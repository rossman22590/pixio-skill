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
      "defaultCredits": 120,
      "fromCredits": null,
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

- `credits`: the raw catalog price. It is an exact price only for a flat-priced
  model; for a per-second model it is a rate, and for an option-priced model a
  floor. For a model billed per second of an uploaded file this is almost never
  the price paid.
- `defaultCredits`: what a request that supplies no params costs. Budget
  against this rather than `credits`.
- `fromCredits`: the cheapest option combination, or `null` where options do
  not drive the price. The same field appears on `GET /pricing`.
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

Returns `{ model, params, outputs }`. `params` entries carry `constraints`, and
`outputs` is `{ format: "json" | "file", hasFileUrl }` (a `json` model returns a
structured result and no output file); see `params.md`. The detail `model`
object is the short form: it omits `pricing`, `defaultCredits`,
`fromCredits`, and `inputs` (the inputs are the `params` array).
`GET /params?modelId=...` returns the same shape. An unknown or hidden ID is
`404` (`model_not_found`, or `not_found` on the path form for a malformed ID).

## Selection Rules

- Filter by `type`, required media inputs, user goal, `yourCredits` from
  `/pricing`, and `freeForCurrentPlan`. Do not select by name alone.
- Never transform a company or provider model name into a guessed `pixio/...`
  ID.
- Never call provider APIs directly. `providerId` is always `pixio`.
- Availability and inputs vary by plan; refresh rather than cache indefinitely.
- A `404` means malformed, hidden, unavailable, or unknown for this account
  (`model_not_found`).
- Every `id` this route lists always runs the model it lists. Send it
  verbatim: a loose or partial id that matches more than one model is `404
  model_not_found` with "Ambiguous Pixio API model: <id>. Use the id listed by
  GET /api/v1/models." The `modelId` returned on generations, assets, and the
  prompt library is the same canonical listed id and can be passed back to
  `/generate`.
- Since 2026-10-02, four short ids that previously ran a different model than
  the one listed now run the listed model: `pixio/edit`, `pixio/remix`,
  `pixio/reframe`, and `pixio/image-to-3d`. Re-check output and cost if you
  depended on their old behavior.
- For any model with `pricing.rate`, quote with `/generations/estimate` and the
  real file before promising a cost.

## Related Routes

- `model-favorites.md`: `GET/POST/DELETE /models/favorites`.
- `preferences.md`: read-only quick-action default models.
- `pricing.md`: the whole catalog priced for this account.
