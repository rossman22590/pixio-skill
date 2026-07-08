# POST /api/v1/generate

Start a Pixio generation.

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/generate \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "modelId": "pixio/nano-banana/edit",
    "params": {
      "prompt": "turn this product photo into a clean studio ad",
      "image_url": "https://example.com/reference.png",
      "aspect_ratio": "1:1",
      "output_format": "png"
    }
  }'
```

## Request Body

```json
{
  "modelId": "pixio/nano-banana/edit",
  "params": {}
}
```

- `providerId`: optional. If included, use `pixio`.
- `modelId`: public Pixio model id from `/api/v1/models`.
- `params`: object shaped from `/api/v1/params`.

## Accepted Response

HTTP status: `202`.

```json
{
  "success": true,
  "message": "Generation started successfully!",
  "contentId": "00000000-0000-0000-0000-000000000000",
  "providerId": "pixio",
  "modelId": "pixio/nano-banana/edit"
}
```

Save `contentId` and poll `/api/v1/generations/{id}`.

## Important Behavior

- This endpoint returns before generation finishes.
- Public media URLs inside media params are imported into Pixio assets first.
- Credits are checked before a successful generation is created.
- API jobs appear in the Pixio account's history.
- API concurrency is account-wide across all API keys.
- The route returns public `providerId` and `modelId` values even when an internal provider handles the job.

## Agent Rules

- Never invent params.
- Use `/api/v1/params` before calling generate.
- For user-provided local files, upload first.
- Surface `402`, `429`, and validation errors clearly to the user.
