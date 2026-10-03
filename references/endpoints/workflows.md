# Workflows

Workflows are a graph of model nodes run in dependency order; each node's
output is wired into a named input of the next, so a multi-step pipeline (for
example text-to-speech, then lipsync, then video) runs as one call. Over the API
you can create, read, update, delete, and run them.

All routes require `Authorization: Bearer $PIXIO_API_KEY`.

Run statuses: `queued`, `running`, `succeeded`, `failed`.

Errors use the shared `{ error, code, ... }` envelope (see `../overview.md`,
"Error envelope"). Workflow-specific codes: `not_found` (404),
`invalid_workflow_definition` (422), `invalid_workflow_override` (400),
`workflow_dispatch_failed` (502), `concurrency_limit` (429).

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
- Internal-only params are silently dropped from every node's `params` when
  the workflow is saved (here and on `PATCH`), the same as run-time
  overrides. The save still succeeds; the returned `definition` omits them.
- `edge.targetHandle` names the input on the target node that receives the
  source's output.

Returns `201 { id, name, description, definition, createdAt, updatedAt }`.
`400 { error: "Invalid body", code: "invalid_request", details }` when the
body or definition fails validation (a body that is not JSON fails the same
way).

The safest way to author a definition is to build one in the app editor,
`GET /workflows/{id}`, and use it as a template.

## GET /api/v1/workflows/{id}

Returns `{ id, name, description, definition, createdAt, updatedAt }`. Read
this before writing run overrides; `definition.nodes[].id` are the override
keys. `404 not_found` when the workflow is not yours.
`422 { error: "invalid_workflow_definition", code: "invalid_workflow_definition", message }`
when the saved definition no longer validates; repair it with `PATCH` or in the
app.

## PATCH /api/v1/workflows/{id}

Send any of `name`, `description` (nullable), `definition`. At least one is
required; otherwise `400 { error: "Invalid body", code: "invalid_request",
details }`. Returns the updated workflow. `404 not_found` when not yours.
Internal-only params in a new `definition` are silently dropped, as on create.

## DELETE /api/v1/workflows/{id}

Returns `{ deleted: true, id }`. Run history cascades away with it. `404
not_found` when not yours. Require explicit user intent.

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

- `400 invalid_json`: the body is not valid JSON.
- `400 invalid_request`: the body failed validation. `error` is the first
  issue's sentence and `details` carries the full report.
- `400 invalid_workflow_override`:
  `{ error: "invalid_workflow_override", code, message }` for an unknown node
  ID or bad media URL.
- `400 invalid_media_url`:
  `{ error: "invalid_media_url", code, message: "One or more media inputs reference a file that does not belong to this account." }`
  when the run body or the saved workflow's nodes (`fileUrl`, `params`,
  locked outputs) carry a Pixio storage path or storage URL that belongs to
  another account, including its signed storage links such as a public
  gallery output. Nothing is queued or billed. Download the file and upload
  it through `POST /media`, then point the node or override at the returned
  URL. Public third-party HTTPS URLs are unaffected.
- `404 not_found`: workflow not found for this account.
- `422 invalid_workflow_definition`: repair the workflow first
  (`error` equals the code, sentence in `message`).
- `429 concurrency_limit`: account API concurrency limit reached (shared with
  `/generate`). The body matches `/generate`'s 429, with `Retry-After: 10`:

  ```json
  {
    "error": "This account has reached its API concurrency limit of 1. Wait for a workflow run to finish before starting another.",
    "code": "concurrency_limit",
    "message": "...",
    "concurrencyLimit": 1,
    "retryAfter": 10,
    "runId": "blocking-run-uuid",
    "status": "running"
  }
  ```

  `runId` and `status` identify the blocking run (omitted when none could be
  read); poll it, then retry.
- `502 workflow_dispatch_failed`: run row queued but orchestration failed to
  start; the body adds `runId`, `workflowId`, and `status: "queued"`. Check
  `GET /workflows/{id}/runs` before resubmitting.

## GET /api/v1/workflows/{id}/runs?limit=20

`limit` is an integer 1–50, default 20. An out-of-range value is clamped to
1–50 and a non-numeric one falls back to 20; a bad `limit` never returns an
error. Runs are newest first; `hasMore` is true when older runs exist
beyond `limit`. `404 not_found` when the workflow is not yours.

```json
{
  "workflowId": "workflow-uuid",
  "hasMore": false,
  "runs": [
    { "id": "run-uuid", "status": "running", "error": null, "createdAt": "...", "startedAt": "...", "finishedAt": null }
  ]
}
```

A run's `error` (here and on the run route, including each step's `error`) is
a sanitized sentence: it never names the model provider and never carries a raw
upstream response body.

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
- Runs share the account concurrency limit; a `429 concurrency_limit` here
  blocks `/generate` too. Poll the `runId` it returns, honour `Retry-After`.
- Creating or editing a definition is a mutation the user should intend;
  prefer `PATCH` over delete-and-recreate so run history survives.
