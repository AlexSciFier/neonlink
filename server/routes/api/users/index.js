"use strict";
const db = require("../../../db/connect");
const crypto = require("crypto");
const { setUserSetting, getUserSettings } = require("../../../db/connect");

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

/**
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} reply
 */
async function requestForbidden(request, reply) {
  if (await db.isUsersTableEmpty())
    throw reply.notFound("No registrated users");
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
              ...settingsFields,
            },
          },
        },
      },
    },
    async (request, reply) => {
      let { SSID } = request.cookies;
      return db.getUserByUUID(SSID);
    }
  );

  fastify.post(
    "/",
    {
      schema: {
        body: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string" },
            password: { type: "string" },
            isAdmin: { type: "boolean" },
          },
        },
      },
    },
    async function (request) {
      let { username, password } = request.body;
      let isAdmin = request.body?.isAdmin || false;
      if (db.isUsersTableEmpty() === false)
        throw fastify.httpErrors.notAcceptable("Users limit reach");
      if (db.isUserExist(username))
        throw fastify.httpErrors.notAcceptable("This username already exist");
      if (db.isUsersTableEmpty()) isAdmin === true;
      return await db.addUser(username, password, isAdmin);
    }
  );

  fastify.put(
    "/changePassword",
    {
      preHandler: requestForbidden,
      schema: {
        body: {
          type: "object",
          required: ["username", "currentPassword", "newPassword"],
          properties: {
            username: { type: "string" },
            currentPassword: { type: "string" },
            newPassword: { type: "string" },
          },
        },
      },
    },
    async function (request) {
      let { username, currentPassword, newPassword } = request.body;
      if (db.isUserExist(username) === false) {
        throw fastify.httpErrors.notFound("Username not found");
      } else {
        let isValid = await db.isPasswordValid(username, currentPassword);
        if (isValid === false) {
          throw fastify.httpErrors.forbidden("Password is incorrect");
        } else {
          db.changePassword(username, newPassword);
          return true;
        }
      }
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
    "/settings",
    {
      preHandler: requestForbidden,
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
        setUserSetting(uuid, key, request.body?.[key]);
        res[key] = request.body?.[key];
      }
      return res;
    }
  );

  fastify.get(
    "/settings",
    {
      preHandler: requestForbidden,
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
      return getUserSettings(uuid);
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
      if (db.getUser(username) === undefined)
        throw reply.notFound("Username or password is incorrect");
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
