# GET /api/v1/guide

Public discovery route for agents. It does not require a Pixio API key.

Use it when an integration needs to discover the current route list before making authenticated calls.

## Markdown Guide

```bash
curl https://beta.pixio.myapps.ai/api/v1/guide
```

Returns `text/markdown` describing the generation flow, media upload flow, workflow flow, and endpoint list.

## JSON Guide

```bash
curl "https://beta.pixio.myapps.ai/api/v1/guide?format=json"
```

Response shape:

```json
{
  "name": "Pixio API",
  "baseUrl": "https://beta.pixio.myapps.ai",
  "auth": "Authorization: Bearer <PIXIO_API_KEY>",
  "openapi": "https://beta.pixio.myapps.ai/api/v1/openapi.json",
  "generateFlow": [],
  "workflowFlow": [],
  "endpoints": [],
  "notes": []
}
```

## Agent Rules

- Fetch this route when you need a compact, current protocol summary.
- Do not send API keys to this public discovery route.
- Use the returned `openapi` URL when generating an HTTP client or tool schema.
