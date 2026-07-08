# Pixio API Overview

Pixio API lets agents, backend services, scripts, and automations generate images, videos, audio, and edits through a Pixio account.

Base URL:

```text
https://beta.pixio.myapps.ai
```

Auth:

```http
Authorization: Bearer pxio_live_your_api_key
```

Never expose a Pixio API key in frontend browser code, public repos, screenshots, logs, or client-side bundles.

## Discovery

- `GET /api/v1/guide`: public Markdown guide, or JSON with `?format=json`.
- `GET /api/v1/openapi.json`: public OpenAPI 3.1 spec for the v1 routes.

## Generation Flow

1. `GET /api/v1/models` to list models visible to the account.
2. Choose a `modelId` from the list. Public IDs use `pixio/...`.
3. `GET /api/v1/params?modelId=...` to inspect required inputs, defaults, and options.
4. For local image files, call `POST /api/v1/images` and pass the returned clean `url` into the model param.
5. For local video or audio files, call `POST /api/v1/media` and pass the returned clean `url` into the model param.
6. Use `POST /api/v1/uploads` when you need Pixio asset metadata such as `filePath`, `signedUrl`, or `mediaType`.
7. `POST /api/v1/generate` to start a generation.
8. Save `contentId`.
9. Poll `GET /api/v1/generations/{id}` until the status is `succeeded` or `failed`.
10. Return `outputUrl`, `outputs`, and `assetVariants` to the user.

## Saved Workflow Flow

1. Build and save workflows in the Pixio app editor.
2. `GET /api/v1/workflows` to list saved workflows for the account.
3. `POST /api/v1/workflows/{id}/runs` to queue a run.
4. Save `runId`.
5. Poll `GET /api/v1/workflows/{id}/runs/{runId}` until `succeeded` or `failed`.
6. Return `outputs[]`, step outputs, and errors.

## Public Model IDs

Use public Pixio model IDs only:

```text
pixio/nano-banana/edit
pixio/video-ops/add-audio
pixio/seedance-2-maker
```

Do not ask users for provider IDs other than Pixio. Send `providerId: "pixio"` when creating generations.

Recent provider additions such as BytePlus Seedance and Seedream are implementation details behind the public model catalog. External callers must still discover and call them through public `pixio/...` IDs from `/api/v1/models`; never call provider dispatch, poll, or webhook routes directly.

## Media Behavior

Pixio API media matches the web app:

- Local files can be converted into clean public media URLs first with `/api/v1/images` or `/api/v1/media`.
- Public media URLs in generation params are imported into Pixio assets before generation.
- Uploaded media appears in the authenticated account's Pixio media/assets.
- Private, localhost, and non-media URLs are rejected.

## Account Behavior

API generations:

- spend from the same Pixio credits as web app generations;
- appear in the same generation history;
- return Pixio output URLs when complete;
- are limited by account-wide API concurrency.

Saved workflow API runs share the same account-wide API concurrency budget.

Default accounts get 1 in-flight API generation or workflow run. Maker accounts get 3 in-flight API generations or workflow runs across all API keys.
