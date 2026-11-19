import { requireSession } from "../../../logics/handlers.js";
import { appContext } from "../../../contexts/appContext.js";
import { appRequestsKeys } from "../../../contexts/appRequests.js";

const idParams = {
  type: "object",
  required: ["id"],
  properties: { id: { type: "integer", minimum: 1 } },
};

/**
 *
 * @param {import("fastify").FastifyInstance} fastify
 * @param {*} opts
 */
export default async function (fastify, opts) {
  fastify.get(
    "/",
    { preHandler: requireSession(true, true, false) },
    async function (request, reply) {
      const user = appContext.request.get(appRequestsKeys.Session);
      return appContext.stores.categories.getAll(user.userId);
    }
  );

  fastify.get(
    "/:id",
    {
      preHandler: requireSession(true, true, false),
      schema: { params: idParams },
    },
    async function (request, reply) {
      let { id } = request.params;
      const user = appContext.request.get(appRequestsKeys.Session);
      let category = appContext.stores.categories.isVisible(id, user)
        ? appContext.stores.categories.getItemById(id)
        : undefined;
      if (category) return category;
      throw fastify.httpErrors.notFound(`bookmark with id ${id} not found`);
    }
  );

  fastify.post(
    "/",
    {
      preHandler: requireSession(true, true, false),
      schema: {
        body: {
          type: "object",
          required: ["name", "color"],
          properties: {
            name: { type: "string" },
            color: { type: "string" },
            position: { type: "number" },
          },
        },
      },
    },
    async function (request, reply) {
      let { name, color, position } = request.body;

      const user = appContext.request.get(appRequestsKeys.Session);
      let existingCategory = appContext.stores.categories.getModifiableByName(
        name,
        user
      );

      if (
        existingCategory &&
        appContext.stores.categories.isModifiable(existingCategory.id, user)
      ) {
        appContext.stores.categories.updateItem(
          existingCategory.id,
          name,
          color,
          user
        );
        return existingCategory.id;
      }
      reply.statusCode = 201;
      return appContext.stores.categories.addItem(name, color, user.userId);
    }
  );

  fastify.put(
    "/:id",
    {
      preHandler: requireSession(true, true, false),
      schema: {
        params: idParams,
        response: {
          200: {
            type: "object",
            required: ["id", "name", "color"],
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
              color: { type: "string" },
            },
          },
        },
        body: {
          type: "object",
          required: ["name", "color"],
          properties: {
            name: { type: "string" },
            color: { type: "string" },
          },
        },
      },
    },
    async function (request, reply) {
      let { id } = request.params;
      let { name, color } = request.body;
      const user = appContext.request.get(appRequestsKeys.Session);
      if (appContext.stores.categories.updateItem(id, name, color, user))
        return { id, name, color };
      throw fastify.httpErrors.notFound();
    }
  );

  fastify.put(
    "/changePositions",
    {
      preHandler: requireSession(true, true, false),
      schema: {
        body: {
          type: "array",
          maxItems: 500,
          items: {
            type: "object",
            required: ["id", "position"],
            properties: {
              id: { type: "integer", minimum: 1 },
              position: { type: "integer", minimum: 0 },
            },
          },
        },
      },
    },
    async function (request, reply) {
      let array = request.body;
      const user = appContext.request.get(appRequestsKeys.Session);
      if (appContext.stores.categories.updatePositions(array, user))
        return true;
      throw fastify.httpErrors.notFound();
    }
  );

  fastify.delete(
    "/:id",
    {
      preHandler: requireSession(true, true, false),
      schema: { params: idParams },
    },
    async function (request, reply) {
      let { id } = request.params;
      const user = appContext.request.get(appRequestsKeys.Session);
      if (appContext.stores.categories.deleteItem(id, user)) return true;
      else throw fastify.httpErrors.notFound();
    }
  );
}
