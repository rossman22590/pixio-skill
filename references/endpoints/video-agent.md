# Video Agent Over The API

Two halves: plan a project from a brief, then dispatch one generation per
planned segment. Final assembly and autonomous orchestration stay in the app.

## 1. Plan: POST /api/v1/video-agent/projects/from-prompt

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/video-agent/projects/from-prompt" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A 60-second vertical explainer about a smart water bottle: hook, three benefits, call to action.",
    "title": "Bottle explainer",
    "episodeCount": 1,
    "aspectRatio": "9:16",
    "modelId": "pixio/example/text-to-video"
  }'
```

- `prompt`: 20–12000 characters.
- `episodeCount`: 1–8, default 1.
- `aspectRatio`: `9:16` (default), `16:9`, `1:1`.
- `modelId`: default video model recorded on the plan (optional).

Returns `201 Project` with `type: "video-agent-projects"` and a `content`
document holding `episodes[]`, each with `segments[]` that carry
`visualPrompt`, `durationSeconds`, and `contentId: null`.

You can also `POST /video-agent/projects` with your own `content` or the
lighter `{ prompt, aspectRatio, episodeCount, modelId }` starter body, and
`PATCH` segments before generating.

## 2. Generate: POST /api/v1/video-agent/projects/{id}/generate

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/video-agent/projects/$PROJECT_ID/generate" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "modelId": "pixio/example/text-to-video",
    "params": { "resolution": "720p" },
    "episodeId": "ep-1",
    "regenerate": false
  }'
```

Body:

- `modelId` (required) and optional `providerId`: the video model to use;
  must be visible to the account.
- `params`: base params merged into every segment. The segment's
  `visualPrompt` becomes `prompt` and wins; `durationSeconds` becomes
  `duration` when the caller did not set one. Internal-only names are
  stripped.
- `episodeId` / `segmentIds` (up to 50): scope the run; default is every
  segment in every episode.
- `regenerate`: also re-run segments that already have a `contentId`.

At most 10 segments dispatch per call. Dispatch is sequential on purpose: each
segment runs the full plan, credit, and concurrency checks, and the first
failure (for example `402`) stops the run with everything so far reported.

Response `202`:

```json
{
  "projectId": "project-uuid",
  "modelId": "pixio/example/text-to-video",
  "dispatched": [{ "segmentId": "seg-1", "generationId": "generation-uuid" }],
  "skipped": [
    { "segmentId": "seg-2", "reason": "already_generated" },
    { "segmentId": "seg-3", "reason": "no_prompt" },
    { "segmentId": "seg-12", "reason": "call_limit" },
    { "segmentId": "seg-4", "reason": "Insufficient credits" }
  ]
}
```

- `already_generated`: has a `contentId` and `regenerate` was false.
- `no_prompt`: empty `visualPrompt`.
- `call_limit`: beyond the 10-per-call cap; call again with `segmentIds`.
- Any other reason is the dispatch error message for that segment.

Segment `contentId`s are written back onto the project so the app's Video
Agent workspace picks the clips up. Poll each `generationId` at
`GET /generations/{id}`.

Errors:

- `400 { error: "No segments to generate", skipped }` when nothing qualified.
- `400 { error: "model_not_available", message }`.
- `400 { error: "Invalid body", details }`.
- `404 PROJECT_NOT_FOUND`, `409 UNSUPPORTED_PROJECT_TYPE`.
- Each segment is billed exactly like `POST /generate`, and each counts
  against the account concurrency limit.

## Agent Protocol

1. `GET /me` and `GET /pricing?modelId=` to budget; multiply `yourCredits`
   (or the per-second rate times each `durationSeconds`) by segment count.
2. Plan with `from-prompt`; show the user the segments and the total quote.
3. Dispatch in batches of at most 10, respecting `concurrencyLimit`.
4. Poll every `generationId`; on `failed` segments, fix the prompt via `PATCH`
   and re-dispatch with `segmentIds` and `regenerate: true`.
5. Hand assembly back to the app; it is not available over the API.
