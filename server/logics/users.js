import { encodePassword, comparePasswords } from "../helpers/security.js"
import { stores } from "../db/stores.js"

export function createUser(username, clearPassword, isAdmin = false) {
  const hashedPassword = encodePassword(clearPassword);
  return stores.users.addItem(username, hashedPassword, isAdmin);
  //TODO: move the usersettings creation logic here.
}

export function loadUserWithSettingsByUsername(username) {
  const user = stores.users.getItemByUsername(username);
  if (user === undefined) return undefined;
  const userSettings = loadUserSettings(user.uuid);
  return { ...user, ...userSettings };
}

export function loadUserWithSettingsByUUID(uuid) {
  const user = stores.appSettings.getNologin() ? stores.users.getNologinUser() : stores.users.getItemByUUID(uuid);
  if (user === undefined) return undefined;
  const userSettings = loadUserSettings(user.uuid);
  return { ...user, ...userSettings };
}

export function getHashedPassword(password) {
  const data = stores.users.getItemByUsername(username);
  return { passwordHash: data.passwordHash, salt: data.salt };
}

export function isPasswordValid(username, password) {
  let { passwordHash, salt } = stores.users.getItemByUsername(username);
  return comparePasswords(password, passwordHash, salt);
}

export function updatePassword(username, clearPassword) {
  const hashedPassword = encodePassword(clearPassword);
  stores.users.updatePassword(username, hashedPassword);
}

function loadUserSettings(uuid) {
  let userSettings = stores.userSettings.getItem(uuid);
  if (userSettings === undefined) { 
    stores.userSettings.addItem(uuid);
    userSettings = stores.userSettings.getItem(uuid);
  }
  return userSettings;
}