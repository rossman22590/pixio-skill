---
name: pixio-director
description: The end-to-end playbook for an AI agent delivering a finished video with Montage (Pixio's Director API) - which endpoint fits the request, Montage Basic vs Premium vs Ultra, GET /api/v1/director/catalog, prompts via the writer or the checker, the free ?check=true / ?dry_run=true quote before spending, the job lifecycle (202, polling, output.url), storyboard and draft to final, the error body, and which fix to pick. Use whenever you plan, start, watch, check or repair any Director job, and read it first; then open the specialist file in references/montage/ it points to.
---

# Montage: from a request to a finished video

Montage (Pixio's Director API) turns text, pictures, songs and voices into finished videos. Every render is a job
that takes minutes. Your job: pick the endpoint, get the prompts right, spend nothing by accident, wait properly,
check the result, fix only what is wrong, and hand the user the finished file (`output.url`).

`GET /api/v1/montage` (public, no key) explains Montage for agents. `GET /api/v1/director/catalog` lists every
endpoint with its accepted fields, the looks and styles, the limits and the credit prices. The full reference is
`references/endpoints/director.md`.

Base URL: `https://beta.pixio.myapps.ai`; every path is under `/api/v1/director/`. Examples use `$BASE` and
`$PIXIO_API_KEY`.

## House rules

- **Test on Basic.** Every test, draft or trial render runs on Montage Basic (`video_model: "montage-basic"`; it is
  also what you get when you leave `video_model` out). Basic is billed in credits like everything else, just less.
  Premium or Ultra only when the user asks for it and has seen the quote.
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.**

Auth: `Authorization: Bearer $PIXIO_API_KEY` on every request (never in a URL). Fields that the endpoint does not
list in the catalog are **ignored**, not rejected, so a typo silently falls back to the default: copy field names
exactly from `GET /api/v1/director/catalog`.

## 1. Pick the endpoint

| The user wants | Endpoint | Notes |
|---|---|---|
| A 5-15 s clip from words | `POST /api/v1/director/videos/text` | JSON `prompt` (required; no `idea` field) |
| A clip that starts from their picture | `POST /api/v1/director/videos/image` | multipart `image` + `prompt` |
| A clip with given people, places, props | `POST /api/v1/director/videos/reference` | multipart `images` (Basic up to 9, Premium/Ultra up to 30), optional `videos`, `audios` (3 each) |
| A story: cast, voices, dialogue, 30 s - 7 min | `POST /api/v1/director/videos/film` | `duration` multiple of 15 (30-420); `idea` or `clips` (`references/montage/pixio-film.md`) |
| An ad | `/api/v1/director/videos/film` with `film_type=commercial`, or `/api/v1/director/videos/reference` | then `/api/v1/director/videos/package` (`references/montage/pixio-ads.md`) |
| Explainer or documentary | `/api/v1/director/videos/film` with `film_type=explainer` / `documentary` | `references/montage/pixio-explainers.md` |
| A vertical micro-drama episode | `/api/v1/director/videos/film` with `film_type=short_drama` | `references/montage/pixio-short-drama.md` |
| A music video | `POST /api/v1/director/videos/music` | the customer's `song` (or `song_job`) + `images`; `idea` or `sections` (`references/montage/pixio-music-video.md`) |
| A song's sections before a music video | `POST /api/v1/director/music/plan` | a writer job: sections and vocal map in `result` |
| A TV series with a fixed cast | `POST /api/v1/director/series`, then `/api/v1/director/series/{id}/episodes` | `references/montage/pixio-series-showrunner.md`, `references/montage/pixio-characters.md` |
| Remake a video shot for shot | `POST /api/v1/director/videos/remake` | `references/montage/pixio-remake.md` |
| Change one thing in a finished video | `POST /api/v1/director/videos/edit` (Montage Edit) | `job_id`, short `prompt`, 1-15 s `start_s`/`end_s` window |
| A new 3-15 s video from 1-6 pictures | `POST /api/v1/director/videos/edit/create` (Montage Create) | `images`, `prompt`, `duration_s` |
| Lips out of sync | `/api/v1/director/videos/lipfix` (one 4-14 s window), `/api/v1/director/videos/lipfix/auto`, `/api/v1/director/videos/relip` | `references/montage/pixio-lipsync-fixing.md` |
| Small far faces smeared | `POST /api/v1/director/videos/facefix` | `people: "all"` for group shots |
| Join clips, add audio tracks | `POST /api/v1/director/videos/assemble` | `clips`, `audio_tracks` |
| Cut a finished video by its shots | `GET /api/v1/director/jobs/{id}/shots`, then `POST /api/v1/director/jobs/{id}/edit` | `references/montage/pixio-video-editing.md` |
| Grade, loudness, deflicker | `POST /api/v1/director/videos/finish` (or `finish` on film / music) | `grain` stays 0 |
| Text, prices, captions, lyric captions over the picture | `POST /api/v1/director/videos/graphics` | `auto: true` + `brief` plans them (`references/montage/pixio-graphics-titles.md`) |
| Logo, end card, music bed, voiceover, shapes, cutdowns | `POST /api/v1/director/videos/package` | `job_id` + `brand_id` (`references/montage/pixio-brands.md`) |
| About 1080p | `POST /api/v1/director/videos/upscale` (or `upscale=true` on film / music) | `detail` 0-1; leave `method` unset |
| Trim, crop, new shape | `POST /api/v1/director/videos/edit/crop` (Montage Crop) | frame-exact |
| What is in a video or song; is it good | `/api/v1/director/understand/video`, `/api/v1/director/understand/audio`, `/api/v1/director/videos/edit/analyze` | `references/montage/pixio-video-qa.md`, `references/montage/pixio-understand.md` |
| Pictures (references, stills, covers) | `/api/v1/director/images/text`, `/api/v1/director/images/edit`, `/api/v1/director/images/reference` | cheap: get them right before any video (`references/montage/pixio-characters.md`, `references/montage/pixio-image-prompter.md`) |
| Audio tools | `POST /api/v1/director/audio/{transcribe,stems,clean,master,voiceover,dub,sfx,foley}` | `references/montage/pixio-audio-tools.md` |

## 2. Basic, Premium or Ultra

Send `video_model` in the body (a form field or JSON field). Every value, with its name and whether it is offered
right now, is in `GET /api/v1/director/catalog` under `videoModels.models`.

| | `montage-basic` | `montage-premium` | `montage-ultra` |
|---|---|---|---|
| What it is | Montage Basic, the default | Montage Premium: sharper and more lifelike | Montage Ultra: the highest-quality model on every shot |
| Cost | the lowest, billed in credits | priced from the studio's quote of the takes; quote first | the top price; quote first |
| Best at | lip-sync to the real song, talking close-ups, long films, looks and styles | movement, camera work, action, fights, many pictures, native sound | a hero shot |
| Prompt limit | 8,000 characters | 30,000 characters | 30,000 characters |
| Pictures | 9 | up to 30 (6-9 a clip works best) | up to 30 |
| Draft / final | yes (`speed: "draft"`) | no (already full quality) | no |

- Start on Basic. Move to Premium only for what it does better (action, big camera moves, dance energy).
- Sung close-ups: Basic. Premium sings the vocal on its own clock; against your exact song send
  `music_sync: "song"` (lips re-timed onto it), or use Basic for the close-ups.
- Both in one video: `tier_mix: "auto"` with `video_model: "montage-premium"` on `/api/v1/director/videos/film` or
  `/api/v1/director/videos/music` (spoken / sung close-ups on Basic, the rest on Premium; each part at its own
  price).
- Premium or Ultra asked for while they are not offered (`videoModels.premiumAvailable` false): `400
  premium_unavailable` before anything renders. If Premium can't be quoted when a new job starts, the job starts on
  Basic at the Basic price (`videoModel` on the job says so).
- On Premium and Ultra, `resolution` is `480p` or `720p` (about twice the cost).

## 3. Before you spend: catalog, prompts, quote

1. `GET /api/v1/director/catalog` once per session: every field, option, limit (`maxLength`) and price.
2. Get the prompts:
   - Films, music videos and series episodes take an `idea`; the studio's writer writes every prompt.
   - Single clips (`/api/v1/director/videos/text|image|reference`) have no `idea`: get a prompt from
     `POST /api/v1/director/prompts/write` with `story` (not `idea`, up to 4000 characters) and `mode`
     (`film` for 15 s clips of a film of `duration`, `reference` for one 6-15 s shot), plus optional `duration`,
     `references`, `voices`, `style`, `aspect`, `film_type`. It is a writer job: poll it, and the written clips are
     in its `result`.
   - Writing your own: follow the model's prompting file (`references/montage/montage-basic-prompting.md`, `references/montage/montage-premium-prompting.md`), then
     `POST /api/v1/director/prompts/check` (free, synchronous) with `prompt` (one clip) or `clips` (a film), plus
     `refs`, `clip_refs` and `duration`. It answers `{ ok, issues, counts }`. Fix every ERROR; read every WARN.
3. Quote: add `?check=true` (or `?dry_run=true`) to `videos/text|image|reference|music|film`, or `?dry_run=true`
   to `videos/remake`, `videos/package`, `series/{id}/episodes` and `jobs/{id}/edit`. You get
   `200 { object: "director.preflight", credits.quoted, promptCheck, ... }`; nothing starts and nothing is charged.
   Other endpoints answer `400 preflight_unavailable` to those flags; price them from the catalog. Show the user the
   quote before any Premium, Ultra, long film or long music video, and wait for a clear yes.

```bash
curl -X POST "$BASE/api/v1/director/prompts/check" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"clips": ["clip 1 prompt ...", "clip 2 prompt ..."], "refs": 2, "duration": 30}'
```

## 4. Start the job (once)

The Director API has no idempotency key: every POST that reaches the server starts a new, billed job. Quote
first, send the real request once, and store the returned `id` straight away. If the POST times out with no
answer, look at `GET /api/v1/director/queue` before sending anything again.

```bash
curl -X POST "$BASE/api/v1/director/videos/film" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-basic -F duration=30 -F speed=draft \
  -F "idea=A night nurse answers a call light that should not be blinking." \
  -F images=@nurse.png -F images=@old_man.png \
  -F 'references=["the nurse", "the old man in room six"]'
# -> 202 {"id": "JOB_ID", "object": "director.job", "status": "queued", ...}
```

At most 8 Director jobs run at once per account; a 9th answers `429 concurrency_limit` with `Retry-After`.

## 5. Wait: poll

There are no webhooks. **Poll** `GET /api/v1/director/jobs/{id}` every 10-60 s (paced by `etaSeconds`); reading
a job also syncs it. Statuses: `queued`, `running`, `done`, `failed`, `cancelled`. `stage` and `progress` say
what is happening; `queue.ahead` and `queue.estimatedCompletionAt` show your place in line. A film made with
`storyboard: true` stays `running` with `storyboard.waiting: true` until you approve it. Full detail:
`references/montage/pixio-jobs-polling.md`.

When `status` is `done`:
- `output.url` is a signed link, valid 6 hours, no key needed; `output.assetPath` is the durable copy in the user's
  Pixio assets. Every `GET /api/v1/director/jobs/{id}` signs fresh links; `GET .../jobs/{id}/video` (or `/image`,
  `/audio`) answers 302 to a fresh one.
- `parts` holds each clip / section (`GET .../jobs/{id}/parts/{n}`); `pictures` lists a film's or music video's
  pictures (yours and designed ones); `deliverables` lists packaged shapes and cutdowns.
- `credits.charged` is what it cost. Cancel with `DELETE /api/v1/director/jobs/{id}` (finished parts are still
  charged).

## 6. Storyboard, draft, final (films and music videos)

Do not spend full-quality renders on a story nobody approved.
1. **Storyboard** (films from an `idea`): `storyboard: true` writes the film, makes the pictures and one still per
   shot, then waits (`storyboard.waiting: true`). Look: `GET /api/v1/director/jobs/{id}/storyboard` or
   `.../storyboard/sheet.jpg`. Redraw a shot: `POST /api/v1/director/jobs/{id}/storyboard/redo`
   `{"clip": 2, "shot": 3, "note": "a close-up of her face"}`. Show the user the sheet, then
   `POST /api/v1/director/jobs/{id}/storyboard/approve` (`references/montage/pixio-storyboarding.md`).
2. **Draft:** `speed: "draft"` renders cheaper and faster (Basic only). Check story, faces and timing.
3. **Final:** `POST /api/v1/director/videos/film/{id}/final` or `/api/v1/director/videos/music/{id}/final` (JSON,
   optional `upscale`; music also `steps`). A new job with the same prompts, pictures and seeds; never the writing
   again.
4. **Redo one part:** `POST /api/v1/director/videos/film/{id}/redo` `{"clip": 3, "seed": 777}` or
   `/api/v1/director/videos/music/{id}/redo` `{"section": 3, "seed": 777}`, plus an optional corrected `"prompt"`
   (and `clip_images`, `images`; film retakes also `audios`, `no_speech`). Other parts are reused; a new job comes
   back.

## 7. Check, then fix the cheapest way

Never hand over a video you have not checked; the full method is in `references/montage/pixio-video-qa.md`. In short:
- Free first look: `GET /api/v1/director/jobs/{id}/shots` (each shot with a thumbnail) and the job's own `qa[]`
  and `qaIssues[]`.
- Cheapest machine check: `POST /api/v1/director/videos/edit/analyze` with `{"job_id": "JOB_ID", "checks":
  ["lipsync"]}`; with all checks it gives `issues` with times and ready `suggestedFixes` (Pixio requests you can
  send as they are). `POST /api/v1/director/understand/video` with `"measure_only": true` measures without the
  deep read. Both are billed from a quote (at least 16 credits).

| What is wrong | Fix |
|---|---|
| A whole clip or section (story, extra person, clone) | `/film/{id}/redo` or `/music/{id}/redo`, new seed, corrected prompt |
| Lips off in places | `/api/v1/director/videos/lipfix/auto`; one known window: `/api/v1/director/videos/lipfix` (4-14 s) |
| One thing wrong in an otherwise good shot | `/api/v1/director/videos/edit`, one short sentence, tight window |
| Small faces smeared | `/api/v1/director/videos/facefix` |
| Too soft | `/api/v1/director/videos/upscale` |
| Length or framing | `/api/v1/director/videos/edit/crop` |
| Wrong order, a shot too many | `/api/v1/director/jobs/{id}/edit` with `shots` |

A window beats a section, a section beats the whole video. Re-check after every fix.

## 8. Errors

Every error body carries `error` (human text) and `code`; validation errors add `details` (for example `field`,
`maxLength`, `length`).

| Status / `code` | Do this |
|---|---|
| 400 `invalid_request` / `invalid_json` | fix the field named in `details` (limits: `GET /api/v1/director/catalog`) |
| 400 `invalid_media_url` | the URL or asset path could not be fetched, or belongs to another account: re-upload the file |
| 400 `preflight_unavailable` | this endpoint has no free quote; drop `?check` / `?dry_run` and price it from the catalog |
| 400 `premium_unavailable` | Premium / Ultra is not offered right now: use `montage-basic` |
| 402 `insufficient_credits` | nothing started; the body has the amount needed; tell the user |
| 404 `not_found` | check the id (`GET /api/v1/director/jobs`); only your own jobs, brands and series work |
| 409 `conflict` | the referenced job has not finished, or the file is not ready: poll it, then send again |
| 422 `prompt_check_failed` | fix the ERRORs in `promptCheck.issues` (or send `strict_prompt: false`); nothing was charged |
| 429 `concurrency_limit` | 8 jobs already running: wait `Retry-After`, then send it |
| 502 `studio_error` | the studio refused the job; nothing charged; read `error`, change the request |
| 503 `service_unavailable` | the studio is busy; nothing charged; retry later |

Never resend a 4xx unchanged. A job with `status: "failed"` has `error` (and, for writer jobs, `details`): read
them before a redo. Full detail: `references/montage/pixio-errors-recovery.md`.

## Common mistakes

- Sending the same POST again after a timeout without checking `GET /api/v1/director/queue`: two jobs, two bills.
- Testing on Premium or Ultra. Leave `video_model` out or send `montage-basic` for tests.
- Full-quality renders before the story is approved (use `storyboard: true` or `speed: "draft"`).
- `idea` sent to `/api/v1/director/prompts/write` (its field is `story`) or to
  `/api/v1/director/videos/text|image|reference` (they have none).
- Both `idea` and `clips` on a film (send one). Wrong counts: a film needs `duration / 15` clips; a music video one
  section per 15 s of song.
- A misspelt field: it is ignored, not refused. Check names against the catalog.
- One picture for two people, or undescribed extras: twins. One picture = one person.
- Long Montage Edit prompts: they change things you did not ask for. One short sentence.
- Re-rendering a whole film to fix one clip, or a whole video to fix one mouth. Polling every second.

## Which file next

Every file below lives in `references/montage/` next to this one.

| File | Read it when |
|---|---|
| `references/montage/montage-basic-prompting.md` | writing or fixing any prompt for Montage Basic: clips, references, film clips |
| `references/montage/montage-premium-prompting.md` | writing or fixing prompts for Montage Premium / Ultra |
| `references/montage/montage-edit-prompting.md` | writing a `/api/v1/director/videos/edit` or `/api/v1/director/videos/edit/create` instruction |
| `references/montage/pixio-music-video.md` | any music video: song, sections, singers, duets, lip-sync, lyric captions |
| `references/montage/pixio-film.md` | story films, fights, documentaries as films, remakes and TV series |
| `references/montage/pixio-video-qa.md` | a job is done: check it before delivery and choose the cheapest fix |
| `references/montage/pixio-ads.md` | ads, UGC and short social videos: hook, brand, package, graphics, variants |
| `references/montage/pixio-characters.md` | people, products or places that must look the same across shots, clips or episodes |
| `references/montage/pixio-explainers.md` | narrated videos with no presenter: explainers, documentaries, kids' videos |
| `references/montage/pixio-jobs-polling.md` | the job lifecycle: polling, listing, downloads, cancelling |
| `references/montage/pixio-errors-recovery.md` | any error code and how to recover |
| `references/montage/pixio-cost-control.md` | what jobs cost and how to keep spend down |
| `references/montage/pixio-tier-choice.md` | picking Basic, Premium or Ultra in detail |

Narrower specialist files, open one when its subject fits the request better than the files above:

- Craft: `references/montage/pixio-prompt-director.md`, `references/montage/pixio-acting.md`,
  `references/montage/pixio-emotion-acting.md`, `references/montage/pixio-dialogue-voices.md`,
  `references/montage/pixio-camera-language.md`, `references/montage/pixio-lighting-color.md`,
  `references/montage/pixio-transitions-continuity.md`, `references/montage/pixio-hooks-openings.md`,
  `references/montage/pixio-sound-design.md`, `references/montage/pixio-storyboarding.md`.
- Genres and styles: `references/montage/pixio-action-fights.md`, `references/montage/pixio-comedy.md`,
  `references/montage/pixio-horror.md`, `references/montage/pixio-sci-fi-fantasy.md`,
  `references/montage/pixio-kids.md`, `references/montage/pixio-3d-animation.md`,
  `references/montage/pixio-anime-styles.md`, `references/montage/pixio-paper-handdrawn.md`,
  `references/montage/pixio-documentary.md`, `references/montage/pixio-short-drama.md`,
  `references/montage/pixio-game-trailers.md`, `references/montage/pixio-dance.md`,
  `references/montage/pixio-duets.md`.
- Ads and delivery: `references/montage/pixio-brands.md`, `references/montage/pixio-brand-promo.md`,
  `references/montage/pixio-product-ads.md`, `references/montage/pixio-ugc-creator.md`,
  `references/montage/pixio-batch-variants.md`, `references/montage/pixio-social-formats.md`,
  `references/montage/pixio-localization.md`, `references/montage/pixio-graphics-titles.md`,
  `references/montage/pixio-lyric-captions.md`, `references/montage/pixio-thumbnails-posters.md`.
- Series and remakes: `references/montage/pixio-series-showrunner.md`, `references/montage/pixio-remake.md`.
- Pictures and sound: `references/montage/pixio-image-generation.md`, `references/montage/pixio-image-editing.md`,
  `references/montage/pixio-image-prompter.md`, `references/montage/pixio-song-generation.md`,
  `references/montage/pixio-audio-tools.md`.
- After the render: `references/montage/pixio-understand.md`, `references/montage/pixio-lipsync-fixing.md`,
  `references/montage/pixio-upscale-finish.md`, `references/montage/pixio-video-editing.md`.
- Looks, styles and colour filters: `references/montage/pixio-looks-styles.md`; `GET /api/v1/director/catalog` lists
  the looks and styles, `GET /api/v1/director/filters` the colour filters, `POST /api/v1/director/looks` measures a
  reference's look.
