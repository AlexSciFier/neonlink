import { loadUserWithSettingsByUUID } from "./users.js";
import { stores } from "../db/stores.js";

export async function requestForbidden(request, reply) {
  try {
    const noLogin = stores.appSettings.getNologin();
    if (noLogin) {
      return;
    }
    let SSID = request.cookies.SSID;

    if (SSID) {
      let user = await loadUserWithSettingsByUUID(SSID);
      if (user === undefined) {
        throw reply.notFound("User not found");
      }
    } else {
      throw reply.unauthorized("You must login to use this method");
    }
  } catch (err) {
    console.error(err);
    throw reply.unauthorized("You must login to use this method");
  }
}

export async function requestForbiddenUser(request, reply) {
  if (await stores.users.checkWhetherTableIsEmpty())
    throw reply.notFound("No registered users");
  let { SSID } = request.cookies;
  let user = await loadUserWithSettingsByUUID(SSID);
  if (user === undefined)
    throw reply.unauthorized("You must login to use this method");
}