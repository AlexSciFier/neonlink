const usersDB = require("../../../db/connect");
const appSettings = require("../../../db/appSettings");
/**
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} reply
 */
async function requestForbidden(request, reply) {
  try {
    const noLogin = appSettings.getNologin();
    if (noLogin) {
      return;
    }
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

module.exports = { requestForbidden };
