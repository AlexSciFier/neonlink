import { randomUUID } from "crypto";
import { requestForbidden, requestForbiddenUser } from "../../../logics/handlers.js";
import { stores } from "../../../db/stores.js"

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
 * @param {import("fastify").FastifyInstance} fastify
 * @param {*} opts
 */
export default async function (fastify, opts) {
  fastify.get(
    "/me",
    {
      preHandler: requestForbiddenUser,
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
      return await stores.users.getUserByUUID(SSID, stores.appSettings.getNologin());
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
            isAdmin: { type: "boolean" }
          }
        }
      }
    },
    async function (request) {
      let { username, password } = request.body;
      let isAdmin = request.body?.isAdmin || false;
      if (stores.users.isUsersTableEmpty() === false)
        throw fastify.httpErrors.notAcceptable("Users limit reach");
      if (stores.users.isUserExist(username))
        throw fastify.httpErrors.notAcceptable("This username already exist");
      if (stores.users.isUsersTableEmpty()) isAdmin === true;
      return await stores.users.addUser(username, password, isAdmin);
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
      if (stores.users.isUserExist(username) === false) {
        throw fastify.httpErrors.notFound("Username not found");
      } else {
        let isValid = await stores.users.isPasswordValid(username, currentPassword);
        if (isValid === false) {
          throw fastify.httpErrors.forbidden("Password is incorrect");
        } else {
          stores.users.changePassword(username, newPassword);
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
      if (stores.users.deleteUser(id)) return { status: "OK" };
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
        }
      }
    },
    async function (request, reply) {
      let uuid = request.cookies.SSID;
      let res = {};
      for (const key in request.body) {
        stores.users.setUserSetting(uuid, key, request.body?.[key]);
        res[key] = request.body?.[key];
      }
      return res;
    }
  );

  fastify.post(
    "/settings/global",
    {
      preHandler: requestForbidden,
      schema: {
        body: {
          type: "object",
          properties: { noLogin: { type: "boolean" } },
        }
      }
    },
    async function (request, reply) {
      let uuid = request.cookies.SSID;
      let user = await stores.users.getUserByUUID(uuid, stores.appSettings.getNologin());
      if (user.usergroup === 0) {
        if (request.body?.noLogin !== undefined)
          stores.appSettings.setNologin(request.body.noLogin);
      }
      return request.body;
    }
  );

  fastify.get(
    "/settings/global",
    {
      schema: {
        response: {
          200: {
            type: "object",
            properties: { noLogin: { type: "boolean" } }
          }
        }
      }
    },
    async function (request, reply) {
      return { noLogin: stores.appSettings.getNologin() };
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
          }
        }
      }
    },
    async function (request, reply) {
      let uuid = request.cookies.SSID;
      return stores.users.getUserSettings(uuid);
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
            ...settingsFields,
          },
        },
      },
    },
    async function (request, reply) {
      let { username, password } = request.body;
      if (stores.users.getUser(username) === undefined)
        throw reply.notFound("Username or password is incorrect");
      let isValid = await stores.users.isPasswordValid(username, password);
      if (isValid) {
        let user = stores.users.getUser(username);
        let userId = user.uuid || randomUUID();
        reply.setCookie("SSID", userId, {
          path: "/",
          httpOnly: true,
          expires: new Date(new Date().setMonth(new Date().getMonth() + 8)),
        });
        if (user.uuid) {
          return user;
        }
        stores.users.addUUID(username, userId);
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
