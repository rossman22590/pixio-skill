# Generation Lifecycle Endpoints

## List Generations

```http
GET /api/v1/generations?status=succeeded&type=image&page=1&limit=20
```

Filters:

- `status`: `pending`, `processing`, `succeeded`, `failed`;
- `type`: `image`, `video`, `audio`, `3d`;
- `page`: integer at least 1, default 1;
- `limit`: 1–100, default 20.

Response:

```json
{
  "data": [],
  "page": 1,
  "limit": 20,
  "total": 0,
  "hasMore": false
}
```

Use history to resume polling after process restart and to reconcile an
uncertain `/generate` response before considering resubmission.

## Poll Or Get Detail

```bash
curl -fsS "$PIXIO_BASE_URL/generations/$CONTENT_ID" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

Response fields:

```json
{
  "id": "generation-id",
  "status": "succeeded",
  "type": "image",
  "providerId": "pixio",
  "modelId": "pixio/example/model",
  "params": {},
  "outputUrl": "https://signed-or-public-output",
  "outputUrlExpiresAt": "2030-01-01T00:00:00.000Z",
  "outputs": {},
  "assetVariants": {},
  "error": null,
  "creditsCost": 10,
  "createdAt": "...",
  "updatedAt": "...",
  "billedAt": "..."
}
```

Poll `pending` and `processing`. Stop on `succeeded` or `failed`. Prefer
`outputUrl`; also preserve useful typed fields under `outputs` and variants.

The detail output URL is refreshed with a seven-day signed URL when the stored
output is in Pixio object storage. Fetch detail again after expiration.

## Delete Generation

```bash
curl -fsS -X DELETE "$PIXIO_BASE_URL/generations/$CONTENT_ID" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

Returns `{ "deleted": true, "id": "..." }`. Deletion removes the owned record
and best-effort removes its stored output. It is not a cancellation endpoint and
must not be used as an automatic retry mechanism.

## Polling Policy

- Start around 2 seconds for images and 3–5 seconds for video/audio.
- Increase the interval gradually, cap it around 15 seconds, and add jitter in
  multi-worker systems.
- Persist the ID before sleeping.
- Respect caller cancellation and time budget without deleting the generation.
- On local timeout, return a resumable pending result with the ID.
