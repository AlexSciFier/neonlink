import { requestForbidden } from "../utils/preHandler.js";
import { stores } from "../../../db/stores.js";

/**
 *
 * @param {import("fastify").FastifyInstance} fastify
 * @param {*} opts
 */
export default async function (fastify, opts) {
  fastify.get(
    "/",
    { preHandler: requestForbidden },
    async function (request, reply) {
      return stores.categories.getAllCategories();
    }
  );

  fastify.get(
    "/:id",
    { preHandler: requestForbidden },
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
      preHandler: requestForbidden,
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

      let existingCategory = stores.categories.getCategoryByName(name);

      if (existingCategory) {
        return stores.categories.updateCategoryById(
          existingCategory.id,
          name,
          color,
          position
        );
      }
      reply.statusCode = 201;
      return stores.categories.addCategory(name, color, position);
    }
  );

  fastify.put(
    "/:id",
    {
      preHandler: requestForbidden,
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
      if (stores.categories.updateCategoryById(id, name, color)) return { id, name, color };
      throw fastify.httpErrors.notFound();
    }
  );

  fastify.put(
    "/changePositions",
    {
      preHandler: requestForbidden,
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
      if (stores.categories.updatePostitions(array)) return true;
      throw fastify.httpErrors.notFound();
    }
  );

  fastify.delete(
    "/:id",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let { id } = request.params;
      if (stores.categories.deleteCategoryById(id)) return true;
      else throw fastify.httpErrors.notFound();
    }
  );
};
