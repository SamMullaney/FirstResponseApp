# First Response

This is a demo for a cross-agency **push-to-talk (PTT) emergency communication app** for police, fire, EMS, and other responders. Users from different agencies can coordinate on shared channels, see active incidents on a live map, and report new incidents from the field.

> **Status:** Early MVP. Authentication and the mobile-first web client work today. Real-time voice, floor control, and telemetry are planned (see the [Roadmap](#roadmap)).

## Features

### Working now

- **Agency-aware login**: email/password sign-in with bcrypt-hashed passwords and JWTs (8-hour expiry) carrying `userId`, `agencyId`, and `role`.
- **Protected API**: Fastify routes guarded by a shared `authenticate` hook, with Zod request validation.
- **Incident map**: MapLibre GL map on OpenStreetMap tiles, with incident markers and an H3 hexagon signal-strength overlay.
- **Incident log and reporting**: a list of active incidents, and a report form that auto-detects your location (falling back to Newark, DE).
- **Incident channels**: a page for each incident with details, assigned units, text chat, and a "resolve" action.
- **Agency channels**: General, Fire, Police, EMT, and other channels with join/leave, member lists, and text chat.
- **Push-to-talk UI**: hold-to-talk mic button with microphone permission handling and a live audio-level meter.
- **Profile page**: shows your agency, role, and badge or license number, loaded from `GET /me`.

### Prototype limitations

These features currently run in the browser only, to demonstrate the UX:

- Incidents are seeded demo data held in React state, so they reset on reload.
- Channel membership and chat history are saved in `localStorage` and aren't shared between users.
- The PTT button captures your microphone locally but doesn't transmit audio yet.
- Heatmap signal values are randomly generated.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 6, MapLibre GL, h3-js |
| Backend | Node.js 20, Fastify 5, TypeScript, Zod, `@fastify/jwt`, bcryptjs |
| Database | PostgreSQL 16, Prisma 6 |
| Testing | Vitest, React Testing Library, jsdom |
| Dev environment | Docker Compose |

## Repository Structure

```
FirstResponseApp/
├── CLAUDE.md                  # Engineering guardrails (auth, floor control, testing rules)
├── .github/
│   └── copilot-instructions.md
└── ptt-app/
    ├── docker-compose.yml     # Postgres (+ optional API container)
    ├── apps/web/              # React frontend
    │   └── src/
    │       ├── auth/          # AuthContext (login/logout, token state)
    │       ├── components/    # TopBar, BottomBar, MapView, VoiceChat
    │       ├── pages/         # Login, MapPage, Channels, IncidentChannel, ReportIncident, Dashboard
    │       ├── data/          # Demo incident data and types
    │       └── __tests__/
    └── services/api/          # Fastify backend
        ├── prisma/            # schema.prisma, migrations, seed.ts
        └── src/
            ├── plugins/jwt.ts # JWT setup + authenticate hook
            ├── routes/        # auth.ts, user.ts
            ├── server.ts
            └── __tests__/
```

## Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/) and npm
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Start PostgreSQL

```bash
git clone https://github.com/SamMullaney/FirstResponseApp.git
cd FirstResponseApp/ptt-app
docker compose up postgres -d
```

Postgres runs on host port **5433**, which avoids clashing with a local install on 5432.

### 2. Start the API

```bash
cd services/api
cp .env.example .env        # then set a strong JWT_SECRET
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

The API runs at **http://localhost:3001**.

> **Windows:** if `npm install` hangs, set `NODE_OPTIONS=--dns-result-order=ipv4first` first. That works around an IPv6 routing issue.

### 3. Start the web app

In a second terminal:

```bash
cd ptt-app/apps/web
npm install
npm run dev
```

Open **http://localhost:5173**. Vite proxies `/api/*` to the API on port 3001.

### 4. Log in

Use the seeded account:

| Email | Password | Agency | Role |
|---|---|---|---|
| `officer@metro.gov` | `password123` | Metro Police Department | OFFICER |

The UI is designed for phones. In your browser's DevTools, turn on device emulation (`Ctrl+Shift+M`) and pick a phone preset.

### Stopping

Press `Ctrl+C` in each terminal, then run `docker compose down` from `ptt-app/`. Add `-v` to also delete the database volume.

## Configuration

`services/api/.env` holds these settings:

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://ptt_user:ptt_password@localhost:5433/ptt_db?schema=public` |
| `JWT_SECRET` | Secret used to sign JWTs. **Required.** The API refuses to start without it. | none |
| `PORT` | API port | `3001` |

## API

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | No | Health check |
| `POST` | `/auth/login` | No | Takes `{ email, password }` and returns `{ token, user }` |
| `GET` | `/me` | Bearer token | Returns the current user's profile and agency |

JWT payload:

```json
{ "userId": "uuid", "agencyId": "uuid", "role": "OFFICER" }
```

## Data Model

- **Agency**: `id`, `name`, `type` (e.g. `police`, `fire`, `emt`)
- **User**: `id`, `email` (unique), `passwordHash`, `role`, `agencyId`, `badgeNumber?`, `licenseNumber?`, `createdAt`

Roles: `OFFICER`, `FIREFIGHTER`, `EMT`, `ADMIN`.

## Scripts

**API** (`services/api`)

| Script | Purpose |
|---|---|
| `npm run dev` | Start with hot reload (`tsx watch`) |
| `npm run build` / `npm start` | Compile to `dist/` and run it |
| `npm test` | Run Vitest |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:seed` | Seed the demo agency and user |

**Web** (`apps/web`)

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm test` | Run Vitest |

## Testing

```bash
cd ptt-app/services/api && npm test   # backend
cd ptt-app/apps/web && npm test       # frontend
```

- **Backend unit tests**: password hashing and JWT sign/verify, including rejecting a token signed with the wrong secret.
- **Backend integration tests**: `POST /auth/login` (valid login, unknown email, wrong password, bad body) and `GET /me` (valid, missing, or invalid token). These mock Prisma, so you don't need a database.
- **Frontend tests**: the login form renders, a successful login shows the app, and a failed login shows an error.

## Roadmap

The full design is in [`CLAUDE.md`](CLAUDE.md). Planned work:

- [ ] Channels and Interop Groups in the database, with access derived from the JWT
- [ ] WebSocket signaling with **server-authoritative floor control** (one speaker per channel, atomic transitions)
- [ ] Voice over WebRTC through an SFU such as mediasoup
- [ ] Persistent incidents and chat on the backend
- [ ] Mobile signal telemetry ingestion, with the backend aggregating H3 cells into heatmap tiles
- [ ] Offline cache and store-and-forward for unsent events
- [ ] Bonus: local mesh fallback over BLE or Wi-Fi Direct

## Contributing

Read [`CLAUDE.md`](CLAUDE.md) before making changes. The key rules:

- Every protected route uses `onRequest: [fastify.authenticate]`. Never trust a client-sent `agencyId`; derive it from the JWT.
- Prisma schema changes need a migration plan and must stay backward compatible.
- Floor-control logic must be atomic and free of race conditions.
- New features ship with unit and integration tests.
- Keep structured logs for auth, floor, and channel events, and never log tokens.

## License

No license has been chosen yet.
