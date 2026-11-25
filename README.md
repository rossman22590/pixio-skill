# Pixio Skill

**Give your AI agent the whole Pixio studio.** One Agent Skill that teaches
Claude Code, Codex, and any skills-compatible agent to generate images, video,
and audio, direct finished films and music videos with Montage, and build
production integrations on the Pixio public API, all without wasting a credit.

```text
Use $pixio-skill to make a 30-second vertical music video from my song and
these three photos. Quote it first, test on Montage Basic, and give me the file.
```

- **Covers everything public:** every `/api/v1` route, both OpenAPI documents,
  and the Montage Director MCP.
- **Spends carefully:** quotes before it spends, keeps to your budget, and
  sends one idempotent request per job.
- **Knows the craft:** 62 Montage playbooks cover prompting, tiers, acting,
  sound, editing, and genres.
- **Stays current:** checks GitHub for updates once a day and fast-forwards
  safely.

Mirrors the deployed API as of **2026-11-16** (`skill-version.json`).

---

## Install

**Any skills manager**

```bash
npx skills add rossman22590/pixio-skill
```

**Claude Code (manual)**

```bash
git clone https://github.com/rossman22590/pixio-skill ~/.claude/skills/pixio-skill
```

**Codex (manual)**

```bash
git clone https://github.com/rossman22590/pixio-skill ~/.codex/skills/pixio-skill
```

Then give the agent your key as an environment variable. Create keys on the
**Integrations** screen in the Pixio app.

```bash
export PIXIO_API_KEY=your-key
node scripts/pixio-smoke.mjs   # read-only: checks the key, specs, models, credits
```

### Add the Montage Director MCP (optional)

The same key also works for the Montage tools over MCP: plan, quote, start,
and watch jobs.

```bash
claude mcp add --transport http montage-director https://beta.pixio.myapps.ai/api/v1/mcp \
  --header "Authorization: Bearer $PIXIO_API_KEY"
```

`pixio_start` refuses to run unless `confirm_spend: true` is set, so the agent
cannot spend by accident.

---

## What you can ask for

| You say | The agent does |
|---|---|
| "Make a product shot of this bottle on marble" | Picks a model by your real price, quotes it, generates once, and returns the file |
| "Cheapest good text-to-video for my plan?" | Reads `GET /pricing` and ranks models by what **your** account pays |
| "Music video for this song with these photos" | Montage `videos/music`: storyboard, Basic draft, final, then upscale |
| "A 2-minute short film with two characters" | Montage `videos/film` with a locked cast, voices, and dialogue |
| "Fix the lips at 0:42" or "Swap the actor" | Lip fix, face fix, Character Swap, or Montage Edit on just that window |
| "30 s ad with our logo and end card" | Film `commercial`, then `package` with your brand kit |
| "Build me a Node or Python client" | Typed client with auth, retries, idempotency, polling, and error codes |
| "Why did I get a 402 / 422 / 429?" | Branches on `code` and explains the fix |
| "Can the API do X?" | Checks both contracts and `/capabilities`, and says no plainly when it can't |

---

## Montage, in one minute

Montage is Pixio's Director API (`/api/v1/director/*`). It turns text,
pictures, songs, and voices into finished videos: clips, music videos, films,
ads, explainers, short dramas, and whole TV series with a fixed cast.

| Tier | `video_model` | Use it for |
|---|---|---|
| Montage Basic | `montage-basic` (default) | Tests and drafts, lip-sync locked to your own song, named looks, long films. The lowest price. |
| Montage Premium | `montage-premium` | Sharper, more lifelike motion: action, crowds, products |
| Montage Ultra / Ultra Plus / Max | `montage-ultra`, `-ultra-plus`, `-max` | Hero shots, up to native 1080p or 4K |
| Montage Quality | `montage-quality` | Native 1080p with sound, 4–30 s takes; cinema, fights, performance |
| Tier mix | `tier_mix: "auto"` | Each section on the tier that suits it |

The agent follows the house rules every time: **test on Basic**, use the
customer's own song first, use every picture they supplied, **no film grain**,
and quote prices in **Pixio credits only**. Start with
[`references/montage/pixio-director.md`](references/montage/pixio-director.md).

---

## How the agent spends credits

```text
GET /me  →  GET /pricing  →  POST /generations/estimate  →  approve?
        →  POST /generate  (Idempotency-Key)  →  poll  →  reconcile ledger
```

`scripts/pixio-run.mjs` runs that whole loop in one command and spends
**nothing** unless you pass a budget:

```bash
node scripts/pixio-run.mjs --model pixio/... --params '{"prompt":"..."}'                    # quote only
node scripts/pixio-run.mjs --model pixio/... --params '{"prompt":"..."}' --max-credits 50   # run it
```

| Script | What it does |
|---|---|
| `scripts/pixio-run.mjs` | Quotes, checks the budget, generates once with an idempotency key, polls, and reports the charge |
| `scripts/pixio-wait.mjs <contentId>` | Resumes polling a job that is already running. Never dispatches. |
| `scripts/pixio-smoke.mjs` | Read-only check of the key, specs, models, and credits |
| `scripts/pixio-skill-update.mjs` | Checks GitHub for a newer skill; `--apply` fast-forwards a clean clone |
| `scripts/check-montage-skills.mjs` | Keeps the Montage playbooks clean (no model names, v1 routes only) |

---

## What's inside

```text
SKILL.md                    entrypoint: Start Here, protocols, agent rules
references/
  index.md                  pick the right document
  pixio-api.md              the whole contract in tables
  endpoints/   (32)         one file per route family, including director.md
  guides/                   agent state machines, integrations, media, errors, billing
  examples/                 end-to-end recipes: Node, Python, image, video, workflows
  montage/     (62)         craft playbooks: tiers, prompting, formats, genres, fixes
  evals/                    trigger queries and behavior scenarios
scripts/                    run, wait, smoke, update, montage lint
agents/openai.yaml          Codex display metadata
```

**Full surface:** discovery, account, pricing and quotes, models and params,
the prompt optimizer, styles and the prompt library, uploads, assets and
folders, generations, workflows, typed projects (Boards, Canvas, Cinema,
Cam View, Video Agent, Editor), Montage Director, the streaming `/agent`,
characters, and training status.

---

## Safety

- **API keys are secrets.** Keep them out of browsers, mobile binaries, public
  repos, URLs, screenshots, and logs. Keys have full account access and
  revoke immediately.
- **No surprise spending.** The agent quotes before it spends, keeps to
  `--max-credits`, and sends one `Idempotency-Key` per job. It never retries
  paid work blindly after an ambiguous failure.
- **Public API only.** The agent never calls internal, admin, webhook, or
  browser-session routes. It reports a missing capability as unsupported
  instead of working around it.
- The smoke script is read-only and never starts generation work.

---

## Staying current

At the start of a session (at most once a day) the agent runs
`node scripts/pixio-skill-update.mjs`:

| Exit code | Meaning |
|---|---|
| `0` | Up to date |
| `10` | Newer version available. `--apply` fast-forwards a clean git clone and never overwrites local edits. |
| `1` | GitHub unreachable. The agent continues and reads `GET /guide` for anything newer. |

**Maintainers:** bump `skill-version.json` on every sync so installed copies
pick up the change.

## What's new

- **2026-11-24:** Montage Quality (`montage-quality`), native 1080p on text,
  image, and reference clips, Character Swap for 2–6 people,
  `replace_character`, and face fix modes (Single, Polish, Restore).
- **2026-11-22:** the Montage Director MCP (plan, quote with ready/blocked,
  start, jobs), fast drafts with `montage_draft`, motion copy, and cutting a
  finished video by its shots.
- **2026-11-21:** a Lip Sync endpoint, Premium images, and duets built from
  your own song sections.
- **2026-10-07:** `pixio-run.mjs`, the update checker, `choose-model.md`,
  behavior evals, and `creditsCharged` / `freeAllowance` / `notCoveredBy` on
  `/generate`.
- **2026-10-01:** every error body carries a machine `code`.

The full history is in `git log`.
