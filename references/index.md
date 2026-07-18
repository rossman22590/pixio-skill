# Pixio API Reference Index

Load only what the current task needs.

## Orientation

- `overview.md`: trust model, capabilities, lifecycle, and unsupported surfaces.
- `pixio-api.md`: concise table of every public method and major response.
- `endpoints/route-map.md`: public route inventory plus internal-route boundaries.
- `endpoints/openapi.md`: live discovery and generated-client guidance.

## Endpoint Contracts

- `endpoints/guide.md`: `GET /api/v1/guide`.
- `endpoints/openapi.md`: `GET /api/v1/openapi.json`.
- `endpoints/models.md`: model list, query lookup, and path detail.
- `endpoints/params.md`: model input schema.
- `endpoints/prompt-optimization.md`: `POST /api/v1/prompts/optimize`.
- `endpoints/generation-estimates.md`: `POST /api/v1/generations/estimate`.
- `endpoints/generate.md`: `POST /api/v1/generate`.
- `endpoints/generations.md`: list, poll/detail, and delete.
- `endpoints/images.md`: clean image URL creation.
- `endpoints/media.md`: clean image/video/audio URL creation.
- `endpoints/uploads.md`: reusable Pixio asset ingestion.
- `endpoints/assets.md`: asset list, get, upload, rename, download, and delete.
- `endpoints/credits.md`: balance, ledger, and subscription/concurrency.
- `endpoints/workflows.md`: saved workflow listing, dispatch, history, and polling.

## Operating Guides

- `guides/agent-integration.md`: safe autonomous execution protocol.
- `guides/integration-patterns.md`: cURL, Node, Python, serverless, mobile, CI,
  generated clients, and secret handling.
- `guides/media-workflow.md`: choose URL normalization versus managed assets.
- `guides/errors-and-concurrency.md`: retry matrix and ambiguous-dispatch recovery.
- `guides/model-docs-template.md`: produce accurate docs for one selected model.

## Connected Examples

- `examples/cost-aware-generation.md`: discover, estimate, approve, generate, poll.
- `examples/asset-lifecycle.md`: upload, list, rename, download, and delete.
- `examples/saved-workflow.md`: upload media, run a workflow, and collect outputs.
- `examples/node-client.md`: reusable Node/TypeScript-style fetch client.
- `examples/python-client.md`: reusable Python standard-library client.
- `examples/text-to-image.md`: prompt-only image generation.
- `examples/image-edit.md`: uploaded reference image to edited output.
- `examples/text-to-video.md`: prompt-to-video.
- `examples/add-audio-to-video.md`: two-input media operation.

## Reusable Scripts

- `scripts/pixio-smoke.mjs`: read-only authentication and API connectivity check.
- `scripts/pixio-wait.mjs`: poll one existing generation without dispatching work.

## Skill Evaluation

- `evals/trigger-queries.json`: should-trigger and should-not-trigger prompts.
