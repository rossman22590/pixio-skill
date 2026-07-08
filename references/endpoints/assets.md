# Asset, Media, Upload, And Output Routes

Use this reference when the user asks about assets, media inputs, uploads, generated outputs, signed URLs, local media, image proxying, or asset libraries.

## Public Stable API Routes

These are the routes external agents should use.

### `POST /api/v1/images`

Clean public URL for images.

- Auth: Pixio API key.
- Inputs: multipart fields `file`, `files`, `image`, `images`, `media`, `asset`; or JSON `url` / `urls`.
- Limit: 10 files or URLs.
- Response: `{ "url": "https://..." }` or `{ "url": "https://...", "urls": ["https://..."] }`.
- Use for: image params such as `image_url`, `image_urls`, `reference_image`, or workflow `fileUrl`.

### `POST /api/v1/media`

Clean public URL for image, video, or audio.

- Auth: Pixio API key.
- Inputs: multipart fields `file`, `files`, `image`, `images`, `media`, `asset`, `assets`, `video`, `audio`; or JSON `url` / `urls`.
- Limit: 10 files or URLs.
- Response: `{ "url": "https://..." }` or `{ "url": "https://...", "urls": ["https://..."] }`.
- Use for: `image_url`, `video_url`, `audio_url`, mixed-media model params, or workflow `fileUrl`.

### `POST /api/v1/uploads`

Pixio user asset upload/import.

- Auth: Pixio API key.
- Inputs: multipart fields `file`, `files`, `media`, `media[]`, `asset`, `assets`, `assets[]`, `url`, `urls`, `urls[]`; JSON `url` / `urls`; URL-encoded `url` / `urls`; or a plain URL body.
- Limit: 8 media items.
- Response: `uploads[]` with `sourceUrl`, `filePath`, `url`, `signedUrl`, `signedUrlExpiresAt`, `fileName`, `fileSize`, `contentType`, and `mediaType`.
- Use for: models or workflow overrides that need Pixio asset metadata, not just a clean URL.

### `GET /api/v1/generations/{id}`

Generated output lookup and signed URL refresh.

- Auth: Pixio API key.
- Response includes `outputUrl`, `outputUrlExpiresAt`, `outputs`, `assetVariants`, `error`, `creditsCost`, and timestamps.
- If `outputUrlExpiresAt` is non-null, poll this route again before using the URL after expiration.

### `GET /api/v1/workflows/{id}/runs/{runId}`

Workflow output lookup.

- Auth: Pixio API key.
- Response includes `steps[]` and final `outputs[]`.
- Step and output URLs may include `outputUrlExpiresAt` or `urlExpiresAt`; refresh by polling the run again if needed.

## App Authenticated Asset Routes

These are web-app routes, not stable third-party API routes. Use them only when maintaining Pixio app code.

### `GET /api/chat/assets`

Returns recent succeeded generated assets for the logged-in web user.

- Auth: Supabase web session, not Pixio API key.
- Query: optional `type=image` or `type=video`.
- Response: `{ "assets": [{ "id", "type", "modelId", "url" }] }`.
- Limit: 40 recent assets.

### `GET /api/image-proxy?url=...`

Proxies allowed image/video/audio/model asset URLs for browser display.

- Auth: no Pixio API key; host allowlist is enforced.
- Allowed hosts include object storage, Supabase storage, configured assets CDN, and optional `NEXT_PUBLIC_IMAGE_PROXY_ALLOWLIST`.
- Supports range requests for video/audio seeking.
- Optional `download=filename` forces attachment disposition.

### `POST /api/latest/local-media/upload`

Video editor local-media upload handler.

- Auth/shape: delegated to `@kit/video-editor/api`.
- Use only inside app/video-editor flows.

### `GET /api/latest/local-media/serve/[...path]`

Video editor local-media serve handler.

- Auth/shape: delegated to `@kit/video-editor/api`.
- Use only inside app/video-editor flows.

### `POST /api/latest/local-media/delete`

Video editor local-media delete handler.

- Auth/shape: delegated to `@kit/video-editor/api`.
- Use only inside app/video-editor flows.

### `GET /api/projects`

Video editor projects handler.

- Auth/shape: delegated to `@kit/video-editor/api`.
- Use only inside app/video-editor flows.

### `GET /api/storage/download`

Removed route. Do not use.

## Public App Utility Routes

These are user-facing app utilities, not the stable Pixio public API.

### `POST /api/upload-film/file`

Film festival video upload utility.

- Input: multipart `file`.
- Response: `{ "publicURL": "https://..." }`.
- Uses the upload service directly.
- Do not use for general Pixio API integrations; use `/api/v1/media`.

### `POST /api/upload-film`

Film festival submission email route.

- Input: JSON with `name`, `email`, `description`, `category`, `videoUrl`, optional `fileName`, optional `xProfile`.
- Allowed categories: `Documentary`, `Music Video`, `Cinema`, `Commercial`.
- Do not use for asset management.

### `GET /api/cam-view/anim?file=name.fbx`

Local-dev-only Mixamo FBX animation server for Cam View.

- Disabled in production.
- Requires `CAM_VIEW_MIXAMO_DIR`.
- Only serves `.fbx` basenames; no traversal.
- Do not use as a public asset route.

## Provider And Internal Asset Routes

These are not stable public API routes.

- `GET /api/argil/assets`: Argil provider asset proxy using server `ARGIL_API_KEY`.
- Provider proxies/webhooks such as `/api/fal/proxy`, `/api/luma/proxy`, `/api/useapi/proxy`, `/api/*/webhook`: provider-specific internals.
- Open Graph image routes under `/api/share/**/opengraph-image`, `/api/gallery/**/opengraph-image`, and `/api/workflows/**/opengraph-image`: image-rendering endpoints for social previews, not asset APIs.

## Agent Rules

- For external callers, prefer `/api/v1/images`, `/api/v1/media`, `/api/v1/uploads`, `/api/v1/generations/{id}`, and workflow run polling.
- Do not use web-session routes with Pixio API keys; they authenticate differently.
- Do not expose signed URLs, API keys, local file paths, or provider secrets in logs or final output.
- Do not call provider webhook, admin, internal, or local-dev routes from third-party integrations.
