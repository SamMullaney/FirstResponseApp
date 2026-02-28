Project Overview
This project is a Cross-Agency Push-To-Talk (PTT) Emergency Communication App with:

Secure cross-agency authentication

Channel-based push-to-talk voice

Server-authoritative floor control

Mobile service telemetry collection

Signal strength heatmap visualization

Offline caching and store-and-forward

(Bonus) Local mesh fallback via BLE/WiFi Direct

The system must be:

Reliable

Deterministic (especially floor control)

Secure

Auditable

Modular

Easy to test

Safe to modify

Core MVP Goals
1. Authentication & Access Control
Users belong to an Agency.

Agencies own Channels.

Channels may be shared via Interop Groups.

JWT-based stateless authentication.

All routes must enforce auth where required.

2. Real-Time Push-To-Talk
WebSocket-based signaling.

Server-authoritative floor control.

Only one active speaker per channel.

Deterministic state transitions.

No race conditions.

3. Voice Transport
WebRTC + SFU (e.g., mediasoup).

Speaker uploads once.

SFU forwards to listeners.

Floor control determines who is allowed to send audio.

4. Telemetry & Heatmap
Mobile clients upload signal metrics.

Backend aggregates by geographic grid.

Heatmap tiles served to clients.

Efficient caching required.

5. Offline Behavior
Local data cache.

Store-and-forward for unsent events.

Graceful degradation.

No silent data loss.


Project Overview
This project is a Cross-Agency Push-To-Talk (PTT) Emergency Communication App with:

Secure cross-agency authentication

Channel-based push-to-talk voice

Server-authoritative floor control

Mobile service telemetry collection

Signal strength heatmap visualization

Offline caching and store-and-forward

(Bonus) Local mesh fallback via BLE/WiFi Direct

The system must be:

Reliable

Deterministic (especially floor control)

Secure

Auditable

Modular

Easy to test

Safe to modify

Safe Code Editing Rules (CRITICAL)
When modifying the codebase, Claude must:

Never refactor unrelated code unless explicitly instructed.

Never change authentication logic without confirming impact.

Never modify database schema without:

Explaining migration implications

Providing a migration plan

Never introduce race conditions in floor control logic.

Never bypass validation for speed.

Never remove logging that aids debugging.

Never introduce global mutable state without justification.

Avoid breaking public API contracts.

If unsure:

Ask before changing architecture.

Propose changes before implementing.

Required Testing Rules
All feature changes must include:

Unit Tests
Auth logic

Permission checks

Floor control transitions

Telemetry aggregation math

Integration Tests
Login → Get Channels

Join Channel → Request Floor

Floor Granted → Floor Released

Telemetry Upload → Aggregation Result

Realtime Simulation Tests
Simulate two users requesting floor simultaneously.

Ensure only one is granted.

Verify proper release behavior.

No feature is considered complete without tests.

Debugging Requirements
Claude must ensure:

Structured logging exists for:

Auth events

Floor control events

Channel joins/leaves

Telemetry ingest

Logs include:

userId

channelId

timestamps

Errors must not fail silently.

All async code must handle rejections.

When debugging:

Reproduce with minimal test case.

Identify deterministic failure point.

Never guess blindly.

Common Claude Mistakes To Avoid
1. Overengineering
Do NOT introduce:

Microservices too early

Event sourcing

CQRS

Complex distributed patterns

MVP first.

2. Breaking Auth
Common mistake:

Forgetting to validate JWT in new route.

Trusting client-sent agencyId.

All agency/channel access must be derived from JWT identity.

3. Race Conditions in Floor Control
Incorrect:

Checking and assigning speaker in separate steps.

Correct:

Atomic state update.

Single authoritative in-memory store.

Lock or transactional guard if needed.

4. Blocking Event Loop
Do not:

Use synchronous heavy operations in request handlers.

Run CPU-heavy aggregation inline.

Use async and offload if needed.

5. Silent Failures
Do not:

Catch errors and ignore them.

Swallow WebSocket errors.

All failures must:

Log

Return proper error response

6. Unsafe Schema Changes
Before changing Prisma schema:

Confirm backward compatibility.

Provide migration steps.

Do not drop columns casually.

7. Editing Without Context
Before modifying a file:

Read full file.

Understand dependencies.

Search where function is used.

Never partially edit blindly.

Performance Guardrails
No N+1 queries.

Use indexed DB columns.

Cache hot paths (Redis optional).

Avoid blocking I/O.

Security Requirements
JWT signed with strong secret.

Do not log tokens.

Validate all user input.

Rate-limit telemetry ingestion.

Sanitize all external data.

When Adding New Features
Claude must:

Explain the change.

Explain impact on architecture.

Add/update tests.

Ensure no breaking changes.

Ensure no auth bypass.

Keep MVP constraints in mind.

Deployment Assumptions (MVP)
Dockerized services.

Postgres container.

Single region deployment.

No horizontal scaling initially.

Design must allow future scaling but not implement it prematurely.

