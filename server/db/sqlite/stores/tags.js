export default class TagsStore {
  constructor(sqliteInstance) {
    this.db = sqliteInstance;
  }

  addItem(name) {
    const insertQuery = `INSERT INTO tags (name) VALUES(?)`;
    return this.db.prepare(insertQuery).run(name.toLocaleLowerCase()).lastInsertRowid;
  }

  deleteItem(id) {
    const deleteQuery = `DELETE FROM tags WHERE id = ?`;
    return this.db.prepare(deleteQuery).run(id).changes > 0;
  }

  existsItemByName(name) {
    const selectQuery = `SELECT COUNT(*) AS count FROM tags WHERE name = ?`;
    const result = this.db.prepare(selectQuery).get(name);
    return result && result.count > 0;
  }

  getAll(name) {
    let selectQuery = 
      `SELECT 
        id, name 
      FROM tags`;

    const selectParams = {};

    if (name) {
      selectQuery += ` WHERE tags.name LIKE :name`
      selectParams.name = `%${name}%`;
    }

    selectQuery +=
      ` GROUP BY tags.id
      ORDER BY tags.name`;
      
    return this.db.prepare(selectQuery).all(selectParams);
  }

  getItemById(id) {
    const selectQuery =
      `SELECT 
        tags.id AS id, tags.name AS name FROM tags
      INNER JOIN bookmarksTags ON tags.id = bookmarksTags.tagId
      WHERE 
        tags.id = :id
      GROUP BY tags.id`
    return this.db.prepare(selectQuery).all({ id });
  }

  updateItem(id, name) {
    const updateQuery =
      `UPDATE tags SET 
        name = coalesce(:name,name)
      WHERE id = :id`;

    return this.db.prepare(updateQuery).run({ id, name: name.toLocaleLowerCase() }).changes > 0;
  }
}

