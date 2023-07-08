import fp from "fastify-plugin";
import { stores } from "../db/stores.js";

async function initializeDatabaseManager(dbType, dbOptions) {
  const databaseModuleName = dbType || "sqlite";
  const databaseModuleFile = `../db/${databaseModuleName}/database.js`;
  const databaseManager = await import(databaseModuleFile);
  const databaseOptions = dbOptions || {};
  return new databaseManager.default(databaseOptions);
}

function initializeHooks(fastify, databaseManager) {
  fastify.addHook("onReady", async () => {
    await databaseManager.migrate();
  });

  fastify.addHook("onClose", (instance, done) => {
    console.log("Closing database...");
    databaseManager.close();
    done();
  });
}

async function initializeStore(dbType, dbInstance, storeName) {
  const databaseModuleName = dbType || "sqlite";
  const storeModuleFile = `../db/${databaseModuleName}/stores/${storeName}.js`;
  const storeManager = await import(storeModuleFile);
  return new storeManager.default(dbInstance);
}

async function initializeStores(databaseType, databaseManager) {
  stores.appSettings = await initializeStore(
    databaseType,
    databaseManager.db,
    "appSettings"
  );
  stores.backgrounds = await initializeStore(
    databaseType,
    databaseManager.db,
    "backgrounds"
  );
  stores.bookmarks = await initializeStore(
    databaseType,
    databaseManager.db,
    "bookmarks"
  );
  stores.categories = await initializeStore(
    databaseType,
    databaseManager.db,
    "categories"
  );
  stores.tags = await initializeStore(databaseType, databaseManager.db, "tags");
  stores.users = await initializeStore(
    databaseType,
    databaseManager.db,
    "users"
  );
  stores.userSettings = await initializeStore(
    databaseType,
    databaseManager.db,
    "userSettings"
  );
}

export default fp(
  async function (fastify, opts) {
    const databaseType = opts.databaseType || "sqlite";
    const databaseManager = await initializeDatabaseManager(
      databaseType,
      opts.databaseOptions
    );

    try {
      await initializeStores(databaseType, databaseManager);
      initializeHooks(fastify, databaseManager);
    } catch (error) {
      databaseManager.close();
      throw error;
    }

    console.log("Database plugin initialization completed.");
  },
  {
    fastify: "4.x",
    name: "database-plugin",
  }
);
