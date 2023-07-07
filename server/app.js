import Dotenv from 'dotenv'
import Fastify from 'fastify';
import FastifyAutoLoad from '@fastify/autoload';

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

try {
  // Read environment variables
  Dotenv.config()

  // Initialize Fastify
  const app = Fastify({
    logger: { level: process.env.FASTIFY_LOG_LEVEL || "info" },
    bodyLimit: 5242880,
  });

  const __dirname = dirname(fileURLToPath(import.meta.url));

  // Load all plugins
  app.register(FastifyAutoLoad, {
    dir: join(__dirname, "./plugins")
  });

  const PORT = process.env.PORT || 3000;
  const HOST = process.env.FASTIFY_ADDRESS || "0.0.0.0";

  // Start fastify
  app.listen({ port: PORT, host: HOST })
    .then((address) => {
      console.log(`Server started listening on ${address}`);
    }).catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
catch(err) {
  console.log(err);
  process.exit(1);
}