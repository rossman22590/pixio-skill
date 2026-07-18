---
name: pixio-skill
description: Integrate, operate, document, or audit the Pixio public user REST API from an agent, backend, worker, script, automation, CLI, mobile backend, or generated client. Use for Pixio API keys, authentication and revocation, OpenAPI discovery, model selection, model parameters, prompt optimization, credit estimates and balances, subscription/concurrency checks, uploads, clean media URLs, asset CRUD and downloads, generation submission/history/polling/deletion, saved workflow runs, retries, signed URLs, or Pixio API errors. Also use to determine whether a Pixio app feature is public API-supported. Do not use app-internal, admin, provider, webhook, chat, project-editor, or browser-session routes for third-party integrations.
---

# Pixio User API

Operate Pixio through the stable public `/api/v1` surface. Treat the current
OpenAPI document and route implementation as the source of truth.

```text
Base URL: https://beta.pixio.myapps.ai/api/v1
Auth:     Authorization: Bearer $PIXIO_API_KEY
```

Never put an API key in browser code, a mobile binary, public source, URLs,
screenshots, telemetry, or logs. Make authenticated requests from a trusted
backend, worker, CLI, automation runtime, or agent secret store.

## Start Every Integration

1. Read `GET /guide?format=json` or `GET /openapi.json` when the deployed API
   may be newer than this skill.
2. Verify the key with `GET /subscription`; this also returns the plan, credit
   totals, and account-wide API concurrency limit.
3. Discover a model with `GET /models`. Never invent a model ID.
4. Fetch `GET /models/{pixio/...}` or `GET /params?modelId=...`. Never invent
   input names, enum values, or required fields.
5. When cost matters, call `POST /generations/estimate` before dispatch.
6. Upload local media or normalize remote media before using it in a model.
7. Submit with `POST /generate`, persist `contentId`, and poll
   `GET /generations/{id}` to `succeeded` or `failed`.
8. Refresh expiring output URLs by fetching the generation or asset again.

## Complete Public Surface

| Area | Routes |
|---|---|
| Discovery | `GET /guide`, `GET /openapi.json` |
| Models | `GET /models`, `GET /models/{id}`, `GET /params` |
| Prompting | `POST /prompts/optimize` |
| Cost/account | `POST /generations/estimate`, `GET /credits`, `GET /credits/ledger`, `GET /subscription` |
| Media ingestion | `POST /images`, `POST /media`, `POST /uploads` |
| Assets | `GET/POST/DELETE /assets`, `GET/PATCH/DELETE /assets/{id}`, `GET /assets/{id}/download`, `GET /assets/download` |
| Generations | `POST /generate`, `GET /generations`, `GET/DELETE /generations/{id}` |
| Saved workflows | `GET /workflows`, `GET/POST /workflows/{id}/runs`, `GET /workflows/{id}/runs/{runId}` |

Read `references/endpoints/route-map.md` for method, auth, mutation, and billing
classification of every route.

## Choose The Correct Media Path

- Use `POST /images` for a clean public image URL.
- Use `POST /media` for a clean public image, video, or audio URL.
- Use `POST /uploads` or `POST /assets` when the integration needs a reusable
  Pixio asset, `filePath`, signed URL metadata, or later asset management.
- A public media URL may be passed directly in a declared media parameter;
  Pixio imports it before dispatch. Local paths, private hosts, and localhost do
  not work as model inputs.

Read `references/guides/media-workflow.md` before implementing file handling.

## Cost-Aware Generation Protocol

Use this sequence for autonomous agents and user-facing products:

1. `GET /subscription` to learn the concurrency ceiling and credit balance.
2. `GET /models/{id}` to validate visibility and input shape.
3. `POST /generations/estimate` with the exact intended params.
4. Ask for approval when the caller's policy or estimated cost requires it.
5. `POST /generate` once.
6. Persist `contentId` before polling or returning control.
7. Poll with bounded backoff and stop on `succeeded` or `failed`.
8. Reconcile uncertain submissions through `GET /generations`; do not blindly
   resubmit after a timeout because `/generate` has no idempotency key contract.

Read `references/guides/errors-and-concurrency.md` for retry classification.

## Saved Workflow Protocol

Saved workflows must already exist in Pixio:

1. `GET /workflows` and select by returned ID.
2. Upload local media first and pass clean URLs in per-node overrides.
3. `POST /workflows/{id}/runs`, persist `runId`, and poll the run route.
4. Return final `outputs[]` plus failed step errors.

The public API can list and run workflows. It cannot create or edit workflow
definitions.

## Unsupported Public Capabilities

Do not claim that the user REST API can currently create, list, edit, export, or
delete these app projects:

- Boards or spatial canvas projects
- Canvas designs
- Chat conversations or Pix Agent tools
- Video Agent projects
- Cinema storyboards
- Cam View scenes or mobile camera sessions
- Timeline/video-editor projects, operations, renders, or exports

Do not call `/api/chat`, `/api/projects`, `/api/editor-agent`, `/api/latest/*`,
provider proxies, admin routes, or webhooks with a Pixio API key. Those routes
use different trust and authentication models. If a requested capability is
absent from `/api/v1/openapi.json`, report it as unsupported rather than trying
an internal route.

## Reference Routing

- Read `references/index.md` when choosing a document.
- Read `references/pixio-api.md` for the concise capability and contract matrix.
- Read `references/guides/agent-integration.md` for autonomous execution.
- Read `references/guides/integration-patterns.md` for Node, Python, serverless,
  mobile-backend, CI, and OpenAPI connectivity patterns.
- Read `references/guides/media-workflow.md` for uploads and URL lifetimes.
- Read `references/guides/errors-and-concurrency.md` for retries and recovery.
- Read `references/endpoints/route-map.md` for all public and non-public route
  boundaries.
- Read one file under `references/endpoints/` for exact endpoint contracts.
- Read one file under `references/examples/` for an end-to-end recipe.

## Non-Negotiable Agent Rules

- Use only model IDs returned for the authenticated account.
- Use the returned param schema and preserve parameter types exactly.
- Treat `202` as queued, not completed.
- Treat `outputUrl` and asset `url` values as potentially expiring.
- Treat `401` as missing, invalid, or revoked credentials; do not retry it.
- Treat `402` as a credit decision; surface `availableCredits`,
  `requiredCredits`, and `shortfall`.
- Treat `429` as account-wide backpressure; poll known jobs before retrying.
- Do not retry destructive operations automatically.
- Do not silently dispatch paid work after an ambiguous network failure.
- Do not expose provider IDs, provider secrets, internal storage paths, or
  app-only endpoints as part of the public contract.

## Completion Checklist

Before saying an integration is complete, verify:

- the API key is server-side and revocation produces `401`;
- `/subscription`, `/models`, and model params were read successfully;
- estimated cost and approval policy are handled;
- local media follows an upload path and remote media is public;
- `contentId` or `runId` is durably saved;
- terminal success and failure states are handled;
- `400`, `401`, `402`, `404`, `422`, `429`, `500`, `502`, and `503` have an
  explicit policy;
- signed URL expiry and refresh are handled;
- list pagination is followed while `hasMore` is true;
- destructive calls require deliberate user intent;
- no unsupported app-internal capability is represented as `/api/v1`.
