# PTT Emergency Communications — Step 1: Auth Skeleton

Cross-agency emergency push-to-talk system. This step implements authentication, agency membership, and JWT-based route protection.

## Architecture

```
ptt-app/
  apps/web/          → React frontend (Vite + TypeScript)
  services/api/      → Fastify backend (TypeScript + Prisma + PostgreSQL)
  docker-compose.yml → Local dev environment
```

## Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- npm (comes with Node.js)

## Quick Start (clone → running in 5 commands)

After cloning the repo, run everything from the `ptt-app/` directory.

### 1. Start PostgreSQL

```bash
cd ptt-app
docker compose up postgres -d
```

This starts a PostgreSQL container on port **5433** (to avoid conflicts with other local Postgres instances).

### 2. Setup and start the API

```bash
cd services/api
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

The API runs at `http://localhost:3001`. Leave this terminal open.

> **Windows users:** If `npm install` hangs, your network may have IPv6 routing issues. Fix it by running this before `npm install`:
> ```bash
> set NODE_OPTIONS=--dns-result-order=ipv4first
> ```
> Or in PowerShell:
> ```powershell
> $env:NODE_OPTIONS="--dns-result-order=ipv4first"
> ```

### 3. Setup and start the Frontend

Open a **second terminal**:

```bash
cd ptt-app/apps/web
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

### 4. Open the app

Go to **http://localhost:5173** in your browser.

Login with the seeded test account:
- **Email:** `officer@metro.gov`
- **Password:** `password123`

### 5. View in mobile layout

1. Open browser DevTools (`F12` or `Ctrl+Shift+I`)
2. Click the device toolbar icon (or `Ctrl+Shift+M`)
3. Select a phone preset (e.g., iPhone 14 Pro)
4. Refresh the page

## Stopping the app

- `Ctrl+C` in both terminal windows to stop the API and frontend
- `docker compose down` from `ptt-app/` to stop PostgreSQL
- To also delete the database data: `docker compose down -v`

## Running Tests

### Backend

```bash
cd services/api
npm test
```

### Frontend

```bash
cd apps/web
npm test
```

## API Endpoints

| Method | Path          | Auth     | Description              |
|--------|---------------|----------|--------------------------|
| GET    | `/health`     | No       | Health check             |
| POST   | `/auth/login` | No       | Login, returns JWT       |
| GET    | `/me`         | Required | Current user profile     |

## JWT Payload

```json
{
  "userId": "uuid",
  "agencyId": "uuid",
  "role": "OFFICER"
}
```

## Database Schema

- **Agency** — id, name, type
- **User** — id, email, passwordHash, role, agencyId, badgeNumber?, licenseNumber?, createdAt

Roles: `OFFICER`, `FIREFIGHTER`, `EMT`, `ADMIN`

## Environment Variables

| Variable       | Description                | Default                          |
|----------------|----------------------------|----------------------------------|
| `DATABASE_URL` | PostgreSQL connection URL  | See `.env.example`               |
| `JWT_SECRET`   | Secret for signing JWTs    | Must be set                      |
| `PORT`         | API server port            | `3001`                           |
