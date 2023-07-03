import { batchUpdateLinks } from "./batchUpdateLinks.js";
import { parseBookmarkFile } from "./bookmarkParser.js";
import { parseHtml } from "./parsePage.js";
import { saveFileStreamToPublic, deleteFileFromPublic } from "./fsHandler.js";
import { stores } from "../../../db/stores.js";

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

  fastify.post("/parseBookmarkFile", {}, async function (request, reply) {
    const bookmarkFile = request.raw.files.file;
    let parsedJson = parseBookmarkFile(bookmarkFile.data);
    return parsedJson;
  });

  fastify.get("/updatelinks", {}, async function (request, reply) {
    return batchUpdateLinks();
  });

  fastify.post(
    "/savefile", 
    {
      schema: {
        consumes: ["multipart/form-data"]
      }
    }, 
    async function (request, reply) {
    const file = await request.file();
    const uuid = request.cookies.SSID;

    let fileUrl = `/static/media/background/${file.filename}`;
    if (stores.backgroundImages.getImageByUrl(fileUrl).length > 0)
        throw reply.notAcceptable("Already exist");

    let res = await saveFileStreamToPublic(file.filename, file.file);
    if (res === false) throw "File upload error";
    try
    {
      let lastRow = stores.backgroundImages.addImage(fileUrl, uuid);
      return { id: lastRow, url: fileUrl };
    }
    catch(error)
    {
      deleteFileFromPublic(file.filename);
      throw(error);
    }
    
  });
};
