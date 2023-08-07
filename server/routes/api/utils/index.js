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
      bodyLimit:
        parseInt(process.env.URL_PASRER_SIZE_LIMIT, 10) || 15 * 1024 * 1024,
    },
    async function (request, reply) {
      let { url } = request.body;
      let res;
      try {
        res = await axios.get(url, {
          responseType: "arraybuffer",
          responseEncoding: "binary",
        });
      } catch (error) {
        console.error(url, error.message);
        return { title: "", desc: "", icon: "" };
      }
      let contentType = res.headers["content-type"];
      let matches = contentType.match(/charset=(.+)/);
      let encoding = matches?.[1] || "utf-8";
      let resData = await res.data;
      let html = new TextDecoder(encoding).decode(resData);
      return await parseHtml(html, url);
    }
  );

  fastify.post(
    "/parseBookmarkFile",
    {
      schema: {
        consumes: ["multipart/form-data"],
      },
    },
    async function (request, reply) {
      const bookmarkFile = await request.file();
      let parsedJson = parseBookmarkFile(await bookmarkFile.toBuffer());
      return parsedJson;
    }
  );

  fastify.get("/updatelinks", {}, async function (request, reply) {
    return batchUpdateLinks();
  });
}
