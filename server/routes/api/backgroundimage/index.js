const { default: fastify } = require("fastify");
const bgImages = require("../../../db/bgImages");
const usersDB = require("../../../db/users");
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
      return bgImages.addImage(url, uuid);
    }
  );
  fastify.delete(
    "/:id",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let { id } = request.params;
      let uuid = request.cookies.SSID;
      return bgImages.deleteImage(id, uuid);
    }
  );
};
