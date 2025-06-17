import fp from "fastify-plugin";
import fs from "../helpers/fileSystem.js";
import { appSecretsKeys } from "../contexts/appSecrets.js";
import { appContext } from "../contexts/appContext.js";

async function initializeDatabaseManager(dbType, dbOptions) {
  const databaseModuleName = dbType || "sqlite";
  const databaseModuleFile = `../db/${databaseModuleName}/database.js`;
  const { default: databaseManager } = await import(databaseModuleFile);
  const databaseOptions = dbOptions || {};
  return new databaseManager(databaseOptions);
}

async function initializeStore(dbType, dbInstance, storeName) {
  const databaseModuleName = dbType || "sqlite";
  const storeModuleFile = `../db/${databaseModuleName}/stores/${storeName}.js`;
  const { default: storeManager } = await import(storeModuleFile);
  return new storeManager(dbInstance);
}

async function initializeStores(databaseType, databaseManager) {
  const stores = {};
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
  stores.userSessions = await initializeStore(
    databaseType,
    databaseManager.db,
    "userSessions"
  );
  stores.userSettings = await initializeStore(
    databaseType,
    databaseManager.db,
    "userSettings"
  );
  appContext.stores = stores;
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

export async function initializeDatabase() {
  const dataPath = fs.resolvePath("./data");
  await fs.ensureDirectoryExists(dataPath);
  const databaseConfig = Object.assign(
    appContext.secrets.get(appSecretsKeys.Database),
    { dataPath }
  );
  const databaseManager = await initializeDatabaseManager(
    databaseConfig.type,
    databaseConfig
  );

  try {
    await initializeStores(databaseConfig.type, databaseManager);
  } catch (error) {
    databaseManager.close();
    throw error;
  }
  return databaseManager;
}

export default fp(
  async function (fastify, opts) {
    const databaseManager = await initializeDatabase();
    initializeHooks(fastify, databaseManager);

    console.log("Database plugin initialization completed.");
  },
  {
    fastify: "5.x",
    name: "neonlink-database",
    dependencies: ["neonlink-config"],
  }
);
