import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";

describe("Password hashing", () => {
  it("hashes a password and verifies it correctly", async () => {
    const password = "secure-password-123";
    const hash = await bcrypt.hash(password, 10);

    expect(hash).not.toBe(password);
    expect(await bcrypt.compare(password, hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await bcrypt.hash("correct-password", 10);

    expect(await bcrypt.compare("wrong-password", hash)).toBe(false);
  });

  it("produces different hashes for the same password", async () => {
    const password = "same-password";
    const hash1 = await bcrypt.hash(password, 10);
    const hash2 = await bcrypt.hash(password, 10);

    expect(hash1).not.toBe(hash2);
    expect(await bcrypt.compare(password, hash1)).toBe(true);
    expect(await bcrypt.compare(password, hash2)).toBe(true);
  });
});

describe("JWT verification", () => {
  it("signs and verifies a token with @fastify/jwt", async () => {
    const Fastify = (await import("fastify")).default;
    const fjwt = (await import("@fastify/jwt")).default;

    const app = Fastify();
    await app.register(fjwt, { secret: "test-secret" });

    const payload = { userId: "u1", agencyId: "a1", role: "OFFICER" };
    const token = app.jwt.sign(payload);

    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);

    const decoded = app.jwt.verify<typeof payload>(token);
    expect(decoded.userId).toBe("u1");
    expect(decoded.agencyId).toBe("a1");
    expect(decoded.role).toBe("OFFICER");

    await app.close();
  });

  it("rejects a token signed with a different secret", async () => {
    const Fastify = (await import("fastify")).default;
    const fjwt = (await import("@fastify/jwt")).default;

    const app1 = Fastify();
    await app1.register(fjwt, { secret: "secret-one" });

    const app2 = Fastify();
    await app2.register(fjwt, { secret: "secret-two" });

    const token = app1.jwt.sign({ userId: "u1" });

    expect(() => app2.jwt.verify(token)).toThrow();

    await app1.close();
    await app2.close();
  });
});
