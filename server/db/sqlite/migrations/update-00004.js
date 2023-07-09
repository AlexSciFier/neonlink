import { columnExists } from "../common.js";

export default async function (db) {

  const createTable = `CREATE TABLE IF NOT EXISTS userSessions (
      id TEXT PRIMARY KEY,
      userId INTEGER,
      created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;

  db.prepare(createTable).run();

  if (columnExists(db, "users", "usergroup")) {
    db.prepare("ALTER TABLE users RENAME COLUMN usergroup TO isAdmin").run();
  }

  if (columnExists(db, "users", "uuid")) {
    const selectQuery = `SELECT id, uuid FROM users`;
    const insertQuery = `INSERT INTO userSessions (id, userId) VALUES (:id, :userId)`;
    const dropQuery = `ALTER TABLE users DROP COLUMN uuid`;

    const sessions = db.prepare(selectQuery).all();

    const insert = db.prepare(insertQuery);
    const drop = db.prepare(dropQuery);
    const transfert = this.db.transaction((items) => {
      for (const item of items)
        insert.run({
          id: categoryId,
          userId: item.id
        });
      drop.run();
    });
    transfert(sessions);
  }

  if (columnExists(db, "userSettings", "uuid")) {
    const dropQuery = `ALTER TABLE users DROP COLUMN uuid`;
    //TODO: convert the table
  }
};