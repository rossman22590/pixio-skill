# GET /api/v1/styles

The style gallery as data: the same styles and viral templates the web app's
picker renders, imported from the exact modules the UI uses, so the API and UI
cannot drift.

```bash
curl -fsS "$PIXIO_BASE_URL/styles?kind=video&category=viral" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

Query (all optional):

- `kind`: `image`, `video`, `3d`; entries that apply to this output kind.
- `category`: for example `viral`, `cinematic`, `motion`.
- `search`: substring match on label, category, and tokens.

## Response

```json
{
  "data": [
    {
      "id": "viral-toy-unboxing",
      "label": "Toy Unboxing",
      "category": "viral",
      "applies": ["video"],
      "promptMode": "replace",
      "tokens": "A hyper-real toy version of the person in the photo ...",
      "recipe": {
        "modelId": "pixio/example/image-to-video",
        "durationSeconds": 5,
        "requiresReferenceImage": true
      },
      "sampleUrl": "https://cdn.example/thumbs/viral-toy-unboxing.jpg"
    },
    {
      "id": "cinematic-anamorphic",
      "label": "Anamorphic Cinematic",
      "category": "cinematic",
      "applies": ["image", "video"],
      "promptMode": "append",
      "tokens": ", anamorphic lens, shallow depth of field, teal and orange grade",
      "recipe": null,
      "sampleUrl": null
    }
  ],
  "total": 193
}
```

Two kinds of entry, told apart by `promptMode`:

- `append` (styles): `tokens` is a fragment to append to the user's prompt.
- `replace` (viral templates): `tokens` is the whole prompt, and `recipe`
  carries the model, duration, and whether a reference photo is required, so
  a caller can go straight to `POST /generate`.

Viral templates lead the list, mirroring the UI ordering.

## Template-To-Generation Recipe

1. Pick an entry with `promptMode: "replace"`.
2. If `recipe.requiresReferenceImage`, upload the photo with `POST /uploads`.
3. `GET /models/{recipe.modelId}` to confirm the media param name and any
   `duration` option.
4. `POST /generations/estimate` with `{ modelId: recipe.modelId, params: { prompt: tokens, image_url, duration: recipe.durationSeconds } }`.
5. `POST /generate` with the same body and an `Idempotency-Key`.

## Agent Rules

- Confirm `recipe.modelId` is visible with `/models/{id}` before dispatch; a
  template can name a model the plan does not include.
- Never edit a viral template's `tokens` unless the user asks; the wording is
  the template.
- Styles and optimizer output compose: optimize first, then append `tokens`.
