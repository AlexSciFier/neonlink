"use strict";

const { deleteBookmarkById } = require("../../../db/bookmarks");
const {
  getAllTags,
  getTagById,
  addTag,
  updateTagById,
  findTags,
} = require("../../../db/tags");

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
};

/**
 *
 * @param {import("fastify").FastifyInstance} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    let { q } = request.query;
    if (q) return findTags(q);
    return getAllTags();
  });

  fastify.get("/:id", async function (request, reply) {
    let { id } = request.params;
    return getTagById(id);
  });

  fastify.post("/", postOptions, async function (request, reply) {
    let { name } = request.body;
    if (name === "") throw new Error("name cannot be empty");
    let id = addTag(name);
    reply.statusCode = 201;
    return { id, name };
  });

  fastify.put("/:id", postOptions, async function (request, reply) {
    let { id } = request.params;
    let { name } = request.body;
    if (name === "") throw new Error("name cannot be empty");
    let tag = getTagById(id);
    if (tag === undefined)
      throw fastify.httpErrors.notFound("tag with this id doesnt exist");
    updateTagById(id, name);
    return { id, name };
  });

  fastify.delete("/:id", async function (request, reply) {
    let { id } = request.params;
    let status = deleteBookmarkById(id);
    if (status) return true;
    throw new Error("cannot delete");
  });
};
