# Pixio API Reference Index

Use this index to load only the document needed for the current task.

## Start Here

- `overview.md`: API mental model, base URL, auth, core flow, account behavior.
- `guides/agent-integration.md`: full agent workflow from user request to final output URL.
- `endpoints/guide.md`: public discovery route for agents.
- `endpoints/openapi.md`: OpenAPI discovery route for tool/client generation.
- `endpoints/assets.md`: all asset, media, upload, generated output, proxy, and local-media routes.
- `endpoints/route-map.md`: full route inventory and public/internal/webhook classification.

## Endpoints

- `endpoints/guide.md`: `GET /api/v1/guide`, Markdown by default or JSON with `?format=json`.
- `endpoints/openapi.md`: `GET /api/v1/openapi.json`, OpenAPI 3.1 spec.
- `endpoints/models.md`: `GET /api/v1/models`, visible model catalog, model IDs.
- `endpoints/params.md`: `GET /api/v1/params`, accepted params, required fields, options.
- `endpoints/images.md`: `POST /api/v1/images`, clean public image URL from upload or remote URL.
- `endpoints/media.md`: `POST /api/v1/media`, clean public image/video/audio URL from upload or remote URL.
- `endpoints/uploads.md`: `POST /api/v1/uploads`, local file upload, public URL import, response fields.
- `endpoints/generate.md`: `POST /api/v1/generate`, request body, accepted response, generation behavior.
- `endpoints/generations.md`: `GET /api/v1/generations/{id}`, polling, status, outputs.
- `endpoints/credits.md`: `GET /api/v1/credits`, recurring/permanent credit response.
- `endpoints/workflows.md`: saved workflow listing, run creation, run listing, and run polling.
- `endpoints/assets.md`: asset/media route map, including `/api/v1/images`, `/api/v1/media`, `/api/v1/uploads`, generated outputs, app asset library, local media, and proxies.
- `endpoints/route-map.md`: all discovered `apps/web/app/api/**/route.*` routes with method and usage classification.

## Guides

- `guides/media-workflow.md`: local files, public media URLs, Pixio assets, media limits.
- `guides/errors-and-concurrency.md`: HTTP errors, insufficient credits, account-wide concurrency, retries.
- `guides/model-docs-template.md`: template for generating selected-model API docs.

## Examples

- `examples/add-audio-to-video.md`: video + audio workflow.
- `examples/text-to-image.md`: prompt-only image generation workflow.
- `examples/image-edit.md`: image edit workflow with public image URL.
- `examples/text-to-video.md`: text-to-video workflow.

## All-In-One

- `pixio-api.md`: full combined reference when an agent needs everything in one file.

## Skill Maintenance

- `evals/trigger-queries.json`: sample should-trigger and should-not-trigger prompts for checking whether the skill description activates correctly.
