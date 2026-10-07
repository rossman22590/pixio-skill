# Connectivity And Integration Patterns

## Environment Contract

```text
PIXIO_BASE_URL=https://beta.pixio.myapps.ai/api/v1
PIXIO_API_KEY=pxio_live_...
```

Validate both at startup. Never prefix the key with a client-public convention
such as `NEXT_PUBLIC_`, `VITE_`, or `EXPO_PUBLIC_`.

## Architecture Patterns

### Backend Or Worker

Call Pixio directly from the trusted process. Use one shared HTTP client, a
central semaphore sized to `/me` → `concurrencyLimit`, durable job state
(including idempotency keys), and background polling. Preferred production
design.

### Desktop App

A desktop client may hold the user's own key in the OS keychain and call
`/api/v1` directly. Use `/me` at launch, `/projects` and `/media/resolve` for
the project workspace, `/assets?modelId=` with `/assets/models` for library
filters, and `/agent` for the in-app copilot. Never ship a shared key.

### Browser Or Mobile App

Do not embed the key. Call your own authenticated backend, which validates the
app user, applies spend policy, calls Pixio, and returns only IDs, status, and
output URLs.

```text
browser/mobile -> your authenticated API -> Pixio /api/v1
                                      \-> durable job store/queue
```

### Serverless

Submit in one invocation with an `Idempotency-Key`, persist `contentId`, and
poll through a scheduled job, queue consumer, or status endpoint. Do not hold a
function open for a long video generation. On retry, resend with the same key.

### CLI And CI

Read the key from the environment or secret store. Print IDs and sanitized
JSON, never headers. Use `scripts/pixio-smoke.mjs` for read-only connectivity
and `scripts/pixio-wait.mjs` to poll an existing job. `scripts/pixio-run.mjs`
is a complete reference client: quote, budget check, idempotent generate, poll.

### Automation Platforms

Use an HTTP action with bearer auth. Split submit and poll into separate steps.
Persist IDs and idempotency keys in workflow state. Route `402` and
approval-required policy to a human step; route `429` to a delayed retry that
honours `Retry-After`.

### Generated OpenAPI Client

Generate transport types from both documents (`/openapi.json` and
`/platform/openapi.json`), then add application wrappers for runtime
model/param discovery, quoting and approval, upload mapping, idempotency keys,
terminal polling, page and cursor pagination, signed URL refresh, project
`expectedUpdatedAt` handling, and reconciliation.

### Streaming (`/agent`)

Use an SSE-capable client (`fetch` with a readable body, `EventSource`
polyfill with headers, or a streaming HTTP library). Parse events
incrementally, persist generation IDs as they appear, and keep the request
alive up to 300 seconds.

## HTTP Client Requirements

- Set `Authorization` and `Accept: application/json` (or `text/event-stream`
  for `/agent`) per request.
- Set `Content-Type: application/json` only for JSON bodies; let the runtime
  set multipart boundaries for `FormData`.
- Apply connection and response timeouts to reads; use longer budgets for
  `/generations/estimate` with media and for `from-prompt` routes.
- Parse JSON error bodies even on non-2xx.
- Do not log authorization headers, signed URLs, or resolved media URLs.
- Keep submission timeout handling separate from safe read retries.

## Multi-Tenant Applications

Do not reuse one customer's key for another. Encrypt keys at rest, restrict
decryption to the job runner, track concurrency per key owner (per account),
and delete stored credentials when the integration is disconnected.

## Health Check

Reads only:

1. fetch anonymous `/openapi.json` and `/platform/openapi.json`;
2. call `/me` and assert `concurrencyLimit >= 1`;
3. call `/capabilities`;
4. call `/models` and assert at least one visible model;
5. call `/credits`;
6. never submit a generation as a routine health check.
