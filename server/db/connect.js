const Database = require("better-sqlite3");
const bcrypt = require("bcrypt");
let db = new Database("./db/bookmarks.sqlite");

/**
 *
 * @typedef {Object} Bookmark
 * @property {number} id
 * @property {string} url
 * @property {string} title
 * @property {string} desc
 * @property {string} icon
 */

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} username
 * @property {string} passwordHash
 * @property {string} salt
 * @property {number} usergroup
 * @property {string} uuid
 */

/**
 *
 * @param {string} url
 * @param {string} title
 * @param {string} desc
 * @param {string} icon
 * @returns {number} Number of changes
 */
function addBookmark(url, title, desc, icon) {
  return db
    .prepare("INSERT INTO bookmarks (url,title,desc,icon) VALUES(?,?,?,?)")
    .run(url, title, desc, icon).changes;
}

/**
 *
 * @param {number} offset
 * @param {number} limit
 * @returns {Bookmark[]} Array of bookmarks
 */
function getAllBookmarks(offset = 0, limit = 10) {
  let total = db.prepare("SELECT COUNT(*) FROM bookmarks").get()["COUNT(*)"];
  let maxPage = Math.ceil(total / limit);
  let currentPage = offset / limit + 1;
  let bookmarks = db
    .prepare("SELECT * FROM bookmarks LIMIT :limit OFFSET :offset")
    .all({ offset, limit });
  return { bookmarks, currentPage, maxPage };
}

/**
 *
 * @param {number} id
 * @returns {Bookmark} Bookmark
 */
function getBookmarkById(id) {
  return db.prepare("SELECT * FROM bookmarks WHERE id = ?").get(id);
}

/**
 *
 * @param {string} url
 * @returns {Bookmark} Bookmark
 */
function getBookmarkByUrl(url) {
  return db.prepare("SELECT * FROM bookmarks WHERE url = ?").get(url);
}

/**
 *
 * @param {string} query
 * @param {number} limit
 * @param {number} offset
 * @returns {Bookmark[]} Array of bookmarks
 */
function findBookmark(query, limit = 10, offset = 0) {
  let total = db.prepare("SELECT COUNT(*) FROM bookmarks").get()["COUNT(*)"];
  let maxPage = Math.ceil(total / limit);
  let currentPage = offset / limit + 1;
  let bookmarks = db
    .prepare(
      "SELECT * FROM bookmarks WHERE title LIKE :query OR desc LIKE :query OR url LIKE :query OFFSET :offset LIMIT :limit"
    )
    .all({ query: `%${query}%`, limit, offset });
  return { bookmarks, currentPage, maxPage };
}

/**
 *
 * @param {number} id
 * @returns {boolean} Deleted succsessfuly
 */
function deleteBookmarkById(id) {
  return db.prepare("DELETE FROM bookmark WHERE id = ?").run(id).changes > 0
    ? true
    : false;
}

/**
 *
 * @param {number} id
 * @param {string} url
 * @param {string} title
 * @param {string} desc
 * @returns {boolean}
 */
function updateBookmarkById(id, url, title, desc, icon) {
  return db
    .prepare(
      `UPDATE bookmarks SET 
  url = coalesce(:url,url), 
  title = coalesce(:title,title),
  desc = coalesce(:desc,desc),
  icon = coalesce(:icon,icon)
  WHERE id = :id`
    )
    .run({ id, url, title, desc, icon }).changes > 0
    ? true
    : false;
}

/**
 *
 * @param {string} username
 * @param {string} password
 * @param {boolean} isAdmin
 * @returns {{username:string,id:number}}
 */
async function addUser(username, password, isAdmin = false) {
  let hashedPassword = await bcrypt.hash(password, 10);
  let result = db
    .prepare(
      "INSERT INTO users (username, passwordhash, usergroup) VALUES (?,?,?)"
    )
    .run(username, hashedPassword, Number(isAdmin));
  return { username, id: result.lastInsertRowid };
}

/**
 *
 * @param {string} username
 * @param {string} uuid
 * @returns {number}
 */
function addUUID(username, uuid) {
  return db
    .prepare("UPDATE users SET uuid=:uuid WHERE username=:username")
    .run({
      username,
      uuid,
    }).changes;
}

async function getUserByUUID(uuid) {
  return db.prepare("SELECT * FROM users WHERE uuid=?").get(uuid);
}

/**
 *
 * @param {number} id
 * @returns {boolean}
 */
function deleteUser(id) {
  return db.prepare("DELETE FROM users WHERE id = ?").run(id).changes > 0
    ? true
    : false;
}

/**
 *
 * @param {string} username
 * @returns {boolean}
 */
function isUserExist(username) {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username)
    ? true
    : false;
}

/**
 *
 * @param {string} username
 * @returns {User}
 */
function getUser(username) {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username);
}

/**
 *
 * @param {number} id
 * @returns {User}
 */
function getUserById(id) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
}

/**
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise<boolean>}
 */
async function isPasswordValid(username, password) {
  let { passwordhash } = getUser(username);
  return bcrypt.compare(password, passwordhash);
}

function init() {
  db.prepare(
    `CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT,
    title TEXT,
    desc TEXT,
    icon TEXT
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
}

module.exports = {
  addBookmark,
  getAllBookmarks,
  getBookmarkById,
  getBookmarkByUrl,
  findBookmark,
  addUser,
  addUUID,
  getUserByUUID,
  deleteUser,
  getUser,
  getUserById,
  isPasswordValid,
  isUserExist,
  updateBookmarkById,
  deleteBookmarkById,
};
