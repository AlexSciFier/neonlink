import { basename } from "path";
import { stores } from "../../../db/stores.js";
import { deleteFileFromPublic } from "../utils/fsHandler.js";
import { requestForbidden } from "../utils/preHandler.js";

/**
 *
 * @param {import("fastify").FastifyInstance} fastify
 * @param {*} opts
 */
export default async function (fastify, opts) {
  fastify.get(
    "/",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let uuid = request.cookies.SSID;
      return stores.backgroundImages.getAllImages(uuid);
    }
  );
  fastify.get(
    "/:id",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let { id } = request.params;
      let uuid = request.cookies.SSID;
      return stores.backgroundImages.getImageById(id, uuid);
    }
  );
  fastify.post(
    "/",
    {
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
      preHandler: requestForbidden,
    },
    async function (request, reply) {
      let { url } = request.body;
      let uuid = request.cookies.SSID;
      if (stores.backgroundImages.getImageByUrl(url).length > 0)
        throw reply.notAcceptable("Already exist");
      let lastRow = stores.backgroundImages.addImage(url, uuid);
      return { id: lastRow, url };
    }
  );
  fastify.delete(
    "/:id",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let { id } = request.params;
      let uuid = request.cookies.SSID;
      let imageInDB = stores.backgroundImages.getImageById(id, uuid);
      if (imageInDB.length === 0) {
        throw "Image id doesn't exist";
      }
      let imageName = basename(imageInDB[0].url);
      let changes = stores.backgroundImages.deleteImage(id, uuid);
      if (changes > 0) {
        try {
          await deleteFileFromPublic(imageName);
        } catch (error) {
          throw `Error while deleting image: ${error.message}`;
        }
        return true;
      }
      return false;
    }
  );
};
