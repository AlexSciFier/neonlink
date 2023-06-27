const Database = require("better-sqlite3");
let db = new Database("./data/bookmarks.sqlite");

/**
 *
 * @typedef {Object} Bookmark
 * @property {number} id
 * @property {string} url
 * @property {string} title
 * @property {string} desc
 * @property {string} created
 * @property {number} categoryId
 * @property {string[]} tags
 */

/**
 *
 * @param {string} url
 * @param {string} title
 * @param {string} desc
 * @param {string} icon
 * @param {number[]} tags
 * @returns {number} Number of changes
 */
function addBookmark(url, title, desc, icon, categoryId, tags) {
  let bookmarkId = db
    .prepare(
      "INSERT INTO bookmarks (url,title,desc,icon,search,categoryId) VALUES(:url,:title,:desc,:icon,:search,:categoryId)"
    )
    .run({
      url,
      title,
      desc,
      icon,
      search: (url + title + desc).toLocaleLowerCase(),
      categoryId,
    }).lastInsertRowid;

  let ids = db
    .prepare(
      `SELECT id FROM tags WHERE name IN (${new Array(tags?.length || 0)
        .fill("?")
        .join(",")})`
    )
    .all(...tags);
  let stmt = db.prepare(
    "INSERT INTO bookmarksTags (bookmarkId, tagId) VALUES(:bookmarkId,:tagId)"
  );
  let transaction = db.transaction((ids) => {
    for (const tagId of ids.map((value) => value.id)) {
      stmt.run({ bookmarkId, tagId });
    }
  });
  transaction(ids);
  transaction(tags);
  return bookmarkId;
}
/**
 * @typedef AllBookmarks
 * @property {Bookmark[]} bookmarks
 * @property {number} currentPage
 * @property {number} maxPage
 */
/**
 *
 * @param {number} offset
 * @param {number} limit
 * @returns {AllBookmarks} All bookmarks
 */
function getAllBookmarks(offset = 0, limit = 10) {
  let total = db.prepare("SELECT COUNT(*) FROM bookmarks").get()["COUNT(*)"];
  let maxPage = Math.ceil(total / limit);
  let currentPage = offset / limit + 1;
  let bookmarks = db
    .prepare(
      `SELECT 
        bookmarks.id,
        url,
        title,
        desc,
        created,
        categoryId,
        group_concat(tags.name, ',') as tags
      FROM bookmarks 
        LEFT JOIN bookmarksTags ON bookmarksTags.bookmarkId = bookmarks.id 
        LEFT JOIN tags ON bookmarksTags.tagId = tags.id
      GROUP BY bookmarks.id
      ORDER BY bookmarks.created DESC
      LIMIT :limit OFFSET :offset`
    )
    .all({ offset, limit })
    .map((bookmark) => {
      return { ...bookmark, tags: bookmark.tags?.split(",") };
    });
  return { bookmarks, currentPage, maxPage };
}

/**
 *
 * @param {number} id
 * @returns {Bookmark} Bookmark
 */
function getBookmarkById(id) {
  return db
    .prepare(
      `SELECT 
        bookmarks.id,
        url,
        title,
        desc,
        created,
        categoryId,
        group_concat(tags.name, ',') as tags
      FROM bookmarks 
        LEFT JOIN bookmarksTags ON bookmarksTags.bookmarkId = bookmarks.id 
        LEFT JOIN tags ON bookmarksTags.tagId = tags.id
      WHERE bookmarks.id = ?
      GROUP BY bookmarks.id`
    )
    .get(id);
}

/**
 *
 * @param {number} categoryId
 * @returns {Bookmark[]} Bookmarks
 */
function getBookmarkByCategoryId(categoryId) {
  return db
    .prepare(
      `SELECT id, url, title, desc, bookmarks.categoryId, created, bookmarkPosition.position FROM bookmarks 
      LEFT JOIN bookmarkPosition ON bookmarks.id = bookmarkPosition.bookmarkId
      WHERE bookmarks.categoryId = ?
      ORDER BY bookmarkPosition.position`
    )
    .all(categoryId);
}

/**
 *
 * @param {string} url
 * @returns {Bookmark} Bookmark
 */
function getBookmarkByUrl(url) {
  return db.prepare("SELECT * FROM bookmarks WHERE url = ?").get(url);
}

/**
 *
 * @param {string} query
 * @param {string?} tag
 * @param {string?} category
 * @param {number} limit
 * @param {number} offset
 * @returns {Bookmark[]} Array of bookmarks
 */
function findBookmark(
  query,
  tag = undefined,
  category = undefined,
  limit = 10,
  offset = 0
) {
  let countQuery = `SELECT 
    COUNT(*) as count
  FROM bookmarks 
    LEFT JOIN category ON category.id = bookmarks.categoryId
    LEFT JOIN bookmarksTags ON bookmarksTags.bookmarkId = bookmarks.id 
    LEFT JOIN tags ON bookmarksTags.tagId = tags.id
  WHERE bookmarks.search LIKE :query
  ${tag !== undefined ? "AND tags.name = :tag" : ""}
  ${category !== undefined ? "AND category.name = :category" : ""}`;

  let total = db
    .prepare(countQuery)
    .get({ query: `%${query}%`, tag, category: category }).count;

  let maxPage = Math.ceil(total / limit);
  let currentPage = offset / limit + 1;
  let bookmarks = db
    .prepare(
      `SELECT 
      bookmarks.id,
      url,
      title,
      desc,
      created,
      categoryId,
      group_concat(tags.name, ',') as tags
    FROM bookmarks 
      LEFT JOIN category ON category.id = bookmarks.categoryId
      LEFT JOIN bookmarksTags ON bookmarksTags.bookmarkId = bookmarks.id 
      LEFT JOIN tags ON bookmarksTags.tagId = tags.id
    WHERE bookmarks.search LIKE :query
    ${tag !== undefined ? "AND tags.name = :tag" : ""}
    ${category !== undefined ? "AND category.name = :category" : ""}
    GROUP BY bookmarks.id
    ORDER BY bookmarks.created
    LIMIT :limit OFFSET :offset`
    )
    .all({
      query: `%${query.toLocaleLowerCase()}%`,
      tag,
      category: category,
      limit,
      offset,
    })
    .map((bookmark) => {
      return { ...bookmark, tags: bookmark.tags?.split(",") };
    });
  return { bookmarks, currentPage, maxPage };
}

function findBookmarkByTag(tag, limit = 10, offset = 0) {
  let total = db
    .prepare(
      `SELECT 
      COUNT(*) AS count
    FROM bookmarks 
      LEFT JOIN bookmarksTags ON bookmarksTags.bookmarkId = bookmarks.id 
      LEFT JOIN tags ON bookmarksTags.tagId = tags.id
    WHERE tags.name=:tag
    GROUP BY bookmarks.id
    ORDER BY bookmarks.created`
    )
    .get({ tag }).count;
  let maxPage = Math.ceil(total / limit);
  let currentPage = offset / limit + 1;
  let bookmarks = db
    .prepare(
      `SELECT * FROM (
        SELECT 
            bookmarks.id,
            url,
            title,
            desc,
            icon,
            created,
            group_concat(tags.name, ',') as tags
        FROM bookmarks 
        LEFT JOIN bookmarksTags ON bookmarksTags.bookmarkId = bookmarks.id 
        LEFT JOIN tags ON bookmarksTags.tagId = tags.id
        GROUP BY bookmarks.id
    )
    WHERE id IN(
        SELECT bookmarkId FROM tags
        LEFT JOIN bookmarksTags ON bookmarksTags.tagId = tags.id
        WHERE name = :tag
    )
    ORDER BY created
    LIMIT :limit OFFSET :offset`
    )
    .all({ tag, limit, offset })
    .map((bookmark) => {
      return { ...bookmark, tags: bookmark.tags.split(",") };
    });
  return { bookmarks, currentPage, maxPage };
}

/**
 *
 * @param {number} id
 * @returns {boolean} Deleted succsessfuly
 */
function deleteBookmarkById(id) {
  return db.prepare("DELETE FROM bookmarks WHERE id = ?").run(id).changes > 0
    ? true
    : false;
}

/**
 *
 * @param {number} id
 * @returns
 */
function getIconByBookmarkId(id) {
  return db
    .prepare(
      `SELECT 
        icon
      FROM bookmarks 
      WHERE bookmarks.id = ?`
    )
    .get(id).icon;
}

/**
 *
 * @param {number} id
 * @param {string} url
 * @param {string} title
 * @param {string} desc
 * @param {string} icon
 * @param {string} categoryId
 * @param {string[]} tags
 * @returns {boolean}
 */
function updateBookmarkById(id, url, title, desc, icon, categoryId, tags) {
  db.prepare("DELETE FROM bookmarksTags WHERE bookmarkId = ?").run(id);

  if (tags) {
    let ids = db
      .prepare(
        `SELECT id FROM tags WHERE name IN (${new Array(tags.length)
          .fill("?")
          .join(",")})`
      )
      .all(...tags);
    let stmt = db.prepare(
      "INSERT INTO bookmarksTags (bookmarkId, tagId) VALUES(:bookmarkId,:tagId)"
    );
    let transaction = db.transaction((ids) => {
      for (const tagId of ids.map((value) => value.id)) {
        stmt.run({ bookmarkId: id, tagId });
      }
    });
    transaction(ids);
  }

  return db
    .prepare(
      `UPDATE bookmarks SET 
    url = coalesce(:url,url), 
    title = coalesce(:title,title),
    desc = coalesce(:desc,desc),
    icon = coalesce(:icon,icon),
    categoryId = coalesce(:categoryId,categoryId)
    WHERE id = :id`
    )
    .run({ id, url, title, desc, icon, categoryId }).changes > 0
    ? true
    : false;
}

/**
 *
 * @param {IdPositionPair[]} idPositionPairArray
 * @param {number} categoryId
 */
function updatePostitions(idPositionPairArray, categoryId) {
  const insert = db.prepare(
    "INSERT OR REPLACE INTO bookmarkPosition (bookmarkId, categoryId, position) VALUES (:bookmarkId, :categoryId, :position)"
  );

  const insertMany = db.transaction((items) => {
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

module.exports = {
  addBookmark,
  getAllBookmarks,
  getBookmarkById,
  getBookmarkByCategoryId,
  getBookmarkByUrl,
  findBookmark,
  findBookmarkByTag,
  updateBookmarkById,
  deleteBookmarkById,
  getIconByBookmarkId,
  updatePostitions,
};
