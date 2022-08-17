const Database = require("better-sqlite3");
let db = new Database("./db/bookmarks.sqlite");

/**
 * @typedef BgImage
 * @property {number} id
 * @property {string} url
 */
/**
 *
 * @param {string} url
 * @return {number} last inserted row
 */
function addImage(url) {
  return db.prepare("INSERT INTO bgImages (url) VALUES(:url)").run({ url })
    .lastInsertRowid;
}
/**
 *
 * @param {number} id
 * @returns {number} changes
 */
function deleteImage(id) {
  return db.prepare("DELETE FROM bgImages WHERE id=:id").run({ id }).changes;
}

/**
 *
 * @returns {BgImage[]}
 */
function getAllImages() {
  return db.prepare("SELECT * FROM bgImages").all();
}
/**
 *
 * @param {number} id
 * @returns {BgImage[]}
 */
function getImageById(id) {
  return db.prepare("SELECT * FROM bgImages WHERE id=:id").all({ id });
}
/**
 *
 * @param {string} url
 * @returns {BgImage[]}
 */
function getImageByUrl(url) {
  return db.prepare("SELECT * FROM bgImages WHERE url=:url").all({ url });
}
module.exports = {
  addImage,
  deleteImage,
  getAllImages,
  getImageById,
  getImageByUrl,
};
