import { requireSession } from "../../../../logics/handlers.js";
import { appContext } from "../../../../contexts/appContext.js";
import { appSettingsKeys } from "../../../../contexts/appSettings.js";

export default async function (fastify, opts) {
  fastify.post(
    "/",
    {
      preHandler: requireSession(true, false, false),
      schema: {
        body: {
          type: "object",
          properties: { noLogin: { type: "boolean" } },
        },
      },
    },
    async function (request, reply) {
      const authenticationEnabled = appContext.settings.get(appSettingsKeys.AuthenticationEnabled);
      const session = appContext.request.get('session');
      console.log(`ae: ${authenticationEnabled}, session: ${JSON.stringify(session)}`);
      if (!authenticationEnabled || (session.authenticated)) {
        if (request.body?.noLogin !== undefined) {
          appContext.settings.set(appSettingsKeys.AuthenticationEnabled, !request.body.noLogin);
          await appContext.settings.save();
        }
      }
      return { noLogin: !appContext.settings.get(appSettingsKeys.AuthenticationEnabled) };
    }
  );

  fastify.get(
    "/",
    {
      schema: {
        response: {
          200: {
            type: "object",
            properties: { noLogin: { type: "boolean" } },
          },
        },
      },
    },
    async function (request, reply) {
      return { noLogin: !appContext.settings.get(appSettingsKeys.AuthenticationEnabled) };
    }
  );
}
