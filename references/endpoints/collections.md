# Asset Collections (Folders)

Folders for uploads and generated assets. Ownership is enforced on every read
and mutation; foreign asset IDs are skipped and reported rather than fatal.

## List Folders

```http
GET /api/v1/assets/collections
```

```json
{
  "data": [
    {
      "id": "collection-uuid",
      "name": "Campaign Q4",
      "parentId": null,
      "color": "#ff8800",
      "itemCount": 12,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

## Create A Folder

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/assets/collections" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Campaign Q4","parentId":null,"color":"#ff8800"}'
```

- `name`: 1–100 characters; inner whitespace collapses; sibling names are
  unique case-insensitively.
- `parentId`: omit or `null` for top level; must be a folder you own.
- `color`: `#rrggbb` or `null`.
- `201 Collection`; `409` when a sibling already has that name; `400` when the
  hierarchy trigger rejects the move (depth cap, descendant cycles) with the
  trigger's own wording.

## Read, Update, Delete One Folder

```http
GET    /api/v1/assets/collections/{id}
PATCH  /api/v1/assets/collections/{id}   { name?, parentId?, color? }
DELETE /api/v1/assets/collections/{id}
```

- `PATCH` with `parentId: null` moves the folder to the top level.
- `DELETE` returns `{ id, deleted: true }`. Sub-folders cascade; assets are
  kept.
- `404` when the folder is not yours.

## Folder Contents

```http
GET /api/v1/assets/collections/{id}/items?page=1&limit=20
```

Returns `{ data: Asset[], page, limit, total, hasMore }` with the same asset
shape and signing as `GET /assets/{id}`, newest first.

## File Assets

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/assets/collections/$COLLECTION_ID/items" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"assetIds":["upload-uuid","generation-uuid"]}'
```

- Up to 100 IDs, uploads or generated content, duplicates deduped.
- Returns `{ added, skipped: [ids you do not own or that do not exist] }`.
- Filing an asset that is already in the folder is a no-op.

## Unfile Assets

```http
DELETE /api/v1/assets/collections/{id}/items   { assetIds } or ?ids=a,b,c
```

Returns `{ removed }`. The assets themselves are untouched.

## One-Call Filing On Upload

`POST /uploads?collectionId=<folder>` files every upload in that call. Filing
errors are reported without discarding the uploads.

## Agent Rules

- Build a folder tree once and cache IDs; names can be renamed by the user.
- Never delete a folder as a way to delete assets; it does not.
- When organising generated output, file by `generationId` (the asset ID of a
  generated item equals its `contentId`).
