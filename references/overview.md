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

## Core Flow

1. `GET /api/v1/models` to list models visible to the account.
2. Choose a `modelId` from the list. Public IDs use `pixio/...`.
3. `GET /api/v1/params?modelId=...` to inspect required inputs, defaults, and options.
4. Upload local files with `POST /api/v1/uploads` if needed.
5. `POST /api/v1/generate` to start a generation.
6. Save `contentId`.
7. Poll `GET /api/v1/generations/{id}` until the status is `succeeded` or `failed`.
8. Return `outputUrl`, `outputs`, and `assetVariants` to the user.

## Public Model IDs

Use public Pixio model IDs only:

```text
pixio/nano-banana/edit
pixio/video-ops/add-audio
pixio/seedance-2-maker
```

Do not ask users for provider IDs other than Pixio. Send `providerId: "pixio"` when creating generations.

## Media Behavior

Pixio API media matches the web app:

- Local files can be uploaded first.
- Public media URLs in generation params are imported into Pixio assets before generation.
- Uploaded media appears in the authenticated account's Pixio media/assets.
- Private, localhost, and non-media URLs are rejected.

## Account Behavior

API generations:

- spend from the same Pixio credits as web app generations;
- appear in the same generation history;
- return Pixio output URLs when complete;
- are limited by account-wide API concurrency.

Default accounts get 1 in-flight API generation. Maker accounts get 3 in-flight API generations across all API keys.
