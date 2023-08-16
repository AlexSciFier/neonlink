import { dataTableExists } from "../common.js";

export default async function (db) {
  if (dataTableExists(db, "bgImages")) {
    console.log("Renaming bgImages table to backgrounds");
    db.prepare("ALTER TABLE bgImages RENAME TO backgrounds").run();
  }
}