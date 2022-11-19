"use strict";
const { default: fastify } = require("fastify");
const db = require("../../../db/connect");
const netscape = require("../../../utils/bookmarkFileGenerator");
const { imgUrlToBase64 } = require("../../../utils/imgUrlToBase64");
const { requestForbidden } = require("../utils/preHandler");

/**
 *
 * @param {import("fastify").FastifyInstance} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
  fastify.get(
    "/",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let query = new URLSearchParams(request.query);
      let offset = query.get("offset") ?? undefined;
      let limit = query.get("limit") ?? undefined;
      let q = query.get("q") ?? undefined;
      let tag = query.get("tag") ?? undefined;
      let category = query.get("category") ?? undefined;
      if (q || tag || category)
        return db.findBookmark(q || "", tag, category, limit, offset);
      return db.getAllBookmarks(offset, limit);
    }
  );

  fastify.get(
    "/:id",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let { id } = request.params;
      let bookmark = db.getBookmarkById(id);
      if (bookmark) return bookmark;
      throw fastify.httpErrors.notFound(`bookmark with id ${id} not found`);
    }
  );

  fastify.get(
    "/:id/icon",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let { id } = request.params;
      let icon = db.getIconByBookmarkId(id);
      if (icon) {
        let type = icon.split(";")[0].split(":")[1];
        reply
          .type(type)
          .send(
            Buffer.from(icon.replace(/^data:\w+\/.+;base64,/, ""), "base64")
          );
        return;
      }
      throw fastify.httpErrors.notFound(`bookmark with id ${id} not found`);
    }
  );

  fastify.get(
    "/export",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let bookmarks = db.getAllBookmarks(0, 999999)?.bookmarks;
      let maped = {};
      for (const key in bookmarks) {
        if (Object.hasOwnProperty.call(bookmarks, key)) {
          const element = bookmarks[key];
          maped[element.title] = element.url;
        }
      }
      let html = netscape(maped);
      return html;
    }
  );

  fastify.get(
    "/category/:id",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let { id } = request.params;
      let bookmarks = db.getBookmarkByCategoryId(id);
      if (bookmarks) return bookmarks;
      throw fastify.httpErrors.notFound(
        `bookmarks with category id ${id} not found`
      );
    }
  );

  fastify.post(
    "/",
    {
      preHandler: requestForbidden,
      schema: {
        body: {
          type: "object",
          required: ["url", "title"],
          properties: {
            url: { type: "string" },
            title: { type: "string" },
            desc: { type: "string" },
            icon: { type: "string" },
            categoryId: { type: "number" },
            tags: { type: "array", items: { type: "string" }, maxItems: 10 },
          },
        },
      },
    },
    async function (request, reply) {
      let { url, title, desc, icon, categoryId, tags } = request.body;
      if (url === "" || title === "")
        throw fastify.httpErrors.notAcceptable(
          "Url and title shoud not be empty string"
        );

      if (icon !== "") icon = await imgUrlToBase64(icon);

      let existingBookmark = db.getBookmarkByUrl(url);
      if (existingBookmark) {
        throw fastify.httpErrors.badRequest(
          "Bookmark with this url is already exist"
        );
      }
      reply.statusCode = 201;
      return db.addBookmark(url, title, desc, icon, categoryId, tags);
    }
  );

  fastify.post(
    "/addArray",
    {
      schema: {
        body: {
          type: "array",
          items: {
            type: "object",
            required: ["url", "title"],
            properties: {
              url: { type: "string" },
              title: { type: "string" },
            },
          },
        },
      },
    },
    async function (request, reply) {
      let urlArray = request.body;
      urlArray.forEach((item) => {
        let { url, title, icon } = item;
        if (url === "")
          throw fastify.httpErrors.notAcceptable(
            `url shoud not be empty ${title}`
          );
        let existingBookmark = db.getBookmarkByUrl(url);
        if (existingBookmark) return;
        db.addBookmark(url, title, "", icon, undefined, []);
        reply.statusCode = 201;
      });
      return true;
    }
  );

  fastify.put(
    "/:id",
    {
      preHandler: requestForbidden,
      schema: {
        body: {
          type: "object",
          required: ["url"],
          properties: {
            url: { type: "string" },
            title: { type: "string" },
            desc: { type: "string" },
            icon: { type: "string" },
            categoryId: { type: "number" },
            tags: { type: "array", items: { type: "string" }, maxItems: 10 },
          },
        },
      },
    },
    async function (request, reply) {
      let { id } = request.params;
      let { url, title, desc, icon, categoryId, tags } = request.body;
      if (url === "") throw new Error("Url shoud not be empty string");
      if (icon && icon.startsWith("http")) icon = await imgUrlToBase64(icon);
      if (db.updateBookmarkById(id, url, title, desc, icon, categoryId, tags))
        return { url, title, desc };
      throw fastify.httpErrors.notFound();
    }
  );

  fastify.delete(
    "/:id",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let { id } = request.params;
      if (db.deleteBookmarkById(id)) return true;
      else throw fastify.httpErrors.notFound();
    }
  );
};
