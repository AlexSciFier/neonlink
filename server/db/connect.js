const Database = require("better-sqlite3");
const bcrypt = require("bcrypt");
let db = new Database("./db/bookmarks.sqlite");

const bookmarks = require("./bookmarks");
const users = require("./users");
const tags = require("./tags");

function init() {
  console.log("Starting up...");
  db
    .prepare(
      `CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )`
    )
    .run().changes;
  db
    .prepare(
      `CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT,
    title TEXT,
    desc TEXT,
    icon TEXT,
    tags TEXT
  )`
    )
    .run().changes;
  db
    .prepare(
      `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    passwordhash TEXT,
    usergroup INTEGER,
    uuid TEXT
  )`
    )
    .run().changes;
}

module.exports = {
  init,
  ...users,
  ...bookmarks,
  ...tags,
};
