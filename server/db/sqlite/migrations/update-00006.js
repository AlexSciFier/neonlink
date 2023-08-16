import { dataColumnExists } from "../common.js";

export default async function (db) {
  const updateBookmarkTable = `ALTER TABLE bookmarks ADD COLUMN userId INTEGER`;
  const updateGroupTable = `ALTER TABLE category ADD COLUMN userId INTEGER`;
  const updateTagsTable = `ALTER TABLE tags ADD COLUMN userId INTEGER`;

  if (dataColumnExists(db, "bookmarks", "userId") === false) {
    db.prepare(updateBookmarkTable).run();
    const selectQuery = "SELECT id FROM users WHERE isAdmin = 1";
    const updateQuery = "UPDATE bookmarks SET userId = :id";
    const transfert = db.transaction((items) => {
      const insert = db.prepare(updateQuery);
      for (const item of items)
        insert.run({
          id: item.id,
        });
      db.prepare(selectQuery).run();
    });
    transfert(db.prepare(selectQuery).all());
  }

  if (dataColumnExists(db, "category", "userId") === false) {
    db.prepare(updateGroupTable).run();
    const selectQuery = "SELECT id FROM users WHERE isAdmin = 1";
    const updateQuery = "UPDATE category SET userId = :id";
    const transfert = db.transaction((items) => {
      const insert = db.prepare(updateQuery);
      for (const item of items)
        insert.run({
          id: item.id,
        });
      db.prepare(selectQuery).run();
    });
    transfert(db.prepare(selectQuery).all());
  }

  if (dataColumnExists(db, "tags", "userId") === false) {
    db.prepare(updateTagsTable).run();
    const selectQuery = "SELECT id FROM users WHERE isAdmin = 1";
    const updateQuery = "UPDATE tags SET userId = :id";
    const transfert = db.transaction((items) => {
      const insert = db.prepare(updateQuery);
      for (const item of items)
        insert.run({
          id: item.id,
        });
      db.prepare(selectQuery).run();
    });
    transfert(db.prepare(selectQuery).all());
  }
}
