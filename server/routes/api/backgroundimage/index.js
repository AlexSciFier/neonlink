const { default: fastify } = require("fastify");
const bgImages = require("../../../db/bgImages");
const usersDB = require("../../../db/users");

/**
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} reply
 */
async function requestForbidden(request, reply) {
  try {
    let SSID = request.cookies.SSID;
    if (SSID) {
      let user = await usersDB.getUserByUUID(SSID);
      if (user === undefined) {
        throw reply.unauthorized("You must login to use this method");
      }
    } else throw reply.unauthorized("You must login to use this method");
  } catch {
    throw reply.unauthorized("You must login to use this method");
  }
}

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
      return bgImages.getAllImages();
    }
  );
  fastify.get(
    "/:id",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let { id } = request.params;
      return bgImages.getImageById(id);
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
      if (bgImages.getImageByUrl(url).length > 0)
        throw reply.notAcceptable("Already exist");
      return bgImages.addImage(url);
    }
  );
  fastify.delete(
    "/:id",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let { id } = request.params;
      return bgImages.deleteImage(id);
    }
  );
};
