"use strict";
const db = require("../../../db/connect");
const crypto = require("crypto");

/**
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} reply
 */
async function requestForbidden(request, reply) {
  if (request.cookies === undefined)
    throw reply.unauthorized("You must login to use this method");
  let { SSID } = request.cookies;
  let user = await db.getUserByUUID(SSID);
  if (user === undefined)
    throw reply.unauthorized("You must login to use this method");
}

/**
 *
 * @param {import("fastify").FastifyInstance} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
  fastify.get(
    "/me",
    {
      preHandler: requestForbidden,
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              username: { type: "string" },
              usergroup: { type: "number" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      let { SSID } = request.cookies;
      return db, db.getUserByUUID(SSID);
    }
  );

  fastify.post(
    "/",
    {
      schema: {
        body: {
          type: "object",
          required: ["username", "password", "isAdmin"],
          properties: {
            username: { type: "string" },
            password: { type: "string" },
            isAdmin: { type: "boolean" },
          },
        },
      },
    },
    async function (request) {
      let { username, password, isAdmin } = request.body;
      if (db.isUserExist(username))
        throw fastify.httpErrors.notAcceptable("This username already exist");
      return await db.addUser(username, password, isAdmin);
    }
  );

  fastify.delete(
    "/:id",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let { id } = request.params;
      if (db.deleteUser(id)) return { status: "OK" };
      else throw fastify.httpErrors.notFound("User with this id is not found");
    }
  );

  fastify.post(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string" },
            password: { type: "string" },
          },
        },
      },
    },
    async function (request, reply) {
      let { username, password } = request.body;
      let isValid = await db.isPasswordValid(username, password);
      if (isValid) {
        let user = db.getUser(username);
        let userId = user.uuid || crypto.randomUUID();
        reply.setCookie("SSID", userId, {
          path: "/",
          httpOnly: true,
          expires: new Date(new Date().setMonth(new Date().getMonth() + 8)),
        });
        if (user.uuid) {
          return user;
        }
        db.addUUID(username, userId);
        return user;
      } else {
        throw reply.forbidden("Username or password is incorrect");
      }
    }
  );

  fastify.post("/logout", async function (request, reply) {
    reply.clearCookie("SSID");
    return true;
  });
};
