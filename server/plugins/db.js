import fp from "fastify-plugin";
import storesSetup from "../db/stores.js";

export default fp(async function (fastify, opts, next) {
  // Define which database we want and initilize it
  // For now only sqlite is available

  try {
    const databasePluginName = opts.databaseType || "sqlite";
    const databasePluginFile = `../db/${databasePluginName}/database.js`;
    const databasePlugin = await import(databasePluginFile);
    const databaseOptions = opts.databaseOptions || {};
    fastify.register(storesSetup, { databasePlugin, databaseOptions });
  }
  catch(error) {
    next(new Error(error));
  }

  console.log("Database plugin initialization completed.");

  next();
});
