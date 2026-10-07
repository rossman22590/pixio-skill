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

- `modelId` is required and must come from `/models` or `/pricing`. Every id
  `GET /models` lists always runs the model it lists. A loose or partial id
  that matches more than one model is `404 model_not_found` ("Ambiguous Pixio
  API model: <id>. Use the id listed by GET /api/v1/models."). The `modelId`
  in the response is the canonical listed id, whatever spelling was sent.
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
  "createdAt": "2026-09-20T10:00:00.000Z",
  "providerId": "pixio",
  "modelId": "pixio/example/model"
}
```

- `providerId` and `modelId` describe the stored original job, the same id
  `GET /generations` shows, even when the retry sent a different `modelId`.
  They are included whenever that model can still be resolved (best effort: a
  model hidden since the original call does not turn a retry into an error, it
  just omits the two fields). A replay carries no billing fields; read
  `creditsCost` on `GET /generations/{id}`.
- Empty or oversized key:
  `400 { "error": "invalid_idempotency_key", "code": "invalid_idempotency_key", "message" }`.
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
  "modelId": "pixio/example/model",
  "creditsCharged": 0,
  "freeAllowance": {
    "slug": "maker-video",
    "label": "Video daily",
    "dailyLimit": 8,
    "remainingToday": 5,
    "nextAllowanceAt": null
  },
  "notCoveredBy": null
}
```

Persist `contentId` immediately and poll `/generations/{contentId}`.

Billing fields (additive; older clients can ignore them):

- `creditsCharged`: credits this job debits when it succeeds. `0` means the
  plan or a daily free pool covered it. `null` if it could not be read; the job
  still started.
- `freeAllowance`: the model's daily free pool after this job (`dailyLimit`,
  `remainingToday`, `nextAllowanceAt`), or `null` when the account's plan has
  no pool for this model. `nextAllowanceAt` is when the oldest use in the
  rolling window ages out, or `null` when a free use is available now.
- `notCoveredBy`: set when the plan includes the model but a setting is never
  free (see `freeExcept` on `/models`) or a value is over the free limit
  (`freeUpTo`, e.g. audio longer than 30 seconds), so the job bills full price
  even with free uses left. Example:
  `{ "settings": { "resolution": "1080p" }, "message": "resolution=1080p is not covered by the free allowance, so this bills full price." }`.
  A job billed this way does not use a free slot.

When a covered model stops being free, the response says so: `creditsCharged`
becomes non-zero with either `freeAllowance.remainingToday == 0` (pool spent)
or `notCoveredBy` set (setting excluded). Report that to the user instead of
assuming the run was free.

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
{ "error": "invalid_media_url", "code": "invalid_media_url", "message": "..." }
```

Any Pixio storage path or Pixio storage URL anywhere in `params` must belong
to the calling account. A reference to another account's file, including that
account's signed storage link (for example a public gallery output), is
refused before anything is dispatched or billed:

```json
{ "error": "invalid_media_url", "code": "invalid_media_url", "message": "One or more media inputs reference a file that does not belong to this account." }
```

To use such a file, download it and upload it through `POST /media` first.
Public third-party HTTPS URLs are unaffected.

Temporary imports are cleaned up if dispatch fails. Per-second models measure
the decoded duration of the imported file server-side; a caller-supplied
duration value never affects billing.

## Failure Semantics

Every error body is `{ error, code, ... }`; branch on `code` (see
`../overview.md`, "Error envelope"). Every failure raised by the generation
pipeline is a `400` (there is no `403`, `500`, or `502` from it); the `code`
says which kind.

| Status | `code` | Body | Meaning |
|---:|---|---|---|
| 400 | `invalid_json` | `{ error, code }` | The body is not valid JSON. |
| 400 | `invalid_request` | `{ error, code, details }` for a failed schema check; `{ error, code }` with the sentence, returned unchanged, for a pre-dispatch rule (input limit, media duration, a param the model rejects) | Correct the request; do not resend it unchanged. |
| 400 | `provider_error` | `{ error, code }` | The model provider rejected the request. The message is sanitized: it never names the provider or returns a raw upstream body. Change the input before retrying. |
| 400 | `model_unavailable` | `{ error: "Model is unavailable on the Pixio API.", code }` | The model resolved but cannot run on the API. Pick another model. |
| 400 | `plan_restricted` | `{ error: "This model is not available on your current plan.", code }` | Choose another model or upgrade. |
| 400 | `maker_in_flight` | `{ error: "Please wait until your current Maker generation finishes before starting another.", code }` | A Maker generation is still running; wait for it to finish, then retry. No `Retry-After`. |
| 400 | `generation_failed` | `{ error: "Generation request failed", code }` | The generation could not be started. Reconcile, then retry with the same `Idempotency-Key`. |
| 400 | `server_error` | `{ error: "Pixio Server Error. Please try again later.", code }` | A Pixio-side outage, not a problem with the request. Retry later with the same `Idempotency-Key`. A generation that fails this way after dispatch reports the same sentence in `error`. |
| 400 | `invalid_media_url` | `{ error: "invalid_media_url", code, message }` | A media URL could not be imported, or a storage path or storage URL in `params` belongs to another account. |
| 400 | `invalid_idempotency_key` | `{ error: "invalid_idempotency_key", code, message }` | Empty or oversized `Idempotency-Key`. |
| 401 | `missing_api_key`, `invalid_api_key` | `{ error, code }` | Missing, invalid, or revoked key. |
| 402 | `insufficient_credits` | `{ error: "Insufficient credits", code, availableCredits, requiredCredits, shortfall }` | Credit decision. |
| 404 | `model_not_found` | `{ error, code }` | The model id did not resolve: unknown, hidden, disabled, or not on the account's plan, or a loose id matched more than one model ("Ambiguous Pixio API model: ..."). |
| 422 | `price_unavailable` | `{ error, code }` | The model's price could not be worked out for these settings, so nothing was generated or charged. Try different settings; do not resend unchanged. |
| 422 | `content_policy` | `{ error, code, message, inputHint, inputsSubmitted }` | Rejected by a content check. Will not succeed unchanged. `error` repeats `message`. `inputHint` names the input when identified (otherwise `null`); `inputsSubmitted` lists the search space. The matched content is never returned. |
| 429 | `concurrency_limit` | `{ error, code, message, generationId?, status?, concurrencyLimit, retryAfter }` + `Retry-After: 10` | Per-account limit on API generations running at once, shared by every key and every generate route. Not a Maker daily allowance. |
| 503 | `service_unavailable` | `{ error, code }` | API-key storage unavailable; back off. |

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
