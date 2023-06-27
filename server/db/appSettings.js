const Database = require("better-sqlite3");
let db = new Database("./data/bookmarks.sqlite");

function getNologin() {
  return !!db.prepare("SELECT useNologin FROM appSettings").get()?.useNologin;
}

function setNologin(value) {
  console.log("NOLOGIN", value);
  let nologin = db.prepare("SELECT useNologin FROM appSettings").get();
  if (nologin)
    return db
      .prepare("UPDATE appSettings SET useNologin = :value")
      .run({ value: Number(value) });
  else
    return db
      .prepare("INSERT INTO appSettings (useNologin) VALUES(:value)")
      .run({ value: Number(value) });
}

module.exports = { getNologin, setNologin };
