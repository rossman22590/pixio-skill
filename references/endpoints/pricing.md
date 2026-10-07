# GET /api/v1/pricing

The live price list for the calling account. Every model the key can reach,
with the list price and what this account is actually charged, plus plan and
credit-pack prices so credits can be turned into dollars.

```bash
curl -fsS "$PIXIO_BASE_URL/pricing" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

Query:

- `type`: optional model type filter, for example `text-to-image`,
  `image-to-video`.
- `modelId`: optional full public ID; returns only that model or `404`.

The response is served with `Cache-Control: private, no-store`. Prices move
with the catalog and with today's free-pool usage. Read it; never cache it.

## Response

```json
{
  "generatedAt": "2026-09-20T10:00:00.000Z",
  "currency": "credits",
  "account": { "plan": "maker", "credits": { "recurring": 3000, "permanent": 407, "total": 3407 } },
  "usdPerCredit": 0.01,
  "plans": [{ "id": "...", "name": "...", "credits": 15000, "usd": 99, "usdPerCredit": 0.0066 }],
  "creditPacks": [{ "id": "...", "credits": 1000, "usd": 10, "usdPerCredit": 0.01 }],
  "dailyFreePools": [{ "slug": "maker-avatars", "label": "Avatars", "dailyLimit": 5, "remainingToday": 2 }],
  "models": [
    {
      "id": "pixio/example/model",
      "name": "Example Model",
      "type": "image-to-video",
      "company": "Example",
      "listCredits": 120,
      "yourCredits": 0,
      "fromCredits": null,
      "pricedFromParams": false,
      "free": true,
      "freeReason": "daily_pool",
      "discountPercent": 0,
      "creditsAfterPool": 120,
      "pricing": { "rate": 24, "rateUnit": "second", "rateQuantity": 1, "rounding": "ceil", "minCredits": 24, "basisInput": "audio_url", "measured": true },
      "yourRate": 24,
      "freeForPlans": ["maker"],
      "freeForCurrentPlan": true,
      "makerCap": { "slug": "maker-avatars", "label": "Avatars", "dailyLimit": 5, "rollingWindowSeconds": 86400 },
      "freeExcept": null,
      "freeUpTo": null
    }
  ],
  "notes": ["yourCredits assumes today's free pool still has room. ..."]
}
```

Field meanings per model:

- `listCredits`: catalog list price at the pricing rule defaults.
- `yourCredits`: the charge for this account at the defaults, after plan
  discounts, plan-free models, and today's free pools.
- `fromCredits`: the cheapest option combination; set only where options drive
  the price.
- `pricedFromParams`: the price comes entirely from what you send, so a `0`
  is an empty request rather than a free model.
- `free` and `freeReason`: whether and why this account pays nothing now.
- `discountPercent`: derived from the computed prices, not from plan config,
  so it is never advertised where the biller does not apply it.
- `creditsAfterPool`: the price once today's free pool is spent.
- `pricing`: how the price is built. When it carries a `rate`, the model bills
  `yourRate` credits per `rateQuantity` of `rateUnit`, so the single credit
  figure is only the default-quantity price. `measured: true` means the server
  measures the quantity from the file you upload.
- `freeForPlans`, `freeForCurrentPlan`, `makerCap`, `freeExcept`, `freeUpTo`: same tier
  fields as `/models`. `yourCredits` is priced at the defaults, so a model whose
  default setting is in `freeExcept` shows its full price there.

## Agent Rules

- Use `yourCredits` for ranking and budgeting, never `listCredits`.
- For any model with `pricing.rate`, quote with `POST /generations/estimate`
  and the real file before promising a price.
- Turn credits into dollars with `usdPerCredit` (cheapest pack) or a specific
  plan's `usdPerCredit`.
- Show the ten cheapest models for this account:

```bash
curl -fsS "$PIXIO_BASE_URL/pricing" -H "Authorization: Bearer $PIXIO_API_KEY" \
  | jq '[.models[] | {id, yourCredits}] | sort_by(.yourCredits) | .[:10]'
```
