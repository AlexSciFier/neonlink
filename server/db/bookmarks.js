const Database = require("better-sqlite3");
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
  let total = db
    .prepare(
      "SELECT COUNT(*) FROM bookmarks WHERE title LIKE :query OR desc LIKE :query OR url LIKE :query"
    )
    .get({ query: `%${query}%` })["COUNT(*)"];
  let maxPage = Math.ceil(total / limit);
  let currentPage = offset / limit + 1;
  console.log({ total, limit, offset, query, maxPage, currentPage });
  let bookmarks = db
    .prepare(
      "SELECT * FROM bookmarks WHERE title LIKE :query OR desc LIKE :query OR url LIKE :query LIMIT :limit OFFSET :offset"
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
  return db.prepare("DELETE FROM bookmarks WHERE id = ?").run(id).changes > 0
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
module.exports = {
  addBookmark,
  getAllBookmarks,
  getBookmarkById,
  getBookmarkByUrl,
  findBookmark,
  updateBookmarkById,
  deleteBookmarkById,
};
