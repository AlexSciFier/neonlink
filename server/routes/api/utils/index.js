"use strict";
const { parse } = require("node-html-parser");
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
};

/**
 *
 * @param {HTMLElement} doc
 * @param {string} baseUrl
 * @returns
 */
function parseIcon(doc, baseUrl) {
  let icon = doc.querySelector('link[rel="icon"]');
  if (icon) {
    let iconUrl = icon.attributes["href"];
    let isRelative = iconUrl.startsWith("/");
    if (isRelative) {
      return new URL(iconUrl, baseUrl);
    } else {
      return iconUrl;
    }
  }
  icon = doc.querySelector('link[rel="shortcut icon"]');
  if (icon) {
    let path = icon.attributes["href"];
    return new URL(path, baseUrl).toString();
  }
  return new URL("/favicon.ico", baseUrl).toString();
}

/**
 *
 * @param {HTMLElement} doc
 */
function parseTitle(doc) {
  let title = doc.querySelector("title").textContent;
  let desc =
    doc.querySelector("meta[name=description]")?.attributes["content"] ?? "";
  return { title, desc };
}

/**
 *
 * @param {string} html
 * @param {string} baseurl
 */
async function parseHtml(html, baseurl) {
  let doc = parse(html);
  let icon = parseIcon(doc, baseurl);
  let { title, desc } = parseTitle(doc);
  return { icon, title, desc };
}
