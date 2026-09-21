# Model Preferences (Read-Only)

Quick-action default models the user configured in Settings. Generate and the
in-app chat agent read the same rows. Over the API they are read-only;
`PUT` and `DELETE` were removed on 2026-09-15. Manage preferences in the app.

## GET /api/v1/preferences/models

```bash
curl -fsS "$PIXIO_BASE_URL/preferences/models" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

```json
{
  "data": [
    {
      "actionKey": "generate-image-t2i",
      "modelId": "pixio/flux/dev",
      "label": "Generate Image",
      "description": "Default for text-to-image on Generate."
    }
  ]
}
```

Entries whose stored IDs cannot be converted to a public `pixio/...` ID are
omitted.

## GET /api/v1/preferences/models/catalog

Every configured action key, including slots with no eligible models, and the
models the account may choose for each.

```json
{
  "data": [
    {
      "actionKey": "generate-image-t2i",
      "label": "Generate Image",
      "description": "Default for text-to-image on Generate.",
      "eligibleModels": [
        { "modelId": "pixio/flux/dev", "name": "FLUX Dev" }
      ]
    }
  ]
}
```

Choices are enabled, visible to the account plan, and compatible with the
action. This is not a guarantee of credits, capacity, or provider availability.

## Errors

- `401` missing, invalid, or revoked key.
- `500` database or catalog error.
- `503` API-key storage unavailable; back off, do not rotate a valid key.

## Agent Rules

- Use a saved preference as the default model for the matching action when
  the user has not named one, then confirm it with `/models/{id}` before
  generating.
- Do not tell users the API can change preferences; point them to Settings.
