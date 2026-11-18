---
name: pixio-music-video
description: How to make a music video from the customer's own song with POST /api/v1/director/videos/music on Montage (Pixio's Director API) - song plan, singer pictures, idea or sections, Montage Basic vs Premium and tier mix, duets, story videos where nobody sings, draft to final and section redo, lip-sync (lip_check, lip fix, relip), lyric captions, and the creative direction that makes it watchable. Use whenever you plan, submit or fix a music video or anything cut to a customer's song. Prompt wording is in `references/montage/montage-basic-prompting.md` / `references/montage/montage-premium-prompting.md`; deep checking is in `references/montage/pixio-video-qa.md`.
---

# Montage music videos

`POST /api/v1/director/videos/music` (multipart) turns a song plus reference pictures into one lip-synced video exactly as long
as the song. The song is cut into 15 s sections, each renders on its own, they are joined with hard cuts, and the
**original song file** goes back under the whole video.

## House rules

- **Test on Basic.** Every test, draft or trial render runs on Montage Basic (`video_model: "montage-basic"`, also
  what you get when `video_model` is left out). Basic is billed in credits too, just least. Premium or Ultra only
  when the user asks for it and has seen the quote (`?check=true`).
- **The customer's own song first.** About 99 % of music videos come with the customer's mp3: send it as `song`.
  Never call `/api/v1/director/music/generate` or send `song_job` when a song was given; the generator is only a fallback.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE`
  (`https://beta.pixio.myapps.ai`) and `$PIXIO_API_KEY`.
- **Lyrics are private.** Never put lyrics in prompts, `idea`, notes, logs or file names. The API transcribes the
  song itself and never returns the words. The only place lyrics may go is `lyrics` on `/api/v1/director/videos/graphics`.

## 1. Plan, then submit

Read the song first with `POST /api/v1/director/music/plan`: sections, a vocal map per section (where the voice is),
loudness and drops; with an `idea`, also a treatment. Without an `idea` it is the song analysis alone (`songAnalysis`
credits); with one, a writer round (`writerRound`). Send the same `balance_sections` value here and on
`videos/music`.

```bash
curl -X POST "$BASE/api/v1/director/music/plan" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "song=@song.mp3" -F "idea=Nova can't sleep at 3 a.m.; she walks to the window and sings to the city" \
  -F 'references=["Nova, the singer: woman, 27, black bob, silver slip dress"]'
```

It is a writer job: it answers `202` with a job; poll `GET /api/v1/director/jobs/{id}` every 10-30 s and read the
plan in its `result` when `status` is `done`.

| field | what to send |
|---|---|
| `song` | the customer's file (mp3, m4a, wav, flac...); or `song_job`, a finished song job from this API |
| `images` | reference pictures: Basic 1-9; Premium / Ultra up to 30, 6-9 per section recommended |
| `idea` + `references` | the AI writer writes the sections: `idea` 10-4000 chars; `references` a JSON list saying what each picture shows, in upload order |
| `sections` | or your own prompts: a JSON list with exactly one entry per 15 s of song, `["prompt", ...]` or `[{"prompt": "...", "seed": 1}, ...]`; each section's slice of the song is `<Audio 1>` (format: `references/montage/montage-basic-prompting.md`) |
| `style` | with `idea`: one look sentence ("glossy night-time pop video") |
| `make_references` | with `idea` (default true): the studio designs place / prop / face pictures first (priced per picture made; they appear in the job's `pictures` with `designed: true`) |
| `clip_images` | each section's own pictures: a JSON list of lists of 1-based positions in `images` |
| `lipsync` | `performance` (default, 8 steps), `sung_words` (places each shot's sung words, 12 steps, slower, priced in proportion), `none` (nobody sings; needs `idea`) |
| `aspect` | `16:9` (default), `9:16`, `1:1` |
| `video_model` | `montage-basic` (default), `montage-premium` or `montage-ultra` |
| `speed` | full quality (default) or `draft` (smaller frame, cheaper: `musicSectionDraft` in the catalog); Basic only |
| `lip_check` | `off` (default), `measure`, `fix`, `relip`: starts that job when the video is done (`lipCheckJobId` on the job) |
| `tier_mix` | `off` (default), `auto`, `manual` (with `basic_sections`) |
| `finish` | optional JSON, as `/api/v1/director/videos/finish`: `{"grade": "warm", "grain": 0}` |

Send `sections` or `idea`, not both. Your own `sections` need exactly one entry per 15 s of song (the error states
the exact number the song needs).

```bash
# Basic, AI-written; check=true is a free quote (credits.quoted, promptCheck) and starts nothing
curl -X POST "$BASE/api/v1/director/videos/music?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "song=@song.mp3" -F "images=@nova.png" -F "images=@penthouse.png" \
  -F 'references=["Nova, the singer: woman, 27, black bob, silver slip dress", "the penthouse bedroom at night"]' \
  -F "idea=Nova can't sleep at 3 a.m.; she walks to the window and sings to the city" \
  -F "video_model=montage-basic" -F "aspect=9:16"
```

Drop `check=true` to render (send it once: there is no idempotency key); poll `GET /api/v1/director/jobs/{id}`.

## 2. Basic, Premium, or both

| | Montage Basic (`montage-basic`) | Montage Premium (`montage-premium`) |
|---|---|---|
| Price | the lowest; a fixed price per section | priced from the studio's quote of the takes; quote first |
| Lips | **best on the customer's song**: each section keeps its slice of the song and the lips follow the isolated vocal | Premium re-sings the vocal on its own clock: lips match its own sound but run early against the song |
| Strengths | sung close-ups, looks and styles, long videos, cheap retakes, draft / final | dance, big camera moves, action, many pictures per shot |

Premium downloads: `GET /api/v1/director/jobs/{id}/video` carries Premium's own sung sound (lips match it);
`?variant=song` (or `output.withOriginalSong` on the job) is the same picture with the customer's song, free.
`music_sync=song` (form field) keeps the exact song as the soundtrack: shorter phrase takes are re-timed onto it, so
the quote is a little higher. Measure the result (section 6) and redo the sections whose lips drift.

**Tier mix** (with `video_model=montage-premium` or `montage-ultra`): each whole section renders on one tier. `tier_mix=auto` puts
sung close-ups on Basic and wide, action, dance, instrumental and cutaway sections on Premium; `tier_mix=manual`
with `basic_sections=[1,3]` chooses yourself. `tier_mix_size` (`larger` default, `basic`, `premium`) is the output
size; `tier_mix_retime` re-times each Premium section's picture onto its slice of your song. Your own `sections`
must be in Basic format. Basic sections keep the Basic price and Premium sections the Premium price, so a mix costs
less than all-Premium; a redo keeps its section's tier. When Premium is not offered
(`videoModels.premiumAvailable` false in the catalog) the request answers `400 premium_unavailable`.

```bash
curl -X POST "$BASE/api/v1/director/videos/music?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "song=@song.mp3" -F "images=@singer.png" -F 'references=["the singer"]' \
  -F "idea=She dances through a neon market, then sings the chorus straight to the lens" \
  -F "video_model=montage-premium" -F "tier_mix=auto"
```

## 3. Duets (two singers)

Send both pictures and `singers` with their picture numbers (needs `idea`):

```bash
curl -X POST "$BASE/api/v1/director/videos/music" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "song=@duet.mp3" -F "images=@him.png" -F "images=@her.png" \
  -F 'references=["the male singer", "the female singer"]' -F 'singers={"male": 1, "female": 2}' \
  -F "video_model=montage-basic" -F "idea=Two lovers singing to each other across a snowy train platform"
```

- Two women or two men: `singers={"first": 1, "second": 2}`; `first` is whoever sings the first line.
- Who sings each line is measured from the isolated vocal. Voices that are too alike: send `singer_parts` with exact
  song seconds, e.g. `{"first": ["0-24.5", "40-49"], "second": ["24.5-40"]}`. Both are free.
- One singer's mouth per line; the other listens with lips closed. Contrasting wardrobe and fixed sides (him frame
  left, her frame right) stop the two from swapping.

## 4. Story music videos (nobody sings)

`lipsync=none` with an `idea`: the writer tells a story or mood cut to the song's sections and energy, nobody on
screen sings, and the song stays the soundtrack unchanged. Good for instrumentals, moods and brand pieces.

## 5. Draft, redo, final

1. `speed=draft` on Basic. Review it (`references/montage/pixio-video-qa.md`).
2. Fix weak sections in draft: `POST /api/v1/director/videos/music/{id}/redo` with JSON `{"section": 3, "seed": 777}` plus an
   optional corrected `"prompt"`; multipart with `images` (+ `clip_images`) adds pictures for that section.
3. `POST /api/v1/director/videos/music/{id}/final` renders the same video (song, sections, pictures, seeds) at full quality as a
   new job, priced as a full render of every section, never the writing or the sets. Both fields optional:
   `upscale`, `steps`. (Premium and Ultra have no draft / final: they are already full quality.)

```bash
curl -X POST "$BASE/api/v1/director/videos/music/JOB_ID/redo" -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"section": 3, "seed": 777}'
curl -X POST "$BASE/api/v1/director/videos/music/JOB_ID/final" -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"upscale": true}'
```

## 6. Lip-sync: measure, then fix

Measure first, cheaply: `POST /api/v1/director/videos/edit/analyze` with `"checks": ["lipsync"]` (about 16 credits a
minute of video), or `POST /api/v1/director/understand/video` with `"measure_only": true`. The done job's
`analysis.lipsync` lists stretches with a verdict and `offset_ms`; a stretch within about 150 ms is in sync, `early` /
`late` stretches need fixing. Reading
the numbers in depth: `references/montage/pixio-video-qa.md`.

| Situation | Route |
|---|---|
| One bad stretch | `POST /api/v1/director/videos/lipfix` with `start_s` / `end_s` (a 4-14 s window): that window is made again so the mouth follows the song's vocal; nothing else changes. Priced from a quote, at least 16 credits |
| Several bad stretches, or unknown | `POST /api/v1/director/videos/lipfix/auto`: measures, fixes each early / late stretch, re-measures, keeps the best try (`tries` 1-3, `max_windows` 1-12). Charged only for the tries it renders; slow (10-40 min for 30 s) |
| Premium / Ultra close-ups out of sync with the song | `POST /api/v1/director/videos/relip`: re-mouths the video to the song's isolated vocal and pastes back only the mouth and jaw (`only_sung`, `isolate_vocal`, `offset_s`). Priced from a quote; check the catalog |
| Decide at submit time | `lip_check=measure` / `fix` / `relip` on `/api/v1/director/videos/music` |

**Default `source` differs:** `lipfix` defaults to `auto`, but `lipfix/auto`, `relip` and `understand` default to
`video`. On a Premium music video always send `"source": "song"` (or `"auto"`) so lips follow the customer's song.

```bash
curl -X POST "$BASE/api/v1/director/videos/lipfix/auto" -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"job_id": "JOB_ID", "source": "song", "start_s": 30, "end_s": 60}'
curl -X POST "$BASE/api/v1/director/videos/relip" -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"job_id": "JOB_ID", "source": "song", "only_sung": true}'
```

## 7. Lyric captions and promo graphics

`POST /api/v1/director/videos/graphics` draws over any finished video (priced like `videos/finish` on its seconds). Karaoke captions: `lyric_captions: true`; add
`lyrics` (the customer's text) for their spelling, timed to the singing. The words are only drawn into the picture,
held in memory, never stored or returned.

```bash
curl -X POST "$BASE/api/v1/director/videos/graphics" -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"job_id": "JOB_ID", "source": "auto", "lyric_captions": true, "lyrics": "CUSTOMER LYRICS, IN MEMORY ONLY",
       "caption_style": "pop", "caption_position": "bottom", "safe_area": "reels"}'
```

Faces are never covered (`avoid_faces` default true). For promo cuts, elements can be timed `beat:N` / `downbeat:N`
(`references/montage/pixio-ads.md`). The song stays the soundtrack: no `music_prompt` / `music_job` on a music video.

## 8. Creative direction

**Start from the song.** Name its core feeling in one line, map its shape from the plan (intro, verse, chorus,
bridge, final chorus), pick one idea and one recurring device that escalates. The last chorus is the biggest moment;
the bridge changes the world or the look. The singer ends somewhere different from where she began.

**Mix shot types; not every line is sung on camera.**

| shot | when | rule |
|---|---|---|
| Performance | hooks, choruses, first line of a section | chest-up or closer, lips on the words, a clear intent (who she sings to) |
| Story | verses, lines about an action | she does what the song is about; her lips are closed |
| Reaction | a line landing on someone, pauses | a look, a turn away; the listener's lips closed |
| Atmosphere | instrumentals, drops, breaths | places, props, crowds from behind; the camera flies here |

Per 15 s vocal section: about 1-2 performance, 1-2 story or reaction, 0-1 atmosphere shots. Smiles in at most one
shot in four, never two in a row. Cut on downbeats or phrase starts, inside vocal gaps, never mid-word. Smooth camera
on sung close-ups; the wildest moves on atmosphere and dance. Ask for clean hard cuts and a full frame with no borders.

**Continuity and identity** (details: `references/montage/pixio-characters.md`). One wardrobe line per person, repeated word for word in
every section; one picture = one person; name exactly who may appear ("Nova is the only person in the video"); no
mirrors, reflections, "twin" or split screens; faces chest-up or closer, far people only from behind. Use
`clip_images` to give each section the singer plus that section's place.

## Checklist before you submit

- [ ] The customer's own song; lyrics nowhere except graphics `lyrics`.
- [ ] Every supplied picture used and described in `references`, one person per picture.
- [ ] Plan read; section count right if you wrote `sections`.
- [ ] Montage Basic for tests; the `?check=true` quote and the user's yes before Premium, Ultra or a long video.
- [ ] Duet: `singers` set; `singer_parts` if the voices are alike.
- [ ] After render: checked with `references/montage/pixio-video-qa.md`; fixed with redo, lip fix or relip; `grain` 0 everywhere.
