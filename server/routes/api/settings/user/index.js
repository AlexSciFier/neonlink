import { requireSession } from "../../../../logics/handlers.js";
import { appContext } from "../../../../contexts/appContext.js";

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
    async function (request, reply) {
      let uuid = request.cookies.SSID;
      let res = {};
      for (const key in request.body) {
        appContext.stores.userSettings.updateItem(uuid, key, request.body?.[key]);
        res[key] = request.body?.[key];
      }
      return res;
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
    async function (request, reply) {
      let uuid = request.cookies.SSID;
      return appContext.stores.userSettings.getItem(uuid);
    }
  );
}
