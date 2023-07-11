import closeWithGrace from "close-with-grace";
import fp from "fastify-plugin";
import { appContext } from "../contexts/appContext.js";

function initializeHooks(fastify, closeListeners) {
  fastify.addHook("onReady", async () => {
    // Check if initialized with users
    appContext.hasAnyUser = appContext.stores.users.checkWhetherAnyUserExists()
    appContext.hasAdminUser = appContext.hasAnyUser && appContext.stores.users.checkWhetherAnyAdminUserExists();
    console.log("Application initialized.");
  });

  fastify.addHook("onClose", async (instance, done) => {
    console.log("Closing listeners...");
    closeListeners.uninstall();
    done();
  });
}

export default fp(
  (fastify, options, next) => {
    const closeListeners = closeWithGrace(
      { delay: 500 },
      async function ({ signal, err, manual }) {
        if (err) {
          console.error(err);
        } else {
          console.log("Server is stopping...");
        }
        await fastify.close();
      }
    );

    initializeHooks(fastify, closeListeners);

    console.log("Life cycle plugin initialization completed.");

    next();
  },
  {
    fastify: "4.x",
    name: "neonlink-lifecycle",
    dependencies: ["neonlink-config", "neonlink-database"] // we make sure the hooks are the last ones.
  }
);
