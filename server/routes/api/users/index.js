import { requireVisitor, requireSession } from "../../../logics/handlers.js";
import {
  createUser,
  isPasswordValid,
  loginUser,
  logoutUser,
  setSessionCookie,
  updatePassword,
} from "../../../logics/users.js";
import { appContext } from "../../../contexts/appContext.js";
import { appRequestsKeys } from "../../../contexts/appRequests.js";
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
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              authenticated: { type: "boolean" },
              id: { type: "number" },
              username: { type: "string" },
              isAdmin: { type: "boolean" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const authEnabled = appContext.settings.get(
        appSettingsKeys.AuthenticationEnabled
      );
      const session = appContext.request.get(appRequestsKeys.Session);
      return {
        authenticated: session.authenticated,
        id: session.userId,
        username: session.userName,
        isAdmin: session.isAdmin,
      };
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
          },
        },
      },
    },
    function (request) {
      let { username, password } = request.body;
      if (!appContext.settings.get(appSettingsKeys.RegistrationEnabled))
        throw fastify.httpErrors.notAcceptable("User registration disabled.");
      if (appContext.stores.users.checkWhetherUserExists(username))
        throw fastify.httpErrors.notAcceptable("This username already exist");
      if (appContext.hasAdminUser) {
        return createUser(username, password, false);
      } else {
        const res = createUser(username, password, true);
        appContext.hasAnyUser = appContext.stores.users.countItems() > 0;
        appContext.hasAdminUser =
          appContext.hasAnyUser && appContext.stores.users.countAdmins() > 0;
        return res;
      }
    }
  );

  fastify.put(
    "/changePassword",
    {
      preHandler: requireSession(false, true, false),
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
      const session = appContext.request.get("session");

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
    "/",
    { preHandler: requireSession(false, true, false) },
    async function (request, reply) {
      const session = appContext.request.get(appRequestsKeys.Session);
      if (appContext.stores.users.deleteUser(session.sessionId)) {
        appContext.hasAnyUser = appContext.stores.users.countItems() > 0;
        appContext.hasAdminUser =
          appContext.hasAnyUser && appContext.stores.users.countAdmins() > 0;
        return { status: "OK" };
      } else
        throw fastify.httpErrors.notFound("User with this id is not found");
    }
  );

  fastify.post(
    "/login",
    {
      preHandler: requireVisitor(false),
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
    function (request, reply) {
      const { username, password } = request.body;
      const data = loginUser(username, password);
      if (data) {
        setSessionCookie(reply, data.sessionId);
      } else {
        throw reply.forbidden("Username or password is incorrect");
      }
      return data;
    }
  );

  fastify.post(
    "/logout",
    { preHandler: requireSession(false, true, false) },
    async function (request, reply) {
      const res = logoutUser(reply);
      if (res) {
        setSessionCookie(reply);
      }
      return res;
    }
  );
}
