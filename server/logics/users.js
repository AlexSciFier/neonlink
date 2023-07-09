import { encodePassword, comparePasswords } from "../helpers/security.js";
import { appContext } from "../contexts/appContext.js";
import { appSettingsKeys } from "../contexts/appSettings.js";

export function createUser(username, clearPassword, isAdmin = false) {
  const hashedPassword = encodePassword(clearPassword);
  return appContext.stores.users.addItem(username, hashedPassword, isAdmin);
  //TODO: move the usersettings creation logic here ?
}

export function loadUserWithSettingsByUsername(username) {
  const user = appContext.stores.users.getItemByUsername(username);
  if (user === undefined) return undefined;
  const userSettings = loadUserSettings(user.uuid);
  return { ...user, ...userSettings };
}

export function loadUserWithSettingsByUUID(uuid) {
  const user = appContext.settings.get(appSettingsKeys.AuthenticationEnabled)
    ? appContext.stores.users.getItemByUUID(uuid)
    : appContext.stores.users.getNologinUser();
  if (user === undefined) return undefined;
  const userSettings = loadUserSettings(user.uuid);
  return { ...user, ...userSettings };
}

export function isPasswordValid(userId, clearPassword) {
  let { passwordHash, salt } = appContext.stores.users.getItem(userId);
  return comparePasswords(clearPassword, passwordHash, salt);
}

export function updatePassword(userId, clearPassword) {
  const hashedPassword = encodePassword(clearPassword);
  appContext.stores.users.updatePassword(userId, hashedPassword);
}

function loadUserSettings(uuid) {
  let userSettings = appContext.stores.userSettings.getItem(uuid);
  if (userSettings === undefined) {
    appContext.stores.userSettings.addItem(uuid);
    userSettings = appContext.stores.userSettings.getItem(uuid);
  }
  return userSettings;
}
