"use strict";
const { default: fastify } = require("fastify");
const db = require("../../../db/connect");

/**
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} reply
 */
async function requestForbidden(request, reply) {
  try {
    console.log("cookies", request.cookies);
    let SSID = request.cookies.SSID;
    if (SSID) {
      let user = await db.getUserByUUID(SSID);
      if (user === undefined) {
        throw reply.unauthorized("You must login to use this method");
      }
    } else throw reply.unauthorized("You must login to use this method");
  } catch {
    throw reply.unauthorized("You must login to use this method");
  }
}

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
      if (q !== undefined) return db.findBookmark(q, limit, offset);
      if (tag !== undefined) return db.findBookmarkByTag(tag, limit, offset);
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
      if (url === "")
        throw fastify.httpErrors.notAcceptable("url shoud not be empty string");
      let existingBookmark = db.getBookmarkByUrl(url);
      if (existingBookmark) {
        return db.updateBookmarkById(
          existingBookmark.id,
          url,
          title,
          desc,
          icon,
          categoryId,
          tags
        );
      }
      reply.statusCode = 201;
      return db.addBookmark(url, title, desc, icon, categoryId, tags);
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
