import { requestForbidden } from "../../../logics/handlers.js";
import { stores } from "../../../db/stores.js";

const postOptions = {
  schema: {
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string" },
      },
    },
  },
  preHandler: requestForbidden,
};

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
      let { q } = request.query;
      if (q) return stores.tags(q);
      return stores.tags.getAllTags();
    }
  );

  fastify.get(
    "/:id",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let { id } = request.params;
      return stores.tags.getTagById(id);
    }
  );

  fastify.post("/", postOptions, async function (request, reply) {
    let { name } = request.body;
    if (name === "") throw new Error("name cannot be empty");
    let id = stores.tags.addTag(name);
    reply.statusCode = 201;
    return { id, name };
  });

  fastify.put("/:id", postOptions, async function (request, reply) {
    let { id } = request.params;
    let { name } = request.body;
    if (name === "") throw new Error("name cannot be empty");
    let tag = stores.tags.getTagById(id);
    if (tag === undefined)
      throw fastify.httpErrors.notFound("tag with this id doesnt exist");
    stores.tags.updateTagById(id, name);
    return { id, name };
  });

  fastify.delete(
    "/:id",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let { id } = request.params;
      let status = stores.bookmarks.deleteBookmarkById(id);
      if (status) return true;
      throw new Error("cannot delete");
    }
  );
};
