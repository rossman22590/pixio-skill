---
name: pixio-film
description: How to make story films (30 s to 7 min), fights and action, documentary-style films, shot-for-shot remakes and TV series with Montage (Pixio's Director API) - POST /api/v1/director/videos/film (idea or your own clips, cast, voices, clip_images, storyboard, draft to final, one-clip redo), fight_flow, Montage Basic / Premium tier mix, /api/v1/director/videos/remake and /api/v1/director/series - plus the story craft that makes them watchable. Use whenever you plan, submit or fix a film, a fight scene, a remake or a series episode. Clip prompt wording is in references/montage/montage-basic-prompting.md (Basic) and references/montage/montage-premium-prompting.md (Premium / Ultra); narrated explainers and documentaries are in references/montage/pixio-explainers.md.
---

# Pixio film: stories, fights, remakes and series

Every film is one job: `POST /api/v1/director/videos/film`, poll `GET /api/v1/director/jobs/{id}` every 10-30 s
until `status` is `done`, then hand over `output.url` (signed, valid 6 hours) or `output.assetPath` (the durable
copy in the user's Pixio assets). Workflow basics (quotes, polling, errors) are in
`references/montage/pixio-director.md`.

## House rules

- **Test on Basic.** Tests, drafts and trial renders run on Montage Basic (leave `video_model` out, or send
  `montage-basic`). Montage Premium or Ultra only when the user asks for it and has seen the `?check=true` quote.
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.
- **Premium renders violence:** blood, wounds and hits render on Montage Premium and Ultra; write them when the
  story needs them.
- **Check before you spend:** `?check=true` on `videos/film` returns the prompt report (`promptCheck`) and the
  credit quote (`credits.quoted`); `?dry_run=true` returns the quote. Neither renders or holds anything.

## 1. Shape of a film

- `duration` is required: a multiple of 15 from 30 to 420, one 15 s clip per 15 s (30 s = 2 clips, 420 s = 28).
- Each clip is a complete mini-scene; put the joins where place or time changes and end every clip on a hold
  (`references/montage/pixio-transitions-continuity.md`).
- `aspect`: `16:9` (default), `9:16`, `1:1`. `fade` 0-3 s in and out (default 0.5; `0` for films you splice).

| you send | what happens |
|---|---|
| `idea` (up to 4000 chars), optional `style` (up to 500), `references`, `cast`, `voices`, `film_type`, `images` | the AI writer plans the beats, writes every clip, designs missing reference pictures (`setPicture` each, up to `filmDesignedPictures` held), then renders |
| `clips` (JSON list of exactly duration/15 prompts, or `{"prompt": "...", "seed": 1}` objects) + `images` | your prompts render; an official-format prompt with a checker ERROR refuses the job (`422 prompt_check_failed`, nothing charged) unless `strict_prompt: false`; `verbatim: true` uses them exactly as sent |

Send one of `idea` or `clips`, never both. To read the writer's clips first: `POST /api/v1/director/prompts/write`
with `{"story": "...", "duration": 30, "mode": "film"}` (a writer job: poll it, the clips are in `result`), then
`POST /api/v1/director/prompts/check` (free), then send them as `clips`.

## 2. Story craft

- **Hook in the first seconds.** Shot 1 shows something wrong, strange or at stake. No slow establishing drift.
- **One person, one goal, one obstacle.** Say it in one sentence before writing anything.
- **Beats:** 30 s = setup, turn. 60 s = setup, incident, turn, payoff. Longer: setup, rising trouble, midpoint turn,
  crisis, payoff, spread over the clips.
- **Every clip ends on a turn** (a reveal, a decision, a hit landing) that makes the next clip necessary.
- **Physical storytelling.** Bodies, objects and places carry the story. Avoid phone screens, texts, laptops and
  small tech props: they render badly. A knock, a key, a letter, a wound do the job.
- **Dialogue short and plain:** about 2.6 words per second plus 1 s of hold per line on Basic; two or three short
  lines per 15 s clip at most; never squeeze a line into the last second.
- **Approve the story first:** show the user the one-line goal and the beat list before any render.

## 3. Cast, pictures and voices

Reference pictures, binding and anti-twin rules are in `references/montage/pixio-characters.md`. The film fields:

- `images`: up to 9 per film on Montage Basic, up to 30 on Premium and Ultra (6-9 a clip works best there).
- `cast` binds pictures and voices to names, one face and one voice per person:
  `[{"name": "Mara", "pictures": [1, 2], "audio": 1, "description": "the baker"}, {"name": "Tom", "picture": 3, "audio": 2}]`
  (positions in `images` and `ref_audios`). The writer, voice lock and the voice check follow it.
- `ref_audios`: 0-3 voice samples (clean, one person speaking). `voices` says whose each is (`["Mara", "Tom"]`) and
  `voice_samples: "used"` gives each clip only the samples its prompt names. No samples: `voice_lock: true` keeps
  each speaker's voice from clip 1 in later clips (takes about one clip longer).
- Only with your own `clips`: `clip_images` (`[[1,2,3],[1,2,4],[1,2,5,6],[1,2,7]]`; inside a clip `<Picture 1>` is
  the first of its own list), `clip_audios` (`[[1,2],[2],[],[1,3]]`, not with `voice_lock`) and `no_speech`
  (`[1, 4]`: clips where nobody speaks, closed mouths). With `idea` every clip gets all the pictures and the writer
  decides who speaks.
- Wounds only from the shot where they happen; wardrobe worded identically in every clip.
- Voices in depth: `references/montage/pixio-dialogue-voices.md`.

## 4. Requests

Basic, 30 s, your own clips, pictures and voices:

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/film" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F duration=30 -F "clips=<clips.json" \
  -F images=@nurse.png -F images=@old_man.png \
  -F ref_audios=@nurse_voice.wav -F ref_audios=@old_man_voice.wav -F voice_samples=used \
  -F 'cast=[{"name":"Ruth","picture":1,"audio":1},{"name":"Walter","picture":2,"audio":2}]' \
  -F seed=4101 -F 'finish={"grade": "neutral", "lufs": -14, "grain": 0}'
```

From an idea, with a storyboard stop and a cheaper draft (quote it first with `?check=true`):

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/film" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F duration=60 -F speed=draft -F storyboard=true \
  -F "idea=A night nurse answers a call light from a room that was emptied this morning." \
  -F images=@nurse.png -F 'references=["Ruth, 48, the night nurse"]'
```

Other fields: `realism` (0-1, how photographic), `upscale: true` (about 1080p, priced per started 15 s; leave
`upscale_method` unset), `variants` (1-4 versions in all, each its own job billed like the first, all held up front;
Basic only), `face_fix: "auto"` (sections whose faces drifted get a face fix job, `faceFix` per fixed section),
`visual_qa` (`local` or `full`, each priced per 15 s part), `package` (titles, captions, `score`; see
`references/montage/pixio-ads.md`), `brand_id`, `film_type`. Every one adds to the quote; `?check=true` shows the
total.

## 5. Storyboard, draft, final, redo

- `storyboard: true` (with `idea`) writes the film, makes the pictures and one still per shot, then waits: the job
  stays `running` with `storyboard.waiting: true`, and no clip is rendered yet. Read it at
  `GET /api/v1/director/jobs/{id}/storyboard` (shots, stills, `sheetUrl`), `.../storyboard/sheet.jpg` or
  `.../storyboard/{clip}/{shot}`; `POST /api/v1/director/jobs/{id}/storyboard/redo`
  `{"clip": 2, "shot": 3, "note": "a close-up of her face"}`; `POST /api/v1/director/jobs/{id}/storyboard/approve`
  renders. Stills cost `setPicture` each (a redo the same, plus `storyboardNote` with a note); never approved, the
  writing and stills are still charged. Not with `variants`. Check every sheet for twins, wrong faces, wounds in the
  wrong place, screens and a weak first shot.
- `speed: "draft"` (Basic) renders a smaller frame for less (`filmClipDraft` a clip instead of `filmClipFinal`).
  Then `POST /api/v1/director/videos/film/{id}/final` (JSON, optional `upscale`) renders the same clips, pictures
  and seeds at full quality as a new job; packaging and finishing carry over, the writing is never charged again.
  Premium and Ultra have no draft: they are already full quality.
- One bad clip: `POST /api/v1/director/videos/film/{id}/redo` with `{"clip": 3, "seed": 777}` and optionally
  `prompt`, `clip_images`, `images`, `audios`, `no_speech`, `verbatim`. Only that clip renders (a few minutes),
  as a new job; a redo keeps the clip's tier, and a Premium retake costs the part price it was sold at.
- Check every render with `references/montage/pixio-video-qa.md` (frames about 1 per second in action, every line
  heard).

## 6. Fights and action

- **`fight_flow`** (the studio's Fight Flow look: each blow sets up the next, fewer frozen poses): on automatically
  for clips the checker reads as a fight, off elsewhere; `true` forces it, `false` turns it off. `fight_motion`
  (0.1-0.6, 0.4 recommended) adds motion energy. Basic only; it has no effect on Premium.
- **Two takes per action clip.** Send `variants: 2` (Basic), or two jobs with different seeds, and keep, per clip,
  the take with the right people, a visible hit and the wound in the right place. Dialogue usually works first time.
  Two takes cost two films: quote and ask.
- **Write action shot by shot:** one blow per shot (start pose, contact point, reaction); one attacker and one
  defender per beat; both fighters in frame, named by build and outfit, in contrasting clothes. Handheld close-ups
  read as intense; a wide fight looks staged.
- **No event keyframes.** "Exactly as in `<Picture N>`" freezes a stab into a posed tableau: give people, prop and
  place, never the moment. Make each weapon a reference picture described so it can only be one thing.
- Name the exact spot of every blow and what is not hit: "the lower side of his back, just above the hip; his chest
  is untouched".
- Deep dive: `references/montage/pixio-action-fights.md`.

**Tiers for action.** Montage Premium is best at fights, stunts, chases and big camera moves; Basic with Fight Flow
is the cheaper option and is better at spoken close-ups. Mix them:

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/film?dry_run=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-premium -F resolution=480p -F duration=60 -F "clips=<clips.json" \
  -F images=@kane.png -F images=@danny.png -F images=@yard.png \
  -F tier_mix=manual -F 'basic_clips=[1, 4]'
```

- `tier_mix: "auto"` sends spoken close-ups to Basic and wide, action, crowd and cutaway clips to Premium; `manual`
  + `basic_clips` chooses. `tier_mix_size`: `larger` (default), `basic`, `premium`. Your `clips` must be in Montage
  Basic format (Premium units are converted). Basic clips cost the Basic price, Premium clips the Premium price.
  If Premium is not offered the request answers `400 premium_unavailable`. Quote first, show the price, wait for a
  yes (`references/montage/pixio-tier-choice.md`).
- A film all on Premium: write the clips with `references/montage/montage-premium-prompting.md` (6-9 pictures per
  clip work best), or send Basic-format prompts and let them convert.

## 7. Documentary films

`film_type: "documentary"` with an `idea` and `duration` (30-420) writes a cold open, chapters, invented on-camera
interviewees (labelled `dramatized`), a fact-checked narration, name and chapter cards, subtitles and a score.
Fields (`doc_style`, `interviews`, `doc_chapters`, `narration_pace`, `max_speedup`, `fact_check`,
`interview_label`) and narration rules are in `references/montage/pixio-explainers.md` and
`references/montage/pixio-documentary.md`. Other written formats: `film_type: "commercial"`
(`references/montage/pixio-ads.md`), `"explainer"`, `"short_drama"` (`references/montage/pixio-short-drama.md`).

## 8. Remake a video shot for shot

`POST /api/v1/director/videos/remake`: a 2 s - 7 min `video` plus plain-words `changes` (up to 4000 characters) and
up to 9 `images`. The AI finds the cuts, transcribes the speech, describes every shot and rewrites it as a film with
the same shots at the same cut times.

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/remake?dry_run=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video=@source.mp4 -F images=@me.png \
  -F "changes=The man in the grey coat is <Picture 1>. Set it in Tokyo at night." -F storyboard=true
```

- `motion`: `loose` (default; new place, style or people) or `medium` (each clip also sees its own 15 s of the
  source, for closer framing, blocking and timing; slower).
- `sound`: `original` (default; source sound kept in sync) or `new`.
- `storyboard`, `realism`, `seed`, `speed`, `aspect`, `upscale`, `visual_qa`, `package`, `video_model`,
  `resolution` work as on films. Length is the source's rounded up to 15 s (30 s minimum). Priced like a film
  written from an idea plus `remakeWatchPerClip` per 15 s for watching the source; `?dry_run=true` quotes it free.
  Full guide: `references/montage/pixio-remake.md`.

## 9. Inspiration videos

With `idea`, send 1-3 `inspiration` videos (up to 120 s each) and `inspiration_notes` (a JSON list in upload order,
or one text): `-F inspiration=@ref.mp4 -F 'inspiration_notes=["the lighting and slow push-ins"]'`. Each video is
studied for camera, light, colour, pacing and staging, priced like `understand/video` (at least 16 credits each) on
top of the film; the writer borrows only that style, never the people, faces, logos or exact shots. The videos are
not kept.

## 10. TV series

1. **Make the show (free):** `POST /api/v1/director/series` (multipart): `name`, `premise`, `style`, `aspect`
   (16:9, 9:16 or 1:1), and the cast as `cast` (JSON list of `{"name", "what", "kind": "person"|"place"|"thing"}`),
   then each member's `picture` and `voice` (5-15 s) with `POST /api/v1/director/series/{id}/cast`; or simply
   `pictures` (1-9) + `references` and `voice_samples` (0-3) + `voices`. Optional `theme` file + `theme_s`,
   `theme_auto` or `theme_brief` (a score made once, charged `score`), `title_card` (on by default), `laugh_track`
   (`light` / `full`, sitcoms).
2. **Plan a season** (optional): `POST /api/v1/director/series/{id}/season`
   `{"idea": "where the season goes", "episodes": 6}`. A writer job (`writerRound`, charged when done); planned
   episodes then need no `idea`.
3. **Make an episode:** `POST /api/v1/director/series/{id}/episodes` with an `idea` naming the cast members,
   `duration` (30-420, a multiple of 15, default 60), `speed: "draft"`, `voice_lock` (`auto` default),
   `fight_flow`, `previously`, `seed`, `video_model` (left out: Montage Basic). It is a normal film job priced like
   an AI-written film plus the recap (`episodeRecap`) and its title card and theme; `?dry_run=true` quotes it free.
4. Wait for episode N to finish before N+1: its recap (what happened, open threads, lasting changes) and learned
   faces and voices feed the next one (`GET /api/v1/director/series/{id}/episodes`). Cast management:
   `references/montage/pixio-characters.md`; showrunning: `references/montage/pixio-series-showrunner.md`.

## Before you report a film as done

- [ ] Story approved; hook in the first seconds; every clip ends on a turn.
- [ ] Every supplied picture used; one picture per person; no twins, over-the-shoulder shots or reflections.
- [ ] Wounds only from the shot they happen in; wardrobe identical across clips.
- [ ] `promptCheck` has no ERRORs and every WARN was read.
- [ ] Montage Basic unless Premium / Ultra was asked for and its quote approved; `grain` 0.
- [ ] Checked with `references/montage/pixio-video-qa.md`; bad clips redone, not the whole film.
- [ ] Reported `credits.charged` and the newest job id with `output.url` / `output.assetPath`.
