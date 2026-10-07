# POST /api/v1/generations/estimate

What one request will cost, computed by the same pipeline that charges for it.
The estimate runs the same pre-dispatch measurement, guards, and rounding as
`/generate`, so a quote and a charge come from one measurement.

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/generations/estimate" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "modelId": "pixio/example/model",
    "params": {
      "prompt": "premium studio product photograph",
      "aspect_ratio": "1:1"
    }
  }'
```

Body (same shape as `/generate`, plus one optional hint):

```json
{
  "modelId": "pixio/example/model",
  "providerId": "pixio",
  "params": {},
  "durationSeconds": 24
}
```

- `durationSeconds` (positive, at most 86400) prices a length you have not
  uploaded yet. It is ignored when the request carries media: the server
  measures the file, and the measurement is what bills.
- Every HTTP(S) URL in `params` is checked against the same public-internet
  guard `/generate` uses before anything probes it. External media is copied
  into the account's storage through the same pinned download `/generate`
  uses, measured from that copy, and the copy is deleted afterwards; a refused
  URL is `400 invalid_media_url`.

## Response

```json
{
  "success": true,
  "modelId": "pixio/example/model",
  "currency": "credits",
  "quote": {
    "status": "measured",
    "billingUnit": "second",
    "rate": 12,
    "rateQuantity": 1,
    "rounding": "ceil",
    "minimumCredits": 60,
    "maximumUnits": 600,
    "measured": {
      "input": "audio_url",
      "decodedSeconds": 24.14,
      "agreesWithBilling": true
    },
    "billedUnits": 25,
    "listCost": 300,
    "planDiscount": { "productId": "maker", "applied": false, "costAfterDiscount": 300 },
    "allowance": {
      "applied": false,
      "slug": "maker-avatars",
      "label": "Avatars",
      "dailyLimit": 5,
      "remainingToday": 0,
      "nextAllowanceAt": "2026-09-21T08:00:00.000Z"
    },
    "expectedDebit": 300
  },
  "baseCost": 300,
  "estimatedCost": 300,
  "pricing": {
    "rate": 12,
    "rateUnit": "second",
    "basisInput": "audio_url",
    "measured": true
  },
  "note": "This model is billed at 12 credits per second of audio, measured from the file you supply. Multiply the rate by your media length for the real cost."
}
```

Field meanings:

- `quote.status`: `measured` when the billed quantity came from the caller's
  own file; `provisional` when it came from a rule default or a
  `durationSeconds` hint. `provisionalReason` says which.
- `billingUnit`, `rate`, `rateQuantity`, `rounding`: how the price is built.
  Unit rules round `quantity / rateQuantity` with `rounding` before multiplying.
- `minimumCredits`: a floor on the total, not on the quantity.
- `maximumUnits`: a ceiling on the billed quantity.
- `measured.decodedSeconds`: the raw value the rounding was applied to.
- `billedUnits`: the rounded quantity that was priced.
- `listCost`: price before plan discount.
- `planDiscount`: discount applied for this plan.
- `allowance`: the Maker daily pool covering this model, or `null`. Only a
  Maker plan that includes the model sees it. `applied: true` means a free use
  covers this run.
- `expectedDebit`: what will actually be charged if the run succeeds now.
- `notCoveredBy`: present when the plan includes the model but a setting is
  never free (`freeExcept` on `/models`) or a value is over `freeUpTo`, so
  `expectedDebit` is full price even
  with uses left: `{ settings: { resolution: "1080p" }, message }`.
- `provisionalReason`: present only on a `provisional` quote.
- `baseCost` and `estimatedCost` are retained for older callers and equal
  `quote.listCost` and `quote.expectedDebit`.
- `pricing`: the same basis object `/models` and `/pricing` publish.
- `note`: present only for measured models.

An incomplete request is priced from the model's defaults and labelled
`provisional` rather than refused.

## Errors

| Status | Body | Meaning |
|---:|---|---|
| 400 | `{ error: "invalid_request", code: "invalid_request", message }` | The params or media cannot be billed as sent (for example a clip over the model limit). `/generate` would reject the same request. |
| 400 | `{ error, code: "invalid_json" }` or `{ error, code: "invalid_request", details }` | The body is not JSON, or failed schema validation. |
| 400 | `{ error: "invalid_media_url", code: "invalid_media_url", message }` | A Pixio storage path or storage URL in `params` belongs to another account (including its signed storage links, such as a public gallery output). `message`: "One or more media inputs reference a file that does not belong to this account." Download the file and upload it through `POST /media` first. Public third-party HTTPS URLs are unaffected. |
| 401 | `{ error, code }` | Bad key (`missing_api_key` / `invalid_api_key`). |
| 404 | `{ error, code: "model_not_found" }` | Model not found or not visible to this account, or a loose id matched more than one model ("Ambiguous Pixio API model: ..."); send the id `GET /models` lists. |
| 500 | `{ error, code: "internal_error" }` | Quote engine failure; do not assume a price. |

## Rules

- Estimate with the exact intended params and the real media file. For
  per-second models a `provisional` quote is arithmetic, not a price.
- Re-estimate after changing any price-sensitive parameter or file.
- Compare `expectedDebit` with `GET /me` `credits.total` and the caller's
  approval policy before dispatch.
- The estimate does not reserve credits and does not guarantee concurrency.
- A `402` from `/generate` is still authoritative when balance is short.
