import { randomUUID } from "crypto";
import { requireSession, requireAuthenticatedUser } from "../../../logics/handlers.js";
import {
  createUser,
  isPasswordValid,
  loadUserWithSettingsByUUID,
  loadUserWithSettingsByUsername,
  updatePassword,
} from "../../../logics/users.js";
import { appContext } from "../../../contexts/appContext.js";
import { appSettingsKeys } from "../../../contexts/appSettings.js";

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

export default async function (fastify, opts) {
  fastify.get(
    "/me",
    {
      preHandler: requireSession,
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
            isAdmin: { type: "boolean" },
          },
        },
      },
    },
    function (request) {
      let { username, password } = request.body;
      let isAdmin = request.body?.isAdmin || false;
      if (appContext.stores.users.checkWhetherTableIsEmpty() === false)
        throw fastify.httpErrors.notAcceptable("Users limit reach");
      if (appContext.stores.users.checkWhetherUserExists(username))
        throw fastify.httpErrors.notAcceptable("This username already exist");
      if (appContext.stores.users.checkWhetherTableIsEmpty()) isAdmin === true;
      return createUser(username, password, isAdmin);
    }
  );

  fastify.put(
    "/changePassword",
    {
      preHandler: requireAuthenticatedUser,
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
      let { currentPassword, newPassword } = request.body;
      const session = appContext.request.get('session');

      let isValid = await isPasswordValid(session.userId, currentPassword);
      if (isValid === false) {
        throw fastify.httpErrors.forbidden("Password is incorrect");
      } else {
        updatePassword(session.userId, newPassword);
        return true;
      }
    }
  );

  fastify.delete(
    "/:id",
    { preHandler: requireSession },
    async function (request, reply) {
      let { id } = request.params;
      if (appContext.stores.users.deleteUser(id)) return { status: "OK" };
      else throw fastify.httpErrors.notFound("User with this id is not found");
    }
  );

  fastify.post(
    "/settings",
    {
      preHandler: requireSession,
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
        appContext.stores.userSettings.updateItem(uuid, key, request.body?.[key]);
        res[key] = request.body?.[key];
      }
      return res;
    }
  );

  fastify.post(
    "/settings/global",
    {
      preHandler: requireSession,
      schema: {
        body: {
          type: "object",
          properties: { noLogin: { type: "boolean" } },
        },
      },
    },
    async function (request, reply) {
      let uuid = request.cookies.SSID;
      let user = await loadUserWithSettingsByUUID(uuid);
      if (user.usergroup === 0) {
        if (request.body?.noLogin !== undefined)
          appContext.stores.appSettings.setNologin(request.body.noLogin);
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
            properties: { noLogin: { type: "boolean" } },
          },
        },
      },
    },
    async function (request, reply) {
      return { noLogin: !appContext.settings.get(appSettingsKeys.AuthenticationEnabled) };
    }
  );

  fastify.get(
    "/settings",
    {
      preHandler: requireSession,
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
      return appContext.stores.userSettings.getItem(uuid);
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
        appContext.stores.users.addUUID(username, userId);
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
}
