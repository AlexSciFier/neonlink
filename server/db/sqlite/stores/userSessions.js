export default class UserSessionsStore {
  constructor(sqliteInstance) {
    this.db = sqliteInstance;
  } 

  addItem(id, userId) {
    const insertQuery = `INSERT INTO userSessions (id, userId) VALUES (?, ?)`;
    return this.db.prepare(updateQuery).run(id, userId);
  }

  removeItem(id) {
    const removeQuery = `DELETE FROM TABLE userSessions WHERE id=?`;
    return this.db.prepare(removeQuery).run(id);
  }

  getItem(id) {
    return this.db.prepare("SELECT * FROM userSessions WHERE id=?").get(id);
  }
}
