# Example: Text To Image

Use a text-to-image model when the user provides a prompt and wants one or more images.

## Discover A Visible Model

```bash
curl https://beta.pixio.myapps.ai/api/v1/models \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

Pick a visible image generation model from the returned catalog. Do not invent a model id.

## Fetch Params

Replace the model id below with the selected model:

```bash
curl "https://beta.pixio.myapps.ai/api/v1/params?modelId=pixio/flux/dev" \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

Use the exact params returned by the API. Common fields may include `prompt`, `aspect_ratio`, `output_format`, `seed`, or model-specific options.

## Start Generation

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/generate \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "pixio",
    "modelId": "pixio/flux/dev",
    "params": {
      "prompt": "a premium studio product photo of a glass perfume bottle on a glossy black surface",
      "aspect_ratio": "1:1",
      "output_format": "png"
    }
  }'
```

## Poll Until Complete

```bash
curl "https://beta.pixio.myapps.ai/api/v1/generations/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

Return `outputUrl` and any useful image fields from `outputs`.

## Expected Final Shape

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "status": "succeeded",
  "type": "image",
  "providerId": "pixio",
  "modelId": "pixio/flux/dev",
  "outputUrl": "https://cdn.pixio.ai/outputs/example.png",
  "outputs": {
    "imageUrl": "https://cdn.pixio.ai/outputs/example.png"
  },
  "creditsCost": 7
}
```

## Agent Rules

- Always fetch `/api/v1/params` before generating.
- Use only params accepted by the selected model.
- If the user asks for a style, put it in the prompt unless the model exposes a dedicated style param.
- If the user provides a reference image, switch to an image-edit/image-to-image model instead of text-to-image.
