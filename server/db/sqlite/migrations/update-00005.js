import { dataColumnExists } from "../common.js";

export default async function (db) {
  const createTable = `CREATE TABLE IF NOT EXISTS userSessions (
      id TEXT PRIMARY KEY,
      userId INTEGER,
      created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;

  db.prepare(createTable).run();

  if (dataColumnExists(db, "users", "uuid")) {
    const selectQuery = `SELECT id, uuid FROM users`;
    const insertQuery = `INSERT INTO userSessions (id, userId) VALUES (:id, :userId)`;
    const dropQuery = `ALTER TABLE users DROP COLUMN uuid`;
    const transfert = db.transaction((items) => {
      const insert = db.prepare(insertQuery);
      for (const item of items)
        insert.run({
          id: item.uuid,
          userId: item.id,
        });
      db.prepare(dropQuery).run();
    });
    transfert(db.prepare(selectQuery).all());
  }
}
