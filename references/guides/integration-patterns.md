# Connectivity And Integration Patterns

## Environment Contract

Use server-side environment variables:

```text
PIXIO_BASE_URL=https://beta.pixio.myapps.ai/api/v1
PIXIO_API_KEY=pxio_live_...
```

Validate both at process startup. Never prefix the key with a client-public
environment convention such as `NEXT_PUBLIC_`, `VITE_`, or `EXPO_PUBLIC_`.

## Architecture Patterns

### Backend Or Worker

Call Pixio directly from the trusted process. Use one shared HTTP client, a
central account-wide concurrency semaphore, durable job state, and background
polling. This is the preferred production design.

### Browser Or Mobile App

Do not embed the Pixio key. Call your own authenticated backend, which validates
the application's user, applies spend policy, calls Pixio, and returns only the
resource ID/status/output needed by the client.

```text
browser/mobile -> your authenticated API -> Pixio /api/v1
                                      \-> durable job store/queue
```

### Serverless

Submit in one invocation, persist `contentId`, and poll through a scheduled job,
queue consumer, or status endpoint. Do not hold one serverless request open for
long video generations.

### CLI And CI

Read the key from the environment/secret store. Print IDs and sanitized JSON,
never request headers. Use `scripts/pixio-smoke.mjs` for read-only connectivity.

### Automation Platforms

Use an HTTP action with Bearer auth. Split submit and poll into separate steps.
Persist IDs in workflow state. Route `402` and approval-required policy to a
human step; route `429` to delayed retry.

### Generated OpenAPI Client

Generate transport types from `/openapi.json`, then add application wrappers for:

- runtime model/param discovery;
- cost approval;
- upload mapping;
- terminal polling;
- pagination;
- signed URL refresh;
- uncertain paid-submission reconciliation.

## HTTP Client Requirements

- Set `Authorization` and `Accept: application/json` per request.
- Set `Content-Type: application/json` only for JSON bodies; let the runtime set
  multipart boundaries for `FormData`.
- Apply connection and response timeouts to reads.
- Parse JSON error bodies even when status is non-2xx.
- Do not log authorization headers or full signed URLs.
- Keep submission timeout handling separate from safe read retries.

## Multi-Tenant Applications

Do not reuse one customer's API key for another customer. Encrypt keys at rest,
restrict decryption to the job runner, track account-level concurrency per key
owner, and delete stored credentials when the integration is disconnected.

## Health Check

Use only reads:

1. fetch public `/openapi.json`;
2. call authenticated `/subscription`;
3. call `/models` and assert at least one visible model;
4. call `/credits`;
5. do not submit a generation as a routine health check.
