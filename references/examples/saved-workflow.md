# Example: Run A Workflow

Select or create a workflow, read its node IDs, prepare media, run it once,
poll, and collect outputs.

```bash
AUTH="Authorization: Bearer $PIXIO_API_KEY"
```

## 1. List Or Create

```bash
curl -fsS "$PIXIO_BASE_URL/workflows" -H "$AUTH" \
  | jq '.workflows[] | {id, name, latestRun: .latestRun.status}'
```

To create one from a definition exported by the app editor:

```bash
WORKFLOW_ID=$(jq -n --slurpfile def workflow-definition.json '{
  name: "Product video workflow",
  description: "Still, then animate.",
  definition: $def[0]
}' | curl -fsS -X POST "$PIXIO_BASE_URL/workflows" \
  -H "$AUTH" -H "Content-Type: application/json" --data-binary @- \
  | jq -er '.id')
```

## 2. Read Node IDs

```bash
curl -fsS "$PIXIO_BASE_URL/workflows/$WORKFLOW_ID" -H "$AUTH" \
  | jq '.definition.nodes[] | {id, type, label: .data.label, modelId: .data.modelId}'
```

Override keys must be these IDs. A `422 invalid_workflow_definition` here
means the saved definition needs repair (`PATCH` or the app) before it can run.

## 3. Prepare Local Media

```bash
MEDIA_URL=$(curl -fsS -X POST "$PIXIO_BASE_URL/media" -H "$AUTH" \
  -F "file=@./product.mp4" | jq -er '.url')
```

## 4. Queue One Run

```bash
RUN=$(jq -n --arg prompt "Premium social campaign with clean product identity" \
            --arg fileUrl "$MEDIA_URL" '{
  prompt: $prompt,
  overrides: {
    "tts-1":   { params: { text: "Meet the new runner." } },
    "video-1": { fileUrl: $fileUrl, params: { aspect_ratio: "9:16" } }
  }
}' | curl -sS -X POST "$PIXIO_BASE_URL/workflows/$WORKFLOW_ID/runs" \
  -H "$AUTH" -H "Content-Type: application/json" --data-binary @-)

RUN_ID=$(printf '%s' "$RUN" | jq -er '.runId')
```

Persist `WORKFLOW_ID` and `RUN_ID`. Handle `400 invalid_workflow_override`
(unknown node ID or bad media URL) and `429` (account concurrency) before
parsing.

## 5. Poll

```bash
curl -fsS "$PIXIO_BASE_URL/workflows/$WORKFLOW_ID/runs/$RUN_ID" -H "$AUTH" \
  | jq '{status, error, outputs, failedSteps: [.steps[] | select(.status=="failed") | {nodeId, error}]}'
```

Poll `queued` and `running`. On success return `outputs[]`; on failure return
the run error plus failed steps. If submission timed out, inspect
`GET /workflows/{id}/runs` before starting another paid run.
