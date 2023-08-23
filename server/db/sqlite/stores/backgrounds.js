export default class BackgroundsStore {
  constructor(sqliteInstance) {
    this.db = sqliteInstance;
  }

  addItem(url, userId) {
    const insertQuery = `INSERT INTO backgrounds (url, userId) VALUES(:url, :userId)`;
    return this.db.prepare(insertQuery).run({ url, userId }).lastInsertRowid;
  }

  deleteItem(id, userId) {
    const deleteQuery = `DELETE FROM backgrounds WHERE id=:id`;
    let deleteParams = {id};
    if (userId) {
      deleteQuery += " AND (userId IN (:userId, 0) OR userId IS NULL)";
      deleteParams += { userId };
    }
    return this.db.prepare(deleteQuery).run(deleteParams).changes;
  }

  getAll(userId) {
    let selectQuery = `SELECT * FROM backgrounds`;
    let selectParams = {};
    if (userId) {
      selectQuery += " WHERE userId IN (:userId, 0) OR userId IS NULL";
      selectParams += { userId };
    }

    return this.db.prepare(selectQuery).all(selectParams);
  }

  getItemById(id, userId) {
    let selectQuery = `SELECT * FROM backgrounds WHERE id=:id`;
    let selectParams = {id};
    if (userId) {
      selectQuery += " AND (userId IN (:userId, 0) OR userId IS NULL)";
      selectParams += { userId };
    }
    return this.db.prepare(selectQuery).all(selectParams);
  }

  getItemByUrl(url, userId) {
    let selectQuery = `SELECT * FROM backgrounds WHERE url=:url`;
    let selectParams = {url};
    if (userId) {
      selectQuery += " AND (userId IN (:userId, 0) OR userId IS NULL)";
      selectParams += { userId };
    }
    return this.db.prepare(selectQuery).all(selectParams);
  }
}
