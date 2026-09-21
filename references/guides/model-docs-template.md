# Model-Specific Documentation Template

Use this only after fetching the selected model from `/models/{id}` and
`/pricing?modelId=`. Replace all placeholders with live values; omit
unsupported params instead of guessing.

````markdown
# <Model Name> Through The Pixio API

## Environment

```bash
export PIXIO_BASE_URL="https://beta.pixio.myapps.ai/api/v1"
export PIXIO_API_KEY="pxio_live_..."
export MODEL_ID="<public pixio/... id>"
```

Keep `PIXIO_API_KEY` in a trusted server, worker, CLI, or secret store.

## Verify Model, Inputs, And Price

```bash
curl -fsS "$PIXIO_BASE_URL/models/$MODEL_ID" -H "Authorization: Bearer $PIXIO_API_KEY"
curl -fsS "$PIXIO_BASE_URL/pricing?modelId=$MODEL_ID" -H "Authorization: Bearer $PIXIO_API_KEY"
```

Model:

- ID: `<model id>`
- Type: `<model type>`
- Company: `<company>`
- List price: `<listCredits>`; your price: `<yourCredits>`
- Pricing basis: `<flat | rate per unit | varies by options>`; measured from
  file: `<yes/no>`
- Plan tier: `<freeForCurrentPlan>`, Maker pool `<makerCap.slug or none>`

Inputs:

- `<name>` (`<type>`, required/optional): `<label>`; constraints
  `<maxBytes / maxSeconds / accepts>`

## Prepare Media

Use `/uploads`, `/media`, or `/images` according to the input type. Never send
local paths in JSON. Check `constraints` before uploading.

## Quote The Exact Request

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/generations/estimate" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"modelId":"<model id>","params":{<exact params>}}'
```

Read `quote.status` (`measured` vs `provisional`) and `quote.expectedDebit`.

## Generate

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/generate" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -H "Idempotency-Key: <stable unique id>" \
  -d '{"modelId":"<model id>","params":{<exact params>}}'
```

Save `contentId`. HTTP `202` means queued.

## Poll

```bash
curl -fsS "$PIXIO_BASE_URL/generations/<contentId>" -H "Authorization: Bearer $PIXIO_API_KEY"
```

Poll `pending`/`processing`; stop on `succeeded`/`failed`. Read `billing` for
the settled cost. Refresh expired output URLs through this route.

## Account And Errors

- `/me` for the account-wide `concurrencyLimit` and `makerCaps`.
- `/credits/ledger?generationId=` for the exact charge.
- Handle `400`, `401`, `402`, `404`, `422 content_policy`, `429
  concurrency_limit`, `500`, `502`, `503`.
- Retry `/generate` only with the same `Idempotency-Key`.
````
