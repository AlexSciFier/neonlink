import { ownerCondition, visibleCondition } from "./ownership.js";

export default class TagsStore {
  constructor(sqliteInstance) {
    this.db = sqliteInstance;
  }

  addItem(name, userId) {
    const insertQuery = `INSERT INTO tags (name,userId) VALUES(:name,:userId)`;
    return this.db
      .prepare(insertQuery)
      .run({ name: name.toLocaleLowerCase(), userId }).lastInsertRowid;
  }

  deleteItem(id, scope) {
    const owner = ownerCondition(scope);
    return this.db.transaction(() => {
      const result = this.db
        .prepare(`DELETE FROM tags WHERE id = :id AND ${owner.sql}`)
        .run({ id, ...owner.params });
      if (result.changes)
        this.db.prepare("DELETE FROM bookmarksTags WHERE tagId = ?").run(id);
      return result.changes > 0;
    })();
  }

  existsItemByName(name, userId) {
    let selectQuery = `SELECT COUNT(*) AS count FROM tags WHERE name = :name`;
    let selectParams = { name };
    if (userId) {
      selectQuery += ` AND (userId IN (:userId, 0) OR userId IS NULL) `;
      selectParams.userId = userId;
    }

    const result = this.db.prepare(selectQuery).get(selectParams);
    return result && result.count > 0;
  }

  getAll(name, userId, onlyActive = false) {
    let selectQuery = `SELECT 
        tags.id, tags.name 
      FROM tags`;

    let selectParams = {};
    let conditions = [];
    if (userId) {
      conditions.push("(tags.userId IN (:userId, 0) OR tags.userId IS NULL)");
      selectParams.userId = userId;
    }

    if (name) {
      conditions.push("tags.name LIKE :name");
      selectParams.name = `%${name}%`;
    }

    if (onlyActive) {
      selectQuery += ` INNER JOIN bookmarksTags ON tags.id = bookmarksTags.tagId`;
    }

    if (conditions.length > 0) {
      selectQuery += ` WHERE ${conditions.join(" AND ")}`;
    }

    selectQuery += ` GROUP BY tags.id
      ORDER BY tags.name`;

    return this.db.prepare(selectQuery).all(selectParams);
  }

  getItemById(id, scope) {
    const owner = visibleCondition(scope, "tags.userId");
    const selectQuery = `SELECT 
        tags.id AS id, tags.name AS name FROM tags
      INNER JOIN bookmarksTags ON tags.id = bookmarksTags.tagId
      WHERE 
        tags.id = :id AND ${owner.sql}
      GROUP BY tags.id`;
    return this.db.prepare(selectQuery).all({ id, ...owner.params });
  }

  updateItem(id, name, scope) {
    const owner = ownerCondition(scope);
    const updateQuery = `UPDATE tags SET 
        name = coalesce(:name,name)
      WHERE id = :id AND ${owner.sql}`;

    return (
      this.db
        .prepare(updateQuery)
        .run({ id, name: name.toLocaleLowerCase(), ...owner.params }).changes >
      0
    );
  }
}
