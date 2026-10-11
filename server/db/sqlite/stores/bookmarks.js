import crypto from "node:crypto";

export default class BookmarksStore {
  constructor(sqliteInstance) {
    this.db = sqliteInstance;
  }

  addItem(url, title, desc, icon, categoryId, tags, userId) {
    const now = new Date().toISOString();
    const insertQuery = `INSERT INTO bookmarks (url,title,desc,icon,search,categoryId,userId,updated_at) 
      VALUES(:url,:title,:desc,:icon,:search,:categoryId,:userId,:updated_at)`;
    const insertParams = {
      url,
      title,
      desc,
      icon,
      userId,
      search: (url + title + desc).toLocaleLowerCase(),
      categoryId,
      updated_at: now,
    };
    const bookmarkId = this.db
      .prepare(insertQuery)
      .run(insertParams).lastInsertRowid;

    if (tags && tags.length > 0) {
      const tagsSelectQuery = `SELECT id FROM tags WHERE name IN (${new Array(
        tags.length
      )
        .fill("?")
        .join(",")})`;
      const tagsSelectIds = this.db.prepare(tagsSelectQuery).all(...tags);

      const tagsRelationsQuery = `INSERT INTO bookmarksTags (bookmarkId, tagId) VALUES(:bookmarkId,:tagId)`;
      const tagsRelationsStmt = this.db.prepare(tagsRelationsQuery);
      const transaction = this.db.transaction((ids) => {
        for (const tagId of ids.map((value) => value.id)) {
          tagsRelationsStmt.run({ bookmarkId, tagId });
        }
      });
      transaction(tagsSelectIds);
    }
    return bookmarkId;
  }

  deleteItem(id) {
    const deleteQuery = `DELETE FROM bookmarks WHERE id = :id`;
    return this.db.prepare(deleteQuery).run({ id }).changes > 0;
  }

  getAll(userId, search = undefined, tag = undefined, category = undefined) {
    let selectQuery = `SELECT 
        bookmarks.id,
        url,
        title,
        desc,
        created,
        updated_at,
        categoryId,
        group_concat(tags.name, ',') as tags
      FROM bookmarks 
        LEFT JOIN bookmarksTags ON bookmarksTags.bookmarkId = bookmarks.id 
        LEFT JOIN tags ON bookmarksTags.tagId = tags.id
        ${
          category !== undefined
            ? "LEFT JOIN category ON category.id = bookmarks.categoryId"
            : ""
        }`;

    let selectParams = {
      userId,
    };

    let conditions = [];

    if (search || tag || category) {
      if (search) {
        conditions.push("bookmarks.search LIKE :search");
        selectParams.search = `%${search}%`;
      }
      if (tag) {
        conditions.push("tags.name = :tag");
        selectParams.tag = tag;
      }
      if (category) {
        conditions.push("category.name = :category");
        selectParams.category = category;
      }
    }

    if (userId) {
      conditions.push("(userId IN (:userId, 0) OR userId IS NULL)");
      selectParams.userId = userId;
    }

    if (conditions.length > 0)
      selectQuery += ` WHERE ${conditions.join(" AND ")}`;

    selectQuery += ` GROUP BY bookmarks.id
      ORDER BY bookmarks.created DESC`;

    return this.db
      .prepare(selectQuery)
      .all(selectParams)
      .map((bookmark) => {
        return { ...bookmark, tags: bookmark.tags?.split(",") };
      });
  }

  getUsersMeta(userId) {
    if (!userId) {
      return {
        hash: null,
        lastModified: null,
      };
    }

    const selectQuery = `
      SELECT COUNT(*) as count, MAX(updated_at) as last_modified 
      FROM bookmarks 
      WHERE (userId IN(:userId, 0) OR userId IS NULL)
    `;

    const result = this.db.prepare(selectQuery).get({ userId });

    const count = result.count || 0;
    const lastModified = result.last_modified || new Date(0).toISOString();

    const hashString = `${userId}-${count}-${lastModified}`;
    const hash = crypto.createHash("sha256").update(hashString).digest("hex");

    return {
      hash: hash,
      lastModified: lastModified,
    };
  }

  getPage(
    userId,
    limit = 10,
    offset = 0,
    search = undefined,
    tag = undefined,
    category = undefined
  ) {
    let countQuery = `SELECT 
        COUNT(*) as count 
      FROM bookmarks
        ${
          tag !== undefined
            ? "LEFT JOIN bookmarksTags ON bookmarksTags.bookmarkId = bookmarks.id"
            : ""
        } 
        ${
          tag !== undefined
            ? "LEFT JOIN tags ON bookmarksTags.tagId = tags.id"
            : ""
        }
        ${
          category !== undefined
            ? "LEFT JOIN category ON category.id = bookmarks.categoryId"
            : ""
        }`;

    let countParams = { userId };

    let selectQuery = `SELECT 
        bookmarks.id,
        url,
        title,
        desc,
        created,
        updated_at,
        categoryId,
        group_concat(tags.name, ',') as tags
      FROM bookmarks 
        LEFT JOIN bookmarksTags ON bookmarksTags.bookmarkId = bookmarks.id 
        LEFT JOIN tags ON bookmarksTags.tagId = tags.id
        ${
          category !== undefined
            ? "LEFT JOIN category ON category.id = bookmarks.categoryId"
            : ""
        }`;

    let selectParams = { userId, search, limit, offset };

    let conditions = [];

    if (userId) {
      conditions.push(
        "(bookmarks.userId IN (:userId, 0) OR bookmarks.userId IS NULL)"
      );
      countParams.userId = userId;
      selectParams.userId = userId;
    }

    if (search || tag || category) {
      if (search) {
        conditions.push("bookmarks.search LIKE :search");
        countParams.search = `%${search}%`;
        selectParams.search = `%${search}%`;
      }
      if (tag) {
        conditions.push("tags.name = :tag");
        countParams.tag = tag;
        selectParams.tag = tag;
      }
      if (category) {
        conditions.push("category.name = :category");
        countParams.category = category;
        selectParams.category = category;
      }
    }

    if (conditions.length > 0) {
      countQuery += ` WHERE ${conditions.join(" AND ")}`;
      selectQuery += ` WHERE ${conditions.join(" AND ")}`;
    }

    selectQuery += ` GROUP BY bookmarks.id
      ORDER BY bookmarks.created DESC
      LIMIT :limit OFFSET :offset`;

    const total = this.db.prepare(countQuery).get(countParams).count;
    const currentPage = offset / limit + 1;
    const lastPage = Math.ceil(total / limit);

    const bookmarks = this.db
      .prepare(selectQuery)
      .all(selectParams)
      .map((bookmark) => {
        return { ...bookmark, tags: bookmark.tags?.split(",") };
      });

    return { bookmarks, currentPage, lastPage };
  }

  getByCategoryId(userId, categoryId) {
    let selectQuery = `SELECT 
        id, url, title, desc, bookmarks.categoryId, created, updated_at, bookmarkPosition.position
      FROM bookmarks
        LEFT JOIN bookmarkPosition ON bookmarks.id = bookmarkPosition.bookmarkId
      `;
    let selectParams = { categoryId, userId };

    let conditions = [];
    conditions.push("bookmarks.categoryId = :categoryId");
    if (userId) {
      conditions.push(
        "(bookmarks.userId IN (:userId, 0) OR bookmarks.userId IS NULL)"
      );
    }

    if (conditions.length > 0) selectQuery += `WHERE ${conditions.join(" AND ")} `;

    selectQuery += "ORDER BY bookmarkPosition.position";

    return this.db
      .prepare(selectQuery)
      .all(selectParams)
      .map((bookmark) => {
        return { ...bookmark, tags: bookmark.tags?.split(",") };
      });
  }

  getByUser(userId) {
    let selectQuery = `SELECT
        bookmarks.id, url, title, desc, bookmarks.categoryId,
        category.name as categoryName, created, updated_at, bookmarkPosition.position,
        group_concat(tags.name, ',') as tags
      FROM bookmarks
        LEFT JOIN bookmarkPosition ON bookmarks.id = bookmarkPosition.bookmarkId
        LEFT JOIN category ON bookmarks.categoryId = category.id
        LEFT JOIN bookmarksTags ON bookmarksTags.bookmarkId = bookmarks.id
        LEFT JOIN tags ON bookmarksTags.tagId = tags.id
      `;
    let selectParams = { userId };

    if (userId) {
      selectQuery +=
        "WHERE (bookmarks.userId IN (:userId, 0) OR bookmarks.userId IS NULL) ";
    }

    selectQuery += "GROUP BY bookmarks.id ORDER BY bookmarkPosition.position";

    return this.db
      .prepare(selectQuery)
      .all(selectParams)
      .map((bookmark) => {
        return { ...bookmark, tags: bookmark.tags?.split(",") };
      });
  }

  getItemById(userId, id) {
    let selectQuery = `SELECT 
        bookmarks.id,
        url,
        title,
        desc,
        created,
        updated_at,
        categoryId,
        group_concat(tags.name, ',') as tags
      FROM bookmarks 
        LEFT JOIN bookmarksTags ON bookmarksTags.bookmarkId = bookmarks.id 
        LEFT JOIN tags ON bookmarksTags.tagId = tags.id
      `;
    let selectParams = { id };
    let conditions = ["bookmarks.id = :id"];
    if (userId) {
      conditions.push(
        "(bookmarks.userId IN (:userId, 0) OR bookmarks.userId IS NULL)"
      );
      selectParams.userId = userId;
    }

    if (conditions.length > 0) selectQuery += `WHERE ${conditions.join(" AND ")} `;

    selectQuery += `GROUP BY bookmarks.id`;
    return this.db.prepare(selectQuery).get(selectParams);
  }

  getItemByUrl(userId, url) {
    let selectQuery = `SELECT * FROM bookmarks WHERE url = :url`;
    let selectParams = { url };
    if (userId) {
      selectQuery += " AND (userId IN (:userId, 0) OR userId IS NULL)";
      selectParams.userId = userId;
    }
    return this.db.prepare(selectQuery).get(selectParams);
  }

  getIconByBookmarkId(id) {
    const selectQuery = `SELECT icon FROM bookmarks WHERE bookmarks.id = :id`;
    return this.db.prepare(selectQuery).get({ id }).icon;
  }

  updateItem(id, url, title, desc, icon, categoryId, tags) {
    const now = new Date().toISOString();
    let tagsRelationsDeleteQuery = `DELETE FROM bookmarksTags WHERE bookmarkId = :id`;
    this.db.prepare(tagsRelationsDeleteQuery).run({ id });

    if (tags) {
      let tagsSelectQuery = `SELECT id FROM tags WHERE name IN (${new Array(
        tags.length
      )
        .fill("?")
        .join(",")})`;
      let tagsIds = this.db.prepare(tagsSelectQuery).all(...tags);

      let tagsRelationsInsertQuery = `INSERT INTO bookmarksTags (bookmarkId, tagId) VALUES(:bookmarkId,:tagId)`;
      let tagsRelationsInsertStmt = this.db.prepare(tagsRelationsInsertQuery);
      let transaction = this.db.transaction((ids) => {
        for (const tagId of ids.map((value) => value.id)) {
          tagsRelationsInsertStmt.run({ bookmarkId: id, tagId });
        }
      });
      transaction(tagsIds);
    }

    let updateQuery = `UPDATE bookmarks SET 
        url = coalesce(:url,url), 
        title = coalesce(:title,title),
        desc = coalesce(:desc,desc),
        icon = coalesce(:icon,icon),
        categoryId = coalesce(:categoryId,categoryId),
        updated_at = :updated_at
      WHERE id = :id`;

    return (
      this.db.prepare(updateQuery).run({
        id,
        url,
        title,
        desc,
        icon,
        categoryId,
        updated_at: now,
      }).changes > 0
    );
  }

  updatePositions(idPositionPairArray, categoryId) {
    let insertOrReplaceQuery = `INSERT OR REPLACE INTO bookmarkPosition (bookmarkId, categoryId, position) VALUES (:bookmarkId, :categoryId, :position)`;
    let insert = this.db.prepare(insertOrReplaceQuery);
    let insertMany = this.db.transaction((items) => {
      for (const item of items)
        insert.run({
          categoryId: categoryId,
          bookmarkId: item.id,
          position: item.position,
        });
    });

    insertMany(idPositionPairArray);
    return true;
  }
}
