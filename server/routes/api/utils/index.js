import { parseBookmarkFile, parseHtml } from "../../../helpers/parsers.js";
import {
  batchUpdateLinks,
  requestHeadFromUrl,
} from "../../../logics/bookmarks.js";

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
      let headHtml = await requestHeadFromUrl(url);
      return parseHtml(headHtml, url);
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
