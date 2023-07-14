export default class UsersStore {
  constructor(sqliteInstance) {
    this.db = sqliteInstance;
  }

  addItem(username, hashedPassword, isAdmin) {
    const insertQuery = `INSERT INTO users (username, passwordhash, salt, isAdmin) VALUES (?,?,?,?)`;
    let result = this.db
      .prepare(insertQuery)
      .run(username, hashedPassword.hash, hashedPassword.salt, Number(isAdmin));
    return { username, id: result.lastInsertRowid };
  }

  countAdmins() {
    const selectQuery = `SELECT COUNT(*) AS count FROM users WHERE isAdmin != 0`;
    const res = this.db.prepare(selectQuery).get();
    return res.count;
  }

  countItems() {
    const selectQuery = `SELECT COUNT(*) AS count FROM users`;
    const res = this.db.prepare(selectQuery).get();
    return res.count;
  }

  checkWhetherUserExists(username) {
    const selectQuery = `SELECT COUNT(*) AS count FROM users WHERE username = ?`;
    return this.db.prepare(selectQuery).get(username);
  }

  deleteItem(id) {
    const deleteQuery = `DELETE FROM users WHERE id = ?`;
    return this.db.prepare(deleteQuery).run(id).changes > 0;
  }

  getItem(id) {
    const selectQuery = `SELECT * FROM users WHERE id = ?`;
    return this.db.prepare(selectQuery).get(id);
  }

  getItemByUsername(username) {
    const selectQuery = `SELECT * FROM users WHERE username = ?`;
    return this.db.prepare(selectQuery).get(username);
  }

  updateIsAdmin(id, isAdmin) {
    const updateQuery = `UPDATE users SET isAdmin=:isAdmin WHERE id=:id`;
    this.db.prepare(updateQuery).run({
      id,
      isAdmin: Number(isAdmin),
    });
  }

  updatePassword(userId, hashedPassword) {
    const updateQuery = `UPDATE users SET passwordHash=:passwordHash, salt=:salt WHERE id=:id`;
    this.db.prepare(updateQuery).run({
      id: userId,
      passwordHash: hashedPassword.hash,
      salt: hashedPassword.salt,
    });
  }
}
