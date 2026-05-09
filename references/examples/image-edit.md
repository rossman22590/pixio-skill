# Example: Image Edit

Use an image edit model when the user wants to transform an existing image.

## Discover Models

```bash
curl https://beta.pixio.myapps.ai/api/v1/models \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

Pick a visible image edit model such as:

```text
pixio/nano-banana/edit
```

## Fetch Params

```bash
curl "https://beta.pixio.myapps.ai/api/v1/params?modelId=pixio/nano-banana/edit" \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

## Generate With Public Image URL

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/generate \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "pixio",
    "modelId": "pixio/nano-banana/edit",
    "params": {
      "prompt": "make this product photo look like a clean premium studio ad",
      "image_url": "https://example.com/reference.png",
      "aspect_ratio": "1:1",
      "output_format": "png"
    }
  }'
```

## Poll

```bash
curl "https://beta.pixio.myapps.ai/api/v1/generations/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer pxio_live_your_api_key"
```
