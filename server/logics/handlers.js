import { appContext } from "../contexts/appContext.js";
import { appSettingsKeys } from "../contexts/appSettings.js";

export async function requestContextHandler(request, reply) {
  const authenticationEnabled = appContext.settings.get(appSettingsKeys.AuthenticationEnabled);

  const sessionId = request.cookies.SSID;
  if (sessionId) {
    let user = authenticationEnabled ? appContext.stores.users.getItemByUUID(sessionId) : appContext.stores.users.getNologinUser();

    request.requestContext.set("session", {
      authenticated: user ? true : false,
      sessionId: sessionId, 
      userId: user?.id,
      username: user?.username, 
      isAdmin: user?.isAdmin === true
    });
  } else {
    request.requestContext.set("session", {
      authenticated: false
    });
  }
}

export async function requireSession(request, reply) {
  if (appContext.settings.get(appSettingsKeys.AuthenticationEnabled)) {
    // If authentication is enabled, the request requires authentication so a session is required.
    const session = request.requestContext.get("session");
    if (!session.authenticated)
      throw reply.unauthorized("Authenticated user required.");
  }
}

export async function requireAuthenticatedUser(request, reply) {
  if (!appContext.settings.get(appSettingsKeys.AuthenticationEnabled)) 
    throw reply.unauthorized("Authentication must be enabled.")

  // If authentication is enabled, the request requires authentication so a session is required.
  const session = request.requestContext.get("session");
  if (!session.authenticated || session.userId === 0)
    throw reply.unauthorized("Authenticated user required.");
}

export async function requireAuthenticatedAdmin(request, reply) {
  if (appContext.settings.get(appSettingsKeys.AuthenticationEnabled)) {
    // If authentication is enabled, the request requires authentication so a session is required.
    const session = request.requestContext.get("session");
    if (!session.authenticated)
      throw reply.unauthorized("Authenticated user required.");
    if (!session.isAdmin)
      throw reply.unauthorized("Authorization required.");
  }
}
