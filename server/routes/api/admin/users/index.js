import { requireSession } from "../../../../logics/handlers.js";
import {
  createUser,
  isPasswordValid,
  updatePassword,
} from "../../../../logics/users.js";
import { appContext } from "../../../../contexts/appContext.js";

export default async function (fastify, opts) {
  fastify.post(
    "/",
    {
      preHandler: requireSession(true, true, true),
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
      if (appContext.stores.users.checkWhetherUserExists(username))
        throw fastify.httpErrors.notAcceptable("This username already exist");
      return createUser(username, password, isAdmin);
    }
  );

  fastify.put(
    "/changePassword",
    {
      preHandler: requireSession(true, true, true),
      schema: {
        body: {
          type: "object",
          required: ["username", "newPassword"],
          properties: {
            username: { type: "string" },
            currentPassword: { type: "string" },
            newPassword: { type: "string" },
          },
        },
      },
    },
    async function (request) {
      const { username, currentPassword, newPassword } = request.body;
      const user = appContext.stores.users.getItemByUsername(username);

      if (user === undefined) {
        throw fastify.httpErrors.notFound("Username not found");
      } else {
        let isValid = await isPasswordValid(user.userId, currentPassword);
        if (isValid === false) {
          throw fastify.httpErrors.forbidden("Password is incorrect");
        } else {
          updatePassword(user.userId, newPassword);
          return true;
        }
      }
    }
  );

  fastify.delete(
    "/:id",
    { preHandler: requireSession(true, true, true) },
    async function (request, reply) {
      let { id } = request.params;
      if (appContext.stores.users.deleteUser(id)) return { status: "OK" };
      else throw fastify.httpErrors.notFound("User with this id is not found");
    }
  );
}
