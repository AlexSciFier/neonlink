import netscape from "../../../utils/bookmarkFileGenerator.js";
import { imgUrlToBase64 } from "../../../utils/imgUrlToBase64.js";
import { requestForbidden } from "../utils/preHandler.js";
import { stores } from "../../../db/stores.js";

/**
 *
 * @param {import("fastify").FastifyInstance} fastify
 * @param {*} opts
 */
export default async function (fastify, opts) {
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
        return stores.bookmarks.findBookmark(q || "", tag, category, limit, offset);
      return stores.bookmarks.getAllBookmarks(offset, limit);
    }
  );

  fastify.get(
    "/:id",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let { id } = request.params;
      let foundedBookmark = stores.bookmarks.getBookmarkById(id);
      if (foundedBookmark) return foundedBookmark;
      throw fastify.httpErrors.notFound(`bookmark with id ${id} not found`);
    }
  );

  fastify.get(
    "/:id/icon",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let { id } = request.params;
      let icon = stores.bookmarks.getIconByBookmarkId(id);
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
      let bookmarks = getAllBookmarks(0, 999999)?.bookmarks;
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
      let bookmarks = stores.bookmarks.getBookmarkByCategoryId(id);
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

      let existingBookmark = stores.bookmarks.getBookmarkByUrl(url);
      if (existingBookmark) {
        throw fastify.httpErrors.badRequest(
          "Bookmark with this url is already exist"
        );
      }
      reply.statusCode = 201;
      return stores.bookmarks.addBookmark(url, title, desc, icon, categoryId, tags);
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
        let existingBookmark = stores.bookmarks.getBookmarkByUrl(url);
        if (existingBookmark) return;
        stores.bookmarks.addBookmark(url, title, "", icon, undefined, []);
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
      if (stores.bookmarks.updateBookmarkById(id, url, title, desc, icon, categoryId, tags))
        return { url, title, desc };
      throw fastify.httpErrors.notFound();
    }
  );

  fastify.delete(
    "/:id",
    { preHandler: requestForbidden },
    async function (request, reply) {
      let { id } = request.params;
      if (stores.bookmarks.deleteBookmarkById(id)) return true;
      else throw fastify.httpErrors.notFound();
    }
  );

  fastify.put(
    "/changePositions",
    {
      preHandler: requestForbidden,
      schema: {
        body: {
          type: "object",
          properties: {
            categoryId: { type: "number" },
            items: {
              type: "array",
              items: {
                type: "object",
                required: ["id", "position"],
                properties: {
                  id: { type: "number" },
                  position: { type: "number" },
                },
              },
            },
          },
        },
      },
    },
    async function (request, reply) {
      let { items, categoryId } = request.body;
      if (stores.bookmarks.updatePostitions(items,categoryId)) return true;
      return { items, categoryId };
    }
  );
};
