# Pixio Public API Skill

Agent Skill for integrating with the complete Pixio public REST API (`/api/v1`)
from backends, workers, scripts, automations, CLIs, desktop apps, mobile
backends, and agents. Mirrors the deployed contracts as of 2026-10-07.

It covers:

- API key authentication, immediate revocation, and trust boundaries;
- discovery through the media OpenAPI document, the platform OpenAPI
  document, `/capabilities`, and `/guide`;
- account identity, plan, credits, concurrency limit, and Maker daily caps
  (`/me`);
- the live per-account price list (`/pricing`) and quotes measured the way
  they bill (`/generations/estimate`);
- model discovery with tier and pricing fields, params with constraints,
  favorites, and read-only preferences;
- the full prompt optimizer, the style gallery with viral-template recipes,
  and the prompt library;
- idempotent generation, polling, billing reports, and ledger reconciliation;
- clean media URLs, managed uploads, asset folders, filtering by model,
  downloads (including Songcraft tiers), and resolving project media
  references;
- workflow create/read/update/delete and runs with per-node overrides;
- project authoring: generic and typed CRUD for Boards, Canvas, Cinema
  storyboards, Cam View scenes, Video Agent projects, and timeline editor
  projects; validated operations; prompt-to-project direction; Video Agent
  per-segment generation;
- the streaming Pixio agent (`/agent`), locked characters, and training
  status;
- retries, concurrency 429s, content-policy 422s, project 409s, signed URLs,
  page and cursor pagination;
- clear boundaries for unsupported surfaces and internal routes.

## Install

```bash
npx skills add .
```

Or install from the repository URL supported by your skill manager.

## Use

```text
Use $pixio-skill to build a cost-aware Node integration that identifies the
account, prices a model, quotes the exact request, generates once with an
idempotency key, polls, and reconciles the charge.
```

```text
Use $pixio-skill to direct a Cinema storyboard from this brief over the Pixio
API and resolve its frame images for display.
```

The skill entrypoint is `SKILL.md`. Endpoint contracts, guides, examples,
smoke checks, and evaluation prompts live under `references/` and `scripts/`.

## Changelog

- **2026-10-01**: every error body now carries a machine `code` beside `error`
  (documented in the new "Error envelope" section of
  `references/overview.md`); malformed JSON is `400 invalid_json`;
  `/generate` pipeline failures stay `400` and now carry a `code`
  (`invalid_request`, `provider_error`, `model_unavailable`,
  `plan_restricted`, `maker_in_flight`, `generation_failed`, `server_error`), so clients that
  branch on status are unaffected, and its idempotent replay also returns
  `providerId`/`modelId`; provider names
  and raw upstream bodies no longer appear in error text, generation, workflow
  run, or video-agent `error`/`reason` fields, and generation `params` echoes
  omit internal keys; workflow-run `429` matches `/generate`; workflow run
  lists return `hasMore` and clamp `limit` to 1-50 (never an error), and
  `/credits/ledger`, `/prompt-library`, and `/training` also return `hasMore`;
  `/prompts/optimize` charges 5 credits per call, only once validation has
  passed, and returns `cost`; `/agent` rejects histories over 1,000,000 characters
  with `413 request_too_large`; an unknown model on
  `/video-agent/projects/{id}/generate` stays `400 model_not_available`; the model
  detail routes return `outputs` and the list returns `defaultCredits` and
  `fromCredits`. The OpenAPI documents gained a shared `ApiError` schema and
  the `/agent`, `/models/favorites`, workflow CRUD, `/assets/models`,
  `/capabilities`, and Video Agent generate operations.
- **2026-10-02**: `/media` and `/images` accept only image, video, or audio
  (images 10MB, video 250MB, audio 30MB); a bad upload is `400
  invalid_request`, and a URL that is private or internal, redirects, is not
  media, or is too large is `400 invalid_media_url` (previously any file type
  was accepted and a failed URL download was `502`). `/prompts/optimize`
  attachment URLs must be public internet addresses, redirects are not
  followed, and a refused attachment is an uncharged `400`. Pixio storage paths
  and URLs in `/generate`, `/generations/estimate`, Video Agent generate, and
  workflow-run params (saved nodes included) must belong to the calling
  account, else `400 invalid_media_url`; re-upload another account's file
  (such as a public gallery output) through `/media` first. Saved workflows
  silently drop internal-only params on create and `PATCH`. Every id
  `GET /models` lists now always runs the listed model, an ambiguous loose id
  is `404 model_not_found`, and `modelId` on generations, assets, and the
  prompt library is the canonical listed id. `pixio/edit`, `pixio/remix`,
  `pixio/reframe`, and `pixio/image-to-3d` previously ran a different model
  than listed and now run the listed one.

## Safety

Pixio API keys are secrets. Keep them out of browsers, mobile binaries, public
repos, screenshots, logs, and signed-URL query strings. The included smoke
script is read-only and never dispatches generation work.
