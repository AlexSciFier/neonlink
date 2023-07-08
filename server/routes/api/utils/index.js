import { parseBookmarkFile, parseHtml } from "../../../helpers/parsers.js";
import { batchUpdateLinks } from "../../../logics/bookmarks.js";

import axios from "axios";
/**
 *
 * @param {import("fastify").FastifyInstance} fastify
 * @param {*} opts
 */
export default async function (fastify, opts) {
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

  fastify.post(
    "/parseBookmarkFile", 
    {
      schema: {
        consumes: ["multipart/form-data"],
      }
    }, 
    async function (request, reply) {
      const bookmarkFile = await request.file();
      let parsedJson = parseBookmarkFile(await bookmarkFile.toBuffer());
      return parsedJson;
  });

  fastify.get("/updatelinks", {}, async function (request, reply) {
    return batchUpdateLinks();
  });
}
