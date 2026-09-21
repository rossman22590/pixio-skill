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
  "data": [
    {
      "id": "generation-id",
      "status": "succeeded",
      "type": "image",
      "providerId": "pixio",
      "modelId": "pixio/example/model",
      "creditsCost": 10,
      "billedAt": "2026-09-20T10:01:00.000Z",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 0,
  "hasMore": false
}
```

`creditsCost` is the quoted price. `billedAt` is set only when credits were
actually debited; credits debit on the transition to `succeeded`, so failed
runs always have `billedAt: null`.

Use history to resume polling after a process restart and to reconcile an
uncertain `/generate` response before considering resubmission.

## Poll Or Get Detail

```bash
curl -fsS "$PIXIO_BASE_URL/generations/$CONTENT_ID" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

Response:

```json
{
  "id": "generation-id",
  "status": "succeeded",
  "type": "video",
  "providerId": "pixio",
  "modelId": "pixio/example/model",
  "params": {},
  "outputUrl": "https://signed-or-public-output",
  "outputUrlExpiresAt": "2026-09-27T10:00:00.000Z",
  "outputs": {},
  "assetVariants": {},
  "error": null,
  "creditsCost": 300,
  "createdAt": "...",
  "updatedAt": "...",
  "billedAt": "...",
  "billing": {
    "settledCost": 300,
    "refundedCredits": 0,
    "billedAt": "...",
    "ledger": {
      "entryIds": ["ledger-entry-id"],
      "matchedBy": "source_id"
    }
  },
  "media": {
    "input": "audio_url",
    "billedSeconds": 25,
    "rounding": "ceil"
  }
}
```

- `params` never includes reserved internal parameters.
- `billing.ledger.matchedBy` is `source_id` when the ledger movement carries a
  direct link, `timestamp` when it was matched on billing time and amount (a
  probable match, not proof), or `none`.
- `billing.refundedCredits` counts only directly linked refund rows.
- `media` appears for per-second models. Call `/generations/estimate` on the
  same file to see the decoded value the rounding was applied to.
- The detail output URL is refreshed with a seven-day signed URL when the
  stored output is in Pixio object storage. Fetch detail again after expiry.

Poll `pending` and `processing`. Stop on `succeeded` or `failed`. Prefer
`outputUrl`; preserve typed fields under `outputs` and `assetVariants`.

## Delete Generation

```bash
curl -fsS -X DELETE "$PIXIO_BASE_URL/generations/$CONTENT_ID" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

Returns `{ "deleted": true, "id": "..." }`.

Deletion semantics are strict:

- it deletes the generation record and best-effort removes stored output;
- it does not stop provider work already in flight;
- it does not avoid or reverse a charge; deleting after billing does not refund;
- provider-side cancellation of in-flight work is not available.

Never use deletion as a retry or cancellation mechanism.

## Polling Policy

- Start around 2 seconds for images and 3–5 seconds for video/audio.
- Increase the interval gradually, cap around 15 seconds, add jitter across
  workers.
- Persist the ID before sleeping.
- Respect caller cancellation and time budget without deleting the generation.
- On local timeout, return a resumable pending result with the ID. A timed-out
  request is not evidence the job failed.
