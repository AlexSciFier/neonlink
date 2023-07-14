import { requireSession } from "../../../../logics/handlers.js";
import { appContext } from "../../../../contexts/appContext.js";
import { appRequestsKeys } from "../../../../contexts/appRequests.js";

const settingsFields = {
  maxNumberOfLinks: { type: "number" },
  linkInNewTab: { type: "boolean" },
  useBgImage: { type: "boolean" },
  bgImage: { type: "string" },
  columns: { type: "number" },
  cardStyle: { type: "string" },
  enableNeonShadows: { type: "boolean" },
  cardPosition: { type: "string" },
};

export default async function (fastify, opts) {
  fastify.post(
    "/",
    {
      preHandler: requireSession(false, true, false),
      schema: {
        body: {
          type: "object",
          properties: settingsFields,
        },
      },
    },
    function (request, reply) {
      const session = appContext.request.get(appRequestsKeys.Session);
      for (const key in request.body) {
        appContext.stores.userSettings.updateItem(
          session.userId,
          key,
          request.body?.[key]
        );
      }
      return true;
    }
  );

  fastify.get(
    "/",
    {
      preHandler: requireSession(false, true, false),
      schema: {
        response: {
          200: {
            type: "object",
            properties: settingsFields,
          },
        },
      },
    },
    function (request, reply) {
      const session = appContext.request.get(appRequestsKeys.Session);
      return appContext.stores.userSettings.getItem(session.userId);
    }
  );
}
