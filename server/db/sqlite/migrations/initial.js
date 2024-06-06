export default async function (db) {
  const statments = [
    `CREATE TABLE IF NOT EXISTS migrations (
      name TEXT PRIMARY KEY,
      version INTEGER
    )`,

    `CREATE TABLE backgrounds (
      id     INTEGER PRIMARY KEY,
      userId INTEGER REFERENCES users (id) ON DELETE CASCADE,
      url    TEXT    NOT NULL
    )`,

    `CREATE TABLE bookmarks (
      id         INTEGER   PRIMARY KEY,
      url        TEXT      NOT NULL,
      title      TEXT,
      desc       TEXT,
      search     TEXT,
      icon       TEXT,
      categoryId INEGER    REFERENCES category (id) ON DELETE SET NULL,
      created    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      userId     INTEGER   REFERENCES users (id) ON DELETE CASCADE
    )`,

    `CREATE TABLE bookmarkPosition (
      bookmarkId INTEGER REFERENCES bookmarks (id) ON DELETE CASCADE,
      categoryId INTEGER REFERENCES category (id) ON DELETE CASCADE,
      position   INTEGER NOT NULL
    )`,

    `CREATE TABLE bookmarksTags (
      id         INTEGER PRIMARY KEY,
      bookmarkId INTEGER REFERENCES bookmarks (id) ON DELETE CASCADE,
      tagId      INTEGER REFERENCES tags (id) ON DELETE CASCADE,
      UNIQUE (
          bookmarkId,
          tagId
      )
      ON CONFLICT IGNORE
    )`,

    `CREATE TABLE category (
      id     INTEGER PRIMARY KEY,
      name   TEXT    NOT NULL,
      color  TEXT    NOT NULL,
      userId INTEGER REFERENCES users (id) ON DELETE CASCADE
    )`,

    `CREATE TABLE categoryPosition (
      categoryId INTEGER REFERENCES category (id) ON DELETE CASCADE,
      position   INTEGER
    )`,

    `CREATE TABLE tags (
      id     INTEGER PRIMARY KEY,
      name   TEXT    NOT NULL,
      userId INTEGER REFERENCES users (id) ON DELETE CASCADE
    )`,

    `CREATE TABLE users (
      id           INTEGER     PRIMARY KEY,
      username     TEXT        NOT NULL,
      passwordHash TEXT        NOT NULL,
      salt         TEXT        NOT NULL,
      isAdmin      INTEGER (1) DEFAULT (0) 
    )`,

    `CREATE TABLE userSessions (
      id      TEXT      PRIMARY KEY,
      userId  INTEGER   REFERENCES users (id) ON DELETE CASCADE,
      created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE userSettings (
      id                INTEGER REFERENCES users (id) ON DELETE CASCADE,
      maxNumberOfLinks  INTEGER,
      linkInNewTab      INTEGER,
      useBgImage        INTEGER,
      bgImage           TEXT,
      columns           INTEGER,
      cardStyle         TEXT,
      enableNeonShadows INTEGER,
      cardPosition      TEXT
    )`,
  ];

  statments.forEach((statment) => {
    db.prepare(statment).run();
  });
}
