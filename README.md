# Pixio Public API Skill

Agent Skill for integrating with the complete Pixio public REST API (`/api/v1`)
from backends, workers, scripts, automations, CLIs, desktop apps, mobile
backends, and agents. Mirrors the deployed contracts as of 2026-09-20.

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

## Safety

Pixio API keys are secrets. Keep them out of browsers, mobile binaries, public
repos, screenshots, logs, and signed-URL query strings. The included smoke
script is read-only and never dispatches generation work.
