import { requireSession } from "../../../logics/handlers.js";
import sharp from "sharp";
import { join } from "path";
import { rootPath } from "../../../helpers/fileSystem.js";

export default async function (fastify, opts) {
  fastify.get(
    "/:filename",
    { preHandler: requireSession(true, true, false) },
    async function (request, reply) {
      const { filename } = request.params;
      const { w, h } = request.query;
      const backgroundsPath = join(rootPath, "public/static/media/background");
      const filePath = join(backgroundsPath, filename);
      reply.type("image/webp");

      if (w || h) {
        return sharp(filePath)
          .resize(parseInt(w, 10), parseInt(h, 10))
          .webp()
          .withMetadata()
          .toBuffer();
      }

      return sharp(filePath).webp().withMetadata().toBuffer();
    }
  );
}
