## Quick orientation — what this repo is

This workspace implements a Push-To-Talk (PTT) emergency app with two primary components:
- `apps/web/` — React + Vite frontend (TypeScript, port 5173 in dev)
- `services/api/` — Fastify backend (TypeScript + Prisma + PostgreSQL, port 3001)

Local dev uses `ptt-app/docker-compose.yml` to run a Postgres container bound to host port `5433` and an `api` service image. See `ptt-app/README.md` for the canonical quick-start steps.

## Key files to inspect (examples)
- API routes: `ptt-app/services/api/src/routes/auth.ts` (POST /auth/login), `ptt-app/services/api/src/routes/user.ts` (GET /me)
- Auth plugin: `ptt-app/services/api/src/plugins/jwt.ts` — registers `fastify.authenticate` and enforces JWT_SECRET presence
- Prisma schema: `ptt-app/services/api/prisma/schema.prisma` — models `Agency` and `User` (use `prisma migrate` + `prisma/seed.ts`)
- Server entry: `ptt-app/services/api/src/server.ts` — registers routes and plugins
- Frontend entry: `ptt-app/apps/web/src/main.tsx` and `ptt-app/apps/web/package.json`
- Docker compose: `ptt-app/docker-compose.yml`

## Short dev workflow (commands you can run)
Work from `ptt-app/` unless noted.

- Start only Postgres: `docker compose up postgres -d` (Postgres listens on host:5433)
- API (dev):
  - `cd services/api`
  - `cp .env.example .env` (set `JWT_SECRET`)
  - `npm install`
  - `npx prisma migrate dev --name init`
  - `npm run db:seed` (creates seeded user)
  - `npm run dev` (runs `tsx watch src/server.ts`)
  - API default: `http://localhost:3001`
- Web (dev):
  - `cd apps/web`
  - `npm install`
  - `npm run dev` (Vite dev server at `http://localhost:5173`)

Tests:
- Backend: `cd ptt-app/services/api && npm test` (uses Vitest)
- Frontend: `cd ptt-app/apps/web && npm test`

Useful Prisma commands: `npm run db:migrate` / `npm run db:generate` / `npm run db:seed` (see `services/api/package.json`).

## Project-specific conventions and constraints (important for agents)
- TypeScript + ESM runtime: source imports include `.js` extensions in compiled/run-time imports (e.g. `import jwtPlugin from "./plugins/jwt.js"` in `server.ts`). Keep that in mind when adding/renaming files.
- Authentication is authoritative and pervasive:
  - JWT payload contains `{ userId, agencyId, role }` (see `plugins/jwt.ts`).
  - Routes that require auth use `onRequest: [fastify.authenticate]` — replicate this pattern.
  - Never trust client-sent agencyId; derive agency membership from JWT.
- Prisma schema changes require migration planning. Follow the existing pattern: `prisma migrate dev --name <desc>` and include a `seed` update if adding required test user data.
- Logging and determinism: the backend uses Fastify + pino (pino-pretty transport configured). Don't remove structured logs for auth/floor events; include `userId`, `channelId`, timestamps where relevant.

## Patterns and anti-patterns (from repo docs and code)
- Fastify route pattern: define route modules that accept `fastify: FastifyInstance` and `fastify.post/get(...)` — register the module in `server.ts`.
- Input validation uses `zod` in route handlers (see `auth.ts`) — validate and return 400 with details when parsing fails.
- Passwords use `bcryptjs` and stored as `passwordHash` (see `prisma/seed.ts` and `auth.ts`).
- Avoid introducing race conditions in any floor-control or single-writer logic. The repo expects atomic/transactional updates (see `CLAUDE.md` where safety rules are explicit).

## Integration points and external dependencies
- Postgres (container via `docker-compose`), Prisma client (`@prisma/client`)
- JWT via `@fastify/jwt` (secret required in `.env`)
- Frontend communicates with API over HTTP and uses JWT for auth in headers

## Quick examples to copy/paste
- Protected route skeleton:

  fastify.get(
    "/protected",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const { userId } = request.user; // populated by fastify-jwt
      // ...
    }
  );

- Sign token (from `auth.ts`):
  const token = fastify.jwt.sign({ userId: user.id, agencyId: user.agencyId, role: user.role });

## Where to look for more guidance
- `ptt-app/README.md` — canonical quick-start for local dev (matches scripts and ports shown here)
- `CLAUDE.md` — project-specific editing guardrails and safety rules; follow these strictly for auth, schema, and floor-control changes

If anything above is unclear or you'd like the file to include extra examples (e.g., a sample protected endpoint or a checklist for safe schema changes), tell me which area to expand and I will iterate.
