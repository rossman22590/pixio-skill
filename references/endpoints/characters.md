# Locked Characters

Reusable characters the Pixio agent keeps in account memory so a name in a
prompt resolves to the same look every time. The API exposes the same store the
in-app chat agent reads.

## GET /api/v1/characters

```json
{
  "data": [
    {
      "name": "Milo",
      "description": "Round blue blob narrator with a yellow scarf, big friendly eyes, no facial hair.",
      "referenceImageUrl": "https://cdn.example/milo.png"
    }
  ],
  "updatedAt": "..."
}
```

## POST /api/v1/characters

Create or replace a character by name (case-insensitive match).

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/characters" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Milo","description":"Round blue blob narrator with a yellow scarf.","referenceImageUrl":"https://cdn.example/milo.png"}'
```

- `name`: 1–60 characters.
- `description`: at most 400 characters, default empty.
- `referenceImageUrl`: optional absolute URL, at most 4096 characters. Use a
  clean public URL from `POST /images`.

Returns `201` with the saved character.

## GET / PATCH / DELETE /api/v1/characters/{name}

- The path segment is the URL-encoded name; lookup is case-insensitive.
- `PATCH` body is a partial `{ description?, referenceImageUrl? }`; the name
  cannot be changed in place (create the new name and delete the old).
- `DELETE` returns `{ deleted: true, name }`.
- `404 { code: "CHARACTER_NOT_FOUND" }` when absent.
- `500 { code: "CHARACTER_WRITE_FAILED" }` when memory could not be saved.

## Agent Rules

- Save a character once the user approves a look; reference it by name in
  later prompts and in `/agent` conversations.
- Keep the reference image unobstructed around the mouth and eyes; the guide's
  stylized-character notes explain why fidelity depends on it.
- Replacing a character overwrites it. Confirm before `POST` on an existing
  name.
