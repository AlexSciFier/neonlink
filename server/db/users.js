const Database = require("better-sqlite3");
const crypto = require("node:crypto");
const { getNologin } = require("./appSettings");

let db = new Database("./db/bookmarks.sqlite");
/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} username
 * @property {string} passwordHash
 * @property {string} salt
 * @property {number} usergroup
 * @property {string} uuid
 * @property {number} maxNumberOfLinks
 * @property {boolean} linkInNewTab
 * @property {boolean} useBgImage
 * @property {string} bgImage
 * @property {number} columns
 * @property {string} cardStyle
 * @property {boolean} enableNeonShadows
 * @property {string} cardPosition
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

/**
 *
 * @param {string} uuid
 * @returns {Promise<User>}
 */
async function getUserByUUID(uuid) {
  let user = db.prepare("SELECT * FROM users WHERE uuid=?").get(uuid);
  if (user === undefined) return undefined;
  if (getNologin() === true) {
    user = db.prepare("SELECT * FROM users WHERE usergroup=0 LIMIT 1").get();
    userSettings = db
      .prepare("SELECT * FROM userSettings WHERE uuid=?")
      .get(user.uuid);
    return { ...user, ...userSettings };
  }
  let userSettings =
    db.prepare("SELECT * FROM userSettings WHERE uuid=?").get(uuid) ??
    initDefaultSettings(uuid);
  return { ...user, ...userSettings };
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
  let { passwordHash, salt } = getUser(username);
  return comparePasswords(password, passwordHash, salt);
}

/**
 *
 * @param {string} username
 * @param {string} newPassword
 * @returns {Promise<boolean>}
 */
async function changePassword(username, newPassword) {
  let hashedPassword = encodePassword(newPassword);
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

async function setUserSetting(uuid, parameter, value) {
  if (uuid === undefined) uuid = "guest";

  let foundedUUID = db
    .prepare("SELECT uuid FROM userSettings WHERE uuid=:uuid")
    .get({ uuid });
  if (typeof value === "boolean") {
    value = Number(value);
  }

  let updateQuery = `UPDATE userSettings SET ${parameter}=:value WHERE uuid=:uuid`;
  let insertQuery = `INSERT INTO userSettings (uuid, ${parameter}) VALUES (:uuid,:value)`;

  if (foundedUUID) {
    return db.prepare(updateQuery).run({ uuid, value });
  } else {
    return initDefaultSettings(uuid);
  }
}

/**
 * @typedef UserSettings
 * @property {string} uuid
 * @property {number} maxNumberOfLinks
 * @property {boolean} linkInNewTab
 * @property {boolean} useBgImage
 * @property {string} bgImage
 * @property {number} columns
 * @property {string} cardStyle
 * @property {boolean} enableNeonShadows
 * @property {string} cardPosition
 */
/**
 *
 * @param {string} uuid
 * @returns {UserSettings}
 */
function initDefaultSettings(uuid) {
  const DEF_SETTINGS = {
    uuid,
    maxNumberOfLinks: 20,
    linkInNewTab: 1,
    useBgImage: 0,
    bgImage: "",
    columns: 3,
    cardStyle: "default",
    enableNeonShadows: 1,
    cardPosition: "top",
  };

  let keys = Object.keys(DEF_SETTINGS).join(", ");
  let values = Object.keys(DEF_SETTINGS)
    .map((key) => `:${key}`)
    .join(", ");
  let query = `INSERT INTO userSettings (${keys}) VALUES (${values})`;
  db.prepare(query).run(DEF_SETTINGS);
  return db.prepare("SELECT * FROM userSettings WHERE uuid=?").get(uuid);
}
/**
 *
 * @param {string} uuid
 * @returns
 */
async function getUserSettings(uuid) {
  return db
    .prepare("SELECT * FROM userSettings WHERE uuid=:uuid")
    .get({ uuid });
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
  setUserSetting,
  getUserSettings,
};
