import { parseBookmarkFile, parseHtml } from "../../../helpers/parsers.js";
import { batchUpdateLinks } from "../../../logics/bookmarks.js";

import axios from "axios";

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows; Windows NT 10.4; Win64; x64) AppleWebKit/535.50 (KHTML, like Gecko) Chrome/48.0.3463.124 Safari/536";

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
      const controller = new AbortController();

      try {
        res = await axios.get(url, {
          responseType: "stream",
          signal: controller.signal,
          headers: {
            Accept: "text/html,application/xhtml+xml,application/xml",
            Dnt: "1",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": DEFAULT_USER_AGENT,
          },
        });
      } catch (error) {
        console.error(url, error.message);
        res = error.response;
      }

      let contentType = res.headers["content-type"];
      let matches = contentType.match(/charset=\s*"?(.[^\"]+)"?$/i);
      let encoding = matches?.[1] || "utf-8";

      let stream = res.data;

      stream.setEncoding("hex");

      let htmlArray = [];

      stream.on("data", (chunk) => {
        let chunkHTML = new TextDecoder(encoding.toLowerCase()).decode(
          Buffer.from(chunk, "hex")
        );
        const closingHeadTag = "</head>";
        const closingHeadTagIndex =
          chunkHTML.indexOf(closingHeadTag) + closingHeadTag.length;

        if (chunkHTML.includes(closingHeadTag)) {
          chunkHTML = chunkHTML.substring(0, closingHeadTagIndex);
          htmlArray.push(chunkHTML);
          controller.abort();
          return;
        }
        htmlArray.push(chunkHTML);
      });

      return new Promise((resolve, reject) => {
        stream.on("close", () => {
          const htmlOut = htmlArray.join("").trim();
          resolve(parseHtml(htmlOut, url));
        });
        stream.on("error", (e) => {
          if (e.code !== "ERR_CANCELED") reject(e);
        });
      });
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
