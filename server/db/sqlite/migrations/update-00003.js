import { tableExists } from "../common.js";

export default async function (db) {
  if (tableExists(db, "bgImages")) {
    db.prepare("ALTER TABLE bgImages RENAME backgrounds").run();
  }
}