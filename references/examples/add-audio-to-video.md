# Example: Add Audio To Video

Model:

```text
pixio/video-ops/add-audio
```

## Check Params

```bash
curl "https://beta.pixio.myapps.ai/api/v1/params?modelId=pixio/video-ops/add-audio" \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

Expected core params:

- `videoUrl`: required media input.
- `audioUrl`: required media input.
- `startAt`: optional number.
- `audioVolume`: optional number.

## Generate With Public URLs

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/generate \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "pixio",
    "modelId": "pixio/video-ops/add-audio",
    "params": {
      "videoUrl": "https://example.com/reference.mp4",
      "audioUrl": "https://example.com/audio.mp3",
      "startAt": 0,
      "audioVolume": 1
    }
  }'
```

## Upload Local Files First

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/uploads \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -F "file=@./video.mp4" \
  -F "file=@./audio.mp3"
```

Use returned asset values in `videoUrl` and `audioUrl` according to the model's accepted params.
