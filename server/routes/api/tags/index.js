import { requireSession } from "../../../logics/handlers.js";
import { appContext } from "../../../contexts/appContext.js";

const postOptions = {
  preHandler: requireSession(true, true, false),
  schema: {
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string" },
      },
    },
  }
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
      let { q } = request.query;
      return appContext.stores.tags.getAll(q);
    }
  );

  fastify.get(
    "/:id",
    { preHandler: requireSession(true, true, false) },
    async function (request, reply) {
      let { id } = request.params;
      return appContext.stores.tags.getItemById(id);
    }
  );

  fastify.post("/", postOptions, async function (request, reply) {
    let { name } = request.body;
    if (name === "") throw new Error("name cannot be empty");
    if (appContext.stores.tags.existsItemByName(name))
      throw new Error("tag name already in use.");

    let id = appContext.stores.tags.addItem(name);
    reply.statusCode = 201;
    return { id, name };
  });

  fastify.put("/:id", postOptions, async function (request, reply) {
    let { id } = request.params;
    let { name } = request.body;
    if (name === "") throw new Error("name cannot be empty");
    let tag = appContext.stores.tags.getItemById(id);
    if (tag === undefined)
      throw fastify.httpErrors.notFound("tag with this id doesnt exist");
    appContext.stores.tags.updateItem(id, name);
    return { id, name };
  });

  fastify.delete(
    "/:id",
    { preHandler: requireSession(true, true, false) },
    async function (request, reply) {
      let { id } = request.params;
      let status = appContext.stores.bookmarks.deleteBookmarkById(id);
      if (status) return true;
      throw new Error("cannot delete");
    }
  );
}
