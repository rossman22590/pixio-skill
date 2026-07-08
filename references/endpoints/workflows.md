# Saved Workflow API Routes

Saved workflow routes let an API key list and run workflows that were built in the Pixio app editor.

All workflow routes require:

```http
Authorization: Bearer pxio_live_your_api_key
```

Workflow statuses:

- `queued`
- `running`
- `succeeded`
- `failed`

## GET /api/v1/workflows

List workflows owned by the authenticated account, newest updated first.

```bash
curl https://beta.pixio.myapps.ai/api/v1/workflows \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

Response:

```json
{
  "workflows": [
    {
      "id": "workflow_000",
      "name": "Product video workflow",
      "description": "Generate a product still and animate it.",
      "updatedAt": "1970-01-01T00:00:00.000Z",
      "latestRun": {
        "id": "run_000",
        "status": "succeeded",
        "createdAt": "1970-01-01T00:00:00.000Z",
        "startedAt": "1970-01-01T00:00:01.000Z",
        "finishedAt": "1970-01-01T00:02:00.000Z"
      }
    }
  ]
}
```

## POST /api/v1/workflows/{id}/runs

Queue a saved workflow run.

```bash
curl -X POST https://beta.pixio.myapps.ai/api/v1/workflows/workflow_000/runs \
  -H "Authorization: Bearer pxio_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "cinematic product reveal on a white studio table",
    "negativePrompt": "blurry, distorted logo",
    "overrides": {
      "node-id-from-editor": {
        "fileUrl": "https://pixio-media.example/uploads/reference.jpg",
        "params": {
          "aspect_ratio": "16:9"
        }
      }
    }
  }'
```

Body fields:

- `prompt`: optional global prompt applied to prompt-bearing nodes.
- `negativePrompt`: optional global negative prompt.
- `overrides`: optional object keyed by workflow node id.
- `overrides.<nodeId>.prompt`: prompt for one node.
- `overrides.<nodeId>.negativePrompt`: negative prompt for one node.
- `overrides.<nodeId>.fileUrl`: clean public media URL for one node.
- `overrides.<nodeId>.params`: extra per-node params.

Accepted response:

```json
{
  "runId": "run_000",
  "workflowId": "workflow_000",
  "status": "queued"
}
```

Errors:

- `400`: missing workflow id, invalid JSON, or invalid override.
- `404`: workflow not found for this account.
- `422`: saved workflow definition is invalid.
- `429`: account API concurrency limit reached.
- `502`: run row was queued but orchestration failed to start.

## GET /api/v1/workflows/{id}/runs

List recent runs for a workflow. Optional `limit` is clamped from 1 to 50 and defaults to 20.

```bash
curl "https://beta.pixio.myapps.ai/api/v1/workflows/workflow_000/runs?limit=10" \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

Response:

```json
{
  "workflowId": "workflow_000",
  "runs": [
    {
      "id": "run_000",
      "status": "running",
      "error": null,
      "createdAt": "1970-01-01T00:00:00.000Z",
      "startedAt": "1970-01-01T00:00:01.000Z",
      "finishedAt": null
    }
  ]
}
```

## GET /api/v1/workflows/{id}/runs/{runId}

Poll one workflow run and fetch step outputs.

```bash
curl https://beta.pixio.myapps.ai/api/v1/workflows/workflow_000/runs/run_000 \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

Response:

```json
{
  "id": "run_000",
  "workflowId": "workflow_000",
  "status": "succeeded",
  "error": null,
  "createdAt": "1970-01-01T00:00:00.000Z",
  "startedAt": "1970-01-01T00:00:01.000Z",
  "finishedAt": "1970-01-01T00:02:00.000Z",
  "steps": [
    {
      "nodeId": "node-id-from-editor",
      "type": "model",
      "status": "succeeded",
      "prompt": "cinematic product reveal",
      "params": {
        "prompt": "cinematic product reveal",
        "aspect_ratio": "16:9"
      },
      "outputUrl": "https://cdn.pixio.ai/output.mp4",
      "outputUrlExpiresAt": null,
      "durationSeconds": 5,
      "estimatedCredits": 100,
      "error": null,
      "startedAt": "1970-01-01T00:00:01.000Z",
      "finishedAt": "1970-01-01T00:02:00.000Z"
    }
  ],
  "outputs": [
    {
      "nodeId": "node-id-from-editor",
      "type": "model",
      "url": "https://cdn.pixio.ai/output.mp4",
      "urlExpiresAt": null,
      "durationSeconds": 5
    }
  ]
}
```

## Agent Rules

- Workflows must already exist in Pixio; the public API lists and runs them, it does not build them.
- Use `/api/v1/images` or `/api/v1/media` first for local files, then pass the clean URL as `fileUrl`.
- Save `runId` from the `POST` response and poll `/api/v1/workflows/{id}/runs/{runId}`.
- Return `outputs[]` first when present, then step-level errors if failed.
- Workflow runs share the account-wide API concurrency limit.
