import FastifyAutoLoad from '@fastify/autoload';
import FastifyCookie from "@fastify/cookie";
import FastifyCors from "@fastify/cors";
import FastifyMultipart from '@fastify/multipart';
import FastifySensible from '@fastify/sensible';
import FastifyStatic from '@fastify/static';

import fp from "fastify-plugin";

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default fp(function (fastify, opts, next) {

  // Handle some plugins
  fastify.register(FastifyMultipart, {});
  fastify.register(FastifyCookie, { secret: "6139a3c94e6b61063c3834942338e2be" });
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
    dir: join(__dirname, "../routes"),
    options: Object.assign({}, opts),
  });

  // This allows us to handle static files
  fastify.register(FastifyStatic, {
    root: join(__dirname, "../public"),
  });

  // This allows us to handle unexpected errors
  fastify.setErrorHandler(function (error, request, reply) {
    // Log error
    console.error(error);
  
    // handle error
    reply.status(500).send({ ok: false })
  });

  // This allows us to handle Error 404
  fastify.setNotFoundHandler((req,rep)=>{
    rep.sendFile("index.html", "public")
  });

  console.log("Host plugin initialization completed.");

  next();
});
