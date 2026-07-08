# GET /api/v1/generations/{id}

Poll a generation and fetch outputs.

```bash
curl "https://beta.pixio.myapps.ai/api/v1/generations/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

## Status Values

- `pending`
- `processing`
- `succeeded`
- `failed`

Poll until `succeeded` or `failed`.

## Response

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "status": "succeeded",
  "type": "image",
  "providerId": "pixio",
  "modelId": "pixio/nano-banana/edit",
  "params": {
    "prompt": "turn this product photo into a clean studio ad"
  },
  "outputUrl": "https://cdn.pixio.ai/outputs/example.png",
  "outputs": {
    "imageUrl": "https://cdn.pixio.ai/outputs/example.png"
  },
  "assetVariants": {},
  "error": null,
  "creditsCost": 4,
  "outputUrlExpiresAt": "1970-01-08T00:01:00.000Z",
  "createdAt": "1970-01-01T00:00:00.000Z",
  "updatedAt": "1970-01-01T00:01:00.000Z",
  "billedAt": "1970-01-01T00:00:00.000Z"
}
```

## Agent Rules

- Return `outputUrl` first when present.
- Also expose useful typed outputs, such as `outputs.imageUrl`, `outputs.videoUrl`, or `outputs.thumbnailUrl`.
- If `outputUrlExpiresAt` is non-null, the output URL is signed and should be refreshed by polling this endpoint again before reuse after expiration.
- If `status` is `failed`, show `error`.
- Do not expose internal API-key metadata. The API strips it from `params`.
