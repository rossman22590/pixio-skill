# POST /api/v1/media

Return a clean, permanent public URL for any media input: image, video, or audio. The response URL has no signed query string and can be passed directly into model params such as `image_url`, `video_url`, `audio_url`, or a workflow `fileUrl`.

Requires:

```http
Authorization: Bearer pxio_live_your_api_key
```

## Multipart Upload

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/media \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -F "file=@./clip.mp4"
```

Accepted multipart file fields:

- `file`
- `files`
- `image`
- `images`
- `media`
- `asset`
- `assets`
- `video`
- `audio`

Limit: up to 10 files per request.

## JSON URL Mirror

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/media \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/clip.mp4"}'
```

Multiple URLs:

```json
{
  "urls": [
    "https://example.com/clip.mp4",
    "https://example.com/music.mp3"
  ]
}
```

Limit: up to 10 URLs per request.

## Response

Single item:

```json
{
  "url": "https://pixio-media.example/uploads/clip.mp4"
}
```

Multiple items:

```json
{
  "url": "https://pixio-media.example/uploads/clip.mp4",
  "urls": [
    "https://pixio-media.example/uploads/clip.mp4",
    "https://pixio-media.example/uploads/music.mp3"
  ]
}
```

## Errors

- `400`: no file or URL was provided.
- `401`: missing or invalid API key.
- `502`: upload service or remote URL fetch failed.

## Agent Rules

- Prefer this endpoint for local video and audio before `POST /api/v1/generate` or workflow runs.
- It also works for images; use `/images` when the user specifically needs an image-only route.
- Pass the returned `url` into the exact media param from `/api/v1/params` or workflow node `fileUrl`.
- For Pixio asset metadata such as `filePath`, use `POST /api/v1/uploads` instead.
