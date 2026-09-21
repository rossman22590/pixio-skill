# Model Favorites

The same favorites list the star buttons in the app's model selector maintain.
Favorites belong to the user behind the key.

## GET /api/v1/models/favorites

```bash
curl -fsS "$PIXIO_BASE_URL/models/favorites" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

```json
{
  "data": [
    {
      "modelId": "pixio/flux/dev",
      "name": "FLUX Dev",
      "type": "text-to-image",
      "createdAt": "..."
    }
  ]
}
```

Only public `pixio/...` IDs are returned. Favorites the caller's plan cannot
see, or that left the catalog, are omitted rather than returned as IDs the API
would reject.

## POST /api/v1/models/favorites

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/models/favorites" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"modelId":"pixio/flux/dev"}'
```

- Idempotent: favoriting twice is a no-op.
- `201 { "modelId": "pixio/flux/dev", "favorited": true }`.
- `400` invalid body; `404` model not found or not enabled.

## DELETE /api/v1/models/favorites?modelId=pixio/flux/dev

Returns `{ "modelId": "...", "favorited": false }`. Removing a model that is
not a favorite is a no-op. `400` when `modelId` is missing.

## Agent Rules

- Use favorites as a user-preference hint when several models fit; never as
  proof of visibility or price. Confirm with `/models` and `/pricing`.
- Do not add favorites without user intent.
