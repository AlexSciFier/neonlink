import { dataColumnExists } from "../common.js";

export default async function (db) {
  if (dataColumnExists(db, "users", "usergroup")) {
    db.prepare("ALTER TABLE users RENAME COLUMN usergroup TO isAdmin").run();
  }

  if (dataColumnExists(db, "userSettings", "uuid")) {
    const selectQuery = `SELECT 
      users.id, userSettings.maxNumberOfLinks, userSettings.linkInNewTab,
      userSettings.useBgImage, userSettings.bgImage, userSettings.columns, 
      userSettings.cardStyle, userSettings.enableNeonShadows, userSettings.cardPosition
    FROM userSettings 
      LEFT JOIN users ON users.uuid = userSettings.uuid`;
    const dropQuery = `DROP TABLE userSettings`;
    const createQuery = `CREATE TABLE userSettings (
      id TEXT PRIMARY KEY,
      maxNumberOfLinks INTEGER,
      linkInNewTab INTEGER,
      useBgImage INTEGER,
      bgImage TEXT,
      columns INTEGER,
      cardStyle TEXT,
      enableNeonShadows INTEGER,
      cardPosition TEXT
    )`;
    const insertQuery = `INSERT INTO userSettings 
      (id, maxNumberOfLinks, linkInNewTab, useBgImage, 
        bgImage, columns, cardStyle, enableNeonShadows, cardPosition)
    VALUES (:id, :maxNumberOfLinks, :linkInNewTab, :useBgImage, 
      :bgImage, :columns, :cardStyle, :enableNeonShadows, :cardPosition)`;

    const transfert = db.transaction((items) => {
      // drop and create queries cause problems is prepared too early....
      db.prepare(dropQuery).run();
      db.prepare(createQuery).run();
      const insert = db.prepare(insertQuery);
      for (const item of items) insert.run(item);
    });
    transfert(db.prepare(selectQuery).all());
  }

  if (dataColumnExists(db, "backgrounds", "uuid")) {
    const selectQuery = `SELECT 
      users.id as userId, backgrounds.url
    FROM backgrounds 
      LEFT JOIN users ON users.uuid = backgrounds.uuid`;
    const dropQuery = `DROP TABLE backgrounds`;
    const createQuery = `CREATE TABLE IF NOT EXISTS backgrounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      url TEXT
    )`;
    const insertQuery = `INSERT INTO backgrounds (userId, url) VALUES (:userId, :url)`;

    const transfert = db.transaction((items) => {
      // It seems some query are executed at prepare, this is problematic
      db.prepare(dropQuery).run();
      db.prepare(createQuery).run();
      const insert = db.prepare(insertQuery);
      for (const item of items) insert.run(item);
    });
    transfert(db.prepare(selectQuery).all());
  }
}
