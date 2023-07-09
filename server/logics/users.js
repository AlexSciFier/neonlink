import { appContext } from "../contexts/appContext.js";
import { appSettingsKeys } from "../contexts/appSettings.js";
import { encodePassword, comparePasswords } from "../helpers/security.js";
import { randomUUID } from "crypto";

export function createUser(username, clearPassword, isAdmin = false) {
  const hashedPassword = encodePassword(clearPassword);
  return appContext.stores.users.addItem(username, hashedPassword, isAdmin);
  //TODO: move the usersettings creation logic here ?
}

export function loadSystemUser() {
  return {
    id: 0,
    username: "system",
    isAdmin: !appContext.settings.get(appSettingsKeys.AuthenticationEnabled)
  }
}

export function loadUserSettings(userId) {
  let userSettings = appContext.stores.userSettings.getItem(userId);
  if (userSettings === undefined) {
    appContext.stores.userSettings.addItem(userId);
    userSettings = appContext.stores.userSettings.getItem(userId);
  }
  return userSettings;
}

export function loadUserWithSettingsByUsername(username) {
  if (appContext.settings.get(appSettingsKeys.AuthenticationEnabled))
    return loadSystemUser();
  const user = appContext.stores.users.getItemByUsername(username);
  if (user === undefined) return undefined;
  const userSettings = loadUserSettings(user.uuid);
  return { ...user, ...userSettings };
}

export function loginUser(username, clearPassword) {
  const user = appContext.stores.users.getItemByUsername(username);
  if (user && comparePasswords(clearPassword, user.passwordHash, user.salt))
  {
    const sessionId = randomUUID(); //TODO: retrieve existing session ?
    appContext.stores.userSessions.addItem(userId, sessionId);
    return sessionId;
  }
  return undefined;
}

export function logoutUser() {
  const session = appContext.request.get("session");
  appContext.stores.userSessions.deleteItem(session.sessionId);
}

export function isPasswordValid(userId, clearPassword) {
  let { passwordHash, salt } = appContext.stores.users.getItem(userId);
  return comparePasswords(clearPassword, passwordHash, salt);
}

export function updatePassword(userId, clearPassword) {
  const hashedPassword = encodePassword(clearPassword);
  appContext.stores.users.updatePassword(userId, hashedPassword);
}
