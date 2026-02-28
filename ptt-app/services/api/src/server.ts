import Fastify from "fastify";
import cors from "@fastify/cors";
import jwtPlugin from "./plugins/jwt.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";

export async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: "info",
      transport: {
        target: "pino-pretty",
        options: { translateTime: "HH:MM:ss Z", ignore: "pid,hostname" },
      },
    },
  });

  await fastify.register(cors, { origin: true });
  await fastify.register(jwtPlugin);
  await fastify.register(authRoutes);
  await fastify.register(userRoutes);

  fastify.get("/health", async () => ({ status: "ok" }));

  return fastify;
}

async function start() {
  const app = await buildApp();
  const port = Number(process.env.PORT) || 3001;

  try {
    await app.listen({ port, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
