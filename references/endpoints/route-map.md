# Public API Route Map

This is the complete implemented `/api/v1` surface as of 2026-09-20. External
integrations must not cross this boundary.

## Discovery And Account

| Method | Path | Auth | Mutates | Notes |
|---|---|---:|---:|---|
| GET | `/api/v1/guide` | No | No | Markdown; `?format=json` for structured guide. |
| GET | `/api/v1/openapi.json` | No | No | Media API OpenAPI 3.1. |
| GET | `/api/v1/platform/openapi.json` | No | No | Project API OpenAPI 3.1. |
| GET | `/api/v1/capabilities` | Yes | No | Supported/unsupported surfaces and contract links. |
| GET | `/api/v1/me` | Yes | No | Identity, plan, credits, concurrency, Maker caps. |
| GET | `/api/v1/subscription` | Yes | No | Plan, quota, `apiConcurrencyLimit`. |
| GET | `/api/v1/credits` | Yes | No | Balances. |
| GET | `/api/v1/credits/ledger` | Yes | No | Movements; `?generationId=` filter. |
| GET | `/api/v1/pricing` | Yes | No | Live per-account price list; `private, no-store`. |

## Models And Prompting

| Method | Path | Auth | Mutates | Notes |
|---|---|---:|---:|---|
| GET | `/api/v1/models` | Yes | No | List or `?modelId=` one model. |
| GET | `/api/v1/models/{pixio/...}` | Yes | No | Detail + params (catch-all path). |
| GET | `/api/v1/params` | Yes | No | Params for `modelId`. |
| GET | `/api/v1/models/favorites` | Yes | No | Public IDs only. |
| POST | `/api/v1/models/favorites` | Yes | Yes | Idempotent add. |
| DELETE | `/api/v1/models/favorites` | Yes | Yes | `?modelId=`. |
| GET | `/api/v1/preferences/models` | Yes | No | Read-only. |
| GET | `/api/v1/preferences/models/catalog` | Yes | No | Read-only. |
| GET | `/api/v1/prompts/optimize` | Yes | No | Optimizer configuration. |
| POST | `/api/v1/prompts/optimize` | Yes | No generation | Uses LLM; may upload attachments internally. |
| GET | `/api/v1/styles` | Yes | No | Style gallery as data. |
| GET | `/api/v1/prompt-library` | Yes | No | Prompt history. |
| GET | `/api/v1/prompt-library/{id}` | Yes | No | One prompt + params. |

## Generation

| Method | Path | Auth | Mutates | Notes |
|---|---|---:|---:|---|
| POST | `/api/v1/generations/estimate` | Yes | No | Quote only; may probe media. |
| POST | `/api/v1/generate` | Yes | Yes, paid | `202`; `Idempotency-Key` supported. |
| GET | `/api/v1/generations` | Yes | No | Paginated history. |
| GET | `/api/v1/generations/{id}` | Yes | No | Poll, `billing`, `media`. |
| DELETE | `/api/v1/generations/{id}` | Yes | Yes | Deletes record and output. Not cancellation. |

## Media And Assets

| Method | Path | Auth | Mutates | Notes |
|---|---|---:|---:|---|
| POST | `/api/v1/images` | Yes | Yes | Clean image URLs, up to 10. |
| POST | `/api/v1/media` | Yes | Yes | Clean image/video/audio URLs, up to 10. |
| POST | `/api/v1/media/resolve` | Yes | No | Storage refs → display URLs, up to 100. |
| POST | `/api/v1/uploads` | Yes | Yes | Managed assets, up to 8; `?collectionId=`. |
| GET | `/api/v1/assets` | Yes | No | Uploads + generated; `?modelId=` filter. |
| GET | `/api/v1/assets/models` | Yes | No | Producing models with counts. |
| POST | `/api/v1/assets` | Yes | Yes | Alias of `/uploads`. |
| DELETE | `/api/v1/assets` | Yes | Yes | Bulk delete up to 100. |
| GET | `/api/v1/assets/{id}` | Yes | No | Fresh signed URL. |
| PATCH | `/api/v1/assets/{id}` | Yes | Yes | Rename uploads only. |
| DELETE | `/api/v1/assets/{id}` | Yes | Yes | Delete one. |
| GET | `/api/v1/assets/{id}/download` | Yes | Paid for Songcraft | `?tier=preview` (100) / `official` (300), once per song. |
| GET | `/api/v1/assets/download` | Yes | Paid for Songcraft | Batch; unpaid songs in `failed[]`. |
| GET | `/api/v1/assets/collections` | Yes | No | Folders. |
| POST | `/api/v1/assets/collections` | Yes | Yes | Create folder. |
| GET | `/api/v1/assets/collections/{id}` | Yes | No | One folder. |
| PATCH | `/api/v1/assets/collections/{id}` | Yes | Yes | Rename/recolour/re-parent. |
| DELETE | `/api/v1/assets/collections/{id}` | Yes | Yes | Sub-folders cascade; assets kept. |
| GET | `/api/v1/assets/collections/{id}/items` | Yes | No | Filed assets. |
| POST | `/api/v1/assets/collections/{id}/items` | Yes | Yes | File assets. |
| DELETE | `/api/v1/assets/collections/{id}/items` | Yes | Yes | Unfile assets. |

## Workflows

| Method | Path | Auth | Mutates | Notes |
|---|---|---:|---:|---|
| GET | `/api/v1/workflows` | Yes | No | With `latestRun`. |
| POST | `/api/v1/workflows` | Yes | Yes | Create from `definition`. |
| GET | `/api/v1/workflows/{id}` | Yes | No | Definition; `422` if invalid. |
| PATCH | `/api/v1/workflows/{id}` | Yes | Yes | Update fields. |
| DELETE | `/api/v1/workflows/{id}` | Yes | Yes | Runs cascade. |
| POST | `/api/v1/workflows/{id}/runs` | Yes | Yes, paid | `202`; shares concurrency. |
| GET | `/api/v1/workflows/{id}/runs` | Yes | No | Recent runs. |
| GET | `/api/v1/workflows/{id}/runs/{runId}` | Yes | No | Poll run. |

## Projects

| Method | Path | Auth | Mutates | Notes |
|---|---|---:|---:|---|
| GET | `/api/v1/projects` | Yes | No | `?type=&query=&limit=&cursor=`. |
| POST | `/api/v1/projects` | Yes | Yes | `type` discriminator. |
| GET/PATCH/DELETE | `/api/v1/projects/{id}` | Yes | PATCH/DELETE | Generic. |
| GET/POST | `/api/v1/boards` | Yes | POST | Spatial boards. |
| GET/PATCH/DELETE | `/api/v1/boards/{id}` | Yes | PATCH/DELETE | |
| POST | `/api/v1/boards/{id}/operations` | Yes | Yes | `add_node`, `update_node`, `remove_node`, `connect`, `disconnect`. |
| POST | `/api/v1/boards/from-prompt` | Yes | Yes, LLM | Directed board. |
| GET/POST | `/api/v1/canvas` | Yes | POST | Layered canvas. |
| GET/PATCH/DELETE | `/api/v1/canvas/{id}` | Yes | PATCH/DELETE | |
| POST | `/api/v1/canvas/{id}/operations` | Yes | Yes | Element operations. |
| POST | `/api/v1/canvas/from-prompt` | Yes | Yes, LLM | Directed canvas. |
| GET/POST | `/api/v1/cinema/storyboards` | Yes | POST | |
| GET/PATCH/DELETE | `/api/v1/cinema/storyboards/{id}` | Yes | PATCH/DELETE | |
| POST | `/api/v1/cinema/storyboards/from-prompt` | Yes | Yes, LLM | Directed storyboard. |
| GET/POST | `/api/v1/cam-view/scenes` | Yes | POST | |
| GET/PATCH/DELETE | `/api/v1/cam-view/scenes/{id}` | Yes | PATCH/DELETE | |
| POST | `/api/v1/cam-view/scenes/from-prompt` | Yes | Yes, LLM | Keyed scene. |
| GET/POST | `/api/v1/video-agent/projects` | Yes | POST | |
| GET/PATCH/DELETE | `/api/v1/video-agent/projects/{id}` | Yes | PATCH/DELETE | |
| POST | `/api/v1/video-agent/projects/from-prompt` | Yes | Yes, LLM | Outline. |
| POST | `/api/v1/video-agent/projects/{id}/generate` | Yes | Yes, paid | Max 10 segments per call. |
| GET/POST | `/api/v1/editor/projects` | Yes | POST | Timeline projects. |
| GET/PATCH/DELETE | `/api/v1/editor/projects/{id}` | Yes | PATCH/DELETE | |
| POST | `/api/v1/editor/projects/{id}/operations` | Yes | Yes | `timeline.*`, `overlay.*`, `audio.*`, `video.*`, `composition.*`; optional `fps`. |

## Agent, Characters, Training

| Method | Path | Auth | Mutates | Notes |
|---|---|---:|---:|---|
| POST | `/api/v1/agent` | Yes | Yes, may be paid | SSE stream; 5-credit floor; 300 s max. |
| GET | `/api/v1/characters` | Yes | No | |
| POST | `/api/v1/characters` | Yes | Yes | Create or replace by name. |
| GET/PATCH/DELETE | `/api/v1/characters/{name}` | Yes | PATCH/DELETE | Name is URL-encoded, case-insensitive. |
| GET | `/api/v1/training` | Yes | No | Read-only. |
| GET | `/api/v1/training/{id}` | Yes | No | Read-only. |

## Removed Routes

- `/api/v1/chat/conversations` and `/api/v1/chat/conversations/{id}` were
  removed on 2026-08-31. Nothing public consumed them. Use `POST /api/v1/agent`.
- `PUT`/`DELETE` on `/api/v1/preferences/models` were removed on 2026-09-15.
  Preferences are read-only over the API.

## Authentication Boundary

API keys authenticate only `/api/v1` handlers. These route families are not
public and must not be used by third-party clients:

- `/api/chat/**`: in-app Pix Agent chat, session-authenticated.
- `/api/projects`, `/api/editor-agent/**`: internal editor surfaces.
- `/api/latest/**`: renderer and local-media internals.
- `/api/internal/**`: server-only orchestration.
- `/api/admin/**`: operator-only actions.
- `/api/*/webhook`: inbound provider and billing callbacks.
- Provider proxy routes under `/api/<provider>/**` are internal and not part of the public API.
- `/api/cam-view/**`: app-side Cam View pairing and sensor support.

## Maintenance Rule

When the deployed `GET /api/v1/openapi.json`, `GET /api/v1/platform/openapi.json`,
or `GET /api/v1/capabilities` differ from this file, follow the deployed
documents and update the skill. Never infer a public endpoint from an app route
with similar behaviour.
