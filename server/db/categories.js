const Database = require("better-sqlite3");
let db = new Database("./db/bookmarks.sqlite");

/**
 *
 * @typedef {Object} Category
 * @property {number} id
 * @property {string} name
 * @property {string} color
 */

/**
 *
 * @param {string} name
 * @param {string} color
 * @returns {number} Id of inserted row
 */
function addCategory(name, color) {
  return db
    .prepare("INSERT INTO category (name, color) VALUES(:name,:color)")
    .run({ name, color }).lastInsertRowid;
}

/**
 *
 * @returns {Category[]} Array of categories
 */
function getAllCategories() {
  return db.prepare("SELECT * FROM category").all();
}

/**
 *
 * @param {number} id
 * @returns {Category} Category
 */
function getCategoryById(id) {
  return db.prepare("SELECT * FROM category WHERE id = ?").get(id);
}

/**
 *
 * @param {number} name
 * @returns {Category} Category
 */
function getCategoryByName(name) {
  return db.prepare("SELECT * FROM category WHERE name = ?").get(name);
}

/**
 *
 * @param {number} id
 * @returns {boolean} Deleted succsessfuly
 */
function deleteCategoryById(id) {
  return db.prepare("DELETE FROM category WHERE id = ?").run(id).changes > 0
    ? true
    : false;
}

/**
 *
 * @param {number} id
 * @param {string} name
 * @param {string} color
 * @returns {boolean}
 */
function updateCategoryById(id, name, color) {
  return db
    .prepare(
      `UPDATE category SET 
    name = coalesce(:name,name), 
    color = coalesce(:color,color)
    WHERE id = :id`
    )
    .run({ id, name, color }).changes > 0
    ? true
    : false;
}

module.exports = {
  addCategory,
  getAllCategories,
  getCategoryById,
  getCategoryByName,
  updateCategoryById,
  deleteCategoryById,
};
