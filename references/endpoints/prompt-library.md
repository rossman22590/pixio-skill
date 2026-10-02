# Prompt Library

Prompts mined from the account's own generation history, so an agent can reuse
what already worked. Read-only.

## GET /api/v1/prompt-library

```bash
curl -fsS "$PIXIO_BASE_URL/prompt-library?type=video&query=product&limit=25" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

Query (all optional):

- `type`: `image`, `video`, `audio`, `3d`.
- `query`: case-insensitive substring match on the prompt, at most 200 chars.
- `limit`: 1–100, default 25.

The route scans the newest 500 generations of the account and returns those
whose params carry a `prompt`, `text_prompt`, or `text` value. `hasMore` is
`true` when more matches than `limit` exist, and also when the 500-row scan
window was full (older matches may exist beyond it).

```json
{
  "data": [
    {
      "id": "generation-id",
      "type": "video",
      "prompt": "cinematic product reveal on a white studio table",
      "modelId": "pixio/example/model",
      "createdAt": "..."
    }
  ],
  "hasMore": false
}
```

`modelId` is the public `pixio/...` model ID, or `null` when that model is no
longer in the catalog.

Errors: an invalid query is `400 { error: "Invalid request.", code:
"INVALID_REQUEST", details }`; a read failure is
`500 { code: "PROMPT_HISTORY_FAILED" }`. Codes on this route family are
UPPER_SNAKE.

## GET /api/v1/prompt-library/{id}

Returns one prompt with the full saved params so it can be replayed:

```json
{
  "id": "generation-id",
  "type": "video",
  "prompt": "...",
  "modelId": "pixio/example/model",
  "params": { "prompt": "...", "aspect_ratio": "16:9" },
  "createdAt": "..."
}
```

`params` has internal keys removed.
`404 { code: "PROMPT_NOT_FOUND" }` when the generation is missing, not owned,
or had no prompt. On this `/{id}` route a `401`/`503` auth failure carries
`error` only (no `code`).

## Agent Rules

- `modelId` is a public `pixio/...` ID, but the model may since have been
  retired (`null`) or hidden from the account. Confirm it appears in `/models`
  before reusing it in `/generate`.
- Check `params` against the current live schema from `/params` before
  replaying; inputs change over time.
- Use `query` to find prior successful prompts for the same subject before
  asking the optimizer to write a fresh one.
