# Example: Managed Asset Lifecycle

## Upload

```bash
UPLOAD=$(curl -fsS -X POST "$PIXIO_BASE_URL/assets" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "file=@./reference.png")

FILE_NAME=$(printf '%s' "$UPLOAD" | jq -er '.uploads[0].fileName')
```

The upload response returns storage metadata but not the asset row ID. Resolve
the managed asset through the asset list before later CRUD operations:

```bash
ASSETS=$(curl -fsS --get "$PIXIO_BASE_URL/assets" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  --data-urlencode "source=upload" \
  --data-urlencode "search=$FILE_NAME" \
  --data-urlencode "limit=10")

ASSET_ID=$(printf '%s' "$ASSETS" | jq -er \
  --arg name "$FILE_NAME" '.data | map(select(.fileName == $name)) | first | .id')
```

## Read And Refresh URL

```bash
curl -fsS "$PIXIO_BASE_URL/assets/$ASSET_ID?source=upload" \
  -H "Authorization: Bearer $PIXIO_API_KEY" | jq
```

Persist `ASSET_ID`; do not persist a signed URL as the durable identifier.

## Rename

```bash
curl -fsS -X PATCH "$PIXIO_BASE_URL/assets/$ASSET_ID?source=upload" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"campaign-approved-reference.png"}' | jq
```

## Get Download URL

```bash
curl -fsS "$PIXIO_BASE_URL/assets/$ASSET_ID/download?source=upload" \
  -H "Authorization: Bearer $PIXIO_API_KEY" | jq
```

## Delete With Explicit Intent

```bash
curl -fsS -X DELETE "$PIXIO_BASE_URL/assets/$ASSET_ID?source=upload" \
  -H "Authorization: Bearer $PIXIO_API_KEY" | jq
```

Do not put deletion in generic retry middleware.
