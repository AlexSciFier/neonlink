const Database = require("better-sqlite3");
let db = new Database("./db/bookmarks.sqlite");

function getAllTags() {
  return db
    .prepare(
      `SELECT tags.id AS id, tags.name AS name FROM tags
        INNER JOIN bookmarksTags ON tags.id = bookmarksTags.tagId
        GROUP BY tags.id
        ORDER BY tags.name`
    )
    .all();
}

function getTagById(id) {
  return db
    .prepare(
      `SELECT tags.id AS id, tags.name AS name FROM tags
  INNER JOIN bookmarksTags ON tags.id = bookmarksTags.tagId
  GROUP BY tags.id
  WHERE tags.id = :id`
    )
    .all({ id });
}

function findTags(query) {
  return db
    .prepare(
      `SELECT tags.id AS id, tags.name AS name FROM tags
    INNER JOIN bookmarksTags ON tags.id = bookmarksTags.tagId
    WHERE tags.name LIKE :query
    GROUP BY tags.id
    ORDER BY tags.name`
    )
    .all({ query: `${query}%` });
}

function addTag(name) {
  let existingTag = db
    .prepare(`SELECT * FROM tags WHERE name = :name`)
    .get({ name: name.toLocaleLowerCase() });
  if (existingTag) throw Error("This tag is already exist");
  return db
    .prepare(`INSERT INTO tags (name) VALUES(?)`)
    .run(name.toLocaleLowerCase()).lastInsertRowid;
}

function updateTagById(id, name) {
  return db
    .prepare(
      `UPDATE tags SET 
      name = coalesce(:name,name), 
      WHERE id = :id`
    )
    .run({ id, name: name.toLocaleLowerCase() }).changes > 0
    ? true
    : false;
}

function deleteTagById(id) {
  return db.prepare("DELETE FROM tags WHERE id = ?").run(id).changes > 0
    ? true
    : false;
}

module.exports = {
  getAllTags,
  getTagById,
  findTags,
  addTag,
  updateTagById,
  deleteTagById,
};
