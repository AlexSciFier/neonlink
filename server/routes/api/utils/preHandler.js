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
    console.log("PREHANDLER NOLOGIN", noLogin);
    if (noLogin) {
      return;
    }
    let SSID = request.cookies.SSID;
    console.log("PREHANDLER SSID", noLogin);
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
