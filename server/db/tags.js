const Database = require("better-sqlite3");
let db = new Database("./db/bookmarks.sqlite");

function getAllTags() {
  return db.prepare(`SELECT * FROM tags`).all();
}

function getTagById(id) {
  return db.prepare(`SELECT * FROM tags WHERE id=:id`).all({ id });
}

function addTag(name) {
  return db.prepare(`INSERT INTO tags (name) VALUES(?)`).run(name)
    .lastInsertRowid;
}

function updateTagById(id, name) {
  return db.prepare(`INSERT INTO tags (name) VALUES(?)`).all(name);
}

function updateTagById(id, name) {
  return db
    .prepare(
      `UPDATE tags SET 
      name = coalesce(:name,name), 
      WHERE id = :id`
    )
    .run({ id, name }).changes > 0
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
  addTag,
  updateTagById,
  deleteTagById,
};
