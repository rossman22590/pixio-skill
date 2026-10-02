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
    "Creating, editing, deleting, listing, and running workflows",
    "Boards and spatial canvas project CRUD and operations",
    "Canvas design CRUD and operations",
    "Cinema storyboard CRUD and prompt-to-storyboard direction",
    "Cam View scene CRUD and prompt-to-keyed-scene direction",
    "Video Agent project persistence and per-segment clip generation",
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

The `supported` list is a product-level summary. It does not name every route
(for example `POST /agent` and `/models/favorites` appear only in the media
OpenAPI document), and its `unsupported` list still carries the older wording
about the internal chat route; `POST /agent` is the public path to the same
agent. Treat the OpenAPI documents as authoritative for route existence.

## Agent Rules

- When a user asks for something in `unsupported`, say so and offer the
  nearest supported path (for example `POST /agent` instead of the internal
  chat route, or the app editor for renders).
- Do not infer an endpoint from a `supported` sentence; confirm the path in
  the matching contract.
