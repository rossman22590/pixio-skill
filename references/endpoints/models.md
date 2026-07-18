# Model Discovery

All model routes require a Pixio API key. Results are filtered for the key's
account and plan.

## List Visible Models

```bash
curl -fsS "$PIXIO_BASE_URL/models" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

Response:

```json
{
  "models": [
    {
      "id": "pixio/example/model",
      "providerId": "pixio",
      "name": "Example Model",
      "description": "...",
      "type": "text-to-image",
      "credits": 10,
      "company": "Example",
      "inputs": []
    }
  ]
}
```

## Query One Model From The List Route

```bash
curl -fsS --get "$PIXIO_BASE_URL/models" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  --data-urlencode "modelId=pixio/example/model"
```

Returns `{ "model": { ... } }` using the list-model shape.

## Get Model Detail And Params

Slash-delimited model IDs are part of the path:

```bash
curl -fsS "$PIXIO_BASE_URL/models/pixio/example/model" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

Returns:

```json
{
  "model": {
    "id": "pixio/example/model",
    "providerId": "pixio",
    "name": "Example Model",
    "description": "...",
    "type": "text-to-image",
    "credits": 10,
    "company": "Example"
  },
  "params": [
    {
      "name": "prompt",
      "type": "string",
      "label": "Prompt",
      "required": true,
      "defaultValue": null,
      "placeholder": "Describe the output"
    }
  ]
}
```

`GET /params?modelId=...` returns the same detail shape.

## Selection Rules

- Filter by returned `type`, required media inputs, user goal, and estimated
  cost. Do not select by name alone.
- Never transform a company/provider model name into a guessed `pixio/...` ID.
- Never call provider APIs directly. `providerId` is always public `pixio`.
- Model availability and inputs can vary by plan; refresh rather than cache
  indefinitely.
- A `404` means malformed, hidden, unavailable, or unknown for this account.
