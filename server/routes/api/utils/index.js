import { parseBookmarkFile, parseHtml } from "../../../helpers/parsers.js";
import {
  batchUpdateLinks,
  requestHeadFromUrl,
} from "../../../logics/bookmarks.js";
import { requireSession } from "../../../logics/handlers.js";
import { appContext } from "../../../contexts/appContext.js";
import { appRequestsKeys } from "../../../contexts/appRequests.js";

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

  fastify.post(
    "/updatelinks",
    { preHandler: requireSession(true, true, false) },
    async function (request, reply) {
      return batchUpdateLinks(appContext.request.get(appRequestsKeys.Session));
    }
  );
}
