# GET /api/v1/capabilities

Authenticated discovery of what the deployed public API supports. Use it to
settle "is X public-API-supported?" from the server rather than from memory.

```bash
curl -fsS "$PIXIO_BASE_URL/capabilities" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

## Response

```json
{
  "authentication": {
    "model": "full-account-access",
    "scopes": false,
    "revocation": "immediate"
  },
  "contracts": {
    "media": "/api/v1/openapi.json",
    "projects": "/api/v1/platform/openapi.json"
  },
  "supported": [
    "AI media generation and credit estimates",
    "Uploaded and generated media assets",
    "Resolving project media references into displayable URLs",
    "Asset folders and the style gallery (viral templates included)",
    "Generation history and status",
    "Model discovery and the full prompt optimizer (model-family prompts, screenplay mode, attachments, grounding)",
    "Account identity, credits, plan, API limits, and Maker daily caps",
    "The live price list, priced for the calling account, with plan and credit-pack rates",
    "Listing and running workflows already saved in Pixio",
    "Boards and spatial canvas project CRUD and operations",
    "Canvas design CRUD and operations",
    "Cinema storyboard CRUD and prompt-to-storyboard direction",
    "Cam View scene CRUD and prompt-to-keyed-scene direction",
    "Video Agent project persistence",
    "Timeline project CRUD and validated editor operations",
    "Locked character CRUD, prompt history, and model-training status"
  ],
  "unsupported": [
    "Executing Pix Agent chat tools through the internal streaming chat route",
    "Cam View mobile-controller pairing and live sensor streaming",
    "Headless timeline renders, exports, and render progress",
    "Autonomous Video Agent orchestration and final assembly",
    "Starting or cancelling model-training jobs"
  ]
}
```

The `supported` list understates two things the routes actually provide:
workflow creation and editing (`POST /workflows`, `PATCH /workflows/{id}`) and
Video Agent per-segment dispatch (`POST /video-agent/projects/{id}/generate`).
Treat the OpenAPI documents as authoritative for route existence and this list
as the product-level summary.

## Agent Rules

- When a user asks for something in `unsupported`, say so and offer the
  nearest supported path (for example `POST /agent` instead of the internal
  chat route, or the app editor for renders).
- Do not infer an endpoint from a `supported` sentence; confirm the path in
  the matching contract.
