# Prompt Optimizer

`POST /api/v1/prompts/optimize` is the same engine the app's Prompt Optimizer
uses: admin-tuned model-family system prompts, screenplay mode, attachments as
source material, and search or URL grounding. A legacy body still runs the
original four-type optimizer unchanged.

## Cost

Every `POST` costs **5 credits** per call (`limits.creditsPerCall` on the
`GET`). The charge is taken only after validation passes (a prompt or
attachment is present, the `messageType` exists, and every attachment resolves
and is an allowed size and type), immediately before the model call. Anything
rejected before that point costs nothing: `400`/`401`, an unknown
`messageType`, a bad attachment (including an attachment that fails to upload
or times out), or an optimizer that is not configured. A model failure after
the charge (`502`) is **not refunded**. An account that cannot cover the call
gets `402 insufficient_credits` and nothing is charged. Both success bodies
carry `cost: { credits }` with the amount charged. The `GET` is free.

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
  "limits": { "maxAttachments": 6, "maxPromptChars": 5000, "creditsPerCall": 5 }
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
{
  "optimizedPrompt": "...",
  "improvements": ["..."],
  "reasoning": "...",
  "cost": { "credits": 5 }
}
```

The body is otherwise unchanged; `cost` is the one additive field.

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
  `/media/resolve`; the model looks at them as source material. A URL must
  be a public internet address that points directly at the file: redirects
  are not followed, and a private or internal address is refused with `400`
  (`Attachment URL is not allowed: <file name>`) before anything is charged.
- `googleSearch`, `urlContext`: let the optimizer ground itself in live
  information.

Returns:

```json
{
  "optimizedPrompt": "...",
  "messageType": "seedance-long",
  "mode": "standard",
  "model": "the LLM used",
  "attachmentsUsed": 1,
  "cost": { "credits": 5 }
}
```

## Errors

Every error body is `{ error, code, ... }`.

- `400 invalid_json`: the body is not valid JSON.
- `400 invalid_request`: failed validation (with `details`), unknown
  `messageType`, unresolvable or unsupported attachment, an attachment URL
  that is not a public internet address or that redirects ("Attachment URL is
  not allowed: ..." / "Attachment could not be fetched: ..."), or neither
  `prompt` nor `attachments`. Not charged.
- `401 missing_api_key` / `invalid_api_key`: bad key.
- `402 insufficient_credits`: fewer than 5 credits. Nothing was charged.
- `500 optimizer_error`: the optimizer is not configured, or its configuration
  could not be loaded (`GET` as well as `POST`). Not charged.
- `502`: `provider_error` on the legacy body, `optimizer_error` on the full
  optimizer. A model failure comes after the charge and is not refunded; keep
  the original prompt. A `502` from uploading an attachment happens before the
  charge and costs nothing.
- `504 optimizer_error`: the optimizer timed out processing an attachment.
  Not charged.
- `503 service_unavailable`: API-key storage unavailable.

## Rules

- Pick `messageType` by the target model family; a Seedance prompt and a
  Midjourney prompt are shaped very differently.
- Optimization does not choose a model, validate params, estimate price, or
  create a generation. It does cost 5 credits per call, so do not run it in a
  tight retry loop; cache the result for a given prompt.
- Preserve explicit user constraints and media identity requirements.
- Surface substantial semantic changes for approval when the product's policy
  requires it.
- Use the optimized text only in a parameter declared by the selected model.
- Combine with `GET /styles`: append a style's `tokens` after optimizing, or
  use a viral template's `tokens` verbatim and skip optimization.
