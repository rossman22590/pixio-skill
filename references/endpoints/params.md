# GET /api/v1/params

Fetch accepted params for one Pixio model. `GET /models/{pixio/...}` returns
the identical shape.

```bash
curl -fsS --get "$PIXIO_BASE_URL/params" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  --data-urlencode "modelId=pixio/nano-banana/edit"
```

Optional: `providerId=pixio`.

## Response

```json
{
  "model": {
    "id": "pixio/nano-banana/edit",
    "providerId": "pixio",
    "name": "Nano Banana Edit",
    "description": "Model description",
    "type": "image-to-image",
    "credits": 4,
    "company": "Pixio",
    "freeForPlans": [],
    "freeForCurrentPlan": false,
    "makerCap": null
  },
  "params": [
    {
      "name": "prompt",
      "type": "string",
      "label": "Prompt",
      "required": true,
      "defaultValue": null,
      "placeholder": "Describe the edit"
    },
    {
      "name": "image_url",
      "type": "file",
      "label": "Image",
      "required": true,
      "defaultValue": null,
      "constraints": {
        "maxBytes": 26214400,
        "maxBytesLabel": "25 MB",
        "accepts": ["image/*"]
      }
    },
    {
      "name": "audio_url",
      "type": "file",
      "label": "Audio",
      "required": false,
      "constraints": {
        "maxBytes": 52428800,
        "maxBytesLabel": "50 MB",
        "maxSeconds": 600,
        "accepts": ["audio/*"]
      }
    }
  ],
  "outputs": { "format": "file", "hasFileUrl": true }
}
```

The response has three top-level keys: `model`, `params`, and `outputs`. The
`model` object here is the short form (no `pricing`, `defaultCredits`, or
`fromCredits`); get those from `GET /models` or `GET /pricing`.

## Param Fields

- `name`: key to put inside `params`.
- `type`: `string`, `number`, `boolean`, `select`, `file`, and similar.
- `label`, `placeholder`: human guidance.
- `required`: whether generation needs this param.
- `defaultValue`: default when available.
- `options`: valid values for select-style fields.
- `constraints` (media inputs): `maxBytes` and `maxBytesLabel` from the upload
  limits, `maxSeconds` from the duration-limit table where the model bills or
  caps by duration, and `accepts` (MIME patterns).
- Top-level `outputs` (always present): `{ format: "json" | "file",
  hasFileUrl: boolean }`. `format: "file"` is the normal media model.
  `format: "json"` marks a model whose result is a structured payload with no
  output file (transcription models); for those `hasFileUrl` is `false`, so
  read the structured result on the generation (`outputs`) instead of
  expecting `outputUrl`.

## Agent Rules

- Fetch params before creating a generation.
- Respect `required`, `options`, and `constraints`. Reject oversize or
  over-length media locally instead of paying for a `400`.
- Preserve declared types; do not stringify numbers or booleans.
- Do not send hidden or undocumented fields. Internal-only names are stripped.
- Do not guess missing required media fields; ask for them.
- A missing `modelId` is `400 { error: "Missing modelId", code:
  "invalid_request", message }`; an unknown or hidden model is
  `404 model_not_found`.
