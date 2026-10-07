---
name: pixio-skill
description: Integrate, operate, document, or audit the Pixio public REST API (/api/v1) from an agent, backend, worker, script, automation, CLI, desktop app, mobile backend, or generated client. Use for Pixio API keys and revocation, OpenAPI discovery (media spec, platform spec, /capabilities), account identity (/me), live per-account pricing, model discovery/params/constraints/favorites/preferences, the full prompt optimizer, credit quotes measured the way they bill, idempotent generation, polling, billing reports and ledger reconciliation, uploads and asset folders, clean media URLs, resolving stored project media references, the style gallery, saved-workflow CRUD and runs, project authoring over the API (Boards, Canvas, Cinema storyboards, Cam View scenes, Video Agent projects, timeline editor projects, prompt-to-project direction, validated operations), the streaming Pixio agent (/agent), locked characters, prompt history, training status, concurrency 429s, Maker daily caps, content-policy 422s, and every other Pixio API error. Also use to decide whether a Pixio app feature is public-API-supported. Never use app-internal, admin, provider, webhook, or browser-session routes for third-party integrations.
---

# Pixio Public API

Operate Pixio through the stable public `/api/v1` surface. The deployed
contracts are the source of truth; this skill mirrors them as of 2026-10-07.

```text
Origin:   https://beta.pixio.myapps.ai
Base URL: https://beta.pixio.myapps.ai/api/v1
Auth:     Authorization: Bearer $PIXIO_API_KEY
```

Keys grant full account access (no scopes) and revoke immediately. Never put a
key in browser code, a mobile binary, public source, URLs, screenshots,
telemetry, or logs. Call Pixio from a trusted backend, worker, CLI, desktop
runtime, or agent secret store. Create and revoke keys on the Integrations
screen in the app.

## Two Contracts, One Key

| Document | Route | Covers |
|---|---|---|
| Media API | `GET /openapi.json` (anonymous) | generate, quotes, generations, media, assets, folders, styles, models and favorites, pricing, credits, `/me`, optimizer, preferences, workflows (CRUD and runs), `/agent`, `/capabilities` |
| Platform API | `GET /platform/openapi.json` (anonymous) | generic and typed project CRUD, operations, prompt-to-project, Video Agent segment generation, characters, prompt library, training, workflow CRUD, plus the account and folder reads (`/me`, `/pricing`, `/assets/collections`, `/assets/models`, `/styles`, `/media/resolve`) and preferences |
| Capabilities | `GET /capabilities` (auth) | supported surfaces, unsupported surfaces, links to both contracts |

`GET /guide` (anonymous, Markdown or `?format=json`) is the agent-readable
protocol summary. Read it when the deployed API may be newer than this skill.

## Errors

Every error body is `{ error, code, ... }`: `error` is a sentence, `code` is a
stable machine string (`missing_api_key`, `invalid_json`, `invalid_request`,
`insufficient_credits`, `model_not_found`, `content_policy`,
`concurrency_limit`, `provider_error`, ...), with optional `message` and
`details`. Branch on `code`. A few legacy bodies set `error` equal to the code.
The project family uses UPPER_SNAKE codes (`PROJECT_NOT_FOUND`) and its `401`
bodies carry `error` only. Read `references/overview.md` ("Error envelope") for
the full list.

## Start Every Integration

1. `GET /me`: confirms the key and returns plan, credit balances,
   `concurrencyLimit`, and Maker `makerCaps`. This is the first call.
2. `GET /capabilities` when you need to know what the deployed API supports.
3. `GET /models` (or `GET /pricing` when cost drives the choice). Never invent
   a model ID. All public IDs start with `pixio/`.
4. `GET /models/{pixio/...}` or `GET /params?modelId=...` for exact inputs,
   `required`, `options`, and `constraints` (`maxBytes`, `maxSeconds`,
   `accepts`). Never invent input names or enum values.
5. `POST /generations/estimate` with the exact params (and the real file for
   per-second models). Read `quote.status`; `provisional` means not measured.
6. Upload local media with `POST /uploads` (or `/media`, `/images`) or pass a
   public URL directly in a declared media param.
7. `POST /generate` once, with an `Idempotency-Key` header. Persist
   `contentId`. Poll `GET /generations/{id}` to `succeeded` or `failed`.
8. Reconcile cost from `GET /generations/{id}` `billing` and
   `GET /credits/ledger?generationId=...`. `creditsCost` is a quote;
   `billedAt` is the charge.

## Complete Public Surface

| Area | Routes |
|---|---|
| Discovery | `GET /guide`, `GET /openapi.json`, `GET /platform/openapi.json`, `GET /capabilities` |
| Account | `GET /me`, `GET /subscription`, `GET /credits`, `GET /credits/ledger` |
| Pricing | `GET /pricing`, `POST /generations/estimate` |
| Models | `GET /models`, `GET /models/{id}`, `GET /params`, `GET/POST/DELETE /models/favorites`, `GET /preferences/models`, `GET /preferences/models/catalog` |
| Prompting | `GET/POST /prompts/optimize`, `GET /styles`, `GET /prompt-library`, `GET /prompt-library/{id}` |
| Media ingestion | `POST /images`, `POST /media`, `POST /uploads`, `POST /media/resolve` |
| Assets | `GET/POST/DELETE /assets`, `GET/PATCH/DELETE /assets/{id}`, `GET /assets/{id}/download`, `GET /assets/download`, `GET /assets/models` |
| Folders | `GET/POST /assets/collections`, `GET/PATCH/DELETE /assets/collections/{id}`, `GET/POST/DELETE /assets/collections/{id}/items` |
| Generations | `POST /generate`, `GET /generations`, `GET/DELETE /generations/{id}` |
| Workflows | `GET/POST /workflows`, `GET/PATCH/DELETE /workflows/{id}`, `GET/POST /workflows/{id}/runs`, `GET /workflows/{id}/runs/{runId}` |
| Projects (generic) | `GET/POST /projects`, `GET/PATCH/DELETE /projects/{id}` |
| Boards | CRUD at `/boards`, `POST /boards/{id}/operations`, `POST /boards/from-prompt` |
| Canvas | CRUD at `/canvas`, `POST /canvas/{id}/operations`, `POST /canvas/from-prompt` |
| Cinema | CRUD at `/cinema/storyboards`, `POST /cinema/storyboards/from-prompt` |
| Cam View | CRUD at `/cam-view/scenes`, `POST /cam-view/scenes/from-prompt` |
| Video Agent | CRUD at `/video-agent/projects`, `POST .../from-prompt`, `POST /video-agent/projects/{id}/generate` |
| Editor | CRUD at `/editor/projects`, `POST /editor/projects/{id}/operations` |
| Agent | `POST /agent` (SSE stream of the Pixio chat agent) |
| Characters | `GET/POST /characters`, `GET/PATCH/DELETE /characters/{name}` |
| Training | `GET /training`, `GET /training/{id}` (read-only) |

`references/endpoints/route-map.md` classifies every route by auth, mutation,
and billing.

## Choose The Correct Media Path

- `POST /images`: clean public image URL, no signed query string.
- `POST /media`: clean public image, video, or audio URL.
- `POST /uploads` (alias `POST /assets`): a managed Pixio asset with `id`,
  `filePath`, signed URL, and metadata. Add `?collectionId=` to `POST /uploads`
  (not the `/assets` alias) to file it into a folder in the same call.
- Public HTTP(S) media URLs may be passed straight into a declared media param;
  Pixio imports them before dispatch. Localhost, private hosts, and local paths
  fail with `400 invalid_media_url`.
- `POST /media/resolve`: turn storage keys stored inside project documents
  (board nodes, canvas layers, storyboard frames) into displayable URLs. Never
  write the returned URLs back into project content.

Read `references/guides/media-workflow.md` before implementing file handling.

## Cost-Aware Generation Protocol

1. `GET /me` for `concurrencyLimit`, `credits.total`, and `makerCaps`.
2. `GET /pricing?modelId=...` to compare `listCredits` vs `yourCredits` and
   learn the billing `pricing.rate` and unit.
3. `GET /models/{id}` to validate inputs and `constraints`.
4. `POST /generations/estimate` with exact params and the real media. Use
   `quote.expectedDebit`. A `provisional` quote is not a price.
5. Ask for approval when policy or `expectedDebit` requires it.
6. `POST /generate` once with `Idempotency-Key: <stable unique id>`.
7. Persist `contentId` before polling or returning control. Report
   `creditsCharged` to the user; when it is non-zero on a plan-covered model,
   say why (`notCoveredBy`, or `freeAllowance.remainingToday == 0`).
8. Poll with bounded backoff; stop on `succeeded` or `failed`.
9. After a timeout, retry with the same `Idempotency-Key`; a `200` with
   `idempotentReplay: true` is the original job. Without a key, inspect
   `GET /generations?status=pending` and `?status=processing` first.

Read `references/guides/errors-and-concurrency.md` for the retry matrix,
`references/endpoints/generation-estimates.md` for the quote object, and
`references/endpoints/generate.md` for the exact status codes.

## Workflow Protocol

1. `GET /workflows`, or `POST /workflows` with a `definition` to create one.
2. `GET /workflows/{id}` to read node IDs before writing overrides.
3. Upload local media first; pass clean URLs as `overrides.<nodeId>.fileUrl`.
4. `POST /workflows/{id}/runs`, persist `runId`, poll the run route.
5. Return `outputs[]` plus failed step errors. Runs share the account
   concurrency limit.

## Project Authoring Protocol

1. Pick the typed route family (`/boards`, `/canvas`, `/cinema/storyboards`,
   `/cam-view/scenes`, `/video-agent/projects`, `/editor/projects`) or the
   generic `/projects` route with a `type` discriminator.
2. Create from a template, a full `content` document, or `POST .../from-prompt`
   so Pixio directs the document from a brief.
3. Mutate Boards, Canvas, and Editor projects with `POST .../{id}/operations`
   (1 to 100 validated operations). Send `expectedUpdatedAt` for optimistic
   concurrency; a `409 PROJECT_CONFLICT` means reload and reapply.
4. Display media with `POST /media/resolve`; never store resolved URLs.
5. Video Agent: plan with `from-prompt`, then dispatch clips with
   `POST /video-agent/projects/{id}/generate` (max 10 segments per call,
   billed like `/generate`).

Read `references/endpoints/projects.md` and
`references/examples/project-authoring.md`.

## Agent Protocol

`POST /agent` streams the same tool-calling Pixio agent that powers in-app
chat over Server-Sent Events. The caller owns the message history and resends
it every turn. It needs at least 5 credits; any generation it starts bills like
`/generate` and is pollable at `GET /generations/{id}`. Use it when a user
wants conversational direction rather than a deterministic pipeline. Read
`references/endpoints/agent.md`.

## Unsupported Public Capabilities

Report these as unsupported rather than reaching for an internal route:

- Executing Pix Agent chat tools through the internal streaming chat route
  (`/api/chat`); use `POST /api/v1/agent` instead.
- Cam View mobile-controller pairing and live sensor streaming.
- Headless timeline renders, exports, and render progress.
- Autonomous Video Agent orchestration and final assembly (planning and
  per-segment dispatch are supported).
- Starting or cancelling model-training jobs (status is read-only).
- Writing model preferences (read-only; managed in the app).
- Cancelling in-flight provider work. `DELETE /generations/{id}` deletes the
  record and output only; it never stops work or reverses a charge.
- `/api/v1/chat/conversations` was removed; do not call it.

Never call `/api/chat`, `/api/projects`, `/api/editor-agent`, `/api/latest/*`,
provider proxies, admin routes, or webhooks with a Pixio API key. If a
capability is absent from both OpenAPI documents, it is unsupported.

## Reference Routing

- `references/index.md`: choose a document.
- `references/pixio-api.md`: the whole contract in tables.
- `references/guides/agent-integration.md`: autonomous execution state machines.
- `references/guides/integration-patterns.md`: Node, Python, serverless,
  desktop, mobile-backend, CI, generated clients.
- `references/guides/media-workflow.md`: uploads, folders, URL lifetimes,
  project media references.
- `references/guides/errors-and-concurrency.md`: retries, idempotency, 402,
  422, 429, 409.
- `references/guides/pricing-and-billing.md`: list vs your price, quotes,
  Maker caps, ledger reconciliation.
- `references/endpoints/route-map.md`: every route and every boundary.
- One file under `references/endpoints/` per endpoint family.
- One file under `references/examples/` per end-to-end recipe.

## Non-Negotiable Agent Rules

- Use only `pixio/...` model IDs returned for the authenticated account.
- Use the returned param schema; preserve types; honour `constraints`.
- Treat `202` as queued, not completed.
- Treat `outputUrl`, asset `url`, and resolved media URLs as expiring.
- Branch on `code`, not on the `error` sentence.
- Treat `401` as missing, invalid, or revoked credentials; do not retry it.
- Treat `402` as a credit decision; surface `availableCredits`,
  `requiredCredits`, and `shortfall`. `POST /prompts/optimize` costs 5 credits
  per call and can return it too.
- Treat `422 content_policy` as final for that input; do not resubmit
  unchanged. Surface `inputHint`.
- Treat `429 concurrency_limit` as account-wide backpressure (shared by every
  key, every generate route); poll `generationId`, honour `Retry-After`. It is
  not a Maker daily-cap rejection.
- Treat `409 PROJECT_CONFLICT` as stale state; reload before reapplying.
- Do not retry destructive operations automatically.
- Do not dispatch paid work after an ambiguous failure without an
  `Idempotency-Key` replay or a history check.
- Do not expose provider IDs, internal storage paths, internal-only params, or
  app-only endpoints as part of the public contract. `providerId` is always
  `pixio`.

## Completion Checklist

Before saying an integration is complete, verify:

- the API key is server-side and revocation produces `401`;
- `/me`, `/models`, and model params were read successfully;
- `quote.status` and `expectedDebit` drive the approval policy;
- local media follows an upload path and remote media is public;
- `Idempotency-Key` is sent on `/generate` and `contentId` or `runId` is saved;
- terminal success and failure states are handled;
- `400`, `401`, `402`, `404`, `409`, `413`, `422`, `429`, `500`, `502`, and
  `503` each have an explicit policy;
- signed URL expiry and refresh are handled;
- page pagination follows `hasMore`; project pagination follows `nextCursor`;
- destructive calls require deliberate user intent;
- no unsupported capability is represented as `/api/v1`.
