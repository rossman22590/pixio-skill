# GET /api/v1/openapi.json

Public OpenAPI 3.1 route for the Pixio API. It does not require a Pixio API key.

```bash
curl https://beta.pixio.myapps.ai/api/v1/openapi.json
```

The spec uses the server origin of the request and documents the `/api/v1` routes:

- `GET /guide`
- `POST /generate`
- `POST /images`
- `POST /media`
- `POST /uploads`
- `GET /params`
- `GET /generations/{id}`
- `GET /models`
- `GET /credits`
- `GET /workflows`
- `POST /workflows/{id}/runs`
- `GET /workflows/{id}/runs`
- `GET /workflows/{id}/runs/{runId}`

## Agent Rules

- Use this route for generated clients, tool schemas, and route discovery.
- Do not assume it contains model-specific params. Use `GET /api/v1/params?modelId=...` for model inputs.
- Do not send API keys to this public discovery route.
