import { requestForbidden } from "../utils/preHandler.js";
import { 
  addBackground, 
  deleteBackground, 
  getBackgroundById, 
  getBackgroundByUrl, 
  getAllBackgrounds } from "../../../logics/backgrounds.js"

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

      return getAllBackgrounds(uuid);
    }
  );

  fastify.get(
    "/:id",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let { id } = request.params;
      let uuid = request.cookies.SSID;
      return getBackgroundById(id, uuid);
    }
  );

  // TODO: Check if there is an actual need for this
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

      let res = getBackgroundByUrl(url, uuid);
      if (res === false)
        throw reply.notAcceptable("Already exist");
      return res;
    }
  );

  fastify.post(
    "/add", 
    {
      schema: {
        consumes: ["multipart/form-data"]
      },
      preHandler: requestForbidden
    }, 
    async function (request, reply) {
    const file = await request.file();
    const uuid = request.cookies.SSID;

    let res = addBackground(file.filename, file.file, uuid);

    if (res === false)
        throw reply.notAcceptable("Background already exist.");
    
    return res;
  });

  fastify.delete(
    "/:id",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let { id } = request.params;
      let uuid = request.cookies.SSID;

      if (!deleteBackground(id, uuid))
        throw reply.notAcceptable("Background doesn't exist.");
    }
  );
};
