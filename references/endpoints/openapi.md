# GET /api/v1/openapi.json

Public OpenAPI 3.1 discovery route. It contains no secrets and requires no key.

```bash
curl -fsS "$PIXIO_BASE_URL/openapi.json"
```

Recommended environment:

```bash
export PIXIO_BASE_URL="https://beta.pixio.myapps.ai/api/v1"
export PIXIO_API_KEY="pxio_live_..."
```

## Uses

- inspect the deployed route surface before integration;
- generate typed clients and tool schemas;
- import the API into Postman, Insomnia, Bruno, or API gateways;
- compare a deployed contract with cached skill references;
- expose route schemas to an agent without exposing an API key.

## Current Domains

The spec covers discovery, models/params, prompt optimization, estimates,
generation lifecycle, media ingestion, complete asset lifecycle, credits,
ledger, subscription/concurrency, and saved workflow runs.

## Important Limits

- OpenAPI does not enumerate the live model catalog.
- Model-specific params remain dynamic and account/plan-sensitive.
- Fetch `/models` and `/models/{id}` or `/params` at runtime.
- Generated clients still need custom polling, retry, signed-URL refresh, and
  ambiguous-submission reconciliation logic.
- The spec describes `/api/v1`; it does not authorize app-internal routes.

## Generated Client Example

```bash
npx openapi-typescript \
  "https://beta.pixio.myapps.ai/api/v1/openapi.json" \
  --output pixio-api.types.ts
```

Keep the generated file reproducible. Do not commit an API key or bake it into
the generated client.
