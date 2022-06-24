"use strict";
const { default: fastify } = require("fastify");
const db = require("../../../db/connect");

/**
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} reply
 */
async function requestForbidden(request, reply) {
  try {
    let SSID = request.cookies.SSID;
    if (SSID) {
      let user = await db.getUserByUUID(SSID);
      if (user === undefined) {
        throw reply.unauthorized("You must login to use this method");
      }
    } else throw reply.unauthorized("You must login to use this method");
  } catch {
    throw reply.unauthorized("You must login to use this method");
  }
}

/**
 *
 * @param {import("fastify").FastifyInstance} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
  fastify.get(
    "/",
    { preHandler: requestForbidden },
    async function (request, reply) {
      return db.getAllCategories();
    }
  );

  fastify.get(
    "/:id",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let { id } = request.params;
      let category = db.getCategoryById(id);
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

      let existingCategory = db.getCategoryByName(name);

      if (existingCategory) {
        return db.updateCategoryById(
          existingCategory.id,
          name,
          color,
          position
        );
      }
      reply.statusCode = 201;
      return db.addCategory(name, color, position);
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
      if (db.updateCategoryById(id, name, color)) return { id, name, color };
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
      if (db.updatePostitions(array)) return true;
      throw fastify.httpErrors.notFound();
    }
  );

  fastify.delete(
    "/:id",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let { id } = request.params;
      if (db.deleteCategoryById(id)) return true;
      else throw fastify.httpErrors.notFound();
    }
  );
};
