export default async function (db) {
  const statments = [
    `CREATE TABLE IF NOT EXISTS migrations (
            name TEXT PRIMARY KEY,
            version INTEGER
        )`,

    `CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT
        )`,

    `CREATE TABLE IF NOT EXISTS bookmarksTags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bookmarkId INTEGER,
            tagId INTEGER,
            UNIQUE (bookmarkId,tagId) ON CONFLICT IGNORE
        )`,

    `CREATE TABLE IF NOT EXISTS bookmarks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT,
            title TEXT,
            desc TEXT,
            search TEXT,
            icon TEXT,
            categoryId INEGER,
            created TIMESTAMP
            DEFAULT CURRENT_TIMESTAMP
        )`,

    `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            passwordHash TEXT,
            salt TEXT,
            usergroup INTEGER,
            uuid TEXT
        )`,

    `CREATE TABLE IF NOT EXISTS category (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            color TEXT
        )`,

    `CREATE TABLE IF NOT EXISTS categoryPosition (
            categoryId INTEGER,
            position INTEGER
        )`,

    `CREATE TABLE IF NOT EXISTS bgImages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT,
            uuid TEXT
        )`,

    `CREATE TABLE IF NOT EXISTS userSettings (
            uuid TEXT PRIMARY KEY,
            maxNumberOfLinks INTEGER,
            linkInNewTab INTEGER,
            useBgImage INTEGER,
            bgImage TEXT,
            columns INTEGER,
            cardStyle TEXT,
            enableNeonShadows INTEGER,
            cardPosition TEXT
        )`,

    `CREATE TABLE IF NOT EXISTS bookmarkPosition (
            bookmarkId INTEGER PRIMARY KEY,
            categoryId INTEGER,
            position INTEGER
        )`,
  ];

  statments.forEach((statment) => {
    db.prepare(statment).run();
  });
}
