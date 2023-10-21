import { getOptimizedImage } from "../../../helpers/imageOptimization.js";
import { requireSession } from "../../../logics/handlers.js";

export default async function (fastify, opts) {
  fastify.get(
    "/:filename",
    { preHandler: requireSession(true, true, false) },
    async function (request, reply) {
      const { filename } = request.params;
      let { w, h } = request.query;

      reply.type("image/webp");

      w = parseInt(w, 10) || undefined;
      h = parseInt(h, 10) || undefined;

      return getOptimizedImage(filename, w, h);
    }
  );
}
