# Pixio Public API Overview

## Trust Boundary

The public API is every implemented route under `/api/v1`. Authenticated routes
use a personal Pixio API key and operate on the account that owns the key.

- Authentication model: `full-account-access`. There are no per-key scopes.
- Revocation: immediate. A revoked key returns `401` on the next call.
- Keys are created and revoked on the Integrations screen in the app.

Anonymous routes (no key required, no secrets returned):

- `GET /api/v1/guide`
- `GET /api/v1/openapi.json`
- `GET /api/v1/platform/openapi.json`

Every other `/api/v1` call requires:

```http
Authorization: Bearer pxio_live_your_api_key
```

## Capability Domains

Supported (mirrors `GET /capabilities` → `supported`):

- AI media generation and credit quotes measured the way they bill.
- Uploaded and generated media assets, folders, and the style gallery.
- Resolving project media references into displayable URLs.
- Generation history, status, billing reports, and ledger reconciliation.
- Model discovery, favorites, read-only preferences, and the full prompt
  optimizer (model-family prompts, screenplay mode, attachments, grounding).
- Account identity, credits, plan, API limits, and Maker daily caps.
- The live price list, priced for the calling account, with plan and
  credit-pack rates.
- Creating, editing, listing, and running saved workflows.
- Boards and spatial canvas project CRUD and operations.
- Canvas design CRUD and operations.
- Cinema storyboard CRUD and prompt-to-storyboard direction.
- Cam View scene CRUD and prompt-to-keyed-scene direction.
- Video Agent project persistence, planning, and per-segment generation.
- Timeline project CRUD and validated editor operations.
- The streaming Pixio agent over API-key auth.
- Locked character CRUD, prompt history, and model-training status.

Unsupported (mirrors `GET /capabilities` → `unsupported`):

- Executing Pix Agent chat tools through the internal streaming chat route.
- Cam View mobile-controller pairing and live sensor streaming.
- Headless timeline renders, exports, and render progress.
- Autonomous Video Agent orchestration and final assembly.
- Starting or cancelling model-training jobs.

## Generation Lifecycle

```text
GET /me
  -> GET /pricing or /models
  -> GET /models/{id}            (inputs + constraints)
  -> upload or normalize media
  -> POST /generations/estimate  (quote.status, expectedDebit)
  -> POST /generate + Idempotency-Key  (202, contentId)
  -> persist contentId
  -> GET /generations/{id} until succeeded | failed
  -> read outputUrl, billing, media
  -> GET /credits/ledger?generationId=... when reconciling
```

`POST /generate` returns HTTP `202`. It never means the media is ready.

## Account Semantics

- API jobs spend the same credits and appear in the same history as app jobs.
- Concurrency is per account, shared by every key and every generate route
  (`/generate`, workflow runs, video-agent generate). `GET /me` returns the
  live `concurrencyLimit` (1 on most plans, 10 on Maker). Exceeding it returns
  `429 concurrency_limit`, not a queue.
- Maker daily caps are a different mechanism: free daily uses per model pool.
  `GET /me` → `makerCaps` reports `remainingToday` and `nextAllowanceAt`.
- Credits debit only when a generation reaches `succeeded`. `creditsCost` is
  the quote; `billedAt` is the charge; failed runs keep `billedAt: null`.
- `402` from `/generate` is the authoritative insufficient-credit response.

## Pricing Semantics

- `GET /models` → `credits` is the list price at the pricing rule's defaults.
- `GET /pricing` → `yourCredits` is what this account pays after plan
  discounts, plan-free models, and today's free pools.
- `POST /generations/estimate` → `quote.expectedDebit` is the exact figure for
  one request. `quote.status: measured` means the billed quantity came from the
  caller's own file; `provisional` means a default or a `durationSeconds` hint.
- Per-second models bill the decoded duration of the supplied file, rounded up
  to the next whole second, subject to a minimum and sometimes a maximum. A
  caller-supplied duration value is ignored for billing.

## Media Semantics

- `/images` and `/media` return clean public URLs.
- `/uploads` and `/assets` return managed assets with `id`, `filePath`, and a
  signed URL that expires.
- `/media/resolve` turns durable storage keys held in project content into
  temporary display URLs.
- Signed asset, generation, and resolved URLs expire; refresh by fetching again.

## Consistency And Retry Semantics

- `POST /generate` accepts an opt-in `Idempotency-Key` header. A repeat within
  24 hours returns the original generation (`200`, `idempotentReplay: true`).
- Without a key, an uncertain submission must be reconciled through
  `GET /generations` before resubmitting.
- Project writes accept `expectedUpdatedAt`; a mismatch returns
  `409 PROJECT_CONFLICT`.
- Asset and generation lists use page pagination (`page`, `limit`, `hasMore`).
  Project lists use cursor pagination (`limit`, `cursor`, `nextCursor`).
