---
name: pixio-batch-variants
description: How an AI agent makes many versions efficiently with Montage (Pixio's Director API) - film `variants` (2-4 linked versions, each with new seeds and, with an idea, its own hook or ad format), takes of single clips and pictures with chosen seeds, two takes per action clip, one-clip redos, comparing takes and keeping the best (shots, QA, assemble with replace), and batch etiquette (the 8-job limit, waves, the queue, never resubmitting). Use whenever you plan A/B versions, ad variants, several takes, a batch or a series of jobs, or pick the best of several renders. Not for prices (that is pixio-cost-control) or fixing a failed job (that is pixio-errors-recovery).
---

# Batches and variants on Montage

Generative video is a lottery per seed: the same prompt can give a perfect take and a broken one. Making a few
versions and keeping the best is normal, but every version is a full render and every version is billed in Pixio
credits, on Montage Basic too. This skill is about getting the most choice for the least spend and render time.

Base URL `$BASE` (`https://beta.pixio.myapps.ai`), key in `Authorization: Bearer $PIXIO_API_KEY`. Every render is a
job you poll with `GET /api/v1/director/jobs/{id}`.

## House rules

- **Test on Basic.** Every test, draft or trial render uses `video_model: "montage-basic"` (also the default when
  `video_model` is left out). Premium or Ultra only when the user asks for it and has seen the quote
  (`?check=true`, `credits.quoted`).
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.

Every version of a music video uses the customer's song, and every variant gets every supplied picture. Before any
batch: quote one version with `?check=true`, multiply by the number of versions, show the total and wait for a yes.

## Decision rules (read these first)

1. **Vary on Basic.** Takes, A/B tests and seed hunts run on `video_model: "montage-basic"`, the cheapest tier. Use
   Premium only when the human asked for Premium and approved the multiplied quote; Premium makes one version at a
   time and has no draft, so its takes are separate jobs.
2. **Films: use `variants` (2-4)**, not N copies of the same POST. One call makes them all, each with its own seeds,
   and links them.
3. **Single clips and pictures: one job per take, each with its own `seed`.**
4. **Action clips get two takes.** Dialogue usually works first time; fights rarely do.
5. **Draft first.** Compare `speed: "draft"` versions (films and music videos on Basic), then render only the winner
   with `/final`.
6. **Redo one clip, not the whole film.** A bad clip in a good film is a `redo` with a new seed.
7. **Mind the limit.** At most 8 Director jobs run at once per account; send in waves, never more than you will
   actually review.

## 1. Film variants

`variants` is a field on `POST /api/v1/director/videos/film`: versions in all, 1-4 (default 1). With 2-4 Montage makes
that many films, as separate jobs:

- each variant gets new seeds and the same pictures, cast, voices and settings;
- with `idea`, each variant's writer is told to make it clearly different: a different opening hook (first 2 s),
  different shots, a different way into the story, with the same product, characters, brand and message;
- with `film_type: "commercial"` and `ad_style: "auto"`, each version gets a different ad format;
- the 202 answer lists the other jobs in `versionJobIds`; each extra version shows the job it was made with in
  `versionOf`;
- each extra version is billed like the first, and every version's credits are held when you start, so a `402`
  means nothing started. Not with `storyboard`.

```bash
# 1) price it (free; nothing starts): credits.quoted covers all three versions
curl -X POST "$BASE/api/v1/director/videos/film?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-basic -F duration=30 -F film_type=commercial -F variants=3 \
  -F "idea=A 30 s ad for a reusable steel water bottle: a cyclist refills it at a mountain spring." \
  -F "images=@bottle.png" -F "images=@cyclist.png" -F 'product_pictures=[1]'

# 2) after a yes, send it for real, once
curl -X POST "$BASE/api/v1/director/videos/film" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-basic -F duration=30 -F film_type=commercial -F variants=3 \
  -F "idea=A 30 s ad for a reusable steel water bottle: a cyclist refills it at a mountain spring." \
  -F "images=@bottle.png" -F "images=@cyclist.png" -F 'product_pictures=[1]'
# -> {"id": "A...", "versionJobIds": ["B...", "C..."], ...}
```

Store every id the moment the 202 arrives. On a timeout, poll the ids you have (or list your recent jobs with
`GET /api/v1/director/jobs?endpoint=videos/film`) instead of sending again: a resend makes a second, billed set.
Watch all of them with `GET /api/v1/director/jobs/{id}` for each.

## 2. Single clips and pictures: one job per seed

`POST /api/v1/director/videos/text`, `/image`, `/reference` and the `images/*` endpoints take an integer `seed`. Left
out, the seed is random and not reported back, so always send your own when you may want to repeat a take. To make
takes:

```bash
for S in 4101 4102; do
  curl -X POST "$BASE/api/v1/director/videos/reference" -H "Authorization: Bearer $PIXIO_API_KEY" \
    -F video_model=montage-basic -F "images=@kane.png" -F "images=@danny.png" -F duration=10 -F seed=$S \
    -F 'prompt=<clip2_prompt.txt'
done
```

- Same prompt, different seeds = takes of one idea. Different prompts, same seed = a fair A/B of the wording.
- Note the winning seed; it reproduces the look for a re-render or a redo.
- Reference pictures are cheap next to a video render: regenerate a picture with new seeds until it is right before
  you spend a video render on it (`references/montage/pixio-image-generation.md`).
- Keep every picture the user supplied in every take. Varying which pictures you send is not a variant; it is a
  different job, and dropping a user's picture breaks the house rules.

## 3. Two takes for action

Measured on fights: render every action clip twice (two seeds) and keep the take with the right people, a visible
hit and the wound in the right place.

- **Single action clip:** two jobs as in section 2.
- **Action film:** `variants=2` renders the whole film twice with different seeds. Then keep, per clip, the better take
  (section 5). Or, cheaper when only one or two clips are action: render the film once, check it, and redo only the
  action clips that failed with a new seed.
- Fight Flow is on automatically for shots that read as a fight (`fight_flow`). On Premium, action renders well;
  blood and wounds are allowed there.

## 4. Redo instead of re-render

```bash
curl -X POST "$BASE/api/v1/director/videos/film/$FILM/redo" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" -d '{"clip": 4, "seed": 9001}'
```

- Film: `{"clip": n}` (1-based), optional `seed` (default a new random one), optional corrected `prompt`,
  `clip_images`, `audios`, `no_speech`, `verbatim`. Music video: `POST /api/v1/director/videos/music/{id}/redo` with
  `{"section": n}`.
- The result is a new job; the original stays. The other clips are reused, so it costs about one clip.
- A redo follows the original job's tier, and a Premium retake costs the part price it was sold at. A Premium retake
  never switches to Basic; if Premium cannot be quoted it answers `503 premium_unavailable` and nothing is charged.
- Each redo is its own job and its own charge: add up `credits.charged` across the original, redos, finals, variants
  and face fixes for the running total.

## 5. Comparing takes and keeping the best

1. Wait until each take is `done` (poll every 10-30 s).
2. Free first: read the job's `qa` and (with `visual_qa`) `qaIssues`; `GET /api/v1/director/jobs/{id}/shots` gives each
   shot's start, end and a thumbnail.
3. Look: about one frame per second in action; listen to speech one 15 s clip at a time. Check people count, swapped
   or cloned faces, the prop, wound placement, posed crowds. The full method is in
   `references/montage/pixio-video-qa.md`.
4. Lip-sync measurements: `POST /api/v1/director/videos/edit/analyze` with `"checks": ["lipsync"]` (the minimum price).
   The wider Analyze checks cost more (about 16 credits a minute).
5. Score each take on the same few points (right people, the hit lands, faces hold, story beat clear) and keep the
   winner. Write down which seed won.

**Combining takes of one film.** Swap one shot of the main film for the better take's part with
`POST /api/v1/director/videos/assemble` and `replace` (priced like `videos/finish` on the finished length):

```json
{"replace": {"job_id": "MAIN_FILM_ID", "shot": 4, "sound": "original"},
 "clips": [{"job_id": "VARIANT_FILM_ID", "start_s": 45.0, "end_s": 60.0}]}
```

Shot numbers come from `GET /api/v1/director/jobs/MAIN_FILM_ID/shots`; read the variant's shots too, to find the
matching `start_s` / `end_s`. With `sound: "original"` the film's soundtrack plays on and the new part takes exactly
the old shot's time. Or simply deliver the winning variant as a whole.

**Keep or drop shots** of one finished video without re-rendering: `POST /api/v1/director/jobs/{id}/edit` with
`{"shots": [1, 2, 4, 3]}` (keep, drop, reorder, trim; priced like packaging on the edited length, `?dry_run=true` is
a free quote).

## 6. Batch etiquette

- **The limit:** at most 8 Director jobs run at once per account. A ninth answers `429 concurrency_limit` with a
  `Retry-After`; honour it rather than hammering.
- **Look first:** `GET /api/v1/director/queue` lists your own waiting and rendering jobs, oldest first, each with its
  place in line; each running job's `queue` object has `ahead` and `estimatedCompletionAt`. Tell the human the
  expected finish time before a big batch.
- **Send in waves.** A practical pace: a few jobs at a time (for example 3-5 clips, or one film with its variants),
  review, then the next wave. Do not queue 40 takes you will never look at.
- **Order:** for a series where order matters (episode 1 before 2), start the next only after the previous one has
  started, or simply wait for it.
- **Never resubmit on a timeout.** Store each id when the 202 arrives and keep polling it; a blind retry loop creates
  duplicate, billed jobs.
- **Cancel what you no longer need:** once a winner is clear, `DELETE /api/v1/director/jobs/{id}` the takes still
  waiting (finished parts are still charged).
- **Series of jobs:** keep a small table of job id, seed, status and verdict. `GET /api/v1/director/jobs`
  (`?limit=&before=&endpoint=`, newest first) recovers it if you lose track. For TV-style episodes see
  `references/montage/pixio-series-showrunner.md`.

## Good vs bad

- Good: "Three ad variants" -> one `/api/v1/director/videos/film` call with `variants=3` on Basic, drafts first, the
  human picks, `/final` on the winner.
- Good: a fight clip rendered with seeds 4101 and 4102, the better one kept, its seed recorded.
- Bad: ten identical POSTs "to get variety" (no linked set, ten full charges, your 8-job limit filled).
- Bad: re-rendering a whole 3-minute film because clip 7 is wrong; redo clip 7.
- Bad: Premium variants for a test.

## Checklist

- [ ] Variants on Basic unless the human approved Premium at the multiplied quote.
- [ ] Films: `variants` 2-4 in one call; noted `versionJobIds`.
- [ ] Clips: explicit `seed` per take, every id stored on arrival.
- [ ] Action clips: two takes, or a redo plan for failed action clips.
- [ ] Drafts compared before a full-quality `/final`.
- [ ] Queue checked (`GET /api/v1/director/queue`) and jobs sent in waves; leftovers cancelled.
- [ ] Takes compared on the same points; winning seed recorded; total `credits.charged` reported.
