import closeWithGrace from 'close-with-grace';
import fp from "fastify-plugin";

export default fp((fastify, options, next) => {
  const closeListeners = closeWithGrace(
    { delay: 500 },
    async function ({ signal, err, manual }) {
      if (err) {
        console.error(err);
      } else {
        console.log("Server is stopping...");
      }
      await fastify.close();
    }
  );

  fastify.addHook("onClose", async (instance, done) => {
    console.log("Closing listeners...");
    closeListeners.uninstall();
    done();
  });

  console.log("Life cycle initialization completed.")

  next()
});