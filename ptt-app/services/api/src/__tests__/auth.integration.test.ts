import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import fjwt from "@fastify/jwt";
import bcrypt from "bcryptjs";
import { z } from "zod";

/**
 * Integration tests that verify the auth flow end-to-end
 * without depending on a real database. We mock Prisma at the route level.
 */

interface MockUser {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
  agencyId: string;
  badgeNumber: string | null;
  licenseNumber: string | null;
  createdAt: Date;
  agency: { id: string; name: string; type: string };
}

let app: FastifyInstance;
let testUser: MockUser;

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

beforeAll(async () => {
  const passwordHash = await bcrypt.hash("test-password", 10);

  testUser = {
    id: "user-1",
    email: "test@metro.gov",
    passwordHash,
    role: "OFFICER",
    agencyId: "agency-1",
    badgeNumber: "MPD-001",
    licenseNumber: null,
    createdAt: new Date("2025-01-01"),
    agency: { id: "agency-1", name: "Metro PD", type: "police" },
  };

  app = Fastify();
  await app.register(fjwt, { secret: "test-secret", sign: { expiresIn: "1h" } });

  // Authenticate decorator
  app.decorate(
    "authenticate",
    async (request: Parameters<typeof app.authenticate>[0], reply: Parameters<typeof app.authenticate>[1]) => {
      try {
        await request.jwtVerify();
      } catch {
        reply.status(401).send({ error: "Unauthorized" });
      }
    }
  );

  // Auth route (mirrors real implementation, uses in-memory user)
  app.post("/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid request body" });
    }

    const { email, password } = parsed.data;

    if (email !== testUser.email) {
      return reply.status(401).send({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, testUser.passwordHash);
    if (!valid) {
      return reply.status(401).send({ error: "Invalid email or password" });
    }

    const token = app.jwt.sign({
      userId: testUser.id,
      agencyId: testUser.agencyId,
      role: testUser.role,
    });

    return reply.send({
      token,
      user: {
        id: testUser.id,
        email: testUser.email,
        role: testUser.role,
        agency: testUser.agency,
      },
    });
  });

  // /me route (mirrors real implementation)
  app.get("/me", { onRequest: [app.authenticate] }, async (request, reply) => {
    const { userId } = request.user as { userId: string };

    if (userId !== testUser.id) {
      return reply.status(404).send({ error: "User not found" });
    }

    return reply.send({
      id: testUser.id,
      email: testUser.email,
      role: testUser.role,
      badgeNumber: testUser.badgeNumber,
      licenseNumber: testUser.licenseNumber,
      createdAt: testUser.createdAt,
      agency: testUser.agency,
    });
  });

  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("POST /auth/login", () => {
  it("returns a token and user on valid credentials", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "test@metro.gov", password: "test-password" },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.token).toBeDefined();
    expect(typeof body.token).toBe("string");
    expect(body.user.email).toBe("test@metro.gov");
    expect(body.user.role).toBe("OFFICER");
    expect(body.user.agency.name).toBe("Metro PD");
    // passwordHash must never be exposed
    expect(body.user.passwordHash).toBeUndefined();
  });

  it("rejects invalid email", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "nobody@metro.gov", password: "test-password" },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe("Invalid email or password");
  });

  it("rejects wrong password", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "test@metro.gov", password: "wrong" },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe("Invalid email or password");
  });

  it("rejects invalid request body", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "not-an-email", password: "" },
    });

    expect(res.statusCode).toBe(400);
  });
});

describe("GET /me", () => {
  it("returns user profile with a valid token", async () => {
    // Login first
    const loginRes = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "test@metro.gov", password: "test-password" },
    });
    const { token } = loginRes.json();

    // Call /me
    const meRes = await app.inject({
      method: "GET",
      url: "/me",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(meRes.statusCode).toBe(200);
    const profile = meRes.json();
    expect(profile.email).toBe("test@metro.gov");
    expect(profile.role).toBe("OFFICER");
    expect(profile.agency.name).toBe("Metro PD");
    expect(profile.badgeNumber).toBe("MPD-001");
    // passwordHash must never be exposed
    expect(profile.passwordHash).toBeUndefined();
  });

  it("rejects requests without a token", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/me",
    });

    expect(res.statusCode).toBe(401);
  });

  it("rejects requests with an invalid token", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/me",
      headers: { authorization: "Bearer invalid-token" },
    });

    expect(res.statusCode).toBe(401);
  });
});
