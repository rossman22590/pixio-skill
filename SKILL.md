---
name: pixio-skill
description: Use this skill when a user wants to use, document, audit, or integrate Pixio API routes from another agent, backend, script, automation, or CLI. Trigger for Pixio API keys, all endpoint inventories, route maps, OpenAPI, model discovery, input params, assets, media uploads, clean public media URLs, signed output URLs, saved workflows, creating generations, polling outputs, credits, or Pixio API errors, even if the user only says they want to use Pixio from an app or agent. Do not use for unrelated image generation APIs or generic frontend-only work.
---

# Pixio API Skill

Use this skill to help an agent or backend service consume the Pixio public `/api/v1` routes safely and correctly.

Base URL:

```text
https://beta.pixio.myapps.ai
```

Auth header:

```http
Authorization: Bearer pxio_live_your_api_key
```

## Core Workflow

1. If unsure of the current API surface, read `GET /api/v1/guide` or `GET /api/v1/openapi.json`.
2. If the user has not provided an API key, ask for one or tell them to create one in Pixio billing.
3. Call `GET /api/v1/models` to list models visible to the authenticated account.
4. Choose a public `modelId` from the response. Public model IDs look like `pixio/...`.
5. Call `GET /api/v1/params?modelId=...` for accepted params, required fields, defaults, and options.
6. For local or remote media inputs, prefer `POST /api/v1/images` for images or `POST /api/v1/media` for image/video/audio clean public URLs. Use `POST /api/v1/uploads` when the model or workflow needs Pixio asset metadata such as `filePath`.
7. Create the job with `POST /api/v1/generate`. Include `providerId: "pixio"` only if a caller expects a provider field; `modelId` and `params` are the core fields.
8. Save `contentId`.
9. Poll `GET /api/v1/generations/{id}` until `succeeded` or `failed`.
10. Return `outputUrl`, useful `outputs`, and the generation id.

## Saved Workflow Flow

1. Build and save workflows in the Pixio app editor.
2. Call `GET /api/v1/workflows` to list workflows visible to the API key account.
3. Call `POST /api/v1/workflows/{id}/runs` to queue a run. Optional body fields are `prompt`, `negativePrompt`, and per-node `overrides`.
4. Poll `GET /api/v1/workflows/{id}/runs/{runId}` until `succeeded` or `failed`.
5. Return `outputs[]`, step statuses, and any run error.

## Gotchas

- Never expose a Pixio API key in browser/client-side code, public repos, examples, or logs.
- Never invent model IDs. Use `/api/v1/models` or a user-provided `pixio/...` model ID.
- Never invent params. Use `/api/v1/params` for the selected model.
- `GET /api/v1/guide` and `GET /api/v1/openapi.json` are public discovery routes. All generation, media, catalog, credit, and workflow routes require a Bearer API key.
- Public media URLs in generation params are imported into Pixio assets before generation starts.
- Local files can be turned into clean URLs with `/api/v1/images` or `/api/v1/media`, or uploaded into Pixio assets with `/api/v1/uploads`.
- API concurrency is shared across the account, across all API keys. Default accounts get 1 in-flight API generation; Maker accounts get 3.
- API generations spend the same Pixio credits and appear in the same account generation history as web app generations.
- Workflow API runs share the same account-wide API concurrency budget as API generations.

## Reference Routing

Load only the reference needed for the task:

- Start with `references/index.md` when unsure which document to load.
- Use `references/overview.md` for the API mental model and core behavior.
- Use `references/guides/agent-integration.md` when building an end-to-end agent workflow.
- Use `references/guides/media-workflow.md` for local files, public media URLs, upload response fields, and asset usage.
- Use `references/guides/errors-and-concurrency.md` when handling non-2xx responses, retries, insufficient credits, or concurrency.
- Use `references/guides/model-docs-template.md` when generating copyable docs for one selected model.
- Use `references/endpoints/assets.md` when the user asks about assets, media URLs, generated outputs, signed URLs, upload endpoints, local media, or proxies.
- Use `references/endpoints/route-map.md` when the user asks for all endpoints, non-public routes, webhooks, admin routes, provider proxies, or app-internal APIs.

Endpoint docs:

- `references/endpoints/guide.md` for `GET /api/v1/guide`.
- `references/endpoints/openapi.md` for `GET /api/v1/openapi.json`.
- `references/endpoints/models.md` for `GET /api/v1/models`.
- `references/endpoints/params.md` for `GET /api/v1/params`.
- `references/endpoints/images.md` for `POST /api/v1/images`.
- `references/endpoints/media.md` for `POST /api/v1/media`.
- `references/endpoints/uploads.md` for `POST /api/v1/uploads`.
- `references/endpoints/generate.md` for `POST /api/v1/generate`.
- `references/endpoints/generations.md` for `GET /api/v1/generations/{id}`.
- `references/endpoints/credits.md` for `GET /api/v1/credits`.
- `references/endpoints/workflows.md` for `GET /api/v1/workflows`, `POST /api/v1/workflows/{id}/runs`, `GET /api/v1/workflows/{id}/runs`, and `GET /api/v1/workflows/{id}/runs/{runId}`.
- `references/endpoints/assets.md` for all asset/media/upload/output URL routes across public and app-internal APIs.
- `references/endpoints/route-map.md` for the full Next API route inventory and public/internal classification.

Examples:

- `references/examples/text-to-image.md` for prompt-only image generation.
- `references/examples/image-edit.md` for image edit workflows.
- `references/examples/text-to-video.md` for text-to-video workflows.
- `references/examples/add-audio-to-video.md` for video plus audio workflows.

## Minimum Request Shapes

Create generation:

```json
{
  "providerId": "pixio",
  "modelId": "pixio/example-model",
  "params": {}
}
```

Upload public URL:

```json
{
  "url": "https://example.com/reference.png"
}
```

## Completion Checklist

Before answering that an integration is ready:

- Confirm the integration uses the current route list from `GET /api/v1/guide`, `GET /api/v1/openapi.json`, or these skill references.
- Confirm the model ID came from `/api/v1/models` or the user.
- Confirm params came from `/api/v1/params`.
- Confirm media handling matches the model's param names.
- Confirm local files were sent through `/api/v1/images`, `/api/v1/media`, or `/api/v1/uploads`.
- Confirm the generation id is saved and polling is implemented.
- Confirm workflow runs save `runId` and poll `/api/v1/workflows/{id}/runs/{runId}` when using saved workflows.
- Confirm errors `400`, `401`, `402`, `404`, `422`, `429`, and `502` are handled.
