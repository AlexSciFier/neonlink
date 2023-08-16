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
            registrationEnabled: { type: "boolean" },
          },
        },
      },
    },
    async function (request, reply) {
      const authenticationEnabled = appContext.settings.get(
        appSettingsKeys.AuthenticationEnabled
      );
      const session = appContext.request.get("session");
      let settingsChanged = false;
      if (!authenticationEnabled || session.authenticated) {
        if (request.body?.authenticationEnabled !== undefined) {
          appContext.settings.set(
            appSettingsKeys.AuthenticationEnabled,
            Boolean(request.body.authenticationEnabled)
          );
          settingsChanged = true;
        }
        if (request.body?.sessionLengthInDays !== undefined) {
          appContext.settings.set(
            appSettingsKeys.SessionLengthInDays,
            request.body.sessionLengthInDays
          );
          settingsChanged = true;
        }
        if (request.body?.registrationEnabled !== undefined) {
          appContext.settings.set(
            appSettingsKeys.RegistrationEnabled,
            Boolean(request.body.registrationEnabled)
          );
          settingsChanged = true;
        }
      }
      if (settingsChanged) {
        await appContext.settings.save();
      }
      return true;
    }
  );

  fastify.get(
    "/",
    {
      preHandler: requireSession(true, false, false),
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              authenticationEnabled: { type: "boolean" },
              sessionLengthInDays: { type: "number" },
              registrationEnabled: { type: "boolean" },
              forceRegistration: { type: "boolean" },
            },
          },
        },
      },
    },
    function (request, reply) {
      return {
        authenticationEnabled: appContext.settings.get(
          appSettingsKeys.AuthenticationEnabled
        ),
        sessionLengthInDays: appContext.settings.get(
          appSettingsKeys.SessionLengthInDays
        ),
        registrationEnabled: appContext.settings.get(
          appSettingsKeys.RegistrationEnabled
        ),
        forceRegistration:
          appContext.settings.get(appSettingsKeys.AuthenticationEnabled) &&
          !appContext.hasAdminUser,
      };
    }
  );
}
