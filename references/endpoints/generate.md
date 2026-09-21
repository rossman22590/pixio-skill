# POST /api/v1/generate

Queue one media generation. This route can spend credits and start provider work.

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/generate" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: order-8812-hero-v1" \
  -d '{
    "modelId": "pixio/example/model",
    "params": {
      "prompt": "premium studio product photograph"
    }
  }'
```

Body:

```json
{
  "modelId": "pixio/example/model",
  "providerId": "pixio",
  "params": {}
}
```

- `modelId` is required and must come from `/models` or `/pricing`.
- `providerId` is optional; when supplied, use `pixio`.
- `params` defaults to `{}` and must follow the selected model's live schema.
- Internal-only parameter names are silently stripped whatever the caller
  sends. The request still proceeds. Do not attempt to control queueing or
  billing behaviour through undocumented params.

## Idempotency-Key Header

Opt-in replay protection. Send a stable, unique value (at most 255 characters)
per logical submission.

- First request with a key: normal `202` and the key is recorded on the job.
- Repeat with the same key within 24 hours: `200` with the original job.

```json
{
  "contentId": "generation-id",
  "status": "processing",
  "idempotentReplay": true,
  "createdAt": "2026-09-20T10:00:00.000Z"
}
```

- Empty or oversized key: `400 { "error": "invalid_idempotency_key", "message" }`.
- Keys are scoped to the account; a key can never reach another account's job.
- Without a key, identical requests are treated as distinct jobs on purpose.

Always send a key from retrying clients, queues, and serverless functions.

## Accepted Response

HTTP `202`:

```json
{
  "success": true,
  "message": "Generation started successfully!",
  "contentId": "generation-id",
  "providerId": "pixio",
  "modelId": "pixio/example/model"
}
```

Persist `contentId` immediately and poll `/generations/{contentId}`.

## Preflight

1. `GET /me` for `concurrencyLimit` and credits.
2. `GET /models/{id}` to confirm visibility, inputs, and `constraints`.
3. Normalize or upload local media.
4. `POST /generations/estimate` with the same body; read `quote`.
5. Apply the approval policy to `quote.expectedDebit`.

## Media Ingestion

Public HTTP(S) URLs inside declared media params are imported into Pixio assets
before provider dispatch. Private hosts, localhost, non-media responses, and
unsupported or oversized media fail with:

```json
{ "error": "invalid_media_url", "message": "..." }
```

Temporary imports are cleaned up if dispatch fails. Per-second models measure
the decoded duration of the imported file server-side; a caller-supplied
duration value never affects billing.

## Failure Semantics

| Status | Body | Meaning |
|---:|---|---|
| 400 | `{ error }` or `{ error: "invalid_media_url", message }` or `{ error: "invalid_idempotency_key", message }` | Invalid params, media, or header. |
| 401 | `{ error }` | Missing, invalid, or revoked key. |
| 402 | `{ error: "Insufficient credits", availableCredits, requiredCredits, shortfall }` | Credit decision. |
| 404 | `{ error }` | Model malformed, hidden, unavailable, or unknown for this account. |
| 422 | `{ code: "content_policy", message, inputHint?, inputsSubmitted? }` | Rejected by a content check. Will not succeed unchanged. `inputHint` names the input when identified; otherwise `inputsSubmitted` lists the search space. The matched content is never returned. |
| 429 | `{ error, code: "concurrency_limit", message, generationId?, status?, concurrencyLimit, retryAfter }` + `Retry-After: 10` | Per-account limit on API generations running at once, shared by every key and every generate route. Not a Maker daily allowance. |

## Concurrency Rule

The limit comes from the plan (1 on most plans, 10 on Maker) and is returned as
`concurrencyLimit` by `GET /me`. A `429` is a rejection, not a queue. Poll the
returned `generationId` to a terminal state, then retry. Do not wait hours
expecting a daily pool to reset; that is `makerCaps`, a separate mechanism.

## Duplicate-Dispatch Rule

With an `Idempotency-Key`, retry the identical request after any ambiguous
failure; a replay is safe. Without one, do not submit again immediately. Query
`GET /generations?status=pending` and `?status=processing`, match by model,
params, and time, and resume polling if found. Ask before resubmitting when the
result remains ambiguous.
