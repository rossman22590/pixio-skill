# Public User API Route Map

This is the complete implemented `/api/v1` surface. External integrations must
not cross this boundary.

## Route Inventory

| Method | Path | Auth | Mutates | Notes |
|---|---|---:|---:|---|
| GET | `/api/v1/guide` | No | No | Markdown; `?format=json` for structured guide. |
| GET | `/api/v1/openapi.json` | No | No | OpenAPI 3.1 document. |
| GET | `/api/v1/models` | Yes | No | List or query one visible model. |
| GET | `/api/v1/models/{pixio/...}` | Yes | No | Model detail and params. |
| GET | `/api/v1/params` | Yes | No | Params for `modelId`. |
| POST | `/api/v1/prompts/optimize` | Yes | No generation | Prompt rewrite utility. |
| POST | `/api/v1/generations/estimate` | Yes | No | Credit estimate only. |
| POST | `/api/v1/generate` | Yes | Yes, paid | Queues provider work; returns `202`. |
| GET | `/api/v1/generations` | Yes | No | Paginated generation history. |
| GET | `/api/v1/generations/{id}` | Yes | No | Poll/detail and URL refresh. |
| DELETE | `/api/v1/generations/{id}` | Yes | Yes | Deletes row and best-effort stored output. |
| POST | `/api/v1/images` | Yes | Yes | Creates clean image URLs, up to 10 items. |
| POST | `/api/v1/media` | Yes | Yes | Creates clean image/video/audio URLs, up to 10. |
| POST | `/api/v1/uploads` | Yes | Yes | Creates managed assets, up to 8 items. |
| GET | `/api/v1/assets` | Yes | No | Paginated uploads + successful generations. |
| POST | `/api/v1/assets` | Yes | Yes | Alias of `/uploads`. |
| DELETE | `/api/v1/assets` | Yes | Yes | Bulk delete up to 100 IDs. |
| GET | `/api/v1/assets/{id}` | Yes | No | One asset with fresh signed URL. |
| PATCH | `/api/v1/assets/{id}` | Yes | Yes | Rename uploaded asset only. |
| DELETE | `/api/v1/assets/{id}` | Yes | Yes | Delete one asset. |
| GET | `/api/v1/assets/{id}/download` | Yes | No | Signed attachment URL or `302`. |
| GET | `/api/v1/assets/download` | Yes | No | Batch signed downloads. |
| GET | `/api/v1/credits` | Yes | No | Current balances. |
| GET | `/api/v1/credits/ledger` | Yes | No | Recent credit events. |
| GET | `/api/v1/subscription` | Yes | No | Plan, quota, balance, concurrency. |
| GET | `/api/v1/workflows` | Yes | No | Saved workflows. |
| POST | `/api/v1/workflows/{id}/runs` | Yes | Yes, paid | Queue workflow run. |
| GET | `/api/v1/workflows/{id}/runs` | Yes | No | Recent runs. |
| GET | `/api/v1/workflows/{id}/runs/{runId}` | Yes | No | Poll run and outputs. |

## Authentication Boundary

API keys authenticate only `/api/v1` handlers. These route families are not
public user API routes and must not be used by third-party clients:

- `/api/chat/**`: Pix Agent and chat, authenticated by app session.
- `/api/projects` and `/api/editor-agent/**`: internal editor surfaces.
- `/api/latest/**`: renderer and local-media internals.
- `/api/internal/**`: server-only orchestration.
- `/api/admin/**`: operator-only actions.
- `/api/*/webhook`: inbound provider/billing callbacks.
- Provider routes such as `/api/fal/**`, `/api/luma/**`, `/api/useapi/**`,
  `/api/elevenlabs/**`, `/api/argil/**`: Pixio's provider integrations.
- `/api/cam-view/**`: app/local-development Cam View support.

## Project Boundary

There is currently no public `/api/v1/projects` route. The user API cannot
operate Boards, Canvas, Chat, Video Agent, Cinema Storyboards, Cam View, timeline
editor projects, renders, or exports. Saved workflow **runs** are public; saved
workflow definition creation/editing is not.

## Maintenance Rule

When the deployed `GET /api/v1/openapi.json` differs from this file, follow the
deployed OpenAPI document and update the skill. Never infer a public endpoint
from an app route with similar behavior.
