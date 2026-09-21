# Workflows

Workflows are a graph of model nodes run in dependency order; each node's
output is wired into a named input of the next, so a multi-step pipeline (for
example text-to-speech, then lipsync, then video) runs as one call. Over the API
you can create, read, update, delete, and run them.

All routes require `Authorization: Bearer $PIXIO_API_KEY`.

Run statuses: `queued`, `running`, `succeeded`, `failed`.

## GET /api/v1/workflows

Workflows owned by the account, newest updated first, each with its latest run.

```json
{
  "workflows": [
    {
      "id": "workflow-uuid",
      "name": "Product video workflow",
      "description": "Generate a product still and animate it.",
      "updatedAt": "...",
      "latestRun": {
        "id": "run-uuid",
        "status": "succeeded",
        "createdAt": "...",
        "startedAt": "...",
        "finishedAt": "..."
      }
    }
  ]
}
```

## POST /api/v1/workflows

Create a saved workflow from a definition. The definition uses the same schema
the in-app builder saves and `GET /workflows/{id}` returns.

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/workflows" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d @workflow.json
```

Body:

- `name`: 1–120 characters.
- `description`: optional, at most 2000 characters, nullable.
- `definition`: `{ version: 1, nodes: WorkflowNode[], edges: WorkflowEdge[] }`.

Definition shape (the fields an API author needs):

```json
{
  "version": 1,
  "nodes": [
    {
      "id": "input-1",
      "type": "input",
      "position": { "x": 0, "y": 0 },
      "data": { "kind": "input", "label": "Narration", "prompt": "..." }
    },
    {
      "id": "tts-1",
      "type": "model",
      "position": { "x": 300, "y": 0 },
      "data": {
        "kind": "model",
        "label": "TTS",
        "providerId": "pixio",
        "modelId": "pixio/example/text-to-speech",
        "modelType": "text-to-speech",
        "params": { "voice": "narrator" }
      }
    }
  ],
  "edges": [
    { "id": "e1", "source": "input-1", "target": "tts-1", "sourceHandle": "output", "targetHandle": "text" }
  ]
}
```

- `node.type` and `node.data.kind` come from the workflow node-kind enum
  (`input`, `model`, and annotation kinds).
- `node.data` may carry `prompt`, `negativePrompt`, `fileUrl`, `providerId`,
  `modelId`, `modelType`, `params`, `label`, `content`, `collapsed`, `locked`.
  Runtime fields (`status`, `outputUrl`, `runtimeParams`, credits) are set by
  runs; do not author them.
- `edge.targetHandle` names the input on the target node that receives the
  source's output.

Returns `201 { id, name, description, definition, createdAt, updatedAt }`.
`400 { error: "Invalid body", details }` when the definition fails validation.

The safest way to author a definition is to build one in the app editor,
`GET /workflows/{id}`, and use it as a template.

## GET /api/v1/workflows/{id}

Returns `{ id, name, description, definition, createdAt, updatedAt }`. Read
this before writing run overrides; `definition.nodes[].id` are the override
keys. `422 { error: "invalid_workflow_definition" }` when the saved definition
no longer validates; repair it with `PATCH` or in the app.

## PATCH /api/v1/workflows/{id}

Send any of `name`, `description` (nullable), `definition`. At least one is
required. Returns the updated workflow. `404` when not yours.

## DELETE /api/v1/workflows/{id}

Returns `{ deleted: true, id }`. Run history cascades away with it. Require
explicit user intent.

## POST /api/v1/workflows/{id}/runs

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/workflows/$WORKFLOW_ID/runs" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "cinematic product reveal on a white studio table",
    "negativePrompt": "blurry, distorted logo",
    "overrides": {
      "tts-1": { "params": { "text": "Meet the new runner." } },
      "img-1": { "fileUrl": "https://pixio-media.example/uploads/reference.jpg", "params": { "aspect_ratio": "16:9" } }
    }
  }'
```

Body fields:

- `prompt`: optional; applies to every prompt-bearing node (`input` and
  `model`) unless a per-node override sets its own.
- `negativePrompt`: optional; same rule.
- `overrides`: object keyed by node ID, each with `prompt`, `negativePrompt`,
  `fileUrl` (clean public media URL), and `params`. A TTS node takes its
  narration as `params.text`. Audio and video duration flow downstream
  automatically so a lipsync step is priced correctly. Internal-only param
  names are stripped from `params`.

Accepted `202`:

```json
{ "runId": "run-uuid", "workflowId": "workflow-uuid", "status": "queued" }
```

Errors:

- `400`: invalid JSON, `{ error: "invalid_workflow_override", ... }` for an
  unknown node ID or bad media URL.
- `404`: workflow not found for this account.
- `422 invalid_workflow_definition`: repair the workflow first.
- `429`: account API concurrency limit reached (shared with `/generate`).
- `502`: run row queued but orchestration failed to start; check
  `GET /workflows/{id}/runs` before resubmitting.

## GET /api/v1/workflows/{id}/runs?limit=20

`limit` 1–50, default 20.

```json
{
  "workflowId": "workflow-uuid",
  "runs": [
    { "id": "run-uuid", "status": "running", "error": null, "createdAt": "...", "startedAt": "...", "finishedAt": null }
  ]
}
```

## GET /api/v1/workflows/{id}/runs/{runId}

```json
{
  "id": "run-uuid",
  "workflowId": "workflow-uuid",
  "status": "succeeded",
  "error": null,
  "createdAt": "...",
  "startedAt": "...",
  "finishedAt": "...",
  "steps": [
    {
      "nodeId": "img-1",
      "type": "model",
      "status": "succeeded",
      "prompt": "cinematic product reveal",
      "params": { "prompt": "cinematic product reveal", "aspect_ratio": "16:9" },
      "outputUrl": "https://cdn.pixio.ai/output.mp4",
      "outputUrlExpiresAt": null,
      "durationSeconds": 5,
      "estimatedCredits": 100,
      "error": null,
      "startedAt": "...",
      "finishedAt": "..."
    }
  ],
  "outputs": [
    { "nodeId": "img-1", "type": "model", "url": "https://cdn.pixio.ai/output.mp4", "urlExpiresAt": null, "durationSeconds": 5 }
  ]
}
```

## Agent Rules

- Read node IDs from `GET /workflows/{id}`; never guess them.
- Use `/images` or `/media` for local files, then pass the clean URL as
  `fileUrl`.
- Save `runId` and poll; return `outputs[]` first, then failed step errors.
- Runs share the account concurrency limit; a `429` here blocks `/generate`
  too.
- Creating or editing a definition is a mutation the user should intend;
  prefer `PATCH` over delete-and-recreate so run history survives.
