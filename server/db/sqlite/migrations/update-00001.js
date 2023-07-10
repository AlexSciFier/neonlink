import { dataColumnExists } from "../common.js";

export default async function (db) {
  if (dataColumnExists(db, "bgImages ", "uuid") === false) {
    db.prepare("ALTER TABLE bgImages ADD COLUMN uuid TEXT").run();
  }

  const statment = `CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY, version INTEGER)`;

  db.prepare(statment).run();
}
