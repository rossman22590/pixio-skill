---
name: pixio-explainers
description: How to make narrated videos with no on-camera presenter on Montage (Pixio's Director API) - explainers, documentaries, narrated stories and kids' videos - from the brief (topic, exact length, shape, language, look, voice, music, subtitles) through the word budget, one-visual-per-sentence scenes, film_type=explainer and film_type=documentary, voiceover, titles and labels, subtitles, dubbing and assembly. Use whenever someone asks for an explainer, a "faceless" or narrated video or a voiced story. Not for documentary craft (that is references/montage/pixio-documentary.md), kids' content (pixio-kids.md), story films with on-screen dialogue (pixio-film.md) or ads (pixio-ads.md).
---

# Narrated videos with no presenter

A narrator talks; the pictures show what is said, when it is said. Nobody on screen speaks to the camera (a
documentary's short interviews are the one exception). Clip prompt wording is in
references/montage/montage-basic-prompting.md.

## House rules

- **Test cheaply on Basic.** Every test, draft or trial render sends `video_model: "montage-basic"` (it is also what
  renders when `video_model` is left out). Basic is billed in Pixio credits like everything else, just less.
  Premium or Ultra only when the user asks for it and has seen the `?check=true` quote (`credits.quoted`).
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all. The same goes for a music
  bed: their track first.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE`
  (`https://beta.pixio.myapps.ai`) and `$PIXIO_API_KEY`.

## 1. Settle the brief before spending anything

Ask for whatever is missing in one message, and repeat the answers back:

| item | what to settle | notes |
|---|---|---|
| topic | one sentence: what the viewer should know at the end | becomes `idea` |
| length | the exact seconds | films are multiples of 15 from 30 to 420. If the ask is not (40 s, 100 s), say so and agree 30/45 or 90/105; never round silently |
| shape | `16:9`, `9:16` or `1:1` (`aspect`) | more shapes later with `package.formats` |
| language | of the narration and of the subtitles | built-in narration is English (section 6) |
| look | one `style` sentence, e.g. "soft paper-cut illustration, warm daylight" | the same look in every clip |
| voice | an `id` from `GET /api/v1/director/voiceover/voices`, or a 5-15 s clean `voiceover_sample` | never invent a voice id |
| music | none, a made `score`, or the customer's own file (`music_bed` / `music`) | the customer's own track wins |
| subtitles | on (default) or off; style; translated? | |

**Voice:** pick from `GET /api/v1/director/voiceover/voices` (free; each has `id`, `language` and a `description`;
the list also gives the `default`) and match the voice's `language` to the text. Defaults that work: `af_heart`
(explainers), `am_onyx` (documentaries). Also good: `am_michael` (clear on names), `bf_emma` / `bm_george`
(British); for kids a light voice such as `af_bella` or `af_sky`. A cloned voice: upload `voiceover_sample`
(5-15 s of the narrator, clean); `voice_clone` picks how (`natural` default, `fast`, `classic`; same price).

## 2. Script: words that fit the length

- The writers size narration to just under the `duration`. Explainer mode writes about **2.3 words a second**:
  30 s = about 65 words, 60 s = about 135, 180 s = about 410. Documentaries use `narration_pace` 1.5-2.6 (default
  1.85). Kids' videos and calm topics: 1.8-2.0.
- Short sentences, one idea each. Each sentence becomes one shot, so it must be something you can SHOW.
- Open with the question or the surprising fact; end on one line that lands.
- Too long: the narration is read faster (explainer up to 1.3x; documentary `max_speedup` 1.0-1.3) and then the last
  sentences are dropped. Cut words yourself instead.

## 3. Scenes: calm, one clear visual per point

- One shot per sentence, held while it is spoken. No fast montage under narration.
- Each shot shows the concrete thing the line names: "a cat twisting mid-air, front legs tucked", not "agility".
- The same `style` and the same reference pictures for recurring things in every clip
  (references/montage/pixio-characters.md).
- Never ask the video model for words, numbers or labels: it garbles text. Add them afterwards (section 5).
- Kids: bright simple shapes, slow camera, one character doing one thing per shot, nothing scary.
- See every shot before the clips render: `storyboard=true` stops after writing with one still per shot (the job
  stays `running` with `storyboard.waiting: true`); `POST /api/v1/director/jobs/{id}/storyboard/redo`
  `{"clip": 2, "shot": 3, "note": "..."}`, then `.../storyboard/approve`. Stills cost `setPicture` credits each, and
  the writing and stills are charged even if you never approve.

## 4. Pick the route

**A. Explainer:** `POST /api/v1/director/videos/film` with `film_type=explainer`, `idea`, `duration`, `aspect`. The
AI writes the narration, reads it, packs whole sentences into the 15 s clips with one shot each, and packages it:
narration from 0 s, word-by-word pop captions, no end card, unless your `package` says otherwise. Priced like a
film plus the narration writing (`adReview`) and packaging.

```bash
curl -X POST "$BASE/api/v1/director/videos/film?dry_run=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F film_type=explainer -F video_model=montage-basic -F duration=45 -F aspect=9:16 -F storyboard=true \
  -F "idea=Why cats land on their feet: the righting reflex, step by step" \
  -F "style=soft 3D clay illustration, warm daylight, clean backgrounds" \
  -F 'package={"voiceover_voice": "am_michael", "score": "a light curious explainer bed", "music_db": -14}'
```

**B. Documentary:** the same call with `film_type=documentary` (an `idea` is required). A cold open, chapters,
optional invented on-camera interviewees (labelled `dramatized`), fact-checked narration, title card, chapter and
name cards, subtitles from the script and a made score, all automatic. Priced like an explainer plus its score and
the fact-check (`factCheck`).

| field | values |
|---|---|
| `doc_style` | `dramatic` (default), `observational`, `investigative` |
| `interviews` | `auto`, `few`, `none`, or `0`-`6` (`none` for a pure narrated piece) |
| `doc_chapters` | 1-8 |
| `narration_pace` / `max_speedup` | 1.5-2.6 words a second / 1.0-1.3 |
| `fact_check` | `true` (default): keep it on |
| `interview_label` | text after the role on name cards (default `dramatized`, up to 40 characters, `""` for none) |

Any default can be changed or switched off in `package`: `"captions": "off"`, `"title_card": ""`,
`"lower_thirds": []`, `"voiceover_voice": "bm_george"`.

**C. Narrated story:** write the clips yourself (or get them from `POST /api/v1/director/prompts/write` with
`mode: "film"`; a writer job whose clips land in the job's `result`), send them as `clips` with `no_speech` listing
every clip number so nobody on screen talks, then read the narration with `POST /api/v1/director/audio/voiceover`
and lay it on with `package` (`voiceover` file) or `/api/v1/director/videos/assemble`.

**D. Sung kids' video** (only when a song is wanted; background music is not a song): the customer's own mp3 first,
else `POST /api/v1/director/music/generate` with `prompt` and `lyrics`; then `POST /api/v1/director/videos/music`
with an `idea` so the story follows the song (references/montage/pixio-music-video.md).

## 5. Sound, titles, subtitles, assembly

**Narration on its own:** `POST /api/v1/director/audio/voiceover` (JSON or multipart): `text` (up to 5,000
characters), `voice` (from the live list) or a `voice_sample` file / `voice_sample_job` (a finished job of yours,
with `voice_sample_start_s` / `voice_sample_end_s`); `speed`, `pause_s`, `lufs`, `format`. Priced like finishing on
the length it makes. Check the length of the finished audio against the agreed length before rendering any video.

```json
{"text": "Every autumn, a billion monarch butterflies fly south. None of them has made the trip before.",
 "voice": "am_onyx", "speed": 1.0}
```

Other audio tools under `POST /api/v1/director/audio/` (each a billed job, no free quote): `clean` (a customer's own
narration recording), `master` (1-16 `tracks` with offsets, ducking and fades, to `lufs`), `sfx` (`description`,
e.g. "pages turning"), `foley` (sound in sync with a finished video), `transcribe`, `stems`, `dub`. See
references/montage/pixio-audio-tools.md.

**Packaging** (`package` on the film, or `POST /api/v1/director/videos/package` with `job_id`): `voiceover_text` (up
to 1,500 characters) + `voiceover_voice`, or a `voiceover` file; `captions` (`"auto"`), `caption_style` (`pop` or
`subtitle`), `caption_words`, `caption_position`; `score` or a `music` file with `music_db`, `voiceover_db`,
`duck_db`; `title_card`, `lower_thirds` (`{"t", "text", "sub"}` name cards or
`{"kind": "chapter", "label", "text", "t", "d"}` chapter cards); `filter`, `vignette`; `formats` (`16:9`, `9:16`,
`1:1`, `4:5`) with `reframe` `crop` or `fit`; `cutdowns`. `?dry_run=true` quotes packaging free.

**Titles and labels:** `POST /api/v1/director/videos/graphics` on the finished `job_id` with a `graphics` list (types
`text`, `image`, `badge`, `arrow`, `checklist`, `button`, `end_card`; `t` start, `d` length in seconds; `x`/`y`
0-1). An arrow with a label points at the thing the narrator names; a `checklist` ticks in the steps. Faces are
avoided and safe areas kept automatically. Priced like `videos/finish` on the video's seconds.

```json
{"job_id": "JOB_ID", "graphics": [
  {"type": "text", "t": 0.3, "d": 2.5, "text": "Why cats land on their feet", "y": 0.2},
  {"type": "arrow", "t": 9.0, "d": 3.0, "x": 0.7, "y": 0.3, "to_x": 0.5, "to_y": 0.5, "text": "inner ear"},
  {"type": "checklist", "t": 30, "d": 6, "items": ["Look", "Twist", "Tuck", "Land"]}]}
```

**Assemble:** `POST /api/v1/director/videos/assemble` with `clips` (each a finished `job_id` or an uploaded video,
`start_s`/`end_s` trims, `transition_in` `cut` | `crossfade` | `dip_to_black` | ..., `audio` `keep` | `mute` |
`duck`) and `audio_tracks` (narration and music, offsets, volume, ducking, fades), `aspect_ratio`,
`loudness_lufs`. Joins parts, trims to an exact length, or lays your own narration under calm clips. Recut a
finished film by shots: `GET /api/v1/director/jobs/{id}/shots` (free), then `POST /api/v1/director/jobs/{id}/edit`
with `{"shots": [1, 2, {"shot": 4, "trim_start": 0.3}, 3]}`.

## 6. Language, subtitles and dubbing

- Explainer and documentary narration is written in English (the film call has no language field).
- **Translated subtitles:** `package.subtitle_language`, any language name ("Spanish", "Brazilian Portuguese");
  the captions are translated line by line with their times (+16 credits).
- **Dubbed narration:** `package.dub_language` (English, Chinese, Japanese, Korean, German, French, Russian,
  Portuguese, Spanish, Italian), or `POST /api/v1/director/audio/dub` with `job_id` and `language`. Lines are re-read
  in the speaker's cloned voice over the original music. Lips do not match (fine with no presenter).
- **Narration written in another language:** write the script in it, read it with
  `POST /api/v1/director/audio/voiceover` using a voice whose `language` matches, and lay it on with route C.

## 7. Cost, tests, asking first

1. Send the real film request with `?dry_run=true` (or `?check=true`) first: you get
   `{object: "director.preflight", credits.quoted, promptCheck, ...}` and nothing starts.
2. Show the user the brief, the script (or its planned length in words), the voice id, the music choice and the
   quote. Wait for a clear yes; with `storyboard=true`, also for their OK on the stills before approving.
3. Start it once and store the job id; poll `GET /api/v1/director/jobs/{id}` every 10-30 s. On a timeout keep
   polling the same id; never resubmit.
4. Afterwards check the video (references/montage/pixio-video-qa.md): the narration fits and nothing was dropped.
   Report `credits.charged`.

## Checklist before the yes

- [ ] Length is a multiple of 15 and exactly what was agreed
- [ ] Voice id from `GET /api/v1/director/voiceover/voices` (or a supplied sample)
- [ ] Word count fits the length at the chosen pace
- [ ] Every sentence has a showable picture; no text asked of the video model; no grain or noise words
- [ ] Music, subtitles, subtitle / dub language and extra formats settled
- [ ] Quote shown, `video_model: "montage-basic"` for tests, the user said yes

Some techniques adapted from an open-source (MIT) community skills collection.
