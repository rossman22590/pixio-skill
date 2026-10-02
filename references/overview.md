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
- Concurrency is per account, shared by every key. `/generate` and workflow
  runs enforce it; video-agent segment dispatch does not return the `429`
  itself, so size its batches to the limit. `GET /me` returns the live
  `concurrencyLimit` (1 on most plans, 10 on Maker). Exceeding it returns
  `429 concurrency_limit`, not a queue.
- Maker daily caps are a different mechanism: free daily uses per model pool.
  `GET /me` → `makerCaps` reports `remainingToday` and `nextAllowanceAt`.
- Credits debit only when a generation reaches `succeeded`. `creditsCost` is
  the quote; `billedAt` is the charge; failed runs keep `billedAt: null`.
- `402 insufficient_credits` from `/generate` is the authoritative
  insufficient-credit response. `POST /prompts/optimize` also charges (5
  credits per call, taken only after validation passes, immediately before
  the model call) and returns the same `402` when short.

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

## Error Envelope

Every error body is JSON with the same two fields:

```json
{
  "error": "Insufficient credits",
  "code": "insufficient_credits",
  "message": "optional longer sentence",
  "details": { "formErrors": [], "fieldErrors": {} }
}
```

- `error`: a human-readable sentence you may show to a person.
- `code`: a stable machine string. **Branch on `code`, never on the `error`
  text.**
- `message` and `details` are optional. `details` is the field-level
  validation report on `invalid_request`. Routes add their own fields beside
  these (`availableCredits`, `retryAfter`, `generationId`, `limitChars`, ...).
- For a handful of legacy bodies `error` equals the code and the sentence is
  in `message`: `invalid_media_url`, `invalid_idempotency_key`,
  `invalid_workflow_override`, `invalid_workflow_definition`,
  `model_not_available` (video-agent generate), and the
  "cannot be billed" `invalid_request` from `POST /generations/estimate`.
  Reading `code` works the same either way.
- Error text never names the model provider or infrastructure vendor and
  never carries a raw upstream response body.

| `code` | Status | When |
|---|---:|---|
| `missing_api_key`, `invalid_api_key` | 401 | No key, or a key that is wrong or revoked. |
| `service_unavailable` | 503 | API-key storage unavailable; back off. |
| `invalid_json` | 400 | Body is not valid JSON (`/generate`, `/generations/estimate`, `/prompts/optimize`, `/agent`, `/media`, `/images`, workflow run). |
| `invalid_request` | 400 | Failed validation (with `details`), a bad query, or a pre-dispatch rule. On `/generate` also a pipeline validation sentence, returned unchanged. |
| `provider_error` | 400 | `/generate` only: the model provider rejected the request. Sanitized; never names the provider. |
| `model_unavailable` | 400 | `/generate` only: "Model is unavailable on the Pixio API." |
| `plan_restricted` | 400 | `/generate` only: "This model is not available on your current plan." |
| `maker_in_flight` | 400 | `/generate` only: a Maker generation is still running; wait for it, then retry. |
| `generation_failed` | 400 | `/generate` only: "Generation request failed". |
| `server_error` | 400 | `/generate` only: "Pixio Server Error. Please try again later." Pixio-side outage; retry later. Stored generation, run, and training errors use the same sentence. |
| `model_not_available` | 400 | `/video-agent/projects/{id}/generate`: unknown, hidden, or disabled model. |
| `invalid_idempotency_key` | 400 | Empty or oversized `Idempotency-Key`. |
| `invalid_media_url` | 400 | A media URL could not be imported. |
| `invalid_workflow_override` | 400 | A workflow run override or its media was rejected. |
| `insufficient_credits` | 402 | Not enough credits (`/generate`, `/prompts/optimize`). |
| `not_found` | 404 | Generation, workflow, run, or similar not owned or absent. |
| `model_not_found` | 404 | The model id did not resolve: unknown, hidden, disabled, or not on the plan. |
| `request_too_large` | 413 | `/agent` history over 1,000,000 characters. |
| `invalid_workflow_definition` | 422 | A saved workflow no longer validates. |
| `content_policy` | 422 | Rejected by a content check; will not succeed unchanged. |
| `concurrency_limit` | 429 | Account concurrency reached (`Retry-After: 10`). |
| `internal_error` | 500 | Pixio failed; back off. |
| `provider_error`, `workflow_dispatch_failed`, `optimizer_error` | 500/502/504 | Upstream or orchestration failure (`/media`, `/images`, `/prompts/optimize`, workflow runs). On `/generate`, `provider_error` is `400`. |

Exceptions, so a client does not assume more than is there:

- The project family (`/projects`, `/boards`, `/canvas`, `/cinema/**`,
  `/cam-view/**`, `/editor/**`, `/video-agent/projects` CRUD, `/characters`,
  `/prompt-library/{id}`, `/training/{id}`) reports failures with UPPER_SNAKE
  codes such as `PROJECT_NOT_FOUND`, `PROJECT_CONFLICT`, `INVALID_REQUEST`,
  and its `401`/`503` bodies carry `error` only, without `code`. Use the HTTP
  status there. `/prompt-library` and `/training` (the list routes) share the
  UPPER_SNAKE codes but do send `code` on auth failures.
- `POST /agent` below the 5-credit floor returns `402 { error }` with no
  `code`, and can return a plain-text `400` or `500` for a body the chat layer
  rejects; check `Content-Type` before parsing.

See `guides/errors-and-concurrency.md` for the retry matrix.

## Consistency And Retry Semantics

- `POST /generate` accepts an opt-in `Idempotency-Key` header. A repeat within
  24 hours returns the original generation (`200`, `idempotentReplay: true`).
- Without a key, an uncertain submission must be reconciled through
  `GET /generations` before resubmitting.
- Project writes accept `expectedUpdatedAt`; a mismatch returns
  `409 PROJECT_CONFLICT`.
- Asset and generation lists use page pagination (`page`, `limit`, `hasMore`).
  Project lists use cursor pagination (`limit`, `cursor`, `nextCursor`).
