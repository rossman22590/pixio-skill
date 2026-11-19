# Pixio API Reference Index

Load only what the current task needs.

## Orientation

- `overview.md`: trust model, capability domains, lifecycle, supported and
  unsupported surfaces.
- `pixio-api.md`: every public method, major response fields, status policy.
- `endpoints/route-map.md`: complete route inventory plus internal-route
  boundaries.
- `endpoints/openapi.md`: both OpenAPI documents, `/capabilities`, and
  generated-client guidance.

## Endpoint Contracts

Discovery and account:

- `endpoints/guide.md`: `GET /guide`.
- `endpoints/openapi.md`: `GET /openapi.json`, `GET /platform/openapi.json`.
- `endpoints/capabilities.md`: `GET /capabilities`.
- `endpoints/me.md`: `GET /me` (identity, plan, credits, concurrency, Maker caps).
- `endpoints/credits.md`: `GET /credits`, `GET /credits/ledger`, `GET /subscription`.
- `endpoints/pricing.md`: `GET /pricing` (live per-account price list).

Models and prompting:

- `endpoints/models.md`: list, query, detail, tier fields, pricing basis.
- `endpoints/params.md`: input schema, `constraints`, `outputs`.
- `endpoints/model-favorites.md`: `GET/POST/DELETE /models/favorites`.
- `endpoints/preferences.md`: `GET /preferences/models`, `GET /preferences/models/catalog`.
- `endpoints/prompt-optimization.md`: `GET/POST /prompts/optimize` (legacy and full optimizer).
- `endpoints/styles.md`: `GET /styles` (styles and viral templates with recipes).
- `endpoints/prompt-library.md`: `GET /prompt-library`, `GET /prompt-library/{id}`.

Generation:

- `endpoints/generation-estimates.md`: `POST /generations/estimate` and the `quote` object.
- `endpoints/generate.md`: `POST /generate`, `Idempotency-Key`, 402/422/429 bodies.
- `endpoints/generations.md`: list, poll, `billing`, `media`, delete.

Media and assets:

- `endpoints/images.md`: clean image URL creation.
- `endpoints/media.md`: clean image/video/audio URL creation.
- `endpoints/media-resolve.md`: `POST /media/resolve` for project media references.
- `endpoints/uploads.md`: managed asset ingestion, `?collectionId=`.
- `endpoints/assets.md`: list, filter by model, get, rename, download, delete, Songcraft tiers.
- `endpoints/collections.md`: asset folders and filing.

Workflows and projects:

- `endpoints/workflows.md`: workflow CRUD, definition schema, runs, overrides.
- `endpoints/projects.md`: generic and typed project CRUD, operations, from-prompt, error codes.
- `endpoints/video-agent.md`: Video Agent planning and per-segment generation.
- `endpoints/director.md`: Director studio — music videos, films, shots, images, songs, commercials (brands, packaging, versions), TV series and season plans, edit by shots; jobs, parts, billing.

Agent and account memory:

- `endpoints/agent.md`: `POST /agent` SSE stream.
- `endpoints/characters.md`: locked character CRUD.
- `endpoints/training.md`: read-only training job status.

## Operating Guides

- `guides/agent-integration.md`: safe autonomous execution protocol and state machines.
- `guides/integration-patterns.md`: cURL, Node, Python, serverless, desktop,
  mobile backend, CI, generated clients, secret handling.
- `guides/media-workflow.md`: URL normalization vs managed assets vs project references.
- `guides/errors-and-concurrency.md`: retry matrix, idempotency, ambiguous dispatch.
- `guides/pricing-and-billing.md`: list vs your price, quotes, Maker caps, reconciliation.
- `guides/model-docs-template.md`: produce accurate docs for one model.

## Connected Examples

- `examples/cost-aware-generation.md`: `/me`, pricing, quote, idempotent generate, poll, reconcile.
- `examples/asset-lifecycle.md`: upload, list, rename, download, delete.
- `examples/saved-workflow.md`: create or select a workflow, run it, collect outputs.
- `examples/project-authoring.md`: board from prompt, operations, resolve media.
- `examples/agent-conversation.md`: stream `POST /agent` and pick up generation IDs.
- `examples/node-client.md`: reusable Node/TypeScript-style fetch client.
- `examples/python-client.md`: reusable Python standard-library client.
- `examples/text-to-image.md`, `examples/image-edit.md`,
  `examples/text-to-video.md`, `examples/add-audio-to-video.md`: single-model recipes.

## Reusable Scripts

- `scripts/pixio-smoke.mjs`: read-only connectivity check (`/me`, both specs, `/capabilities`, `/models`, `/credits`).
- `scripts/pixio-wait.mjs`: poll one existing generation without dispatching work.
- `scripts/pixio-run.mjs`: quote, budget check, one idempotent generate, poll. Quote only unless `--max-credits` is given.
- `scripts/pixio-skill-update.mjs`: check GitHub for a newer skill; `--apply` fast-forwards a clean git clone.
- `examples/choose-model.md`: cheapest suitable model for this account from `GET /pricing`.
- `evals/behavior-scenarios.json`: behaviour checks for agents using this skill.

## Skill Evaluation

- `evals/trigger-queries.json`: should-trigger and should-not-trigger prompts.

## Montage Craft Skills

How to make good videos with `/api/v1/director/*` (Montage), one file per
topic in `montage/`. Start with `montage/pixio-director.md`, the end-to-end
playbook; it routes to the rest. `endpoints/director.md` stays the contract.
`node scripts/check-montage-skills.mjs` keeps them free of model names and
non-v1 routes.

Running jobs:

- `montage/pixio-director.md`: end-to-end playbook and index.
- `montage/pixio-tier-choice.md`: Montage Basic, Premium, Ultra or a tier mix.
- `montage/pixio-cost-control.md`: what jobs cost in credits, quoting first.
- `montage/pixio-jobs-polling.md`: job lifecycle, polling, downloads.
- `montage/pixio-errors-recovery.md`: every error and how to recover.
- `montage/pixio-batch-variants.md`: many versions efficiently.
- `montage/pixio-storyboarding.md`: the storyboard stop.
- `montage/pixio-video-qa.md`: checking a video before the user sees it.
- `montage/pixio-understand.md`: structured reads of any video or sound.

Prompting:

- `montage/montage-basic-prompting.md`: prompts for Montage Basic and images.
- `montage/montage-premium-prompting.md`: prompts for Premium and Ultra.
- `montage/montage-edit-prompting.md`: instructions for Montage Edit.
- `montage/pixio-prompt-director.md`: high-control shot prompts.
- `montage/pixio-image-prompter.md`: pictures that videos are built on.

Formats:

- `montage/pixio-long-form.md`: one unbroken 20-60 s take.
- `montage/pixio-photoreal-shorts.md`: believable live-action shorts, 1-20 min.
- `montage/pixio-blocking-map.md`: staging people with a colour-coded outline picture.
- `montage/pixio-music-video.md`, `montage/pixio-duets.md`,
  `montage/pixio-dance.md`, `montage/pixio-lyric-captions.md`
- `montage/pixio-film.md`, `montage/pixio-short-drama.md`,
  `montage/pixio-series-showrunner.md`, `montage/pixio-remake.md`
- `montage/pixio-ads.md`, `montage/pixio-product-ads.md`,
  `montage/pixio-brand-promo.md`, `montage/pixio-brands.md`,
  `montage/pixio-ugc-creator.md`, `montage/pixio-game-trailers.md`
- `montage/pixio-explainers.md`, `montage/pixio-documentary.md`,
  `montage/pixio-kids.md`, `montage/pixio-social-formats.md`,
  `montage/pixio-thumbnails-posters.md`

Genres and looks:

- `montage/pixio-horror.md`, `montage/pixio-comedy.md`,
  `montage/pixio-action-fights.md`, `montage/pixio-sci-fi-fantasy.md`
- `montage/pixio-anime-styles.md`, `montage/pixio-3d-animation.md`,
  `montage/pixio-paper-handdrawn.md`
- `montage/pixio-looks-styles.md`, `montage/pixio-lighting-color.md`

Craft:

- `montage/pixio-acting.md`, `montage/pixio-emotion-acting.md`,
  `montage/pixio-characters.md`, `montage/pixio-dialogue-voices.md`
- `montage/pixio-camera-language.md`, `montage/pixio-transitions-continuity.md`,
  `montage/pixio-hooks-openings.md`, `montage/pixio-sound-design.md`

Tools:

- `montage/pixio-audio-tools.md`, `montage/pixio-song-generation.md`,
  `montage/pixio-lipsync-fixing.md`, `montage/pixio-localization.md`
- `montage/pixio-image-generation.md`, `montage/pixio-image-editing.md`
- `montage/pixio-video-editing.md`, `montage/pixio-graphics-titles.md`,
  `montage/pixio-upscale-finish.md`
