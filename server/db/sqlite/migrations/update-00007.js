import { dataColumnExists } from "../common.js";

export default async function (db) {
  if (dataColumnExists(db, "bookmarks", "updated_at") === false) {
    // SQLite doesn't support non-constant defaults like CURRENT_TIMESTAMP in ALTER TABLE ADD COLUMN
    // So we add it without default, then update, then (optionally) we'd need a table recreation for a real default
    // But for our needs, just adding the column and populating it is enough as the code handles updates.
    db.prepare(`ALTER TABLE bookmarks ADD COLUMN updated_at TIMESTAMP`).run();
    db.prepare(`UPDATE bookmarks SET updated_at = created`).run();
  }
}
