# Asset Lifecycle

Pixio presents uploaded media and successful generated outputs through one asset
API. Every route requires the API key and account ownership.

## Contents

- List and filter assets
- Upload managed assets
- Get and refresh one asset
- Rename uploaded assets
- Create single and batch download links
- Delete single and bulk assets
- URL lifetime and safety rules

## List Assets

```http
GET /api/v1/assets?type=image&source=upload&search=product&page=1&limit=20
```

Optional query fields:

- `type`: `image`, `video`, `audio`;
- `source`: `upload`, `generated`;
- `search`: 1–200 characters; matches upload names or generated prompts;
- `page`: at least 1, default 1;
- `limit`: 1–100, default 20.

Response:

```json
{
  "data": [
    {
      "id": "asset-id",
      "source": "upload",
      "type": "image",
      "url": "https://signed-url",
      "urlExpiresAt": "...",
      "fileName": "reference.png",
      "fileSize": 12345,
      "contentType": "image/png",
      "assetVariants": {},
      "providerId": null,
      "modelId": null,
      "status": null,
      "createdAt": "..."
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1,
  "hasMore": false
}
```

Generated assets have `source: "generated"`, public `providerId/modelId`, and
`status: "succeeded"`.

## Upload Assets

`POST /assets` is an alias of `POST /uploads`.

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/assets" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "file=@./reference.png"
```

Remote import:

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/assets" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"urls":["https://example.com/a.png","https://example.com/b.mp4"]}'
```

The response is `{ "uploads": [...] }`. See `uploads.md` for accepted fields
and metadata.

## Get One Asset

```bash
curl -fsS "$PIXIO_BASE_URL/assets/$ASSET_ID?source=upload" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

`source` is optional. Supplying it avoids searching both asset stores.

## Rename One Upload

```bash
curl -fsS -X PATCH "$PIXIO_BASE_URL/assets/$ASSET_ID?source=upload" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"approved-product-reference.png"}'
```

Name length is 1–200 characters. Only uploaded assets can be renamed. Generated
assets return `422`.

## Get A Download URL

```bash
curl -fsS "$PIXIO_BASE_URL/assets/$ASSET_ID/download?source=upload" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

Returns `{ "url", "expiresAt", "fileName" }` with a one-hour attachment URL.
Add `redirect=true` to receive a `302` directly to the file.

Batch download URLs:

```bash
curl -fsS --get "$PIXIO_BASE_URL/assets/download" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  --data-urlencode "ids=id-one,id-two" \
  --data-urlencode "source=generated"
```

Returns `{ "downloads": [...], "notFound": [...] }`. Maximum 100 unique IDs.

## Delete Assets

One asset:

```bash
curl -fsS -X DELETE "$PIXIO_BASE_URL/assets/$ASSET_ID?source=upload" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

Bulk JSON request:

```bash
curl -fsS -X DELETE "$PIXIO_BASE_URL/assets" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"ids":["id-one","id-two"],"source":"upload"}'
```

Bulk deletion accepts 1–100 IDs and returns `deleted`, `deletedCount`, and
`notFound`. Deletion removes the database record and best-effort deletes storage.

## Rules

- Treat asset URLs as temporary and refresh through `GET /assets/{id}`.
- Persist asset IDs and source, not signed URLs, for long-lived references.
- Require explicit intent before delete; do not retry deletion automatically.
- Asset delete and generation delete can target the same generated record. Do
  not issue both for one ID.
- The asset API does not expose folders, tags, Boards, Canvas, or project links.
