# Pixio User API Contract Matrix

Base URL: `https://beta.pixio.myapps.ai/api/v1`

Authenticated calls require `Authorization: Bearer $PIXIO_API_KEY`.

## Discovery

| Method | Path | Auth | Purpose |
|---|---|---:|---|
| GET | `/guide` | No | Human/agent guide; add `?format=json` for structured output. |
| GET | `/openapi.json` | No | OpenAPI 3.1 contract using the current request origin. |

## Models And Prompts

| Method | Path | Purpose |
|---|---|---|
| GET | `/models` | List models visible to the account. |
| GET | `/models?modelId=pixio/...` | Get one list-format model record. |
| GET | `/models/pixio/...` | Get model metadata plus `params`. |
| GET | `/params?modelId=pixio/...` | Get model metadata plus accepted `params`. |
| POST | `/prompts/optimize` | Rewrite a prompt for image, video, audio, or 3D. |

## Cost And Account

| Method | Path | Purpose |
|---|---|---|
| POST | `/generations/estimate` | Estimate base and plan-adjusted credits. |
| GET | `/credits` | Current recurring, permanent, and total credits. |
| GET | `/credits/ledger?limit=50` | Recent top-ups, debits, and refunds. |
| GET | `/subscription` | Plan, credit quota, balance, and concurrency limit. |

## Media And Assets

| Method | Path | Purpose |
|---|---|---|
| POST | `/images` | Upload/mirror up to 10 images into clean public URLs. |
| POST | `/media` | Upload/mirror up to 10 image/video/audio items into clean URLs. |
| POST | `/uploads` | Upload/import up to 8 reusable Pixio assets. |
| GET | `/assets` | Page through uploaded and generated assets. |
| POST | `/assets` | Alias of `/uploads`. |
| DELETE | `/assets` | Delete up to 100 owned assets. |
| GET | `/assets/{id}` | Fetch one owned asset with a fresh signed URL. |
| PATCH | `/assets/{id}` | Rename an uploaded asset; generated assets cannot be renamed. |
| DELETE | `/assets/{id}` | Delete one owned asset. |
| GET | `/assets/{id}/download` | Get a one-hour attachment URL or redirect. |
| GET | `/assets/download?ids=...` | Batch attachment URLs for up to 100 assets. |

## Generations

| Method | Path | Purpose |
|---|---|---|
| POST | `/generate` | Queue one paid generation and return `contentId`. |
| GET | `/generations` | Page through generation history and all statuses. |
| GET | `/generations/{id}` | Poll/detail with output, error, cost, and timestamps. |
| DELETE | `/generations/{id}` | Delete an owned generation and best-effort output object. |

Generation statuses: `pending`, `processing`, `succeeded`, `failed`.

## Saved Workflows

| Method | Path | Purpose |
|---|---|---|
| GET | `/workflows` | List workflows already saved in Pixio. |
| POST | `/workflows/{id}/runs` | Queue a saved workflow with optional overrides. |
| GET | `/workflows/{id}/runs?limit=20` | List recent runs. |
| GET | `/workflows/{id}/runs/{runId}` | Poll run, step status, and final outputs. |

Workflow statuses: `queued`, `running`, `succeeded`, `failed`.

## Standard Status Policy

| Status | Meaning | Client action |
|---:|---|---|
| 200/201 | Read/upload completed | Consume response. |
| 202 | Generation/workflow queued | Persist ID and poll. |
| 400 | Invalid body, params, query, or media | Fix request; do not blind retry. |
| 401 | Missing, invalid, or revoked key | Replace credentials; do not retry. |
| 402 | Insufficient credits | Ask user or choose a cheaper model. |
| 404 | Resource/model unavailable to this account | Re-discover or correct ID. |
| 422 | Semantically unsupported or invalid saved definition | Change operation or repair in app. |
| 429 | Account API concurrency reached | Wait for a known job to finish. |
| 500/502/503 | Server/provider/storage failure | Back off; reconcile before paid resubmit. |

## Boundary

Anything outside `/api/v1` is not part of this user API contract. Do not use
browser-session, app project, internal provider, admin, or webhook endpoints from
external integrations.
