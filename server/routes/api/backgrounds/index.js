import axios from "axios";
import path from "path";
import { appContext } from "../../../contexts/appContext.js";
import { appRequestsKeys } from "../../../contexts/appRequests.js";
import {
  addBackground,
  deleteBackground,
  getAllBackgrounds,
  getBackgroundById,
  isBackgroundExist,
} from "../../../logics/backgrounds.js";
import { requireSession } from "../../../logics/handlers.js";

export default async function (fastify, opts) {
  fastify.get(
    "/",
    { preHandler: requireSession(true, true, false) },
    async function (request, reply) {
      const user = appContext.request.get(appRequestsKeys.Session);

      return getAllBackgrounds(user.userId);
    }
  );

  fastify.get(
    "/:id",
    { preHandler: requireSession(true, true, false) },
    async function (request, reply) {
      const { id } = request.params;
      const user = appContext.request.get(appRequestsKeys.Session);
      return getBackgroundById(id, user.userId);
    }
  );

  fastify.post(
    "/",
    {
      preHandler: requireSession(true, true, false),
      schema: {
        schema: {
          body: {
            type: "object",
            required: ["url"],
            properties: {
              url: { type: "string" },
            },
          },
        },
      },
    },
    async function (request, reply) {
      const { url } = request.body;
      const user = appContext.request.get(appRequestsKeys.Session);

      let res = isBackgroundExist(url, user.userId);
      if (res) throw reply.notAcceptable("Already exist");

      let imgRes = await axios.get(url, {
        method: "GET",
        responseType: "stream",
      });
      if (imgRes.status !== 200)
        throw reply.notFound(
          "Cannot download image from this url. " + imgRes.statusText
        );

      res = await addBackground(path.basename(url), imgRes.data, user.userId);
      if (res === false) throw reply.notAcceptable("Background already exist.");

      return res;
    }
  );

  fastify.post(
    "/add",
    {
      schema: {
        consumes: ["multipart/form-data"],
      },
      bodyLimit: parseInt(process.env.FILE_SIZE_LIMIT, 10) || 15 * 1024 * 1024,
      preHandler: requireSession(true, true, false),
    },
    async function (request, reply) {
      const file = await request.file({
        limits: { fileSize: request.routeOptions.bodyLimit },
      });

      const user = appContext.request.get(appRequestsKeys.Session);

      let res = await addBackground(file.filename, file.file, user.userId);

      if (file.file.truncated) {
        let fileLimit = request.routeOptions.bodyLimit / 1024 / 1024;
        throw new fastify.multipartErrors.FilesLimitError(
          `(${fileLimit.toFixed(2)} Mb per file)`
        );
      }

      if (res === false) throw reply.notAcceptable("Background already exist.");

      return res;
    }
  );

  fastify.delete(
    "/:id",
    { preHandler: requireSession(true, true, false) },
    async function (request, reply) {
      const { id } = request.params;
      const user = appContext.request.get(appRequestsKeys.Session);

      if (!deleteBackground(id, user.userId))
        throw reply.notAcceptable("Background doesn't exist.");
    }
  );
}
