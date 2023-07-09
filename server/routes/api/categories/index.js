import { requireSession } from "../../../logics/handlers.js";
import { appContext } from "../../../contexts/appContext.js";

/**
 *
 * @param {import("fastify").FastifyInstance} fastify
 * @param {*} opts
 */
export default async function (fastify, opts) {
  fastify.get(
    "/",
    { preHandler: requireSession(true, false, false) },
    async function (request, reply) {
      return appContext.stores.categories.getAll();
    }
  );

  fastify.get(
    "/:id",
    { preHandler: requireSession(true, false, false) },
    async function (request, reply) {
      let { id } = request.params;
      let category = store.categories.getCategoryById(id);
      if (category) return category;
      throw fastify.httpErrors.notFound(`bookmark with id ${id} not found`);
    }
  );

  fastify.post(
    "/",
    {
      preHandler: requireSession(true, false, false),
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

      let existingCategory = appContext.stores.categories.getItemByName(name);

      if (existingCategory) {
        return appContext.stores.categories.updateItem(
          existingCategory.id,
          name,
          color,
          position
        );
      }
      reply.statusCode = 201;
      return appContext.stores.categories.addItem(name, color, position);
    }
  );

  fastify.put(
    "/:id",
    {
      preHandler: requireSession(true, false, false),
      schema: {
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
      if (appContext.stores.categories.updateItem(id, name, color))
        return { id, name, color };
      throw fastify.httpErrors.notFound();
    }
  );

  fastify.put(
    "/changePositions",
    {
      preHandler: requireSession(true, false, false),
      schema: {
        body: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "position"],
            properties: {
              id: { type: "number" },
              position: { type: "number" },
            },
          },
        },
      },
    },
    async function (request, reply) {
      let array = request.body;
      if (appContext.stores.categories.updatePositions(array)) return true;
      throw fastify.httpErrors.notFound();
    }
  );

  fastify.delete(
    "/:id",
    { preHandler: requireSession(true, false, false) },
    async function (request, reply) {
      let { id } = request.params;
      if (appContext.stores.categories.deleteItem(id)) return true;
      else throw fastify.httpErrors.notFound();
    }
  );
}
