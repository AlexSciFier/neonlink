import FastifyAutoLoad from "@fastify/autoload";
import FastifyCookie from "@fastify/cookie";
import FastifyCors from "@fastify/cors";
import FastifyMultipart from "@fastify/multipart";
import { fastifyRequestContext, requestContext } from "@fastify/request-context";
import FastifySensible from "@fastify/sensible";
import FastifyStatic from "@fastify/static";

import fp from "fastify-plugin";
import fs from "../helpers/fileSystem.js";
import { appContext } from "../contexts/appContext.js";
import { AppSecrets, appSecretKeys } from "../contexts/appSecrets.js";
import { AppSettings } from "../contexts/appSettings.js";
import { requestContextHandler } from "../logics/handlers.js";

export async function initializeConfig() {
  // Handle secrets configuration (separate to mitigate access from api)
  const secretsPath = fs.resolvePath("./data/secrets.json");
  await fs.ensureDirectoryExists(fs.extractDirectory(secretsPath));
  appContext.secrets = new AppSecrets(secretsPath);
  if (await fs.checkWhetherPathIsExistingFile(secretsPath)) {
    await appContext.secrets.load();
  } else {
    await appContext.secrets.save();
  }

  // Handle settings configuration (separate to mitigate access from api)
  const settingsPath = fs.resolvePath("./data/settings.json");
  await fs.ensureDirectoryExists(fs.extractDirectory(settingsPath));
  appContext.settings = new AppSettings(settingsPath);
  if (await fs.checkWhetherPathIsExistingFile(settingsPath)) {
    await appContext.settings.load();
  } else {
    await appContext.settings.save();
  }
}

function initializeFastify(fastify, opts) {
  // Handle some plugins
  fastify.register(FastifySensible, {
    errorHandler: false
  });
  fastify.register(FastifyCors, {
    origin: true,
    credentials: true,
    methods: ["PUT", "OPTIONS", "POST", "DELETE"]
  });

  fastify.register(FastifyMultipart, {});
  fastify.register(FastifyCookie, {
    secret: appContext.secrets.get(appSecretKeys.Cookie)
  });
  fastify.register(fastifyRequestContext);

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(FastifyAutoLoad, {
    dir: fs.joinPath(fs.rootPath, "./routes"),
    options: Object.assign({}, opts)
  });

  // This allows us to handle static files
  fastify.register(FastifyStatic, {
    root: fs.joinPath(fs.rootPath, "./public")
  });

  // This allows us to handle Error 404
  fastify.setNotFoundHandler((req, rep) => {
    rep.sendFile("index.html", "public");
  });
}

function initializeHooks(fastify) {
  fastify.addHook('onRequest', async (req, reply) => {
    await requestContextHandler(req, reply);
  });
}

function initializeRequests() {
    // Handle request contexts
    appContext.request = requestContext;
}

export default fp(async function (fastify, opts) {
  
  await initializeConfig();

  initializeFastify(fastify, opts);
  initializeHooks(fastify);
  initializeRequests();

  console.log("Config plugin initialization completed.");
}, {
  fastify: "4.x",
  name: "neonlink-config"
});