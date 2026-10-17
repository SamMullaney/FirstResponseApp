# FirstResponseApp

A cross-agency **Push-To-Talk (PTT) emergency communication app** that lets responders from different agencies talk on shared channels, with deterministic floor control, live signal-strength mapping, and graceful offline behavior.

> **Status:** MVP in active development.

## Features

- **Secure cross-agency authentication**: JWT-based, stateless auth. Users belong to an Agency, agencies own Channels, and Channels can be shared through Interop Groups.
- **Channel-based push-to-talk**: real-time signaling over WebSockets.
- **Server-authoritative floor control**: only one active speaker per channel, with atomic, deterministic state transitions and no race conditions.
- **Voice transport**: WebRTC with an SFU (e.g., mediasoup). The speaker uploads once and the SFU forwards audio to listeners; floor control decides who may send.
- **Telemetry and signal heatmap**: mobile clients upload signal metrics, the backend aggregates them by geographic grid, and cached heatmap tiles are served to clients.
- **Offline support**: local data cache and store-and-forward for unsent events, with no silent data loss.
- **(Bonus) Local mesh fallback** via BLE / Wi-Fi Direct.

## Design Goals

Reliable, deterministic (especially floor control), secure, auditable, modular, easy to test, and safe to modify.

## Architecture Overview

| Area | Approach |
|---|---|
| Auth | JWT; agency/channel access is derived from the token, never from client-sent IDs |
| Signaling | WebSocket, with a single authoritative in-memory floor-control store |
| Voice | WebRTC + SFU |
| Data | PostgreSQL via Prisma |
| Caching | Heatmap tiles cached; Redis optional |
| Deployment (MVP) | Dockerized services, Postgres container, single region |

The MVP deliberately avoids microservices, event sourcing, and CQRS. The design leaves room to scale later without implementing it prematurely.

## Repository Structure

```
FirstResponseApp/
├── .github/        # GitHub configuration
├── ptt-app/        # Application source
├── CLAUDE.md       # Project rules and guidance for AI-assisted development
├── package-lock.json
└── .gitignore
```

<!-- TODO: expand the ptt-app/ breakdown (e.g., server/, mobile/, prisma/) to match your layout. -->

## Getting Started

### Prerequisites

- Node.js and npm
- Docker (for PostgreSQL and containerized services)

<!-- TODO: confirm versions, and add mobile toolchain requirements if applicable. -->

### Setup

```bash
git clone https://github.com/SamMullaney/FirstResponseApp.git
cd FirstResponseApp/ptt-app
npm install
```

### Configuration

Create a `.env` file (never commit it). Typical values for this stack:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/firstresponse
JWT_SECRET=<long-random-secret>
```

<!-- TODO: replace with the actual variables your app reads. -->

### Run

```bash
# TODO: replace with your actual commands
docker compose up -d      # start Postgres
npx prisma migrate dev    # apply database migrations
npm run dev               # start the app
```

## Testing

Feature changes are expected to ship with tests covering:

- **Unit**: auth logic, permission checks, floor-control transitions, telemetry aggregation math
- **Integration**: login → get channels; join channel → request floor; floor granted → released; telemetry upload → aggregation result
- **Realtime simulation**: two users requesting the floor simultaneously, where exactly one must be granted

```bash
npm test
```

## Security

- JWTs signed with a strong secret; tokens are never logged
- All routes enforce auth where required; agency and channel access come from the JWT identity
- All user input validated and external data sanitized
- Telemetry ingestion is rate-limited

## Logging and Debugging

Structured logs cover auth events, floor-control events, channel joins/leaves, and telemetry ingest, including `userId`, `channelId`, and timestamps. Errors are logged and returned, never swallowed.

## Contributing

1. Read `CLAUDE.md` for the project's safe-editing, testing, and security rules.
2. Keep changes scoped; avoid refactoring unrelated code.
3. Don't change auth logic or the database schema without a migration plan.
4. Include unit and integration tests with every feature change.

## License

<!-- TODO: add a license (e.g., MIT) and a LICENSE file. -->
