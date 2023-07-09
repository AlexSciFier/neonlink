import { columnExists } from "../common.js";

export default async function (db) {
  if (columnExists(db, "backgrounds", "uuid") === false) {
    db.prepare("ALTER TABLE backgrounds ADD COLUMN uuid TEXT").run();
  }

  const statment = `CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY, version INTEGER)`;

  db.prepare(statment).run();
}
