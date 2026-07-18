# Example: Cost-Aware Generation

This recipe discovers a model, validates params, estimates cost, submits once,
and polls. It uses `jq` for JSON extraction.

```bash
export PIXIO_BASE_URL="https://beta.pixio.myapps.ai/api/v1"
export PIXIO_API_KEY="pxio_live_..."
export MODEL_ID="pixio/example/model"
```

## 1. Verify Account And Model

```bash
curl -fsS "$PIXIO_BASE_URL/subscription" \
  -H "Authorization: Bearer $PIXIO_API_KEY" | jq

curl -fsS "$PIXIO_BASE_URL/models/$MODEL_ID" \
  -H "Authorization: Bearer $PIXIO_API_KEY" | jq
```

## 2. Prepare One Exact Request

```bash
REQUEST='{
  "modelId": "pixio/example/model",
  "params": {
    "prompt": "premium studio photograph of a red running shoe",
    "aspect_ratio": "1:1"
  }
}'
```

Replace the example fields with values accepted by the live model detail.

## 3. Estimate And Approve

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/generations/estimate" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$REQUEST" | jq
```

Apply the application's approval threshold before continuing.

## 4. Submit Once

```bash
RESPONSE=$(curl -fsS -X POST "$PIXIO_BASE_URL/generate" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$REQUEST")

CONTENT_ID=$(printf '%s' "$RESPONSE" | jq -er '.contentId')
printf 'queued %s\n' "$CONTENT_ID"
```

Persist `CONTENT_ID` before polling.

## 5. Poll

```bash
while true; do
  RESULT=$(curl -fsS "$PIXIO_BASE_URL/generations/$CONTENT_ID" \
    -H "Authorization: Bearer $PIXIO_API_KEY")
  STATUS=$(printf '%s' "$RESULT" | jq -r '.status')

  case "$STATUS" in
    succeeded)
      printf '%s\n' "$RESULT" | jq '{id,status,modelId,creditsCost,outputUrl,outputUrlExpiresAt,outputs}'
      break
      ;;
    failed)
      printf '%s\n' "$RESULT" | jq '{id,status,error,creditsCost}' >&2
      exit 1
      ;;
    pending|processing)
      sleep 4
      ;;
    *)
      printf 'unexpected status: %s\n' "$STATUS" >&2
      exit 2
      ;;
  esac
done
```
