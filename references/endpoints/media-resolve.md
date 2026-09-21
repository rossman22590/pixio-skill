# POST /api/v1/media/resolve

Turn media references stored inside a project into URLs you can display.

Board nodes, canvas image layers, and storyboard frames persist durable storage
keys rather than URLs, because a signed URL would expire while the document
lives on. The web app re-signs them server-side; API clients (for example the
desktop app) call this route.

```bash
curl -fsS -X POST "$PIXIO_BASE_URL/media/resolve" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"refs":["users/<account>/uploads/api/reference.png","https://cdn.example/public.jpg"]}'
```

- `refs`: 1–100 strings. Each is a storage key from project content, a signed
  URL that may have expired, or an already-public URL.

## Response

```json
{
  "urls": {
    "users/<account>/uploads/api/reference.png": "https://cdn.pixio.ai/...?signature=fresh",
    "https://cdn.example/public.jpg": "https://cdn.example/public.jpg",
    "someone-elses/key.png": null
  }
}
```

- A reference resolves only inside the caller's own storage namespace
  (`<namespace>/<accountId>/...`, UUID-checked; traversal and malformed paths
  are rejected). Anything else resolves to `null` instead of erroring, so one
  bad reference cannot fail a whole document.
- Already-public URLs pass through unchanged.
- Expired signed URLs are re-signed from their key.
- Returned URLs expire.

## Errors

- `400`: missing, empty, or oversized `refs` array.
- `401`: bad key.

## Agent Rules

- Resolve at display time. Never write resolved URLs back into project content
  through `PATCH` or operations; store the durable key instead.
- Batch all references for one document into a single call.
- Treat `null` as "not yours or not storage-backed", not as an error to retry.
- The same ownership rules apply to `attachments` on `POST /prompts/optimize`.
