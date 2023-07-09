import { appContext } from "../contexts/appContext.js";
import { appSettingsKeys } from "../contexts/appSettings.js";
import { loadSystemUser } from "./users.js";

export async function requestContextHandler(request, reply) {
  const authenticationEnabled = appContext.settings.get(appSettingsKeys.AuthenticationEnabled);

  const sessionId = request.cookies.SSID;
  if (sessionId) {
    let user = authenticationEnabled 
      ? appContext.stores.users.getItemByUUID(sessionId) 
      : loadSystemUser();

    appContext.request.set("session", {
      authenticated: user ? true : false,
      sessionId: sessionId, 
      userId: user?.id,
      username: user?.username, 
      isAdmin: user?.isAdmin === true
    });
  } else {
    appContext.request.set("session", {
      authenticated: false,
      userId: 0,
      isAdmin: false
    });
  }
}

export function requireSession(allowAuthenticationDisabled=true, requireAuthenticatedUser=false, requireAuthenticatedAdmin=false) {
  return async (request, reply) => {
    const authenticationEnabled = appContext.settings.get(appSettingsKeys.AuthenticationEnabled);
    if (!allowAuthenticationDisabled && !authenticationEnabled) {
      throw reply.unauthorized("Authentication must be enabled.");
    }
    else if (authenticationEnabled) {
      // If authentication is enabled, the request requires authentication so a session is required.
      const session = appContext.request.get("session");
      if (requireAuthenticatedUser && !session.authenticated)
        throw reply.unauthorized("Authenticated user required.");
      if (requireAuthenticatedAdmin && !session.isAdmin)
        throw reply.unauthorized("Authenticated admin required.");
    }   
  };
}