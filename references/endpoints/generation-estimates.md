# POST /api/v1/generations/estimate

Estimate credit cost without creating a generation.

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

The body matches `/generate`:

```json
{
  "modelId": "pixio/example/model",
  "providerId": "pixio",
  "params": {}
}
```

`providerId` is optional. If supplied, use `pixio`.

Response:

```json
{
  "success": true,
  "modelId": "pixio/example/model",
  "currency": "credits",
  "baseCost": 20,
  "estimatedCost": 16
}
```

## Rules

- Estimate using the exact intended params because duration, resolution, count,
  quality, and other options may affect price.
- Re-estimate after changing any price-sensitive parameter.
- `estimatedCost` includes the account's plan discount.
- The estimate does not reserve credits and may not include every free allowance.
- Compare with `/credits` and the caller's approval/spend policy before dispatch.
- A successful estimate does not guarantee concurrency availability.
