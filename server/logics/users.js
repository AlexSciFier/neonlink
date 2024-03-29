import { appContext } from "../contexts/appContext.js";
import { appRequestsKeys } from "../contexts/appRequests.js";
import { appSettingsKeys } from "../contexts/appSettings.js";
import { addDays } from "../helpers/dates.js";
import { encodePassword, comparePasswords } from "../helpers/security.js";
import { randomUUID } from "crypto";

export function createUser(username, clearPassword, isAdmin = false) {
  const hashedPassword = encodePassword(clearPassword);
  return appContext.stores.users.addItem(username, hashedPassword, isAdmin);
  //TODO: move the usersettings creation logic here ?
}

export function generateSessionId() {
  return randomUUID();
}

export function loadSystemUser() {
  return {
    id: 0,
    username: "system",
    isAdmin: !appContext.settings.get(appSettingsKeys.AuthenticationEnabled),
  };
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
  if (user && comparePasswords(clearPassword, user.passwordHash, user.salt)) {
    const sessionId = generateSessionId();
    appContext.stores.userSessions.addItem(sessionId, user.id);
    return {
      sessionId,
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    };
  }
  return null;
}

export function logoutUser() {
  const session = appContext.request.get(appRequestsKeys.Session);
  if (session) {
    appContext.stores.userSessions.deleteItem(session.sessionId);
    return true;
  }
  return false;
}

export function isPasswordValid(userId, clearPassword) {
  let { passwordHash, salt } = appContext.stores.users.getItem(userId);
  return comparePasswords(clearPassword, passwordHash, salt);
}

export function setSessionCookie(reply, sessionId) {
  if (sessionId) {
    const sessionLengthInDays = appContext.settings.get(
      appSettingsKeys.SessionLengthInDays
    );
    reply.setCookie("SSID", sessionId, {
      path: "/",
      httpOnly: true,
      expires: addDays(new Date(), sessionLengthInDays),
    });
  } else {
    reply.clearCookie("SSID");
  }
}

export function updateIsAdmin(userId, isAdmin) {
  appContext.stores.users.updateIsAdmin(userId, isAdmin);
}

export function updatePassword(userId, clearPassword) {
  const hashedPassword = encodePassword(clearPassword);
  appContext.stores.users.updatePassword(userId, hashedPassword);
}
