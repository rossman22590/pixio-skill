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
whose params carry a `prompt`, `text_prompt`, or `text` value.

```json
{
  "data": [
    {
      "id": "generation-id",
      "type": "video",
      "prompt": "cinematic product reveal on a white studio table",
      "modelId": "...",
      "createdAt": "..."
    }
  ]
}
```

## GET /api/v1/prompt-library/{id}

Returns one prompt with the full saved params so it can be replayed:

```json
{
  "id": "generation-id",
  "type": "video",
  "prompt": "...",
  "modelId": "...",
  "params": { "prompt": "...", "aspect_ratio": "16:9" },
  "createdAt": "..."
}
```

`404 { code: "PROMPT_NOT_FOUND" }` when the generation is missing, not owned,
or had no prompt.

## Agent Rules

- Treat `modelId` here as a hint only. It is the stored model reference from
  the generation row and is not guaranteed to be a public `pixio/...` ID.
  Resolve the model through `GET /generations/{id}` (which returns the public
  ID) or `/models` before reusing it in `/generate`.
- Strip any reserved or unknown keys from `params` before replaying against
  the current live schema from `/params`.
- Use `query` to find prior successful prompts for the same subject before
  asking the optimizer to write a fresh one.
