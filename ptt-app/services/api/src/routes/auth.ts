import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "../prisma.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid request body", details: parsed.error.issues });
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { agency: true },
    });

    if (!user) {
      return reply.status(401).send({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return reply.status(401).send({ error: "Invalid email or password" });
    }

    const token = fastify.jwt.sign({
      userId: user.id,
      agencyId: user.agencyId,
      role: user.role,
    });

    return reply.send({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        agency: {
          id: user.agency.id,
          name: user.agency.name,
          type: user.agency.type,
        },
      },
    });
  });
}
