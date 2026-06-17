// JWT auth plugin: exposes fastify.authenticate as a preHandler
import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";

export default fp(async function authPlugin(fastify, opts) {
  await fastify.register(fastifyJwt, { secret: opts.secret });

  fastify.decorate("authenticate", async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.code(401).send({ error: "unauthorized" });
    }
  });
});
