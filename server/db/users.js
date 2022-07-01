const Database = require("better-sqlite3");
const crypto = require("node:crypto");

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
function generateSalt() {
  let length = 32;
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, 16);
}
function sha512(password, salt) {
  var hash = crypto.createHmac("sha512", salt);
  hash.update(password);
  return hash.digest("hex");
}
function encodePassword(password) {
  var salt = generateSalt(16);
  var hash = sha512(password, salt);
  return { hash, salt };
}
function comparePasswords(password, hashInDb, saltInDB) {
  var sha512Result = sha512(password, saltInDB);
  return hashInDb === sha512Result;
}
/**
 *
 * @param {string} username
 * @param {string} password
 * @param {boolean} isAdmin
 * @returns {{username:string,id:number}}
 */
async function addUser(username, password, isAdmin = false) {
  let hashedPassword = encodePassword(password);
  let result = db
    .prepare(
      "INSERT INTO users (username, passwordhash,salt, usergroup) VALUES (?,?,?,?)"
    )
    .run(username, hashedPassword.hash, hashedPassword.salt, Number(isAdmin));
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
  let { passwordhash, salt } = getUser(username);
  return comparePasswords(password, passwordhash, salt);
}

/**
 *
 * @param {string} username
 * @param {string} newPassword
 * @returns {Promise<boolean>}
 */
async function changePassword(username, newPassword) {
  let hashedPassword = encodePassword(password);
  db.prepare(
    "UPDATE users SET passwordHash=:passwordHash, salt=:salt WHERE username=:username"
  ).run({
    username,
    passwordHash: hashedPassword.hash,
    salt: hashedPassword.salt,
  });
}

/**
 *
 */
async function isUsersTableEmpty() {
  return db.prepare("SELECT COUNT(*) AS count FROM users").get().count === 0;
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
  changePassword,
  isUsersTableEmpty,
};
