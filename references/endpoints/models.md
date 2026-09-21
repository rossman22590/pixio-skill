# Model Discovery

All model routes require a Pixio API key. Results are filtered for the key's
account and plan. Every public ID starts with `pixio/`.

## List Visible Models

```bash
curl -fsS "$PIXIO_BASE_URL/models" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

```json
{
  "models": [
    {
      "id": "pixio/example/model",
      "providerId": "pixio",
      "name": "Example Model",
      "description": "...",
      "type": "image-to-video",
      "credits": 120,
      "company": "Example",
      "pricing": {
        "rate": 24,
        "rateUnit": "second",
        "rateQuantity": 1,
        "rounding": "ceil",
        "minCredits": 24,
        "maxUnits": 600,
        "basisInput": "audio_url",
        "measured": true
      },
      "freeForPlans": ["maker"],
      "freeForCurrentPlan": true,
      "makerCap": {
        "slug": "maker-avatars",
        "label": "Avatars",
        "dailyLimit": 5,
        "rollingWindowSeconds": 86400
      },
      "inputs": []
    }
  ]
}
```

Field meanings:

- `credits`: the list price at the pricing rule's defaults. For a model billed
  per second of an uploaded file this is almost never the price paid.
- `pricing`: how the model is priced. `rate` per `rateQuantity` of `rateUnit`;
  `basisInput` is the param the quantity comes from; `measured: true` means
  the server measures that quantity from your file and ignores any value you
  send. Flat models carry no `rate`; option-dependent rules read as
  "varies by options".
- `freeForPlans`: plans that include this model.
- `freeForCurrentPlan`: whether this account's plan pays nothing while its
  pool has uses left.
- `makerCap`: the daily free-use pool, or `null`. Join `slug` to
  `GET /me` → `makerCaps` for `remainingToday`.

Your plan's included models in one line:

```bash
curl -fsS "$PIXIO_BASE_URL/models" -H "Authorization: Bearer $PIXIO_API_KEY" \
  | jq '[.models[] | select(.freeForCurrentPlan) | .id]'
```

## Query One Model From The List Route

```bash
curl -fsS --get "$PIXIO_BASE_URL/models" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  --data-urlencode "modelId=pixio/example/model"
```

Returns `{ "model": { ... } }` using the list shape.

## Get Model Detail And Params

Slash-delimited IDs are part of the path:

```bash
curl -fsS "$PIXIO_BASE_URL/models/pixio/example/model" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

Returns `{ model, params }`. `params` entries carry `constraints` and the
model may carry an `outputs` descriptor; see `params.md`.
`GET /params?modelId=...` returns the same shape.

## Selection Rules

- Filter by `type`, required media inputs, user goal, `yourCredits` from
  `/pricing`, and `freeForCurrentPlan`. Do not select by name alone.
- Never transform a company or provider model name into a guessed `pixio/...`
  ID.
- Never call provider APIs directly. `providerId` is always `pixio`.
- Availability and inputs vary by plan; refresh rather than cache indefinitely.
- A `404` means malformed, hidden, unavailable, or unknown for this account.
- For any model with `pricing.rate`, quote with `/generations/estimate` and the
  real file before promising a cost.

## Related Routes

- `model-favorites.md`: `GET/POST/DELETE /models/favorites`.
- `preferences.md`: read-only quick-action default models.
- `pricing.md`: the whole catalog priced for this account.
