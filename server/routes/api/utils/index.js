"use strict";
const { parseHtml } = require("./parsePage");
const { parseBookmarkFile } = require("./bookmarkParser");
const { batchUpdateLinks } = require("./batchUpdateLinks");
const { saveFileToPublic } = require("./fsHandler");
const { getImageByUrl, addImage } = require("../../../db/bgImages");

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
        console.error(url, error.message);
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

  fastify.get("/updatelinks", {}, async function (request, reply) {
    return batchUpdateLinks();
  });

  fastify.post("/savefile", {}, async function (request, reply) {
    const file = request.raw.files.file;
    const uuid = request.cookies.SSID;
    let res = saveFileToPublic(file.name, file.data);
    if (res === false) throw "File upload error";
    let fileUrl = `/static/media/${file.name}`;
    if (getImageByUrl(fileUrl).length > 0)
      throw reply.notAcceptable("Already exist");
    let lastRow = addImage(fileUrl, uuid);
    return { id: lastRow, url: fileUrl };
  });
};
