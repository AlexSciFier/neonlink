const Database = require("better-sqlite3");
let db = new Database("./db/bookmarks.sqlite");

/**
 * @typedef BgImage
 * @property {number} id
 * @property {string} url
 * @property {string} uuid
 */

/**
 *
 * @param {string} url
 * @param {string} uuid
 * @return {number} last inserted row
 */
function addImage(url, uuid) {
  return db
    .prepare("INSERT INTO bgImages (url, uuid) VALUES(:url, :uuid)")
    .run({ url, uuid }).lastInsertRowid;
}
/**
 *
 * @param {number} id
 * @param {string} uuid
 * @returns {number} changes
 */
function deleteImage(id, uuid) {
  return db
    .prepare("DELETE FROM bgImages WHERE id=:id AND uuid=:uuid")
    .run({ id, uuid }).changes;
}

/**
 * @param {string} uuid
 * @returns {BgImage[]}
 */
function getAllImages(uuid) {
  return db.prepare("SELECT * FROM bgImages WHERE uuid=:uuid").all({ uuid });
}
/**
 *
 * @param {number} id
 * @param {string} uuid
 * @returns {BgImage[]}
 */
function getImageById(id, uuid) {
  return db
    .prepare("SELECT * FROM bgImages WHERE id=:id AND uuid=:uuid")
    .all({ id, uuid });
}
/**
 * @param {string} uuid
 * @param {string} url
 * @returns {BgImage[]}
 */
function getImageByUrl(url, uuid) {
  return db
    .prepare("SELECT * FROM bgImages WHERE url=:url AND uuid=:uuid")
    .all({ url, uuid });
}

module.exports = {
  addImage,
  deleteImage,
  getAllImages,
  getImageById,
  getImageByUrl,
};
