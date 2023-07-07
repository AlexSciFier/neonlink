import { randomUUID } from "crypto";
import { requestForbidden, requestForbiddenUser } from "../../../logics/handlers.js";
import { createUser, isPasswordValid, loadUserWithSettingsByUUID, loadUserWithSettingsByUsername, updatePassword } from "../../../logics/users.js";
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
      return await loadUserWithSettingsByUUID(SSID);
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
    function (request) {
      let { username, password } = request.body;
      let isAdmin = request.body?.isAdmin || false;
      if (stores.users.checkWhetherTableIsEmpty() === false)
        throw fastify.httpErrors.notAcceptable("Users limit reach");
      if (stores.users.checkWhetherUserExists(username))
        throw fastify.httpErrors.notAcceptable("This username already exist");
      if (stores.users.checkWhetherTableEmpty()) isAdmin === true;
      return createUser(username, password, isAdmin);
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
      if (stores.users.checkWhetherUserExists(username) === false) {
        throw fastify.httpErrors.notFound("Username not found");
      } else {
        let isValid = await isPasswordValid(username, currentPassword);
        if (isValid === false) {
          throw fastify.httpErrors.forbidden("Password is incorrect");
        } else {
          updatePassword(username, newPassword);
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
        stores.userSettings.updateItem(uuid, key, request.body?.[key]);
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
      let user = await loadUserWithSettingsByUUID(uuid);
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
      return stores.userSettings.getItem(uuid);
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
      let user = loadUserWithSettingsByUsername(username);
      if (user === undefined)
        throw reply.notFound("Username or password is incorrect");
      let isValid = await isPasswordValid(username, password);
      if (isValid) {
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
