# Prompt Optimizer

`POST /api/v1/prompts/optimize` is the same engine the app's Prompt Optimizer
uses: admin-tuned model-family system prompts, screenplay mode, attachments as
source material, and search or URL grounding. A legacy body still runs the
original four-type optimizer unchanged.

## GET /api/v1/prompts/optimize

Discover configuration instead of guessing.

```json
{
  "messageTypes": [
    { "type": "flux", "label": "FLUX" },
    { "type": "midjourney", "label": "Midjourney" },
    { "type": "video", "label": "Video" },
    { "type": "seedance-long", "label": "Seedance (long)" },
    { "type": "sora2-short", "label": "Sora 2 (short)" },
    { "type": "suno", "label": "Suno" },
    { "type": "music", "label": "Music" },
    { "type": "3d-model", "label": "3D model" }
  ],
  "modes": ["standard", "screenplay"],
  "legacyTypes": ["image", "video", "audio", "3d"],
  "limits": { "maxAttachments": 6, "maxPromptChars": 5000 }
}
```

The list is live; read it rather than hardcoding types.

## POST: Legacy Body

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/prompts/optimize" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"shoe ad in rain","type":"video","context":"Six-second vertical ad; keep the logo exact."}'
```

- `prompt`: required, 1–5000 characters.
- `type`: optional `image`, `video`, `audio`, `3d`; default `image`.
- `context`: optional, at most 2000 characters.

Returns exactly as before:

```json
{ "optimizedPrompt": "...", "improvements": ["..."], "reasoning": "..." }
```

## POST: Full Optimizer

Any of `messageType`, `mode`, `attachments`, `googleSearch`, or `urlContext`
switches to the full engine.

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/prompts/optimize" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "a blob narrator in a cozy studio, warm light",
    "messageType": "seedance-long",
    "mode": "standard",
    "attachments": ["https://example.com/reference.png"],
    "googleSearch": false,
    "urlContext": false
  }'
```

- `prompt`: your idea. Optional only when `attachments` are sent.
- `messageType`: model-family system prompt from the `GET` list. Defaults
  from `type` when omitted.
- `mode`: `standard` (one prompt) or `screenplay` (cinematic video-script
  treatment).
- `attachments`: up to 6 public URLs or storage keys you own (images, audio,
  video, PDF, Markdown, text). Resolved with the same ownership rules as
  `/media/resolve`; the model looks at them as source material.
- `googleSearch`, `urlContext`: let the optimizer ground itself in live
  information.

Returns:

```json
{
  "optimizedPrompt": "...",
  "messageType": "seedance-long",
  "mode": "standard",
  "model": "the LLM used",
  "attachmentsUsed": 1
}
```

## Errors

- `400`: unknown `messageType`, unresolvable or unsupported attachment, or
  neither `prompt` nor `attachments`.
- `401`: bad key.
- `502`: optimizer backend failure; keep the original prompt.

## Rules

- Pick `messageType` by the target model family; a Seedance prompt and a
  Midjourney prompt are shaped very differently.
- Optimization does not choose a model, validate params, estimate price, or
  create a generation.
- Preserve explicit user constraints and media identity requirements.
- Surface substantial semantic changes for approval when the product's policy
  requires it.
- Use the optimized text only in a parameter declared by the selected model.
- Combine with `GET /styles`: append a style's `tokens` after optimizing, or
  use a viral template's `tokens` verbatim and skip optimization.
