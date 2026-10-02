# Media Workflow

Pixio supports four media paths: clean public URL creation, direct public URL
ingestion, managed asset upload, and resolving stored project references.

## Decision Table

| Need | Route | Returns |
|---|---|---|
| A URL to drop into `image_url`/`video_url`/`audio_url` or a workflow `fileUrl` | `POST /images` (images) or `POST /media` (any) | clean public `url` |
| A reusable asset with metadata, foldering, and later management | `POST /uploads` with optional `?collectionId=` (alias `POST /assets` uploads the same way but ignores `collectionId`) | `id`, `filePath`, signed `url`, `signedUrlExpiresAt`, `contentType`, `fileSize`, `mediaType` |
| Use media the user already hosts publicly | pass the URL directly in the declared media param | Pixio imports it before dispatch |
| Display media stored inside a board, canvas, or storyboard document | `POST /media/resolve` | temporary display URLs keyed by ref |
| Download a generated file as an attachment | `GET /assets/{id}/download` or `/assets/download?ids=` | one-hour attachment URL |

## Clean Public URL First

Single: `{ "url": "https://pixio-media.example/uploads/reference.jpg" }`.
Multiple: `{ "url": "<first>", "urls": ["...", "..."] }`.

Pass `url` into model media params or workflow `fileUrl`. Up to 10 files or
URLs per request.

## Public URL In Generation Params

```json
{
  "modelId": "pixio/nano-banana/edit",
  "params": { "prompt": "make this cinematic", "image_url": "https://example.com/reference.png" }
}
```

Pixio imports the URL into assets before generation starts. Temporary imports
are cleaned up if dispatch fails. The same public-internet guard runs on
`/generations/estimate`, so quoting with a private URL fails early.

## Managed Upload First

Use `/uploads` when you need to:

- reuse the same media across generations, workflows, or projects;
- store a durable reference (`filePath`) inside project content;
- file media into a folder (`?collectionId=`);
- validate or import media before paying for a generation;
- read `fileSize`, `contentType`, `mediaType` first.

Up to 8 items per request. Persist `id` and `filePath`, never a signed URL.

## Project Media References

Project documents keep storage keys, not URLs. When building content or
operations, write the upload's `filePath` (or the key already present in the
document). When displaying, call `POST /media/resolve` with every ref in the
document (up to 100 per call) and use the returned URLs until they expire.
Never `PATCH` a resolved URL back into content.

## Limits And Rejections

- `/images`, `/media`: up to 10 items; `/uploads`: up to 8; `/media/resolve`:
  up to 100 refs.
- Per-kind size caps are published as `constraints.maxBytes` on `/params`
  (check before uploading); duration caps as `constraints.maxSeconds`.
- Public URLs must be HTTP(S) and resolve on the public internet; private IPs,
  localhost, and local paths fail with `400 invalid_media_url`.
- Remote media must return an image, video, or audio content type.
- For per-second models the server measures the decoded duration; a
  caller-supplied duration is ignored for billing.

## URL Lifetimes

| URL | Lifetime | Refresh |
|---|---|---|
| `/images`, `/media` clean URL | long-lived public | none needed |
| `/uploads` signed `url` | until `signedUrlExpiresAt` | `GET /assets/{id}` |
| Generation `outputUrl` | seven days when in Pixio storage | `GET /generations/{id}` |
| Asset list/detail `url` | until `urlExpiresAt` | `GET /assets/{id}` |
| Download `url` | one hour | request again |
| `/media/resolve` URLs | short | resolve again at display time |

## Agent Rules

- Use exact param names from `/params`; do not put URLs into text params.
- Preserve array shape for `image_urls`-style params.
- Map each returned upload to the intended param by order or `fileName`.
- Use clean URL routes for workflow `fileUrl` overrides and character
  `referenceImageUrl`.
- Check `constraints` before uploading to avoid a paid `400`.
