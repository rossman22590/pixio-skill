---
name: pixio-cost-control
description: What Montage (Pixio's Director API) jobs cost in Pixio credits and how an AI agent keeps spend down - which calls are free and which bill, where prices come from (GET /api/v1/director/catalog), the free ?check=true / ?dry_run=true quote before a render, the job's credits object (quoted, charged), holds and settlement, drafts and redos instead of re-renders, and when to stop and ask the human. Use whenever a job might cost credits, the user asks what something costs or why a bill is high, or you plan a batch, a long film or a Montage Premium / Ultra render. Not for choosing a tier on quality grounds (that is references/montage/pixio-tier-choice.md) or the job lifecycle itself (that is references/montage/pixio-jobs-polling.md).
---

# Cost control on Montage

Every Montage call that makes something is billed in **Pixio credits** from the caller's balance, Montage Basic
included. A few calls are free (listed below). Know which is which before you press go, show the human the number,
and never spend twice by accident.

There are only two places a price comes from, and you never make one up:

1. **`GET /api/v1/director/catalog`** -> `prices` (unit `credits`): the price list, by name (`musicSection`,
   `filmClipFinal`, `filmClipDraft`, `setPicture`, `finishPerSecond`, ...).
2. **The free quote**: the same request with `?check=true` or `?dry_run=true`, which answers
   `200 { object: "director.preflight", credits: { quoted }, promptCheck, ... }` and starts nothing.

## House rules

- **Test on Basic.** Tests, drafts and trial renders run on Montage Basic. A request without `video_model` always
  renders on Basic; Montage Premium or Ultra only when the user asks for it and has seen the quote.
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture to save credits, time or for a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.

## Decision rules (read these first)

1. **Quote before every paid render that has a quote.** Send the same request with `?check=true` (or
   `?dry_run=true`) and read `credits.quoted`. Show that number to the human and wait for a yes before the long or
   paid ones (music videos, films, remakes, episodes, anything on Premium or Ultra, any batch).
2. **No quote available? Price it from the catalog.** Other endpoints answer `400 preflight_unavailable` to either
   flag (nothing starts). Work the price out from `GET /api/v1/director/catalog` -> `prices` and say it is an
   estimate.
3. **Never resubmit on a timeout.** Montage has no idempotency key: a second POST is a second job and a second
   hold. Keep the job id from the `202`, poll `GET /api/v1/director/jobs/{id}`; if the POST itself timed out, look
   for the job in `GET /api/v1/director/jobs?endpoint=<endpoint>&limit=5` before sending again.
4. **Fix one clip, not the whole video.** `POST /api/v1/director/videos/film/{id}/redo` (`clip`) and
   `POST /api/v1/director/videos/music/{id}/redo` (`section`) render one part again as a new job; a full re-submit
   renders and bills every part again.
5. **Look cheap first.** `speed: "draft"` on Basic films and music videos, then `/final` when it is right.
6. **Free checks before paid fixes:** `POST /api/v1/director/prompts/check`, the `?check=true` preflight and
   `GET /api/v1/director/jobs/{id}/shots` cost nothing.
7. **Read `credits` when the job ends** and report it: `credits.quoted` was held, `credits.charged` is what was
   billed.

## What is free and what bills

| Call | Cost |
|---|---|
| `GET /api/v1/director/catalog`, `GET /api/v1/director/jobs`, `GET /api/v1/director/jobs/{id}`, `GET /api/v1/director/queue`, file downloads | free |
| `?check=true` / `?dry_run=true` preflights (on the endpoints listed below) | free, nothing starts |
| `POST /api/v1/director/prompts/check` | free, synchronous |
| `GET /api/v1/director/jobs/{id}/shots` and `.../shots/{n}` | free |
| Brands, series and cast saves (`/director/brands`, `/director/series`), `GET /director/filters`, `GET /director/voiceover/voices`, `POST /director/looks`, `GET .../filter_preview` | free |
| `POST /api/v1/director/jobs/{id}/song/rebuild`; a Premium music video's `output.withOriginalSong` | free |
| `singers`, `singer_parts`, `voice_samples`, `clip_audios`, `no_speech`, `fade`, `voice_clone`, filters, captions, fine print, packshot, typed voiceover inside packaging | free extras (no change to the price) |
| Single shots (`videos/text|image|reference`) | per second (`videoFastPerSecond` or `videoQualityPerSecond`), billed as at least 8 s |
| Music videos | per 15 s section (`musicSection`, draft `musicSectionDraft`), plus `writerRound` with an `idea`, plus designed pictures (`setPicture` each) |
| Films | per 15 s clip (`filmClipFinal`, draft `filmClipDraft`), plus writing and designed pictures with an `idea`; `adReview`, `factCheck`, `episodeRecap` where they apply |
| Montage Premium and Ultra | priced from the studio's quote of the takes plus `premiumPrompts` for writing their prompts, in place of the Basic part price; only the `?check=true` quote tells you the number |
| Upscale, finish, packaging, cutting by shots | `upscaleMostDetail` per started 15 s; `finishPerSecond` / `packagePerSecond` on the seconds written, each with a minimum |
| Face fix | `faceFix` per section it visibly changed |
| Lip fix, Lip fix auto, Relip, Montage Edit, Montage Create, Montage Analyze, Understand | priced from the studio's quote of the exact request, at least 16 credits; no free preflight |
| Crop, graphics, assemble, audio tools (`/director/audio/*`) | priced like finishing on the seconds made (with a minimum) or a fixed amount; see the catalog |
| `visual_qa`, `score`, `laugh_track`, `steps` above the default, `vsa: false`, `fix_prompt: "ai"`, storyboard stills | each adds its own catalog price; the quote shows the total |

When unsure whether something bills, assume it does and price it.

### The free quote: where it works

| Endpoint | Flag |
|---|---|
| `videos/text`, `videos/image`, `videos/reference`, `videos/music`, `videos/film` | `?check=true` (quote plus prompt report) or `?dry_run=true` |
| `videos/remake`, `videos/package`, `series/{id}/episodes`, `jobs/{id}/edit` | `?dry_run=true` |
| anything else | no quote: `400 preflight_unavailable`, nothing starts |

## The quote: the price before the render

Add the flag to the same URL with the same body. Nothing renders, nothing is held, no job is stored.

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/film?check=true" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F duration=60 -F video_model=montage-premium -F resolution=480p \
  -F "idea=A courier races a storm across a desert town to deliver a letter." \
  -F "images=@courier.png"
```

The answer carries (numbers illustrative):

```json
{
  "object": "director.preflight",
  "endpoint": "videos/film",
  "mode": "check",
  "credits": { "quoted": 2140 },
  "promptCheck": { "issues": [], "counts": {} }
}
```

- With `variants`, `credits` also has `perVersion` and `versions`; `quoted` is the total for every version.
- A single shot with packaging (`brand_id` or `package`) splits into `credits.clip` and `credits.packaging`.
- A note says when the real request would be refused (for example a checker ERROR).

Present it like this:

> "This 60 s film on Montage Premium at 480p is quoted at 2,140 credits. The same film on Montage Basic quotes
> 1,370 credits, and a Basic draft less again. Go ahead on Premium?"

(Both numbers come from two `?check=true` calls, one per `video_model`.)

Bad: starting the Premium job and telling the human afterwards. Bad: quoting a number you worked out in your head
when a free quote was available.

## The `credits` object on every job

Every job (`GET /api/v1/director/jobs/{id}`) carries `credits: { quoted, charged }`.

- **Held:** the quote is reserved when the job starts; `402 insufficient_credits` (with the required amount) means
  nothing started.
- **Settled once:** the quote when the job is `done`. A music video or film that stops early is charged only for
  finished sections / clips plus any writing; a job that fails before rendering anything costs nothing.
- **Cancel** (`DELETE /api/v1/director/jobs/{id}`) still charges finished parts.
- **Designed pictures:** the hold covers the most the studio might design (`filmDesignedPictures` for a film or
  episode, `designedSets` for a music video); only the pictures made are charged.
- **Face fix** is charged only for the sections it visibly changed (`faceFixReport`); the rest of the hold goes back.
- **Variants:** each extra version is its own job (`versionJobIds`), billed like the first; every version is held up
  front.
- **Shot packaging:** the packaging job (`packageJobId`) is held with the shot and given back if it never starts
  (`packageSkipped`).
- **Premium fallback:** if Premium can't be quoted the job starts on Basic at the Basic price
  (`videoModel: "montage-basic"`), and anything the studio renders on Basic instead is charged at the Basic price.

Reporting:
- "Quoted 1,644 credits, charged 1,644" or "charged 920 of 1,644: it stopped after 4 of 7 sections".
- "What did the film cost in all, with the fixes?" -> add up `credits.charged` of the original job and every redo,
  final, face fix, packaging and variant job you started from it (`sourceJobId` / `versionOf` link them).

## Keeping spend down

**Drafts (Montage Basic).** `speed: "draft"` on `/api/v1/director/videos/film` (`filmClipDraft` a clip) and
`/api/v1/director/videos/music` (`musicSectionDraft` a section, smaller frame). When it is right,
`POST /api/v1/director/videos/film/{id}/final` or `/api/v1/director/videos/music/{id}/final` renders the same clips,
pictures and seeds at full quality as a new job, never re-charging the writing or the sets. Premium and Ultra have no
draft (they are already full quality): test the idea on a Basic draft first.

**Redo, don't resubmit.**

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/film/$JOB/redo" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"clip": 3, "seed": 777}'
```

A redo costs one clip or section. A Premium retake costs the part price it was sold at and never switches to Basic
(if Premium can't be quoted it answers `503 premium_unavailable` and nothing is charged).

**Cut instead of re-render.** A finished video with one bad shot can often be cut around:
`GET /api/v1/director/jobs/{id}/shots` (free), then `POST /api/v1/director/jobs/{id}/edit` with the shots to keep
(`?dry_run=true` quotes it, priced like packaging on the edited length).

**Fix the part, not the video.** Lips off in one stretch: `POST /api/v1/director/videos/lipfix` on a 4-14 s window,
or Lip fix auto (`/videos/lipfix/auto`, held as `max_windows` x `tries` lip fixes, charged only for the tries it
renders). Far faces soft: `videos/facefix` (charged only for sections it visibly changed). See
`references/montage/pixio-lipsync-fixing.md`.

**Tier mix instead of all-Premium.** `tier_mix: "auto"` on a Premium film or music video puts sung or spoken
close-ups on Basic at the Basic price and only the rest on Premium (`references/montage/pixio-tier-choice.md`).

**Write once, render many.** `POST /api/v1/director/prompts/write` and `/director/music/plan` are writer jobs
(`writerRound`); reuse their `result` with `verbatim: true` instead of paying for a new `idea` each time. On Premium
and Ultra `verbatim: true` also skips the `premiumPrompts` charge.

**Variants multiply the bill.** `variants: 3` makes three full films. The quote already shows the total; say it as
"3 x 1,370 = 4,110 credits" and ask (`references/montage/pixio-batch-variants.md`).

**Extras are opt-in.** `visual_qa`, `upscale`, `finish`, `score`, `laugh_track`, `fix_prompt: "ai"`, `steps` above
the default and `vsa: false` all add to the price. Turn them on for the final, not the draft.

**No blind retries.** Retry only `429 concurrency_limit` (after `Retry-After`; at most 8 Director jobs run at once)
and `503 service_unavailable` / `502 studio_error` (nothing was charged). A job that ended `failed` needs a fix first
(`references/montage/pixio-errors-recovery.md`).

**Catch errors before the hold.** Text over a limit gets `400 invalid_request` naming the field, and an
official-format prompt with checker errors gets `422 prompt_check_failed`, both before anything is held. Run
`?check=true` and fix every ERROR first.

## When to ask the human

Ask (with the quote, or a catalog estimate where there is no quote) before:
- any Montage Premium or Ultra render, any `variants` above 1, any `tier_mix` job;
- any music video, film, remake or episode, and anything over 2 minutes;
- Montage Edit / Create, Montage Analyze, Relip, Lip fix auto, `visual_qa: "full"` across a long video;
- a batch of more than a handful of jobs;
- re-running a paid job that failed.

No need to ask for: `?check=true` / `?dry_run=true`, `prompts/check`, reading jobs and the catalog, the free calls
in the table above. A single short Basic test shot is cheap, but still say what it costs.

## Checklist

- [ ] Every paid render with a free quote was priced with `?check=true` / `?dry_run=true` first, and the human said
      yes to that number.
- [ ] Calls without a quote were priced from `GET /api/v1/director/catalog` and called an estimate.
- [ ] Tests and drafts on Montage Basic (`video_model` left out or `montage-basic`).
- [ ] Draft first for Basic films and music videos; `/final` when approved.
- [ ] Bad clip -> `redo`; bad lips -> lip fix; one bad shot -> `jobs/{id}/edit`; never a full re-render for one fault.
- [ ] No resubmit after a timeout: polled the id, or found it in `GET /api/v1/director/jobs`.
- [ ] Reported `credits.quoted` and `credits.charged` (and the total over every follow-up job).
