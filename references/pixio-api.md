# Pixio Public API Contract Matrix

Base URL: `https://beta.pixio.myapps.ai/api/v1`

Authenticated calls require `Authorization: Bearer $PIXIO_API_KEY`.

## Discovery And Account

| Method | Path | Auth | Purpose |
|---|---|---:|---|
| GET | `/guide` | No | Agent guide; `?format=json` for structured output. |
| GET | `/openapi.json` | No | Media API OpenAPI 3.1 document. |
| GET | `/platform/openapi.json` | No | Project/platform API OpenAPI 3.1 document. |
| GET | `/capabilities` | Yes | `{ authentication, contracts, supported[], unsupported[] }`. |
| GET | `/me` | Yes | Identity, `plan`, `credits`, `concurrencyLimit`, `makerCaps[]`. |
| GET | `/subscription` | Yes | `plan`, `credits`, `apiConcurrencyLimit`. |
| GET | `/credits` | Yes | Recurring, permanent, and total balance. |
| GET | `/credits/ledger?limit=&generationId=` | Yes | `{ entries, hasMore }`: movements with `generationId`, `debitedCredits`, `creditedCredits`. |
| GET | `/pricing?type=&modelId=` | Yes | Live price list: `listCredits`, `yourCredits`, `pricing`, plans, packs. |

## Models And Prompting

| Method | Path | Purpose |
|---|---|---|
| GET | `/models` | Visible models with `credits`, `defaultCredits`, `fromCredits`, `pricing`, `freeForPlans`, `freeForCurrentPlan`, `makerCap`, `freeExcept`, `freeUpTo`, `inputs`. |
| GET | `/models?modelId=pixio/...` | One list-format model as `{ model }`. |
| GET | `/models/pixio/...` | `{ model, params, outputs }`; `params` carry `constraints`, `outputs` is `{ format: "json" \| "file", hasFileUrl }`. |
| GET | `/params?modelId=pixio/...` | Same detail shape. |
| GET | `/models/favorites` | `{ data: [{ modelId, name, type, createdAt }] }`. |
| POST | `/models/favorites` | `{ modelId }` → `201 { modelId, favorited: true }`. |
| DELETE | `/models/favorites?modelId=` | `{ modelId, favorited: false }`. |
| GET | `/preferences/models` | Read-only quick-action defaults with public IDs. |
| GET | `/preferences/models/catalog` | Every action key with eligible models. |
| GET | `/prompts/optimize` | `messageTypes`, `modes`, `legacyTypes`, `limits`. |
| POST | `/prompts/optimize` | Legacy `{ prompt, type?, context? }` or full optimizer body. Costs 5 credits per call; success bodies carry `cost: { credits }`; `402` when short. |
| GET | `/styles?kind=&category=&search=` | Styles (`append`) and viral templates (`replace` + `recipe`). |
| GET | `/prompt-library?type=&query=&limit=` | `{ data, hasMore }`: prompts mined from generation history, `modelId` a public `pixio/...` ID. |
| GET | `/prompt-library/{id}` | One prompt with its saved `params` (internal keys removed). |

## Generation

| Method | Path | Purpose |
|---|---|---|
| POST | `/generations/estimate` | `{ modelId, params, durationSeconds? }` → `quote`, `pricing`, `baseCost`, `estimatedCost`. |
| POST | `/generate` | `{ modelId, params }` + `Idempotency-Key` → `202 { contentId, providerId, modelId, creditsCharged, freeAllowance, notCoveredBy }` or `200` replay (with the stored job's `providerId`, `modelId`). |
| GET | `/generations?status=&type=&page=&limit=` | History with `creditsCost` and `billedAt`. |
| GET | `/generations/{id}` | Status, output, `billing`, `media`. |
| DELETE | `/generations/{id}` | Delete record and stored output. Not cancellation. |

Generation statuses: `pending`, `processing`, `succeeded`, `failed`.

## Media And Assets

| Method | Path | Purpose |
|---|---|---|
| POST | `/images` | Up to 10 images → clean public URLs. |
| POST | `/media` | Up to 10 image/video/audio items → clean public URLs. |
| POST | `/media/resolve` | `{ refs[1..100] }` → `{ urls: { ref: url \| null } }`. |
| POST | `/uploads?collectionId=` | Up to 8 items → managed assets with `id`, `filePath`, signed URL. |
| GET | `/assets?type=&source=&search=&modelId=&page=&limit=` | Uploads and generated assets. |
| GET | `/assets/models` | Models that produced assets, with counts. |
| POST | `/assets` | Alias of `/uploads`. |
| DELETE | `/assets` | Bulk delete up to 100 IDs. |
| GET | `/assets/{id}?source=` | One asset with a fresh signed URL. |
| PATCH | `/assets/{id}` | Rename an upload; generated assets return `422`. |
| DELETE | `/assets/{id}` | Delete one asset. |
| GET | `/assets/{id}/download?redirect=&tier=` | Attachment URL; Songcraft `tier` charges once per song. |
| GET | `/assets/download?ids=&source=&tier=` | Batch attachment URLs with `failed[]`. |
| GET | `/assets/collections` | Folders with item counts. |
| POST | `/assets/collections` | `{ name, parentId?, color? }` → `201`; `409` on sibling name clash. |
| GET/PATCH/DELETE | `/assets/collections/{id}` | Read, rename/recolour/re-parent, delete (assets kept). |
| GET | `/assets/collections/{id}/items?page=&limit=` | Filed assets. |
| POST | `/assets/collections/{id}/items` | `{ assetIds }` → `{ added, skipped[] }`. |
| DELETE | `/assets/collections/{id}/items` | `{ assetIds }` or `?ids=` → `{ removed }`. |

## Workflows

| Method | Path | Purpose |
|---|---|---|
| GET | `/workflows` | Saved workflows with `latestRun`. |
| POST | `/workflows` | `{ name, description?, definition }` → `201`. |
| GET | `/workflows/{id}` | Definition with node IDs; `422` if invalid. |
| PATCH | `/workflows/{id}` | Update `name`, `description`, or `definition`. |
| DELETE | `/workflows/{id}` | `{ deleted: true, id }`; runs cascade. |
| POST | `/workflows/{id}/runs` | `{ prompt?, negativePrompt?, overrides? }` → `202 { runId }`. |
| GET | `/workflows/{id}/runs?limit=` | `{ workflowId, hasMore, runs }`: recent runs (`limit` clamped to 1–50, default 20; never an error). |
| GET | `/workflows/{id}/runs/{runId}` | Run status, `steps[]`, `outputs[]`. |

Workflow run statuses: `queued`, `running`, `succeeded`, `failed`.

## Projects

Project types: `boards`, `canvas`, `cinema-storyboards`, `cam-view-scenes`,
`video-agent-projects`, `editor-projects`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/projects?type=&query=&limit=&cursor=` | Any type; `{ data, nextCursor }`. |
| POST | `/projects` | `{ type, ...create body }` → `201 Project`. |
| GET/PATCH/DELETE | `/projects/{id}` | Generic read, update, delete. |
| GET/POST | `/boards`, `/canvas`, `/cinema/storyboards`, `/cam-view/scenes`, `/video-agent/projects`, `/editor/projects` | Typed list and create. |
| GET/PATCH/DELETE | `.../{id}` | Typed read, update (`expectedUpdatedAt`), delete (`?expectedUpdatedAt=`). |
| POST | `/boards/{id}/operations`, `/canvas/{id}/operations`, `/editor/projects/{id}/operations` | `{ operations[1..100], expectedUpdatedAt?, fps? }`. |
| POST | `/boards/from-prompt`, `/canvas/from-prompt`, `/cinema/storyboards/from-prompt`, `/cam-view/scenes/from-prompt`, `/video-agent/projects/from-prompt` | Direct a project from a brief → `201`. |
| POST | `/video-agent/projects/{id}/generate` | Dispatch per-segment generations → `202`. |

## Agent, Characters, Training

| Method | Path | Purpose |
|---|---|---|
| POST | `/agent` | `{ messages }` → SSE stream; needs 5+ credits. |
| GET | `/characters` | `{ data: Character[], updatedAt }`. |
| POST | `/characters` | `{ name, description?, referenceImageUrl? }` → `201`; replaces by name. |
| GET/PATCH/DELETE | `/characters/{name}` | Read, partial update, delete. |
| GET | `/training` | `{ data, hasMore }`: up to 200 training jobs (snake_case fields). |
| GET | `/training/{id}` | One job. |

## Standard Status Policy

| Status | Meaning | Client action |
|---:|---|---|
| 200/201 | Read, create, or upload completed | Consume response. |
| 200 + `idempotentReplay` | `/generate` replayed an earlier job | Resume polling the returned `contentId`. |
| 202 | Generation, workflow run, or segment dispatch queued | Persist ID and poll. |
| 302 | `?redirect=true` download | Follow to the file. |
| 400 | Invalid JSON (`invalid_json`), body, params, query, media, cursor, or idempotency key (`invalid_request` and friends); every `/generate` pipeline failure (`provider_error`, `model_unavailable`, `plan_restricted`, `maker_in_flight`, `generation_failed`, `server_error`); video-agent generate `model_not_available` | Branch on `code`. Fix request; do not blind retry (`maker_in_flight`: wait for the running Maker job). |
| 401 | Missing, invalid, or revoked key | Replace credentials; do not retry. |
| 402 | Insufficient credits (generate, prompt optimizer, Songcraft download) | Ask user or choose a cheaper path. |
| 404 | Resource, model, project, character, or prompt unavailable | Re-discover or correct ID. |
| 409 | Project version conflict, unsupported project type, or folder name clash | Reload and reapply, or rename. |
| 413 | Project payload over 5 MB, or an `/agent` history over 1,000,000 characters (`request_too_large`) | Shrink content or trim older messages. |
| 422 | Content policy, invalid workflow definition, rename of generated asset, canvas operation unsupported | Change the input or operation. |
| 429 | Account API concurrency reached | Poll the blocking job; honour `Retry-After`. |
| 500/502/503 | Server, provider, upload, or key-storage failure | Back off; reconcile before paid resubmit. |

Every error body is `{ error, code, ... }`; branch on `code`. See
`overview.md`, "Error envelope", for the code list and the project-family
exceptions.

## Boundary

Anything outside `/api/v1` is not part of this contract. Do not use
browser-session, app project, internal provider, admin, or webhook endpoints
from external integrations.
