import { requireSession } from "../../../../logics/handlers.js";
import { appContext } from "../../../../contexts/appContext.js";
import { appSettingsKeys } from "../../../../contexts/appSettings.js";

export default async function (fastify, opts) {
  fastify.post(
    "/",
    {
      preHandler: requireSession(true, true, false),
      schema: {
        body: {
          type: "object",
          properties: { 
            authenticationEnabled: { type: "boolean" },
            sessionLengthInDays: { type: "number" },
            userRegistrationEnabled: { type: "boolean" } 
          },
        },
      },
    },
    async function (request, reply) {
      const authenticationEnabled = appContext.settings.get(appSettingsKeys.AuthenticationEnabled);
      const session = appContext.request.get('session');
      let settingsChanged = false;
      if (!authenticationEnabled || (session.authenticated)) {
        if (request.body?.authenticationEnabled !== undefined) {
          appContext.settings.set(appSettingsKeys.AuthenticationEnabled, Boolean(request.body.authenticationEnabled));
          settingsChanged = true;
        }
      }
      if (settingsChanged) {
        await appContext.settings.save();
      }
      return {
        authenticationEnabled: appContext.settings.get(appSettingsKeys.AuthenticationEnabled),
        sessionLengthInDays: appContext.settings.get(appSettingsKeys.SessionLengthInDays),
        userRegistrationEnabled: appContext.settings.get(appSettingsKeys.UserRegistrationEnabled)
       };
    }
  );

  fastify.get(
    "/",
    {
      requireSession: (true, false, false),
      schema: {
        response: {
          200: {
            type: "object",
            properties: { 
              authenticationEnabled: { type: "boolean" },
              sessionLengthInDays: { type: "number" },
              userRegistrationEnabled: { type: "boolean" } 
            }
          }
        }
      }
    },
    function (request, reply) {
      return {
        authenticationEnabled: appContext.settings.get(appSettingsKeys.AuthenticationEnabled),
        sessionLengthInDays: appContext.settings.get(appSettingsKeys.SessionLengthInDays),
        userRegistrationEnabled: appContext.settings.get(appSettingsKeys.UserRegistrationEnabled)
       };
    }
  );
}
