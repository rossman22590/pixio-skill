# Pixio API Reference For Agents

This reference is for agents and backend services using a user's Pixio API key.

Base URL:

```text
https://beta.pixio.myapps.ai
```

Auth header:

```http
Authorization: Bearer pxio_live_your_api_key
```

Never expose the API key in browser code, static websites, public repositories, or logs.

## Recommended Flow

1. Discover routes with `GET /api/v1/guide` or `GET /api/v1/openapi.json` when needed.
2. Check credits with `GET /api/v1/credits` if the user asks about balance.
3. List available models with `GET /api/v1/models`.
4. Select a public Pixio model id such as `pixio/nano-banana/edit`.
5. Fetch accepted params with `GET /api/v1/params?modelId=...`.
6. Convert local images to clean URLs with `POST /api/v1/images`.
7. Convert local video/audio or mixed media to clean URLs with `POST /api/v1/media`.
8. Use `POST /api/v1/uploads` when you need Pixio asset metadata such as `filePath`.
9. Create a generation with `POST /api/v1/generate`.
10. Poll `GET /api/v1/generations/{id}` until the job is final.
11. Return final output URLs to the user.

Saved workflows:

1. List saved workflows with `GET /api/v1/workflows`.
2. Queue a run with `POST /api/v1/workflows/{id}/runs`.
3. Poll `GET /api/v1/workflows/{id}/runs/{runId}` until final.
4. Return `outputs[]`.

## Model-Specific Reference Format

When creating docs for a selected model, use this structure and fill it with the selected model's real values from `/api/v1/models` and `/api/v1/params`.

````markdown
# <Model Name> API Reference

Use this reference when integrating with the Pixio API.

## Base URL

`https://beta.pixio.myapps.ai`

## Authentication

All requests require a Pixio API key.

```http
Authorization: Bearer pxio_live_your_api_key
```

## Core Endpoints

### Create Generation

```http
POST https://beta.pixio.myapps.ai/api/v1/generate
```

Body:

```json
{
  "providerId": "pixio",
  "modelId": "<selected model id>",
  "params": {
    "<param>": "<example value>"
  }
}
```

Returns immediately with a generation id. Poll the generation endpoint for status and outputs.

### Clean Media URLs

```http
POST https://beta.pixio.myapps.ai/api/v1/images
POST https://beta.pixio.myapps.ai/api/v1/media
```

`/images` is image-focused. `/media` accepts image, video, or audio. Send multipart `file=@...` or JSON `{ "url": "https://..." }`. Both return `{ "url": "https://..." }` or `{ "url": "...", "urls": [...] }`.

### Upload Media Asset

```http
POST https://beta.pixio.myapps.ai/api/v1/uploads
```

Body:

```json
{
  "url": "https://example.com/reference.png"
}
```

Example:

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/uploads \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/reference.png"}'
```

Upload a local file:

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/uploads \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -F "file=@./reference.png"
```

Multipart URL import also works:

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/uploads \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -F "url=https://example.com/reference.png"
```

You can also send `urls` with up to 8 public media URLs, or up to 8 multipart media items using `file`, `files`, `media`, `assets`, `url`, or `urls`. Pixio uploads each file into the authenticated user's Pixio assets and returns `filePath`, `url`, `signedUrl`, `signedUrlExpiresAt`, `fileName`, `fileSize`, `contentType`, and `mediaType`. Use `url` when you need a temporary asset URL, and use `filePath` in generation params when you want to reference the uploaded Pixio asset directly.

### Get Generation

```http
GET https://beta.pixio.myapps.ai/api/v1/generations/{id}
```

Returns status, params, outputUrl, outputs, assetVariants, error, credit cost, and timestamps.

### List Models

```http
GET https://beta.pixio.myapps.ai/api/v1/models
```

Returns the Pixio model catalog visible to the authenticated account.

### Get Input Params For A Model

```http
GET https://beta.pixio.myapps.ai/api/v1/params?modelId=<selected model id>
```

Returns accepted params, required flags, defaults, placeholders, and options for one model.

### Check Credits

```http
GET https://beta.pixio.myapps.ai/api/v1/credits
```

Returns recurring, permanent, and total credits for the authenticated account.

### API Discovery

```http
GET https://beta.pixio.myapps.ai/api/v1/guide
GET https://beta.pixio.myapps.ai/api/v1/openapi.json
```

Public routes for protocol discovery. Do not send API keys to these routes.

### Saved Workflows

```http
GET https://beta.pixio.myapps.ai/api/v1/workflows
POST https://beta.pixio.myapps.ai/api/v1/workflows/{id}/runs
GET https://beta.pixio.myapps.ai/api/v1/workflows/{id}/runs
GET https://beta.pixio.myapps.ai/api/v1/workflows/{id}/runs/{runId}
```

List and run workflows already created in the Pixio app editor.

## Media URL Inputs

When params include media URLs such as `image_url`, `image_urls`, `video_url`, `audio_url`, `mask`, `reference_image`, or nested media fields, Pixio imports those public URLs into Pixio media storage first. Generation then receives Pixio storage paths, matching the normal web app media flow.

Rules:

- Media URLs must be public HTTP or HTTPS URLs.
- Localhost and private network URLs are rejected.
- The remote file must return an image, video, or audio content type.
- The uploaded media appears in Pixio media/assets for the account.

## Concurrency

API concurrency is shared across the account, across all API keys. Default accounts get 1 in-flight API generation. Maker accounts get 3 in-flight API generations.

## Credits

API generations spend from the same Pixio account credits as web app generations. If credits are insufficient, the API returns HTTP 402 with availableCredits, requiredCredits, and shortfall.

## Selected Model

This model was selected when copied.

### <Model Name>

- modelId: `<selected model id>`
- type: `<model type>`
- credits: `<credit cost>`

Params:

- `<param>` (`<type>`, required/optional): `<label>`. Default: `<default>`.
````

## GET /api/v1/models

Lists models visible to the authenticated account.

```bash
curl https://beta.pixio.myapps.ai/api/v1/models \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

Response shape:

```json
{
  "models": [
    {
      "id": "pixio/nano-banana/edit",
      "providerId": "pixio",
      "name": "Nano Banana Edit",
      "description": "Model description",
      "type": "image-to-image",
      "credits": 4,
      "company": "Pixio",
      "inputs": []
    }
  ]
}
```

Use `id` as `modelId` in `/params` and `/generate`.

Optional single-model lookup:

```bash
curl "https://beta.pixio.myapps.ai/api/v1/models?modelId=pixio/nano-banana/edit" \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

## GET /api/v1/params

Returns the accepted input params for one model.

```bash
curl "https://beta.pixio.myapps.ai/api/v1/params?modelId=pixio/nano-banana/edit" \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

Response shape:

```json
{
  "model": {
    "id": "pixio/nano-banana/edit",
    "providerId": "pixio",
    "name": "Nano Banana Edit",
    "type": "image-to-image",
    "credits": 4,
    "company": "Pixio"
  },
  "params": [
    {
      "name": "prompt",
      "type": "string",
      "label": "Prompt",
      "required": true,
      "defaultValue": null,
      "placeholder": "Describe the edit"
    },
    {
      "name": "image_url",
      "type": "file",
      "label": "Image",
      "required": true,
      "defaultValue": null
    }
  ]
}
```

Build generation requests from this response. Respect `required`, `defaultValue`, and `options`.

## POST /api/v1/images

Returns a clean, permanent public image URL for use in image params or workflow `fileUrl`.

Multipart upload:

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/images \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -F "file=@./reference.jpg"
```

JSON URL mirror:

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/images \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/reference.jpg"}'
```

Response:

```json
{
  "url": "https://pixio-media.example/uploads/reference.jpg"
}
```

For multiple files or URLs, the response includes both `url` and `urls`. Limit: 10 items.

## POST /api/v1/media

Returns a clean, permanent public URL for image, video, or audio.

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/media \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -F "file=@./clip.mp4"
```

JSON URL mirror:

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/media \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/clip.mp4"}'
```

Response:

```json
{
  "url": "https://pixio-media.example/uploads/clip.mp4"
}
```

For multiple files or URLs, the response includes both `url` and `urls`. Limit: 10 items.

## POST /api/v1/uploads

Uploads local files or imports public media URLs into Pixio assets.

Use uploads when:

- The user gives the agent a local file path.
- The model requires an uploaded Pixio asset.
- You want to prepare reusable media assets before generation.

### Multipart file upload

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/uploads \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -F "file=@./reference.png"
```

Accepted multipart file fields include `file`, `files`, `media`, `media[]`, `asset`, `assets`, and `assets[]`.

### JSON URL import

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/uploads \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/reference.png"}'
```

Multiple URLs:

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/uploads \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://example.com/reference-1.png",
      "https://example.com/reference-2.png"
    ]
  }'
```

Upload response:

```json
{
  "uploads": [
    {
      "sourceUrl": "https://example.com/reference.png",
      "filePath": "users/00000000-0000-0000-0000-000000000000/uploads/api/reference.png",
      "url": "https://cdn.pixio.ai/uploads/api/reference.png?signature=example",
      "signedUrl": "https://cdn.pixio.ai/uploads/api/reference.png?signature=example",
      "signedUrlExpiresAt": "1970-01-01T01:00:00.000Z",
      "fileName": "reference.png",
      "fileSize": 123456,
      "contentType": "image/png",
      "mediaType": "image"
    }
  ]
}
```

Use the param format expected by the selected model. Some models accept a URL-like media param, while others may need the `filePath` returned by upload.

## POST /api/v1/generate

Starts a generation.

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/generate \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "pixio",
    "modelId": "pixio/nano-banana/edit",
    "params": {
      "prompt": "turn this product photo into a clean studio ad",
      "image_url": "https://example.com/reference.png",
      "aspect_ratio": "1:1",
      "output_format": "png"
    }
  }'
```

Accepted response:

```json
{
  "success": true,
  "message": "Generation started successfully!",
  "contentId": "00000000-0000-0000-0000-000000000000",
  "providerId": "pixio",
  "modelId": "pixio/nano-banana/edit"
}
```

HTTP status is `202`. Save `contentId`. It is the id to poll.

## GET /api/v1/generations/{id}

Fetches generation status and outputs.

```bash
curl "https://beta.pixio.myapps.ai/api/v1/generations/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

Final image response example:

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "status": "succeeded",
  "type": "image",
  "providerId": "pixio",
  "modelId": "pixio/nano-banana/edit",
  "params": {
    "prompt": "turn this product photo into a clean studio ad",
    "image_url": "users/00000000-0000-0000-0000-000000000000/uploads/api/reference.png"
  },
  "outputUrl": "https://cdn.pixio.ai/outputs/example.png",
  "outputs": {
    "imageUrl": "https://cdn.pixio.ai/outputs/example.png"
  },
  "assetVariants": {},
  "error": null,
  "creditsCost": 4,
  "outputUrlExpiresAt": null,
  "createdAt": "1970-01-01T00:00:00.000Z",
  "updatedAt": "1970-01-01T00:01:00.000Z",
  "billedAt": "1970-01-01T00:00:00.000Z"
}
```

Final video response example:

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "status": "succeeded",
  "type": "video",
  "providerId": "pixio",
  "modelId": "pixio/seedance-2-maker",
  "outputUrl": "https://cdn.pixio.ai/outputs/example.mp4",
  "outputs": {
    "videoUrl": "https://cdn.pixio.ai/outputs/example.mp4",
    "thumbnailUrl": "https://cdn.pixio.ai/outputs/example-thumb.jpg"
  },
  "creditsCost": 175,
  "createdAt": "1970-01-01T00:00:00.000Z",
  "updatedAt": "1970-01-01T00:03:00.000Z",
  "billedAt": "1970-01-01T00:00:00.000Z"
}
```

## GET /api/v1/credits

Checks the authenticated account's Pixio credits.

```bash
curl https://beta.pixio.myapps.ai/api/v1/credits \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

Response shape:

```json
{
  "accountId": "00000000-0000-0000-0000-000000000000",
  "total": 3407,
  "recurring": {
    "current": 3000,
    "quota": 15000,
    "lastTopOffAt": "1970-01-01T00:00:00.000Z"
  },
  "permanent": 407
}
```

## GET /api/v1/guide

Public route. Markdown by default:

```bash
curl https://beta.pixio.myapps.ai/api/v1/guide
```

JSON with route lists:

```bash
curl "https://beta.pixio.myapps.ai/api/v1/guide?format=json"
```

Do not send API keys to this discovery route.

## GET /api/v1/openapi.json

Public OpenAPI 3.1 spec:

```bash
curl https://beta.pixio.myapps.ai/api/v1/openapi.json
```

Use it to generate clients or tool schemas. Use `/params` for model-specific inputs.

## GET /api/v1/workflows

Lists saved workflows for the authenticated account.

```bash
curl https://beta.pixio.myapps.ai/api/v1/workflows \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

Response:

```json
{
  "workflows": [
    {
      "id": "workflow_000",
      "name": "Product video workflow",
      "description": "Generate a product still and animate it.",
      "updatedAt": "1970-01-01T00:00:00.000Z",
      "latestRun": null
    }
  ]
}
```

## POST /api/v1/workflows/{id}/runs

Queues a run for a saved workflow.

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/workflows/workflow_000/runs \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "cinematic product reveal",
    "overrides": {
      "node-id": {
        "fileUrl": "https://pixio-media.example/uploads/reference.jpg"
      }
    }
  }'
```

Response:

```json
{
  "runId": "run_000",
  "workflowId": "workflow_000",
  "status": "queued"
}
```

## GET /api/v1/workflows/{id}/runs

Lists recent runs for one workflow. Optional `limit` defaults to 20 and is clamped to 1-50.

```bash
curl "https://beta.pixio.myapps.ai/api/v1/workflows/workflow_000/runs?limit=10" \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

## GET /api/v1/workflows/{id}/runs/{runId}

Polls a workflow run and returns step outputs.

```bash
curl https://beta.pixio.myapps.ai/api/v1/workflows/workflow_000/runs/run_000 \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

Final response includes:

```json
{
  "id": "run_000",
  "workflowId": "workflow_000",
  "status": "succeeded",
  "steps": [],
  "outputs": [
    {
      "nodeId": "node-id",
      "type": "model",
      "url": "https://cdn.pixio.ai/output.mp4",
      "urlExpiresAt": null,
      "durationSeconds": 5
    }
  ]
}
```

## Polling Guidance

Use a 2-5 second interval for most jobs.

Pseudo-code:

```text
generation = POST /api/v1/generate
id = generation.contentId

loop:
  result = GET /api/v1/generations/{id}
  if result.status is "succeeded":
    return result.outputUrl and result.outputs
  if result.status is "failed":
    return result.error
  wait 2-5 seconds
```

## Media Input Guidance

If the user provides a local file:

1. Convert it to a clean URL with `/api/v1/images` or `/api/v1/media`.
2. Read the selected model's params from `/api/v1/params`.
3. Put the returned `url` into the right model param.

Use `/api/v1/uploads` when the model needs Pixio asset metadata such as `filePath`.

If the user provides a public image/video/audio URL:

- You may pass it directly in the media param.
- Pixio imports it into Pixio assets before generation.

Public media URLs must be direct image, video, or audio URLs. Private network, localhost, and non-media URLs are rejected.

## Concurrency

API concurrency is shared across the whole Pixio account.

Default accounts:

```text
1 in-flight API generation
```

Maker accounts:

```text
3 in-flight API generations
```

This limit is across all API keys on the account. Two keys do not double the account's concurrency.

## Common Errors

Missing or invalid key:

```json
{
  "error": "Missing API key. Send Authorization: Bearer <api_key>."
}
```

Insufficient credits:

```json
{
  "error": "Insufficient credits",
  "availableCredits": 154,
  "requiredCredits": 175,
  "shortfall": 21
}
```

Concurrency reached:

```json
{
  "error": "This account has reached its API concurrency limit of 3. Wait for a generation to finish before starting another.",
  "generationId": "00000000-0000-0000-0000-000000000000",
  "status": "processing",
  "concurrencyLimit": 3
}
```

Invalid media URL:

```json
{
  "error": "invalid_media_url",
  "message": "Media URLs must resolve to public internet addresses."
}
```

Unknown model:

```json
{
  "error": "Pixio API model not found"
}
```

## Example Model-Specific Docs

# Add Audio to Video API Reference

Use this reference when integrating with the Pixio API.

## Base URL

`https://beta.pixio.myapps.ai`

## Authentication

All requests require a Pixio API key.

```http
Authorization: Bearer pxio_live_your_api_key
```

## Core Endpoints

### Create Generation

```http
POST https://beta.pixio.myapps.ai/api/v1/generate
```

Body:

```json
{
  "providerId": "pixio",
  "modelId": "pixio/video-ops/add-audio",
  "params": {
    "videoUrl": "https://example.com/reference.mp4",
    "audioUrl": "https://example.com/audio.mp3",
    "startAt": 0,
    "audioVolume": 1
  }
}
```

Returns immediately with a generation id. Poll the generation endpoint for status and outputs.

### Upload Media Asset

```http
POST https://beta.pixio.myapps.ai/api/v1/uploads
```

Body:

```json
{
  "url": "https://example.com/reference.mp4"
}
```

Example:

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/uploads \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/reference.mp4"}'
```

Upload a local file:

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/uploads \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -F "file=@./reference.mp4"
```

Multipart URL import also works:

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/uploads \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -F "url=https://example.com/reference.mp4"
```

You can also send `urls` with up to 8 public media URLs, or up to 8 multipart media items using `file`, `files`, `media`, `assets`, `url`, or `urls`. Pixio uploads each file into the authenticated user's Pixio assets and returns `filePath`, `url`, `signedUrl`, `signedUrlExpiresAt`, `fileName`, `fileSize`, `contentType`, and `mediaType`. Use `url` when you need a temporary asset URL, and use `filePath` in generation params when you want to reference the uploaded Pixio asset directly.

### Get Generation

```http
GET https://beta.pixio.myapps.ai/api/v1/generations/{id}
```

Returns status, params, outputUrl, outputs, assetVariants, error, credit cost, and timestamps.

### List Models

```http
GET https://beta.pixio.myapps.ai/api/v1/models
```

Returns the Pixio model catalog visible to the authenticated account.

### Get Input Params For A Model

```http
GET https://beta.pixio.myapps.ai/api/v1/params?modelId=pixio/video-ops/add-audio
```

Returns accepted params, required flags, defaults, placeholders, and options for one model.

### Check Credits

```http
GET https://beta.pixio.myapps.ai/api/v1/credits
```

Returns recurring, permanent, and total credits for the authenticated account.

## Media URL Inputs

When params include media URLs such as `image_url`, `image_urls`, `video_url`, `audio_url`, `mask`, `reference_image`, or nested media fields, Pixio imports those public URLs into Pixio media storage first. Generation then receives Pixio storage paths, matching the normal web app media flow.

Rules:

- Media URLs must be public HTTP or HTTPS URLs.
- Localhost and private network URLs are rejected.
- The remote file must return an image, video, or audio content type.
- The uploaded media appears in Pixio media/assets for the account.

## Concurrency

API concurrency is shared across the account, across all API keys. Default accounts get 1 in-flight API generation. Maker accounts get 3 in-flight API generations.

## Credits

API generations spend from the same Pixio account credits as web app generations. If credits are insufficient, the API returns HTTP 402 with availableCredits, requiredCredits, and shortfall.

## Selected Model

This model was selected when copied.

### Add Audio to Video

- modelId: `pixio/video-ops/add-audio`
- type: `video-to-video`
- credits: `0`

Params:

- `videoUrl` (`file`, required): Video. Default: `""`.
- `audioUrl` (`file`, required): Audio. Default: `""`.
- `startAt` (`number`, optional): Audio start offset in seconds. Default: `0`.
- `audioVolume` (`number`, optional): Audio volume. Default: `1`.
