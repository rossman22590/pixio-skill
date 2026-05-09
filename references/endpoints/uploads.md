# POST /api/v1/uploads

Upload local files or import public media URLs into the authenticated user's Pixio assets.

Use this endpoint when the user provides a local file, or when you want a Pixio asset before generating.

## JSON URL Upload

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

## Multipart File Upload

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/uploads \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -F "file=@./reference.png"
```

Multipart URL import:

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/uploads \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -F "url=https://example.com/reference.png"
```

Accepted multipart fields:

- `file`
- `files`
- `media`
- `media[]`
- `asset`
- `assets`
- `assets[]`
- `url`
- `urls`
- `urls[]`

Limit: up to 8 media items per request.

## Response

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

## Agent Rules

- Use `url` when a model accepts a temporary asset URL.
- Use `filePath` when a model needs a Pixio asset reference.
- Only upload image, video, or audio media.
- Public URL imports must point to direct media files.
- Localhost, private-network, and non-public URLs are rejected.
