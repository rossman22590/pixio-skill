# POST /api/v1/uploads

Upload local files or import public media URLs into the authenticated user's
Pixio assets. `POST /api/v1/assets` is an alias.

Use this when you want a managed Pixio asset: an `id` you can file into a
folder, a `filePath` for asset-style params, a signed URL, and metadata. For a
simple clean URL to drop into `image_url`, `video_url`, `audio_url`, or a
workflow `fileUrl`, prefer `/images` or `/media`.

## JSON URL Upload

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/uploads" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"urls":["https://example.com/reference-1.png","https://example.com/reference-2.png"]}'
```

Single: `{"url":"https://example.com/reference.png"}`.

## Multipart File Upload

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/uploads" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "file=@./reference.png"
```

Accepted multipart fields: `file`, `files`, `media`, `media[]`, `asset`,
`assets`, `assets[]`, `url`, `urls`, `urls[]`.

Limit: up to 8 media items per request.

## File Into A Folder In One Call

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/uploads?collectionId=$COLLECTION_ID" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "file=@./reference.png"
```

Every upload in the call is filed into that folder. Filing errors are reported
in the response without discarding the uploads.

## Response

```json
{
  "uploads": [
    {
      "id": "upload-uuid",
      "sourceUrl": "https://example.com/reference.png",
      "filePath": "users/<account>/uploads/api/reference.png",
      "url": "https://cdn.pixio.ai/...?signature=example",
      "signedUrl": "https://cdn.pixio.ai/...?signature=example",
      "signedUrlExpiresAt": "2026-09-20T11:00:00.000Z",
      "fileName": "reference.png",
      "fileSize": 123456,
      "contentType": "image/png",
      "mediaType": "image"
    }
  ]
}
```

- `id` is the asset ID; use it with `/assets/{id}`, folder filing, and bulk
  delete.
- `filePath` is the durable storage key; use it in asset-style params and when
  persisting references inside project content.
- `url` and `signedUrl` are temporary; `signedUrlExpiresAt` says when.

## Errors

- `400`: invalid media, private or local URL, unsupported type, over the size
  limit for the media kind (see `constraints.maxBytes` on `/params`).
- `401`: bad key.
- `502`: upload service or remote fetch failed.

## Agent Rules

- Use `url` when a model accepts a temporary asset URL now.
- Use `filePath` when a model needs a Pixio asset reference or when storing a
  reference in a board, canvas, or storyboard document.
- Only upload image, video, or audio media; imports must be direct media files.
- Persist `id` and `filePath`, never a signed URL, for long-lived references.
