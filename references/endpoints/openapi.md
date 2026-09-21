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

Covers: guide, generate (with `Idempotency-Key` parameter and 200/202/400/401/
402/422/429 responses), images, media, media/resolve, uploads, assets and
downloads, collections, styles, params, generations and estimate, models,
pricing, credits, ledger, subscription, me, prompts/optimize, preferences,
workflows and runs.

## GET /api/v1/platform/openapi.json

Title `Pixio Project Integration API`. `servers[0].url` is the origin
`https://beta.pixio.myapps.ai`, so paths are absolute (`/api/v1/boards`).
Security scheme `bearerAuth` (HTTP bearer). It is generated from the public
operation table, so every project, character, prompt-library, training,
workflow-CRUD, and preference operation appears with a generated
`operationId` such as `post_boards_id_operations`.

Component schemas worth reading: `Project`, `ProjectWrite`,
`GenericProjectCreateRequest` (discriminated on `type`), the per-type
`*CreateRequest` schemas with template enums, `OperationsRequest`,
`VisualProjectPromptRequest`, `CamViewPromptRequest`,
`StoryboardPromptRequest`, `VideoAgentPromptRequest`, and `ApiError`
(`{ error, code?, details? }`).

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
