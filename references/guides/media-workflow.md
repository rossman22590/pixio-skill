# Media Workflow

Pixio API supports three media paths: clean public URL creation, direct public URL ingestion, and explicit Pixio asset upload.

## Clean Public URL First

Use these routes for local files or remote media when the next call needs a simple URL without a signed query string:

- `POST /api/v1/images`: image-focused clean URL route.
- `POST /api/v1/media`: image, video, or audio clean URL route.

Single-item response:

```json
{
  "url": "https://pixio-media.example/uploads/reference.jpg"
}
```

Multiple-item response:

```json
{
  "url": "https://pixio-media.example/uploads/reference-1.jpg",
  "urls": [
    "https://pixio-media.example/uploads/reference-1.jpg",
    "https://pixio-media.example/uploads/reference-2.jpg"
  ]
}
```

Pass the returned `url` into model media params or workflow `fileUrl`.

## Public URL In Generation Params

If a model param is a media field and the user has a public media URL, you can pass it directly:

```json
{
  "providerId": "pixio",
  "modelId": "pixio/nano-banana/edit",
  "params": {
    "prompt": "make this cinematic",
    "image_url": "https://example.com/reference.png"
  }
}
```

Pixio imports the URL into Pixio assets before generation starts.

## Explicit Upload First

Use `/api/v1/uploads` first when:

- you need to reuse the same media in multiple generations;
- a model expects a Pixio asset path;
- you want to validate/import media before generating.
- you need metadata such as `filePath`, `signedUrl`, `fileSize`, `contentType`, or `mediaType`.

Upload response fields:

- `filePath`: Pixio storage path for asset-style params.
- `url`: temporary signed asset URL.
- `signedUrl`: same temporary signed asset URL.
- `signedUrlExpiresAt`: expiration timestamp.
- `mediaType`: `image`, `video`, or `audio`.

## Limits And Rejections

- `/api/v1/images` and `/api/v1/media`: up to 10 files or URLs per request.
- `/api/v1/uploads`: up to 8 media URLs/items per request.
- Public URLs must use HTTP or HTTPS.
- Private IPs, localhost, and local network URLs are rejected.
- Remote media must return image, video, or audio content type.
- Oversized files are rejected.

## Agent Rules

- Use exact param names from `/api/v1/params`.
- Do not put image URLs into text-only params.
- For arrays such as `image_urls`, preserve array shape.
- For multiple uploads, map each returned upload to the intended param.
- Use clean URL routes for workflow `fileUrl` overrides.
