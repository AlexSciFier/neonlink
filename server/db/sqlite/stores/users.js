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

  deleteItem(id) {
    const deleteQuery = `DELETE FROM users WHERE id = ?`;
    return this.db.prepare(deleteQuery).run(id).changes > 0;
  }

  checkWhetherUserExists(username) {
    const selectQuery = `SELECT * FROM users WHERE username = ?`;
    return this.db.prepare(selectQuery).get(username);
  }

  checkWhetherTableIsEmpty() {
    const selectQuery = `SELECT COUNT(*) AS count FROM users`;
    return this.db.prepare(selectQuery).get().count === 0;
  }

  getItem(id) {
    const selectQuery = `SELECT * FROM users WHERE id = ?`;
    return this.db.prepare(selectQuery).get(id);
  }

  getItemByUsername(username) {
    const selectQuery = `SELECT * FROM users WHERE username = ?`;
    return this.db.prepare(selectQuery).get(username);
  }

  updateIsAdmin(userId, isAdmin) {
    const updateQuery = `UPDATE users SET isAdmin=isAdmin WHERE id=:id`;
    this.db.prepare(updateQuery).run({
      id: userId,
      isAdmin: Boolean(isAdmin)
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
