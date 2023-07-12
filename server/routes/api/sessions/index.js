import { appContext } from "../../../contexts/appContext.js";
import { appRequestsKeys } from "../../../contexts/appRequests.js";
import { appSettingsKeys } from "../../../contexts/appSettings.js";

export default async function (fastify, opts) {
  fastify.get(
    "/",
    {
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "number" },
              username: { type: "string" },
              isAdmin: { type: "number" },
              hasAnyUser: { type: "boolean" },
              hasAnyAdmin: { type: "boolean" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const authEnabled = appContext.settings.get(appSettingsKeys.AuthenticationEnabled);
      const session = appContext.request.get(appRequestsKeys.Session);
      if (authEnabled && !appContext.hasAdminUser)
        throw new 
      return {
        authenticated: session.authenticated,
        id: session.userId,
        username: session.username,
        isAdmin: session.isAdmin,
        forceRegistration: forceRegistration,
      };
    }
  );
}
