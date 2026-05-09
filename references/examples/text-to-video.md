# Example: Text To Video

Use a text-to-video model when the user provides a prompt and wants a video.

## Discover A Visible Model

```bash
curl https://beta.pixio.myapps.ai/api/v1/models \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

Pick a visible `text-to-video` model from the returned catalog.

## Fetch Params

```bash
curl "https://beta.pixio.myapps.ai/api/v1/params?modelId=pixio/seedance-2-maker" \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

Use the exact params returned by the API.

## Start Generation

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/generate \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "pixio",
    "modelId": "pixio/seedance-2-maker",
    "params": {
      "prompt": "a cinematic product video of a glass perfume bottle on a glossy black surface",
      "duration": "5",
      "aspect_ratio": "16:9",
      "resolution": "480p",
      "audio": "true"
    }
  }'
```

## Poll Until Complete

```bash
curl "https://beta.pixio.myapps.ai/api/v1/generations/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

Return `outputUrl`, `outputs.videoUrl`, and `outputs.thumbnailUrl` when present.
