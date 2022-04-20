"use strict";

const fp = require("fastify-plugin");
const cookie = require("fastify-cookie");
const cors = require("fastify-cors");

/**
 *
 * @param {import("fastify").FastifyInstance} fastify
 */
const plugin = async function (fastify) {
  fastify.register(cookie, { secret: "6139a3c94e6b61063c3834942338e2be" });
  fastify.register(cors, {
    origin: true,
    credentials: true,
    methods: ["PUT", "OPTIONS", "POST", "DELETE"],
  });
};

module.exports = fp(plugin);
