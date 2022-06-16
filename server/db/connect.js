const Database = require("better-sqlite3");
const bcrypt = require("bcrypt");
let db = new Database("./db/bookmarks.sqlite");

const bookmarks = require("./bookmarks");
const users = require("./users");
const tags = require("./tags");
const categories = require("./categories");

function init() {
  console.log("Starting up...");
  db.prepare(
    `CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )`
  ).run();
  db.prepare(
    `CREATE TABLE IF NOT EXISTS bookmarksTags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bookmarkId INTEGER,
    tagId INTEGER,
    UNIQUE (bookmarkId,tagId) ON CONFLICT IGNORE
  )`
  ).run();
  db.prepare(
    `CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT,
    title TEXT,
    desc TEXT,
    icon TEXT,
    categoryId INEGER,
    created TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP
  )`
  ).run();
  db.prepare(
    `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    passwordhash TEXT,
    usergroup INTEGER,
    uuid TEXT
  )`
  ).run();
  db.prepare(
    `CREATE TABLE IF NOT EXISTS category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    color TEXT
  )`
  ).run();
  db.prepare(
    `CREATE TABLE IF NOT EXISTS categoryPosition (
    categoryId INTEGER,
    position INTEGER
  )`
  ).run();
}

module.exports = {
  init,
  ...users,
  ...bookmarks,
  ...tags,
  ...categories,
};
