import AutoLoad from "@fastify/autoload";
import fs from "./helpers/fileSystem.js";

// Pass --options via CLI arguments in command to enable these options.
export const options = {};

export default async function (fastify, opts) {
  // Place here your custom code!

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: fs.joinPath(
      fs.extractDirectory(fs.convertToPath(import.meta.url)),
      "./plugins"
    ),
    options: Object.assign({}, opts),
  });
}
