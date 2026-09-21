# GET /api/v1/guide

Public discovery route for agents. No API key required; never send one to it.

```bash
curl https://beta.pixio.myapps.ai/api/v1/guide                 # text/markdown
curl "https://beta.pixio.myapps.ai/api/v1/guide?format=json"   # application/json
```

## JSON Shape

```json
{
  "name": "Pixio API",
  "baseUrl": "https://beta.pixio.myapps.ai",
  "auth": "Authorization: Bearer <PIXIO_API_KEY>",
  "openapi": "https://beta.pixio.myapps.ai/api/v1/openapi.json",
  "generateFlow": ["..."],
  "workflowFlow": ["..."],
  "endpoints": [{ "method": "GET", "path": "/api/v1/...", "purpose": "..." }],
  "notes": ["..."],
  "cancellation": ["..."],
  "retries": ["..."],
  "concurrency": ["..."],
  "durationAndBilling": ["..."],
  "stylizedCharacterGuidance": ["..."]
}
```

## Sections Worth Reading Verbatim

- `cancellation`: `DELETE /generations/{id}` deletes the record and stored
  output only; it does not stop in-flight work or reverse a charge.
- `retries`: on a gateway timeout, resume polling the original `contentId`;
  check `?status=pending` and `?status=processing` before resubmitting.
- `concurrency`: per-account limit shared by every key and every generate
  route; `429` rejects rather than queues; unrelated to Maker daily caps.
- `durationAndBilling`: per-second models bill decoded duration rounded up,
  with a per-model minimum and sometimes a maximum; caller-supplied duration
  is ignored; the soundtrack is never re-timed.
- `stylizedCharacterGuidance`: reference-image quality governs character
  fidelity; keep the mouth region unobstructed; generate quiet poses and
  laughter as separate takes.

The Markdown guide adds worked cURL examples for image-to-video, workflow runs
with node overrides (`params.text` for a TTS node), the full optimizer, and
plan/pricing/Maker-cap reads.

## Agent Rules

- Fetch this route when you need a compact, current protocol summary or when
  the deployed API may be newer than this skill.
- The `endpoints` list is the media-API surface. Project, character,
  prompt-library, and training routes live in `/platform/openapi.json`.
- Use the returned `openapi` URL when generating an HTTP client.
