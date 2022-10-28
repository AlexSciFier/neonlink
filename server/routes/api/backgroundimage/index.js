const { default: fastify } = require("fastify");
const path = require("path");
const bgImages = require("../../../db/bgImages");
const usersDB = require("../../../db/users");
const { deleteFileFromPublic } = require("../utils/fsHandler");
const { requestForbidden } = require("../utils/preHandler");

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
      let uuid = request.cookies.SSID;
      return bgImages.getAllImages(uuid);
    }
  );
  fastify.get(
    "/:id",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let { id } = request.params;
      let uuid = request.cookies.SSID;
      return bgImages.getImageById(id, uuid);
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
      if (bgImages.getImageByUrl(url).length > 0)
        throw reply.notAcceptable("Already exist");
      let lastRow = bgImages.addImage(url, uuid);
      return { id: lastRow, url };
    }
  );
  fastify.delete(
    "/:id",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let { id } = request.params;
      let uuid = request.cookies.SSID;
      let imageInDB = bgImages.getImageById(id, uuid);
      if (imageInDB.length === 0) {
        throw "Image id doesn't exist";
      }
      let imageName = path.basename(imageInDB[0].url);
      let changes = bgImages.deleteImage(id, uuid);
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
