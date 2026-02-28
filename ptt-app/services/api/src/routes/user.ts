import type { FastifyInstance } from "fastify";
import prisma from "../prisma.js";

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/me",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const { userId } = request.user;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { agency: true },
      });

      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      return reply.send({
        id: user.id,
        email: user.email,
        role: user.role,
        badgeNumber: user.badgeNumber,
        licenseNumber: user.licenseNumber,
        createdAt: user.createdAt,
        agency: {
          id: user.agency.id,
          name: user.agency.name,
          type: user.agency.type,
        },
      });
    }
  );
}
