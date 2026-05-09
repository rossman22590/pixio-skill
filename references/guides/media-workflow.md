# Media Workflow

Pixio API supports two media paths: direct public URL ingestion and explicit upload.

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

- the media is a local file;
- you need to reuse the same media in multiple generations;
- a model expects a Pixio asset path;
- you want to validate/import media before generating.

Upload response fields:

- `filePath`: Pixio storage path for asset-style params.
- `url`: temporary signed asset URL.
- `signedUrl`: same temporary signed asset URL.
- `signedUrlExpiresAt`: expiration timestamp.
- `mediaType`: `image`, `video`, or `audio`.

## Limits And Rejections

- Up to 8 media URLs/items per upload request.
- Public URLs must use HTTP or HTTPS.
- Private IPs, localhost, and local network URLs are rejected.
- Remote media must return image, video, or audio content type.
- Oversized files are rejected.

## Agent Rules

- Use exact param names from `/api/v1/params`.
- Do not put image URLs into text-only params.
- For arrays such as `image_urls`, preserve array shape.
- For multiple uploads, map each returned upload to the intended param.
