# Full Next API Route Map

This inventory reflects the current `apps/web/app/api/**/route.*` surface. Use it to decide whether an endpoint is part of the stable Pixio public API, app-internal, admin-only, provider-specific, or webhook-only.

## Classification Rules

- **Public stable API**: `/api/v1/**`. External agents should use these routes.
- **Public discovery**: `/api/v1/guide` and `/api/v1/openapi.json`; no API key required.
- **App authenticated**: browser/app routes that use Supabase session auth or app-specific handlers, not Pixio API keys.
- **Admin/internal**: app operator routes. Do not call from external integrations.
- **Provider proxy/catalog**: routes backed by provider keys. Use only inside Pixio app code.
- **Webhook**: inbound provider/billing/database webhook receivers. Never call from agents except when explicitly testing local webhook handlers.
- **Removed**: route file exists but intentionally has no handler.

## Public Stable API (`/api/v1`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/guide` | Public Markdown/JSON API guide. |
| GET | `/api/v1/openapi.json` | Public OpenAPI 3.1 spec. |
| GET | `/api/v1/models` | List or fetch visible public models. |
| GET | `/api/v1/params` | Fetch accepted params for one model. |
| POST | `/api/v1/images` | Clean public image URL from file or URL. |
| POST | `/api/v1/media` | Clean public image/video/audio URL from file or URL. |
| POST | `/api/v1/uploads` | Upload/import media into Pixio user assets. |
| POST | `/api/v1/generate` | Queue a media generation. |
| GET | `/api/v1/generations/[id]` | Poll generation status and outputs. |
| GET | `/api/v1/credits` | Fetch account credit balance. |
| GET | `/api/v1/workflows` | List saved workflows for the API key account. |
| GET, POST | `/api/v1/workflows/[id]/runs` | List workflow runs or queue a run. |
| GET | `/api/v1/workflows/[id]/runs/[runId]` | Poll one workflow run and outputs. |

## Authenticated App And Chat Routes

| Method | Path | Classification |
|---|---|---|
| POST | `/api/chat` | App chat agent route. |
| GET | `/api/chat/assets` | App asset library for logged-in user. |
| POST | `/api/chat/basic` | App chat variant. |
| GET, POST | `/api/chat/conversations/[id]` | App chat conversation route. |
| POST | `/api/chat/critique` | App chat critique route. |
| POST | `/api/chat/generation-status` | App chat generation polling helper. |
| POST | `/api/chat/transcribe` | App chat transcription route. |
| POST | `/api/ai/captions` | App AI captions route. |
| POST | `/api/prompt-optimizer/generate` | App prompt optimizer generation route. |
| GET | `/api/projects` | Video editor projects handler. |
| POST | `/api/latest/local-media/upload` | Video editor local-media upload. |
| GET | `/api/latest/local-media/serve/[...path]` | Video editor local-media serve. |
| POST | `/api/latest/local-media/delete` | Video editor local-media delete. |
| POST | `/api/latest/lambda/render` | Latest renderer lambda render route. |
| POST | `/api/latest/lambda/progress` | Latest renderer lambda progress route. |
| POST | `/api/latest/ssr/render` | Latest SSR render route. |
| POST | `/api/latest/ssr/progress` | Latest SSR progress route. |
| GET | `/api/latest/ssr/download/[id]` | Latest SSR download route. |
| GET | `/api/image-proxy` | Allowlisted media proxy. |
| GET | `/api/fonts/[name]` | Font serving route. |
| GET | `/api/cam-view/anim` | Local-dev-only Cam View FBX server. |
| POST | `/api/upload-film/file` | Film festival file upload utility. |
| POST | `/api/upload-film` | Film festival submission email route. |
| GET | `/api/newsletter/track/open` | Newsletter open tracker. |
| GET | `/api/gallery/[id]/opengraph-image` | Gallery OG image. |
| GET | `/api/share/[id]/opengraph-image` | Share OG image. |
| GET | `/api/share/boards/[projectId]/[token]/opengraph-image` | Boards share OG image. |
| GET | `/api/share/canvas/[projectId]/[token]/opengraph-image` | Canvas share OG image. |
| GET | `/api/workflows/[id]/opengraph-image` | Workflow OG image. |
| none | `/api/storage/download` | Removed; do not use. |

## Admin And Internal Routes

| Method | Path | Classification |
|---|---|---|
| GET | `/api/admin/audit-feed` | Admin feed. |
| GET | `/api/admin/dashboard-activity` | Admin dashboard. |
| POST | `/api/admin/generated-content/[id]/retry-webhook` | Admin generated-content operation. |
| POST | `/api/admin/generated-content/[id]/stop` | Admin stop generation. |
| POST | `/api/admin/lora-training/[id]/stop` | Admin stop LoRA training. |
| DELETE, GET, POST | `/api/admin/prompt-optimizer` | Admin prompt optimizer management. |
| GET | `/api/admin/railway-logs` | Admin log retrieval. |
| GET | `/api/admin/run-feed` | Admin run feed. |
| POST | `/api/admin/workflow-runs/[id]/stop` | Admin stop workflow run. |
| POST | `/api/internal/workflows/run` | Internal workflow runner. |
| POST | `/api/generation/useapi-runway-sync` | Internal generation sync helper. |

## Provider Catalog, Proxy, And Utility Routes

| Method | Path | Classification |
|---|---|---|
| POST | `/api/acedata/generators` | Acedata provider helper. |
| GET | `/api/argil/assets` | Argil assets provider proxy. |
| GET | `/api/argil/avatars` | Argil avatars provider proxy. |
| GET | `/api/argil/avatars/[id]` | Argil avatar detail proxy. |
| GET | `/api/argil/subtitles` | Argil subtitles provider proxy. |
| GET | `/api/argil/voices` | Argil voices provider proxy. |
| POST | `/api/elevenlabs/add-shared-voice` | ElevenLabs provider helper. |
| POST | `/api/elevenlabs/music/plan` | ElevenLabs music planning helper. |
| GET | `/api/elevenlabs/shared-voices` | ElevenLabs shared voices proxy. |
| GET | `/api/elevenlabs/voices` | ElevenLabs voices proxy. |
| GET, POST | `/api/fal/proxy` | Fal provider proxy. |
| GET | `/api/heygen/catalog` | HeyGen catalog proxy. |
| GET, POST | `/api/luma/proxy` | Luma provider proxy. |
| GET | `/api/mureka/moods-and-genres` | Mureka catalog proxy. |
| GET | `/api/mureka/refs` | Mureka refs proxy. |
| GET, POST | `/api/useapi/proxy` | UseAPI provider proxy. |

## Webhook Routes

| Method | Path | Source |
|---|---|---|
| POST | `/api/argil/webhook` | Argil. |
| POST | `/api/billing/webhook` | Billing provider. |
| POST | `/api/db/webhook` | Database auth/user events. |
| POST | `/api/elevenlabs/webhook` | ElevenLabs. |
| POST | `/api/fal/webhook` | Fal. |
| POST | `/api/freepik/webhook` | Freepik. |
| POST | `/api/lora-training/webhook` | LoRA training. |
| POST | `/api/luma/webhook` | Luma. |
| POST | `/api/meshy/webhook` | Meshy. |
| POST | `/api/piapi/webhook` | PiAPI. |
| POST, PUT | `/api/pixio/webhook` | Pixio provider callback. |
| POST | `/api/replicate/webhook` | Replicate. |
| POST | `/api/resend/webhook` | Resend. |
| POST | `/api/sync/webhook` | Sync provider. |
| POST | `/api/useapi/webhook` | UseAPI. |
| POST | `/api/webhooks/acedata/suno` | Acedata Suno. |

## Agent Rules

- Use only `/api/v1/**` for third-party/API-key integrations unless the human explicitly asks about Pixio app internals.
- Do not call admin, internal, provider proxy, or webhook routes from external agents.
- Do not document provider secrets, webhook tokens, production URLs, or local filesystem paths in generated examples.
- If a route is not in `/api/v1`, treat it as unstable unless a Pixio maintainer says otherwise.
