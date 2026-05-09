# GET /api/v1/models

List Pixio models visible to the authenticated account.

```bash
curl https://beta.pixio.myapps.ai/api/v1/models \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

Optional single-model lookup:

```bash
curl "https://beta.pixio.myapps.ai/api/v1/models?modelId=pixio/nano-banana/edit" \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

## Response

List response:

```json
{
  "models": [
    {
      "id": "pixio/nano-banana/edit",
      "providerId": "pixio",
      "name": "Nano Banana Edit",
      "description": "Model description",
      "type": "image-to-image",
      "credits": 4,
      "company": "Pixio",
      "inputs": []
    }
  ]
}
```

Single response:

```json
{
  "model": {
    "id": "pixio/nano-banana/edit",
    "providerId": "pixio",
    "name": "Nano Banana Edit",
    "description": "Model description",
    "type": "image-to-image",
    "credits": 4,
    "company": "Pixio",
    "inputs": []
  }
}
```

## Agent Rules

- Use only returned `id` values as `modelId`.
- Do not show hidden/internal models.
- Do not invent a model id from a model name.
- If the user asks for a model not returned here, treat it as unavailable to this account.
