---
name: pixio-skill
description: Use this skill when a user wants to generate or edit images, videos, or audio with the Pixio API from another agent, backend, script, automation, or CLI. Trigger for Pixio API keys, model discovery, input params, media uploads, public media URLs, creating generations, polling outputs, credits, or Pixio API errors, even if the user only says they want to use Pixio from an app or agent. Do not use for unrelated image generation APIs or generic frontend-only work.
---

# Pixio API Skill

Use this skill to help an agent or backend service consume the Pixio API safely and correctly.

Base URL:

```text
https://beta.pixio.myapps.ai
```

Auth header:

```http
Authorization: Bearer pxio_live_your_api_key
```

## Core Workflow

1. If the user has not provided an API key, ask for one or tell them to create one in Pixio billing.
2. Call `GET /api/v1/models` to list models visible to the authenticated account.
3. Choose a public `modelId` from the response. Public model IDs look like `pixio/...`.
4. Call `GET /api/v1/params?modelId=...` for accepted params, required fields, defaults, and options.
5. Upload local files with `POST /api/v1/uploads` before generation.
6. Create the job with `POST /api/v1/generate` and `providerId: "pixio"`.
7. Save `contentId`.
8. Poll `GET /api/v1/generations/{id}` until `succeeded` or `failed`.
9. Return `outputUrl`, useful `outputs`, and the generation id.

## Gotchas

- Never expose a Pixio API key in browser/client-side code, public repos, examples, or logs.
- Never invent model IDs. Use `/api/v1/models` or a user-provided `pixio/...` model ID.
- Never invent params. Use `/api/v1/params` for the selected model.
- Always send `providerId: "pixio"` for public API generation.
- Public media URLs in generation params are imported into Pixio assets before generation starts.
- Local files must be uploaded first with `/api/v1/uploads`.
- API concurrency is shared across the account, across all API keys. Default accounts get 1 in-flight API generation; Maker accounts get 3.
- API generations spend the same Pixio credits and appear in the same account generation history as web app generations.

## Reference Routing

Load only the reference needed for the task:

- Start with `references/index.md` when unsure which document to load.
- Use `references/overview.md` for the API mental model and core behavior.
- Use `references/guides/agent-integration.md` when building an end-to-end agent workflow.
- Use `references/guides/media-workflow.md` for local files, public media URLs, upload response fields, and asset usage.
- Use `references/guides/errors-and-concurrency.md` when handling non-2xx responses, retries, insufficient credits, or concurrency.
- Use `references/guides/model-docs-template.md` when generating copyable docs for one selected model.

Endpoint docs:

- `references/endpoints/models.md` for `GET /api/v1/models`.
- `references/endpoints/params.md` for `GET /api/v1/params`.
- `references/endpoints/uploads.md` for `POST /api/v1/uploads`.
- `references/endpoints/generate.md` for `POST /api/v1/generate`.
- `references/endpoints/generations.md` for `GET /api/v1/generations/{id}`.
- `references/endpoints/credits.md` for `GET /api/v1/credits`.

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

- Confirm the model ID came from `/api/v1/models` or the user.
- Confirm params came from `/api/v1/params`.
- Confirm media handling matches the model's param names.
- Confirm local files were uploaded first.
- Confirm the generation id is saved and polling is implemented.
- Confirm errors `401`, `402`, `404`, and `429` are handled.
