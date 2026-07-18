# POST /api/v1/generate

Queue one media generation. This route can spend credits and start provider work.

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/generate" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
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

- `modelId` is required and must come from `/models`.
- `providerId` is optional; when supplied, use `pixio`.
- `params` defaults to `{}` and must follow the selected model's live schema.

Accepted response is HTTP `202`:

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

Before dispatch:

1. confirm model visibility;
2. validate exact params and enum values;
3. normalize/upload local media;
4. call `/generations/estimate` when cost matters;
5. compare estimate with `/credits` and approval policy;
6. check `/subscription` for worker concurrency sizing.

## Media Ingestion

Public HTTP(S) URLs inside declared media params are imported into Pixio assets
before provider dispatch. Private hosts, localhost, non-media responses, and
unsupported/oversized media fail with `400 invalid_media_url`. Temporary imports
are cleaned up if generation dispatch fails.

## Failure Semantics

- `400`: invalid params/media or dispatch error;
- `401`: invalid/revoked key;
- `402`: insufficient credits with balance and shortfall fields;
- `404`: model missing, malformed, hidden, or unavailable;
- `429`: account-wide API concurrency limit reached.

## Duplicate-Dispatch Rule

The route does not accept an idempotency key. If the connection fails after the
request was sent, do not immediately submit again. Query recent `/generations`
and reconcile by model, params, and creation time. Ask before resubmitting when
the result remains ambiguous.
