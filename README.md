# Pixio User API Skill

Agent Skill for integrating with the complete Pixio public user REST API from
backends, workers, scripts, automations, CLIs, mobile backends, and agents.

It covers:

- API key authentication, revocation, and trust boundaries;
- OpenAPI and guide discovery;
- model selection and live parameter schemas;
- prompt optimization and generation cost estimates;
- credits, ledger, subscription, and concurrency;
- image/media normalization and managed uploads;
- complete asset list/get/rename/download/delete lifecycle;
- generation submission, history, polling, URL refresh, and deletion;
- saved workflow run submission/history/polling;
- retries, ambiguous paid submissions, signed URLs, and pagination;
- clear boundaries for unsupported app-only projects and internal routes.

## Install

From this checkout:

```bash
npx skills add .
```

Or install from the repository URL supported by your skill manager.

## Use

```text
Use $pixio-skill to build a cost-aware Node integration that uploads a local
reference, selects a visible edit model, estimates credits, generates once, and
returns the final output URL.
```

The skill entrypoint is `SKILL.md`. Detailed endpoint contracts, integration
patterns, examples, smoke checks, and evaluation prompts live under the folders
referenced directly from that file.

## Safety

Pixio API keys are secrets. Keep them out of browsers, mobile binaries, public
repos, screenshots, logs, and signed-URL query strings. The included smoke script
is read-only and never dispatches generation work.
