const Database = require("better-sqlite3");
let db = new Database("./db/bookmarks.sqlite");
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

module.exports = {
  addUser,
  addUUID,
  getUserByUUID,
  deleteUser,
  getUser,
  getUserById,
  isPasswordValid,
  isUserExist,
};
