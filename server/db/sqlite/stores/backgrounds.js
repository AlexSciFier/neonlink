export default class BackgroundsStore {
  constructor(sqliteInstance) {
    this.db = sqliteInstance;
  }

  addItem(url, userId) {
    const insertQuery = `INSERT INTO backgrounds (url, userId) VALUES(:url, :userId)`;
    return this.db.prepare(insertQuery).run({ url, userId }).lastInsertRowid;
  }

  deleteItem(id, userId) {
    const deleteQuery = `DELETE FROM backgrounds WHERE id=:id AND (userId=:userId OR userId IS NULL)`;
    return this.db.prepare(deleteQuery).run({ id, userId }).changes;
  }

  getAll(userId) {
    const selectQuery = `SELECT * FROM backgrounds WHERE userId=:userId OR userId IS NULL`;
    return this.db.prepare(selectQuery).all({ userId });
  }

  getItemById(id, userId) {
    const selectQuery = `SELECT * FROM backgrounds WHERE id=:id AND (userId=:userId OR userId IS NULL)`;
    return this.db.prepare(selectQuery).all({ id, userId });
  }

  getItemByUrl(url, userId) {
    const selectQuery = `SELECT * FROM backgrounds WHERE url=:url AND (userId=:userId OR userId IS NULL)`;
    return this.db.prepare(selectQuery).all({ url, userId });
  }
}
