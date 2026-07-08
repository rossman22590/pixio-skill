# POST /api/v1/images

Return a clean, permanent public URL for image input. The response URL has no signed query string and can be passed directly into model params such as `image_url`, `image_urls`, `reference_image`, or a workflow `fileUrl`.

Requires:

```http
Authorization: Bearer pxio_live_your_api_key
```

## Multipart Upload

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/images \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -F "file=@./reference.jpg"
```

Accepted multipart file fields:

- `file`
- `files`
- `image`
- `images`
- `media`
- `asset`

Limit: up to 10 files per request.

## JSON URL Mirror

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/images \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/reference.jpg"}'
```

Multiple URLs:

```json
{
  "urls": [
    "https://example.com/reference-1.jpg",
    "https://example.com/reference-2.jpg"
  ]
}
```

Limit: up to 10 URLs per request.

## Response

Single item:

```json
{
  "url": "https://pixio-media.example/uploads/reference.jpg"
}
```

Multiple items:

```json
{
  "url": "https://pixio-media.example/uploads/reference-1.jpg",
  "urls": [
    "https://pixio-media.example/uploads/reference-1.jpg",
    "https://pixio-media.example/uploads/reference-2.jpg"
  ]
}
```

## Errors

- `400`: no file or URL was provided.
- `401`: missing or invalid API key.
- `502`: upload service or remote URL fetch failed.

## Agent Rules

- Prefer this endpoint for local image files before `POST /api/v1/generate`.
- Pass the returned `url` into the exact media param from `/api/v1/params`.
- For video or audio, use `POST /api/v1/media` instead.
- For Pixio asset metadata such as `filePath`, use `POST /api/v1/uploads` instead.
