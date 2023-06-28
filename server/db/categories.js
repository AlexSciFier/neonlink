const Database = require("better-sqlite3");
let db = new Database("./data/bookmarks.sqlite");

/**
 *
 * @typedef {Object} Category
 * @property {number} id
 * @property {string} name
 * @property {string} color
 */

/**
 *
 * @typedef {Object} IdPositionPair
 * @property {number} id
 * @property {number} position
 */

/**
 *
 * @param {string} name
 * @param {string} color
 * @returns {number} Id of inserted row
 */
function addCategory(name, color) {
  let lastPosition =
    db
      .prepare("SELECT * FROM categoryPosition ORDER BY position DESC LIMIT 1")
      .get()?.position || 0;

  let categoryId = db
    .prepare("INSERT INTO category (name, color) VALUES(:name,:color)")
    .run({ name, color }).lastInsertRowid;

  db.prepare(
    "INSERT INTO categoryPosition (categoryId, position) VALUES(:categoryId,:position)"
  ).run({ categoryId, position: ++lastPosition });

  return categoryId;
}

/**
 *
 * @returns {Category[]} Array of categories
 */
function getAllCategories() {
  return db
    .prepare(
      `SELECT id,name,color,position FROM category 
       INNER JOIN categoryPosition ON categoryPosition.categoryId = category.id
       ORDER BY position ASC`
    )
    .all();
}

/**
 *
 * @param {number} id
 * @returns {Category} Category
 */
function getCategoryById(id) {
  return db
    .prepare(
      `SELECT id,name,color,position FROM category 
       INNER JOIN categoryPosition ON categoryPosition.categoryId = category.id
       WHERE categoryId = :id
       ORDER BY position ASC`
    )
    .get(id);
}

/**
 *
 * @param {number} name
 * @returns {Category} Category
 */
function getCategoryByName(name) {
  let id = db.prepare("SELECT * FROM category WHERE name = ?").get(name)?.id;
  if (id === undefined) return undefined;
  return db
    .prepare(
      `SELECT id,name,color,position FROM category 
       INNER JOIN categoryPosition ON categoryPosition.categoryId = category.id
       WHERE categoryId = :id
       ORDER BY position ASC`
    )
    .get({ id });
}

/**
 *
 * @param {number} id
 * @returns {boolean} Deleted succsessfuly
 */
function deleteCategoryById(id) {
  const statements = [
    "DELETE FROM category WHERE id = :categoryId",
    "DELETE FROM categoryPosition WHERE categoryId = :categoryId",
  ].map((sql) => db.prepare(sql));

  const deleteTransaction = db.transaction((data) => {
    for (const stmt of statements) {
      stmt.run(data);
    }
  });

  deleteTransaction({ categoryId: id });

  return true;
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

/**
 *
 * @param {IdPositionPair[]} idPositionPairArray
 */
function updatePostitions(idPositionPairArray) {
  const insert = db.prepare(
    "UPDATE categoryPosition SET position = coalesce(:position,position) WHERE categoryId = :id"
  );

  const insertMany = db.transaction((items) => {
    for (const item of items)
      insert.run({ id: item.id, position: item.position });
  });

  insertMany(idPositionPairArray);
  return true;
}

module.exports = {
  addCategory,
  getAllCategories,
  getCategoryById,
  getCategoryByName,
  updateCategoryById,
  deleteCategoryById,
  updatePostitions,
};
