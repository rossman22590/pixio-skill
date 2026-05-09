# Pixio API Skill

Agent Skill for using the Pixio API from agents, backend services, scripts, automations, and CLIs.

This skill teaches compatible agents how to:

- authenticate with Pixio API keys;
- list visible Pixio models;
- fetch model input params;
- upload local files and import public media URLs;
- create generations;
- poll generation results;
- check account credits;
- handle Pixio API errors and account-wide concurrency.

## Install

From a local checkout:

```bash
npx skills add ./scripts/pixio-skill
```

Install globally:

```bash
npx skills add -g ./scripts/pixio-skill
```

If this skill is moved to its own repository, install it from the repo:

```bash
npx skills add <owner>/<repo>
```

## Usage

After installing, ask an agent something like:

```text
Use my Pixio API key to generate a product image and return the output URL.
```

or:

```text
Create Pixio API docs for pixio/video-ops/add-audio with curl examples.
```

The agent should load `pixio-skill`, call the relevant references, and follow the Pixio API workflow.

## Files

- `SKILL.md`: required Agent Skill entrypoint and routing instructions.
- `references/index.md`: map of all reference docs.
- `references/endpoints/`: endpoint-specific API docs.
- `references/guides/`: integration, media, errors, and model-docs guides.
- `references/examples/`: practical example workflows.
- `references/evals/trigger-queries.json`: sample prompts for testing skill activation.

## Safety

Pixio API keys are secrets. Do not put them in browser code, public repos, screenshots, or logs. Use them from a backend, server action, worker, CLI, automation, or agent runtime.
