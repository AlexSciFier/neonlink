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
 * @param {number[]} tags
 * @returns {number} Number of changes
 */
function addBookmark(url, title, desc, icon, categoryId, tags) {
  let bookmarkId = db
    .prepare(
      "INSERT INTO bookmarks (url,title,desc,icon,categoryId) VALUES(?,?,?,?,?)"
    )
    .run(url, title, desc, icon, categoryId).lastInsertRowid;
  let ids = db
    .prepare(
      `SELECT id FROM tags WHERE name IN (${new Array(tags.length)
        .fill("?")
        .join(",")})`
    )
    .all(...tags);
  let stmt = db.prepare(
    "INSERT INTO bookmarksTags (bookmarkId, tagId) VALUES(:bookmarkId,:tagId)"
  );
  let transaction = db.transaction((ids) => {
    for (const tagId of ids.map((value) => value.id)) {
      stmt.run({ bookmarkId, tagId });
    }
  });
  transaction(ids);
  transaction(tags);
  return bookmarkId;
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
    .prepare(
      `SELECT 
        bookmarks.id,
        url,
        title,
        desc,
        icon,
        created,
        group_concat(tags.name, ',') as tags
      FROM bookmarks 
        INNER JOIN bookmarksTags ON bookmarksTags.bookmarkId = bookmarks.id 
        INNER JOIN tags ON bookmarksTags.tagId = tags.id
      GROUP BY bookmarks.id
      LIMIT :limit OFFSET :offset`
    )
    .all({ offset, limit })
    .map((bookmark) => {
      return { ...bookmark, tags: bookmark.tags.split(",") };
    });
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
 * @param {number} categoryId
 * @returns {Bookmark[]} Bookmarks
 */
function getBookmarkByCategoryId(categoryId) {
  return db
    .prepare("SELECT * FROM bookmarks WHERE categoryId = ?")
    .all(categoryId);
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
      "SELECT COUNT(*) AS count FROM bookmarks WHERE title LIKE :query OR desc LIKE :query OR url LIKE :query"
    )
    .get({ query: `%${query}%` }).count;
  let maxPage = Math.ceil(total / limit);
  let currentPage = offset / limit + 1;
  let bookmarks = db
    .prepare(
      `SELECT 
      bookmarks.id,
      url,
      title,
      desc,
      icon,
      created,
      group_concat(tags.name, ',') as tags
    FROM bookmarks 
      INNER JOIN bookmarksTags ON bookmarksTags.bookmarkId = bookmarks.id 
      INNER JOIN tags ON bookmarksTags.tagId = tags.id
    WHERE bookmarks.title LIKE :query OR bookmarks.desc LIKE :query OR bookmarks.url LIKE :query 
    GROUP BY bookmarks.id
    ORDER BY bookmarks.created
    LIMIT :limit OFFSET :offset`
    )
    .all({ query: `%${query}%`, limit, offset })
    .map((bookmark) => {
      return { ...bookmark, tags: bookmark.tags.split(",") };
    });
  return { bookmarks, currentPage, maxPage };
}

function findBookmarkByTag(tag, limit = 10, offset = 0) {
  let total = db
    .prepare(
      `SELECT 
      COUNT(*) AS count
    FROM bookmarks 
      INNER JOIN bookmarksTags ON bookmarksTags.bookmarkId = bookmarks.id 
      INNER JOIN tags ON bookmarksTags.tagId = tags.id
    WHERE tags.name=:tag
    GROUP BY bookmarks.id
    ORDER BY bookmarks.created`
    )
    .get({ tag }).count;
  let maxPage = Math.ceil(total / limit);
  let currentPage = offset / limit + 1;
  let bookmarks = db
    .prepare(
      `SELECT * FROM (
        SELECT 
            bookmarks.id,
            url,
            title,
            desc,
            icon,
            created,
            group_concat(tags.name, ',') as tags
        FROM bookmarks 
        INNER JOIN bookmarksTags ON bookmarksTags.bookmarkId = bookmarks.id 
        INNER JOIN tags ON bookmarksTags.tagId = tags.id
        GROUP BY bookmarks.id
    )
    WHERE id IN(
        SELECT bookmarkId FROM tags
        INNER JOIN bookmarksTags ON bookmarksTags.tagId = tags.id
        WHERE name = :tag
    )
    ORDER BY created
    LIMIT :limit OFFSET :offset`
    )
    .all({ tag, limit, offset })
    .map((bookmark) => {
      return { ...bookmark, tags: bookmark.tags.split(",") };
    });
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
function updateBookmarkById(id, url, title, desc, icon, categoryId, tags) {
  db.prepare("DELETE FROM bookmarksTags WHERE bookmarkId = ?").run(id);
  let ids = db
    .prepare(
      `SELECT id FROM tags WHERE name IN (${new Array(tags.length)
        .fill("?")
        .join(",")})`
    )
    .all(...tags);
  console.log(ids);
  let stmt = db.prepare(
    "INSERT INTO bookmarksTags (bookmarkId, tagId) VALUES(:bookmarkId,:tagId)"
  );
  let transaction = db.transaction((ids) => {
    for (const tagId of ids.map((value) => value.id)) {
      stmt.run({ bookmarkId: id, tagId });
    }
  });
  transaction(ids);

  return db
    .prepare(
      `UPDATE bookmarks SET 
    url = coalesce(:url,url), 
    title = coalesce(:title,title),
    desc = coalesce(:desc,desc),
    icon = coalesce(:icon,icon),
    categoryId = coalesce(:categoryId,categoryId),
    WHERE id = :id`
    )
    .run({ id, url, title, desc, icon, categoryId }).changes > 0
    ? true
    : false;
}
module.exports = {
  addBookmark,
  getAllBookmarks,
  getBookmarkById,
  getBookmarkByCategoryId,
  getBookmarkByUrl,
  findBookmark,
  findBookmarkByTag,
  updateBookmarkById,
  deleteBookmarkById,
};
