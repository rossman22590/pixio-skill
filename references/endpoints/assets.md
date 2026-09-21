# Asset Lifecycle

Pixio presents uploaded media and successful generated outputs through one asset
API. Every route requires the API key and account ownership.

## Contents

- List and filter assets, including by producing model
- Upload managed assets
- Get and refresh one asset
- Rename uploaded assets
- Create single and batch download links (Songcraft tiers)
- Delete single and bulk assets
- URL lifetime and safety rules

Folders live in `collections.md`.

## List Assets

```http
GET /api/v1/assets?type=image&source=generated&modelId=pixio/flux/dev&search=product&page=1&limit=20
```

Query (all optional):

- `type`: `image`, `video`, `audio`, `3d`;
- `source`: `upload`, `generated`;
- `search`: 1–200 characters; matches upload names or generated prompts;
- `modelId`: only generations produced by this model (get candidates from
  `GET /assets/models`);
- `page`: at least 1, default 1;
- `limit`: 1–100, default 20.

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

Generated assets have `source: "generated"`, public `providerId`/`modelId`,
and `status: "succeeded"`.

## Models That Produced Assets

```http
GET /api/v1/assets/models
```

```json
{ "data": [{ "modelId": "pixio/flux/dev", "name": "FLUX Dev", "company": "BFL", "count": 42 }] }
```

Only models with at least one asset appear, so a "filter by model" control
built from this list always returns results. Pass `modelId` back to
`GET /assets?modelId=`.

## Upload Assets

`POST /assets` is an alias of `POST /uploads` (see `uploads.md`), including
`?collectionId=` filing. The response is `{ "uploads": [...] }` with each
upload's `id`.

## Get One Asset

```bash
curl -fsS "$PIXIO_BASE_URL/assets/$ASSET_ID?source=upload" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

`source` is optional; supplying it avoids searching both stores. Returns the
asset with a fresh signed URL.

## Rename One Upload

```bash
curl -fsS -X PATCH "$PIXIO_BASE_URL/assets/$ASSET_ID?source=upload" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"approved-product-reference.png"}'
```

Name length 1–200. Only uploads can be renamed; generated assets return `422`.

## Download URLs

```bash
curl -fsS "$PIXIO_BASE_URL/assets/$ASSET_ID/download?source=generated" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

Returns `{ "url", "expiresAt", "fileName", "creditsCharged" }` with a
one-hour attachment URL. Add `redirect=true` for a `302` straight to the file.

Songcraft songs are the one paid download:

- `?tier=preview` (default): 100 credits.
- `?tier=official`: 300 credits, the official commercial MP3.
- Each tier is charged once per song; re-downloads are free.
- `402` when credits are short. `creditsCharged` reports the debit.

Batch:

```bash
curl -fsS --get "$PIXIO_BASE_URL/assets/download" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  --data-urlencode "ids=id-one,id-two" \
  --data-urlencode "source=generated"
```

Returns `{ "downloads": [{ id, url, expiresAt, fileName, creditsCharged }],
"notFound": [...], "failed": [{ id, code, error }] }`. Songs that could not be
charged appear under `failed`. Maximum 100 unique IDs.

## Delete Assets

One:

```bash
curl -fsS -X DELETE "$PIXIO_BASE_URL/assets/$ASSET_ID?source=upload" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

Returns `{ deleted, id, source }`.

Bulk:

```bash
curl -fsS -X DELETE "$PIXIO_BASE_URL/assets" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"ids":["id-one","id-two"],"source":"upload"}'
```

Also accepts `?ids=a,b,c&source=upload`. 1–100 IDs. Returns `deletedCount`,
`deleted`, and `notFound`. Deletion removes the record and best-effort deletes
storage. Folder memberships disappear with the asset.

## Rules

- Treat asset URLs as temporary; refresh through `GET /assets/{id}`.
- Persist asset IDs and `source`, not signed URLs.
- Require explicit intent before delete; never retry deletion automatically.
- Asset delete and generation delete can target the same generated record. Do
  not issue both for one ID.
- Warn before a Songcraft `official` download; it spends 300 credits.
