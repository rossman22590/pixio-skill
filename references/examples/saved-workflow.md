# Example: Run A Saved Workflow

The workflow definition must already be saved in the Pixio app.

## 1. List Workflows

```bash
curl -fsS "$PIXIO_BASE_URL/workflows" \
  -H "Authorization: Bearer $PIXIO_API_KEY" | jq
```

Select a returned workflow ID and use node IDs from its saved definition/editor.

## 2. Prepare Local Media

```bash
MEDIA=$(curl -fsS -X POST "$PIXIO_BASE_URL/media" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "file=@./product.mp4")

MEDIA_URL=$(printf '%s' "$MEDIA" | jq -er '.url')
```

## 3. Queue One Run

```bash
RUN=$(jq -n \
  --arg prompt "Premium social campaign with clean product identity" \
  --arg fileUrl "$MEDIA_URL" \
  '{
    prompt: $prompt,
    overrides: {
      "node-id-from-editor": {
        fileUrl: $fileUrl,
        params: {aspect_ratio: "9:16"}
      }
    }
  }' | curl -fsS -X POST "$PIXIO_BASE_URL/workflows/$WORKFLOW_ID/runs" \
    -H "Authorization: Bearer $PIXIO_API_KEY" \
    -H "Content-Type: application/json" \
    --data-binary @-)

RUN_ID=$(printf '%s' "$RUN" | jq -er '.runId')
```

Persist `WORKFLOW_ID` and `RUN_ID`.

## 4. Poll Run

```bash
curl -fsS "$PIXIO_BASE_URL/workflows/$WORKFLOW_ID/runs/$RUN_ID" \
  -H "Authorization: Bearer $PIXIO_API_KEY" | jq
```

Poll `queued` and `running`. On success return `outputs[]`; on failure return the
run error plus failed step errors. If submission timed out, inspect
`GET /workflows/{id}/runs` before starting another paid run.
