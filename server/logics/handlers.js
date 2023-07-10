import { appContext } from "../contexts/appContext.js";
import { appRequestsKeys } from "../contexts/appRequests.js";
import { appSettingsKeys } from "../contexts/appSettings.js";
import {
  generateSessionId,
  loadSystemUser,
  setSessionCookie,
} from "./users.js";
import { addDays } from "../helpers/dates.js";

export async function requestContextHandler(request, reply) {
  let user = loadSystemUser();
  let sessionId = request.cookies.SSID;
  if (appContext.settings.get(appSettingsKeys.AuthenticationEnabled) && sessionId) {
    const session = appContext.stores.userSessions.getItem(sessionId);
    user = appContext.stores.users.getItem(session.userId);
    // Session token renewal after a day
    if (addDays(new Date(session.created), 1) < new Date()) {
      sessionId = generateSessionId();
      appContext.stores.userSessions.deleteItem(session.Id);
      appContext.stores.userSessions.addItem(sessionId, user.id);
      setSessionCookie(reply, sessionId);
    }
    
  }

  appContext.request.set(appRequestsKeys.Session, {
    authenticated: user.id != 0,
    sessionId: sessionId,
    userId: user.id,
    username: user.username,
    isAdmin: user.isAdmin === true,
  });
}

export function requireSession(
  allowAuthenticationDisabled,
  requireAuthenticatedUser,
  requireAuthenticatedAdmin
) {
  return async (request, reply) => {
    const authenticationEnabled = appContext.settings.get(
      appSettingsKeys.AuthenticationEnabled
    );
    if (!allowAuthenticationDisabled && !authenticationEnabled)
      throw reply.unauthorized("Authentication must be enabled.");
    else if (authenticationEnabled) {
      const session = appContext.request.get(appRequestsKeys.Session);
      if (requireAuthenticatedUser && !session.authenticated) 
        throw reply.unauthorized("Authenticated user required.");
      if (requireAuthenticatedAdmin && !session.isAdmin)
        throw reply.unauthorized("Authenticated admin required.");
    }
  };
}

export function requireVisitor(
  allowAuthenticationDisabled
) {
  return async (request, reply) => {
    const authenticationEnabled = appContext.settings.get(
      appSettingsKeys.AuthenticationEnabled
    );
    if (!allowAuthenticationDisabled && !authenticationEnabled)
      throw reply.unauthorized("Authentication must be enabled.");
    else if (authenticationEnabled) {
      const session = appContext.request.get(appRequestsKeys.Session);
      if (session.authenticated)
        throw reply.unauthorized("Authenticated user disallowed.");
    }
  };
}
