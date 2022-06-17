"use strict";
const { parseHtml } = require("./parsePage");
const { parseBookmarkFile } = require("./bookmarkParser");

const axios = require("axios").default;
/**
 *
 * @param {import("fastify").FastifyInstance} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
  fastify.post(
    "/urlinfo",
    {
      schema: {
        body: {
          type: "object",
          required: ["url"],
          properties: {
            url: { type: "string" },
          },
        },
      },
    },
    async function (request, reply) {
      let { url } = request.body;
      let res;
      try {
        res = await axios.get(url);
      } catch (error) {
        return { title: "", desc: "", icon: "" };
      }

      let html = await res.data;
      return await parseHtml(html, url);
    }
  );

  fastify.post("/parseBookmarkFile", {}, async function (request, reply) {
    const bookmarkFile = request.raw.files.file;
    let parsedJson = parseBookmarkFile(bookmarkFile.data);
    return parsedJson;
  });
};
