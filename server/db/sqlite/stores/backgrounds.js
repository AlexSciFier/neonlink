export default class BackgroundsStore {
  constructor(sqliteInstance) {
    this.db = sqliteInstance;
  }

  addItem(url, uuid) {
    const insertQuery = `INSERT INTO backgrounds (url, uuid) VALUES(:url, :uuid)`;
    return this.db.prepare(insertQuery).run({ url, uuid }).lastInsertRowid;
  }

  deleteItem(id, uuid) {
    const deleteQuery = `DELETE FROM backgrounds WHERE id=:id AND (uuid=:uuid OR uuid IS NULL)`;
    return this.db.prepare(deleteQuery).run({ id, uuid }).changes;
  }

  getAll(uuid) {
    const selectQuery = `SELECT * FROM backgrounds WHERE uuid=:uuid OR uuid IS NULL`;
    return this.db.prepare(selectQuery).all({ uuid });
  }

  getItemById(id, uuid) {
    const selectQuery = `SELECT * FROM backgrounds WHERE id=:id AND (uuid=:uuid OR uuid IS NULL)`;
    return this.db.prepare(selectQuery).all({ id, uuid });
  }

  getItemByUrl(url, uuid) {
    const selectQuery = `SELECT * FROM backgrounds WHERE url=:url AND (uuid=:uuid OR uuid IS NULL)`;
    return this.db.prepare(selectQuery).all({ url, uuid });
  }
}
