export default async function (db) {
  const statements = [
    `CREATE TABLE sqlitestudio_temp_table AS SELECT *
                                            FROM backgrounds;
  
  DROP TABLE backgrounds;
  
  CREATE TABLE backgrounds (
      id     INTEGER PRIMARY KEY,
      userId INTEGER REFERENCES users (id) ON DELETE CASCADE,
      url    TEXT    NOT NULL
  );
  
  INSERT INTO backgrounds (
                              id,
                              userId,
                              url
                          )
                          SELECT id,
                                 userId,
                                 url
                            FROM sqlitestudio_temp_table;
  
  DROP TABLE sqlitestudio_temp_table;`,
    `
  CREATE TABLE sqlitestudio_temp_table AS SELECT *
                                            FROM bookmarkPosition;
  
  DROP TABLE bookmarkPosition;
  
  CREATE TABLE bookmarkPosition (
      bookmarkId INTEGER REFERENCES bookmarks (id) ON DELETE CASCADE,
      categoryId INTEGER REFERENCES category (id) ON DELETE CASCADE,
      position   INTEGER NOT NULL
  );
  
  INSERT INTO bookmarkPosition (
                                   bookmarkId,
                                   categoryId,
                                   position
                               )
                               SELECT bookmarkId,
                                      categoryId,
                                      position
                                 FROM sqlitestudio_temp_table;
  
  DROP TABLE sqlitestudio_temp_table;`,
    `
  CREATE TABLE sqlitestudio_temp_table AS SELECT *
                                            FROM bookmarks;
  
  DROP TABLE bookmarks;
  
  CREATE TABLE bookmarks (
      id         INTEGER   PRIMARY KEY,
      url        TEXT      NOT NULL,
      title      TEXT,
      desc       TEXT,
      search     TEXT,
      icon       TEXT,
      categoryId INEGER    REFERENCES category (id) ON DELETE SET NULL,
      created    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      userId     INTEGER   REFERENCES users (id) ON DELETE CASCADE
  );
  
  INSERT INTO bookmarks (
                            id,
                            url,
                            title,
                            desc,
                            search,
                            icon,
                            categoryId,
                            created,
                            userId
                        )
                        SELECT id,
                               url,
                               title,
                               desc,
                               search,
                               icon,
                               categoryId,
                               created,
                               userId
                          FROM sqlitestudio_temp_table;
  
  DROP TABLE sqlitestudio_temp_table;`,
    `
  CREATE TABLE sqlitestudio_temp_table AS SELECT *
                                            FROM bookmarksTags;
  
  DROP TABLE bookmarksTags;
  
  CREATE TABLE bookmarksTags (
      id         INTEGER PRIMARY KEY,
      bookmarkId INTEGER REFERENCES bookmarks (id) ON DELETE CASCADE,
      tagId      INTEGER REFERENCES tags (id) ON DELETE CASCADE,
      UNIQUE (
          bookmarkId,
          tagId
      )
      ON CONFLICT IGNORE
  );
  
  INSERT INTO bookmarksTags (
                                id,
                                bookmarkId,
                                tagId
                            )
                            SELECT id,
                                   bookmarkId,
                                   tagId
                              FROM sqlitestudio_temp_table;
  
  DROP TABLE sqlitestudio_temp_table;`,
    `
  CREATE TABLE sqlitestudio_temp_table AS SELECT *
                                            FROM category;
  
  DROP TABLE category;
  
  CREATE TABLE category (
      id     INTEGER PRIMARY KEY,
      name   TEXT    NOT NULL,
      color  TEXT    NOT NULL,
      userId INTEGER REFERENCES users (id) ON DELETE CASCADE
  );
  
  INSERT INTO category (
                           id,
                           name,
                           color,
                           userId
                       )
                       SELECT id,
                              name,
                              color,
                              userId
                         FROM sqlitestudio_temp_table;
  
  DROP TABLE sqlitestudio_temp_table;`,
    `  
  CREATE TABLE sqlitestudio_temp_table AS SELECT *
                                            FROM categoryPosition;
  
  DROP TABLE categoryPosition;
  
  CREATE TABLE categoryPosition (
      categoryId INTEGER REFERENCES category (id) ON DELETE CASCADE,
      position   INTEGER
  );
  
  INSERT INTO categoryPosition (
                                   categoryId,
                                   position
                               )
                               SELECT categoryId,
                                      position
                                 FROM sqlitestudio_temp_table;
  
  DROP TABLE sqlitestudio_temp_table;`,
    `  
  CREATE TABLE sqlitestudio_temp_table AS SELECT *
                                            FROM tags;
  
  DROP TABLE tags;
  
  CREATE TABLE tags (
      id     INTEGER PRIMARY KEY,
      name   TEXT    NOT NULL,
      userId INTEGER REFERENCES users (id) ON DELETE CASCADE
  );
  
  INSERT INTO tags (
                       id,
                       name,
                       userId
                   )
                   SELECT id,
                          name,
                          userId
                     FROM sqlitestudio_temp_table;
  
  DROP TABLE sqlitestudio_temp_table;`,
    `  
  CREATE TABLE sqlitestudio_temp_table AS SELECT *
                                            FROM users;
  
  DROP TABLE users;
  
  CREATE TABLE users (
      id           INTEGER     PRIMARY KEY,
      username     TEXT        NOT NULL,
      passwordHash TEXT        NOT NULL,
      salt         TEXT        NOT NULL,
      isAdmin      INTEGER (1) DEFAULT (0) 
  );
  
  INSERT INTO users (
                        id,
                        username,
                        passwordHash,
                        salt,
                        isAdmin
                    )
                    SELECT id,
                           username,
                           passwordHash,
                           salt,
                           isAdmin
                      FROM sqlitestudio_temp_table;
  
  DROP TABLE sqlitestudio_temp_table;`,
    `  
  CREATE TABLE sqlitestudio_temp_table AS SELECT *
                                            FROM userSessions;
  
  DROP TABLE userSessions;
  
  CREATE TABLE userSessions (
      id      TEXT      PRIMARY KEY,
      userId  INTEGER   REFERENCES users (id) ON DELETE CASCADE,
      created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  INSERT INTO userSessions (
                               id,
                               userId,
                               created
                           )
                           SELECT id,
                                  userId,
                                  created
                             FROM sqlitestudio_temp_table;
  
  DROP TABLE sqlitestudio_temp_table;`,
    `  
  CREATE TABLE sqlitestudio_temp_table AS SELECT *
                                            FROM userSettings;
  
  DROP TABLE userSettings;
  
  CREATE TABLE userSettings (
      id                INTEGER REFERENCES users (id) ON DELETE CASCADE,
      maxNumberOfLinks  INTEGER,
      linkInNewTab      INTEGER,
      useBgImage        INTEGER,
      bgImage           TEXT,
      columns           INTEGER,
      cardStyle         TEXT,
      enableNeonShadows INTEGER,
      cardPosition      TEXT
  );
  
  INSERT INTO userSettings (
                               id,
                               maxNumberOfLinks,
                               linkInNewTab,
                               useBgImage,
                               bgImage,
                               columns,
                               cardStyle,
                               enableNeonShadows,
                               cardPosition
                           )
                           SELECT id,
                                  maxNumberOfLinks,
                                  linkInNewTab,
                                  useBgImage,
                                  bgImage,
                                  columns,
                                  cardStyle,
                                  enableNeonShadows,
                                  cardPosition
                             FROM sqlitestudio_temp_table;
  
  DROP TABLE sqlitestudio_temp_table;`,
  ];
  db.prepare("PRAGMA foreign_keys = OFF;").run();
  db.prepare("BEGIN TRANSACTION;").run();
  for (const statment of statements) {
    try {
      db.exec(statment);
    } catch (error) {
      console.error(statment);
      if (db.inTransaction) db.prepare("ROLLBACK;").run();
      db.prepare("PRAGMA foreign_keys = ON;").run();
      throw error;
    }
  }
  db.prepare("PRAGMA foreign_keys = ON;").run();
  db.prepare("COMMIT;").run();
}
