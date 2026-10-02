# OpenAPI Discovery

Pixio publishes two OpenAPI 3.1 documents and one capabilities route. Neither
document contains secrets; both are anonymous.

```bash
export PIXIO_BASE_URL="https://beta.pixio.myapps.ai/api/v1"
export PIXIO_API_KEY="pxio_live_..."

curl -fsS "$PIXIO_BASE_URL/openapi.json"            # media API
curl -fsS "$PIXIO_BASE_URL/platform/openapi.json"   # project API
```

## GET /api/v1/openapi.json

Title `Pixio API`. `servers[0].url` is `https://beta.pixio.myapps.ai/api/v1`,
so paths are relative (`/generate`, `/models`). Security scheme `ApiKey`
(HTTP bearer).

Covers (the paths, relative to the server URL):

- discovery: `/guide`, `/openapi.json`, `/capabilities`;
- generation: `/generate` (with the `Idempotency-Key` parameter and typed
  200/202/400/401/402/404/422/429/503 responses; every generation-pipeline
  failure is a `400` with a `code`), `/generations`,
  `/generations/{id}`, `/generations/estimate`;
- media: `/images`, `/media`, `/media/resolve`, `/uploads` (with
  `?collectionId=`), `/assets` (GET with `modelId`, POST, DELETE),
  `/assets/models`, `/assets/{id}`, `/assets/{id}/download`,
  `/assets/download`, `/assets/collections` and `/{id}` and `/{id}/items`,
  `/styles`;
- models and prices: `/models`, `/models/{id}`, `/models/favorites`
  (GET/POST/DELETE), `/params`, `/pricing`, `/preferences/models`,
  `/preferences/models/catalog`;
- account: `/me`, `/credits`, `/credits/ledger`, `/subscription`;
- prompting: `/prompts/optimize` (GET and POST);
- agent: `/agent` (the SSE stream);
- workflows: `/workflows` (GET, POST), `/workflows/{id}` (GET, PATCH, DELETE),
  `/workflows/{id}/runs` (POST, GET with `limit`), `/workflows/{id}/runs/{runId}`.

Not in this document: the project family, characters, `/prompt-library`, and
`/training`. They are in the platform document below.

Components include `ApiError`, the one error envelope
(`{ error, code, message?, details? }`), referenced by every documented error
status, plus `InsufficientCreditsError`, `ContentPolicyError`,
`ConcurrencyLimitError`, `UploadItem`, `WorkflowDefinition`, `Workflow`, and
`ModelOutputs`. Every authenticated operation lists `401` and `503`.

## GET /api/v1/platform/openapi.json

Title `Pixio Project Integration API`. `servers[0].url` is the origin
`https://beta.pixio.myapps.ai`, so paths are absolute (`/api/v1/boards`).
Security scheme `bearerAuth` (HTTP bearer). It is generated from the public
operation table, so each operation appears with a generated `operationId` such
as `post_boards_id_operations`. It covers:

- generic and typed project CRUD (`/projects`, `/boards`, `/canvas`,
  `/cinema/storyboards`, `/cam-view/scenes`, `/video-agent/projects`,
  `/editor/projects`), `.../{id}/operations`, and `.../from-prompt`;
- `POST /video-agent/projects/{id}/generate`;
- characters, `/prompt-library`, `/prompt-library/{id}`, `/training`,
  `/training/{id}`;
- workflow create/read/update/delete: `POST /workflows` and
  `GET/PATCH/DELETE /workflows/{id}` (the workflow list and runs are in the
  media document);
- the account and asset-folder reads that were added later: `/me`, `/pricing`,
  `/capabilities`, `/assets/models`, `/assets/collections` (all seven
  operations), `/styles`, `/media/resolve`, `GET /prompts/optimize`;
- the two read-only preference routes, and `/platform/openapi.json` itself.

Not in this document: generate, estimate, generations, uploads, assets,
downloads, models, params, credits, ledger, subscription, the optimizer `POST`,
workflow runs, favorites, and `/agent`. Those are in the media document.

Component schemas worth reading: `Project`, `ProjectWrite`,
`GenericProjectCreateRequest` (discriminated on `type`), the per-type
`*CreateRequest` schemas with template enums, `OperationsRequest`,
`VisualProjectPromptRequest`, `CamViewPromptRequest`,
`StoryboardPromptRequest`, `VideoAgentPromptRequest`, `Workflow`,
`WorkflowDefinition`, `VideoAgentGenerateRequest`/`VideoAgentGenerateResult`,
and `ApiError` (`{ error, code?, message?, details? }`; project-family routes
use UPPER_SNAKE `code` values and their `401`/`503` bodies carry `error` only).

## GET /api/v1/capabilities (authenticated)

```json
{
  "authentication": { "model": "full-account-access", "scopes": false, "revocation": "immediate" },
  "contracts": { "media": "/api/v1/openapi.json", "projects": "/api/v1/platform/openapi.json" },
  "supported": ["..."],
  "unsupported": ["..."]
}
```

Use it to answer "can the API do X?" from the deployed server rather than from
memory. See `capabilities.md`.

## Uses

- inspect the deployed route surface before integration;
- generate typed clients and tool schemas;
- import into Postman, Insomnia, Bruno, or an API gateway;
- compare a deployed contract with this skill;
- expose route schemas to an agent without exposing an API key.

## Important Limits

- Many success bodies are described in the operation's `description` text
  rather than as full schemas; where a response is only described in text, the
  field list in that description is authoritative.
- Neither document enumerates the live model catalog or model params. Fetch
  `/models`, `/models/{id}`, `/params`, and `/pricing` at runtime.
- Project `content` documents are typed as open objects in the spec; the
  server validates them against the real per-type schema and returns
  `400 INVALID_PROJECT_CONTENT` on failure.
- Operation payloads are typed as open objects; the server validates against
  the real operation unions (see `projects.md` for the operation names).
- Generated clients still need polling, retry, idempotency-key, signed-URL
  refresh, cursor pagination, and reconciliation logic.
- The documents describe `/api/v1` only; they never authorise internal routes.

## Generated Client Example

```bash
npx openapi-typescript "https://beta.pixio.myapps.ai/api/v1/openapi.json" \
  --output pixio-media.types.ts
npx openapi-typescript "https://beta.pixio.myapps.ai/api/v1/platform/openapi.json" \
  --output pixio-platform.types.ts
```

Keep generated files reproducible. Never bake an API key into a client.
