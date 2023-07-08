import FastifyAutoLoad from "@fastify/autoload";
import FastifyCookie from "@fastify/cookie";
import FastifyCors from "@fastify/cors";
import FastifyMultipart from "@fastify/multipart";
import FastifySensible from "@fastify/sensible";
import FastifyStatic from "@fastify/static";

import fp from "fastify-plugin";
import fs from "../helpers/fileSystem.js";

export default fp(function (fastify, opts, next) {
    // Handle some plugins
    fastify.register(FastifyMultipart, {});
    fastify.register(FastifyCookie, {
      secret: "6139a3c94e6b61063c3834942338e2be" 
    });
  
    fastify.register(FastifyCors, {
      origin: true,
      credentials: true,
      methods: ["PUT", "OPTIONS", "POST", "DELETE"],
    });

    fastify.register(FastifySensible, {
      errorHandler: false
    });

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

    console.log("Host plugin initialization completed.");

    next();
}, {
    fastify: "4.x",
  name: "host-plugin"
});
