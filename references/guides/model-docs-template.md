# Model-Specific Documentation Template

Use this only after fetching the selected model from `/models/{id}`. Replace all
placeholders with live values; omit unsupported params instead of guessing.

````markdown
# <Model Name> Through Pixio API

## Environment

```bash
export PIXIO_BASE_URL="https://beta.pixio.myapps.ai/api/v1"
export PIXIO_API_KEY="pxio_live_..."
export MODEL_ID="<public pixio/... id>"
```

Keep `PIXIO_API_KEY` in a trusted server, worker, CLI, or secret store.

## Verify Model And Inputs

```bash
curl -fsS "$PIXIO_BASE_URL/models/$MODEL_ID" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

Model:

- ID: `<model id>`
- Type: `<model type>`
- Company: `<company>`
- Catalog credits: `<base credits>`

Inputs:

- `<name>` (`<type>`, required/optional): `<label and constraints>`

## Prepare Media

For local media, use `/images`, `/media`, or `/uploads` according to the exact
input type. Do not send local filesystem paths in generation JSON.

## Estimate Exact Request

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/generations/estimate" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"modelId":"<model id>","params":{<exact params>}}'
```

## Generate

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/generate" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"modelId":"<model id>","params":{<exact params>}}'
```

Save `contentId`. HTTP `202` means queued, not complete.

## Poll

```bash
curl -fsS "$PIXIO_BASE_URL/generations/<contentId>" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

Poll `pending`/`processing`; stop on `succeeded`/`failed`. Refresh expired output
URLs through this route.

## Account And Errors

- Use `/subscription` for the live account-wide API concurrency limit.
- Use `/credits` for balance and `/credits/ledger` for recent charges/refunds.
- Handle `400`, `401`, `402`, `404`, `429`, `500`, `502`, and `503`.
- Do not blindly resubmit after an uncertain `/generate` timeout.
````
