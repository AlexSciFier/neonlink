export default class UserSessionsStore {
  constructor(sqliteInstance) {
    this.db = sqliteInstance;
  }

  addItem(id, userId) {
    const insertQuery = `INSERT INTO userSessions (id, userId) VALUES (?, ?)`;
    return this.db.prepare(insertQuery).run(id, userId);
  }

  deleteItem(id) {
    const deleteQuery = `DELETE FROM userSessions WHERE id=?`;
    return this.db.prepare(deleteQuery).run(id);
  }

  getItem(id) {
    const selectQuery = `SELECT * FROM userSessions WHERE id=?`;
    return this.db.prepare(selectQuery).get(id);
  }
}
