# POST /api/v1/prompts/optimize

Rewrite a rough prompt into a model-ready prompt before generation.

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/prompts/optimize" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "shoe ad in rain",
    "type": "video",
    "context": "Six-second vertical social ad; preserve the logo exactly."
  }'
```

Body:

- `prompt`: required, 1–5000 characters;
- `type`: optional `image`, `video`, `audio`, or `3d`; default `image`;
- `context`: optional, at most 2000 characters.

Response:

```json
{
  "optimizedPrompt": "...",
  "improvements": ["..."],
  "reasoning": "..."
}
```

## Rules

- Optimization does not choose a model, validate model params, estimate price,
  or create a generation.
- Preserve explicit user constraints and media identity requirements.
- Show or obtain approval for substantial semantic changes when required by the
  product's policy.
- Use the optimized text only in a parameter declared by the selected model.
- On `502`, keep the original prompt available instead of losing the request.
