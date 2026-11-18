---
name: pixio-documentary
description: How to make factual-channel documentaries with Montage (Pixio's Director API) - POST /api/v1/director/videos/film with film_type=documentary in depth (doc_style, interviews, doc_chapters, narration_pace, max_speedup, fact_check, interview_label, the package defaults and how to change them), the narrator, dramatized interviews, B-roll that matches every line, an archival or period look without grain, mixing in the customer's own footage, and honesty rules. Use whenever someone asks for a documentary, a mini-doc, a history or nature film, a true-story recap or a "factual channel" style video. Not for teaching or how-it-works videos with pop captions and no interviews (that is pixio-explainers) and not for the clip prompt format (that is montage-basic-prompting).
---

# Documentaries on Montage

One call makes a whole documentary: `POST /api/v1/director/videos/film` with `film_type=documentary`, an `idea` and a
`duration`. The AI writes a script in chapters (a cold open that hooks, chapters that build and end on a turn, a
closing line that lands), fact-checks it, has a narrator read it, gives every line its own shot at the moment it
is spoken, adds short on-camera interviews with invented people (labelled as dramatized), and packages it with a
title card, chapter and name cards, subtitles from the script and a score that dips under every voice. Your job is
the brief, the settings, the check before the render and the honesty of the result.

Base URL `$BASE` (`https://beta.pixio.myapps.ai`), key in `Authorization: Bearer $PIXIO_API_KEY`. Every render is
billed in Pixio credits; poll `GET /api/v1/director/jobs/{id}` until `done`.

## House rules

- **Test on Basic.** Every test, draft or trial render uses `video_model: "montage-basic"` (also the default when
  `video_model` is left out). Premium or Ultra only when the user asks for it and has seen the quote
  (`?check=true`, `credits.quoted`).
- **The customer's own song first.** A music video uses the song the user gave you (`song`). `POST /api/v1/director/music/generate`
  is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.
- Keep `fact_check` on; keep dramatized interviews labelled; never fake a real person's words or face.

The shared narrated-video basics (word budget, voiceover, packaging fields, subtitles, dubbing, assembly) are in
`references/montage/pixio-explainers.md`; this skill covers what is specific to documentaries.

## Documentary or explainer? (decide first)

| | `film_type=documentary` (this skill) | `film_type=explainer` (`references/montage/pixio-explainers.md`) |
|---|---|---|
| purpose | tell a true story: stakes, people, a turn | teach how something works, step by step |
| structure | cold open + 1-8 chapters + closing line | sentences packed into 15 s clips |
| on camera | short dramatized interviews (optional) | nobody talks on screen |
| pace | `narration_pace` 1.5-2.6 words/s (default 1.85) | about 2.3 words/s |
| default voice | `am_onyx` (deep) | `af_heart` (warm) |
| text | title card, chapter cards, name cards, subtitles | pop captions (2 words), no end card |
| music | a cinematic score made for it | none unless you ask |

If the human says "documentary" but wants "how X works in 45 s for TikTok", that is an explainer. Ask when unsure.

## 1. The fields

| field | values | what it does |
|---|---|---|
| `idea` | 10-4000 characters | the subject and angle: "how a blue whale hunts krill off California" |
| `duration` | multiple of 15, 30-420 s | 30 s = 2 clips, 420 s = 28 clips |
| `doc_style` | `dramatic` (default), `observational`, `investigative` | dramatic: stakes, scale, cliffhangers, epic score. observational: quiet, lets it breathe. investigative: a mystery, clues, an answer |
| `interviews` | `auto` (default), `few` (1-2), `none`, `0`-`6` | auto = none under 40 s, 1-2 up to 100 s, 2-4 longer |
| `doc_chapters` | 1-8 | chapters after the cold open; default 1 under 50 s, 2 under 100 s, 3 under 200 s, 4 longer |
| `narration_pace` | 1.5-2.6 words per second of film | default 1.85; lower = more room for pictures and pauses |
| `max_speedup` | 1.0-1.3 | how much the narrator may be sped up to fit; default 1.15; 1.0 = never |
| `fact_check` | `true` (default) / `false` | a second writer pass checks every claim and fixes wrong or overstated ones before the narration is read (`factCheck` credits in the catalog). Keep it on |
| `interview_label` | up to 40 characters | shown after the interviewee's role on the name card; default `dramatized`; `""` for none |
| `package` | JSON object | any packaging field; your values win over every documentary default |

Plus everything a film takes: `video_model`, `aspect`, `style`, `images` + `references`, `storyboard`, `speed`,
`realism`, `seed`, `upscale`, `visual_qa`, `face_fix`. Priced like an explainer plus its score.

**Pace in words** (narration_pace x duration): 60 s at 1.85 is about 110 words; 3 min about 330; 7 min about 780.
Observational pieces read well at 1.6-1.7; dramatic ones at 1.85-2.0. A script still too long after `max_speedup`
loses middle lines, never the hook or the closing line.

## 2. Writing the idea

- **Name the subject, the angle and the turn:** "The 1928 flood of the St. Francis Dam: how a dam declared safe
  that morning failed at midnight, and what the investigation found." The writer builds the cold open from the
  most startling true fact; give it one.
- **State what must be said and what must not.** "Do not name the victims' families." "Mention that the
  engineer accepted responsibility at the inquest."
- **Say the era and the places** so the B-roll is right: "1920s California canyon, wooden houses, Model T
  trucks, men in flat caps."
- **Real animals, machines and places get a reference picture** whose description lists their true identifying
  features (a blue whale, not a humpback), used in every clip that shows them. The writer does this when it
  designs the pictures; when you upload your own, say what each one is in `references`.
- **Real people:** do not render a real, identifiable person doing or saying things they did not do. Show them
  only from behind, in silhouette, or through objects and places (their desk, their tools, the town); or use
  photos the human has the right to use, and say they are reconstructions.

## 3. Interviews (dramatized)

- Interviewees are **invented people who would know** (a boat captain, a historian, a retired engineer), seated,
  speaking their line on camera; the studio voices and lip-syncs them. They are not real witnesses.
- **Keep the label.** `interview_label` defaults to `dramatized` on the name card. Remove it (`""`) only when the
  human explicitly accepts that and the video is clearly fiction. Never present an invented interviewee as a real
  person, and never give them a real person's name.
- `interviews=none` for a pure narrated piece (nature, a calm history); `few` for 60-100 s; an exact number when
  the human wants a set count.
- Check their name cards in the storyboard and in the render.

## 4. B-roll: one shot per line

- The writer gives each narration line its own shot at the moment it is spoken. Every line must be something you
  can SHOW: "the water reached the town at 1:20 a.m." becomes a wide of dark water across a road under one street
  lamp, not "devastation".
- Check every shot before anything renders: with `storyboard=true` the job stays `running` with
  `storyboard.waiting: true` after the writing. `GET /api/v1/director/jobs/{id}/storyboard` lists the shots and stills;
  `GET /api/v1/director/jobs/{id}/storyboard/sheet.jpg` is a contact sheet (a row per clip). Each still costs
  `setPicture` credits, and the writing and stills are charged even if you never approve. Fix a shot with
  `POST /api/v1/director/jobs/{id}/storyboard/redo` `{"clip": 2, "shot": 3, "note": "a wide of the empty canyon at dawn, no people"}`,
  then `POST /api/v1/director/jobs/{id}/storyboard/approve`.
- What to look for: wrong species or machine, modern objects in a period film, text or signs (the video model garbles them),
  phones and screens, twins in crowd shots, real-looking famous faces.
- Nature B-roll: side-profile animals, medium framing, long-lens feel; avoid small creatures in macro and herds
  (clones). Steady or slow camera reads as documentary; on Premium "handheld with slight shake" and "nature
  documentary, long lens" are the phrasings that work.

## 5. Narration and voice

- Default narrator `am_onyx` (deep). Change it with `package.voiceover_voice`, an id from `GET /api/v1/director/voiceover/voices`
  (never invent one). A cloned narrator needs the speaker's consent. Voice choice, cloning, translated subtitles
  and dubbing work as for any narrated video: `references/montage/pixio-explainers.md` and
  `references/montage/pixio-localization.md`.
- The narrator should sound like it knows and is in no hurry: a slower `narration_pace` (1.6-1.8) gives the
  pictures room, and a line followed by a held shot lands harder than two lines back to back.

## 6. Packaging defaults, and how to change them

| default | change it | turn it off |
|---|---|---|
| subtitles from the script (interviews included) | `caption_style`, `caption_position`, `caption_font`, `caption_size` | `"captions": "off"` |
| title card (the script's title) | `"title_card": "THE NIGHT THE DAM BROKE\nMarch 1928"`, `title_card_s` | `"title_card": ""` |
| chapter cards and name cards | your own `lower_thirds` list (`{"t", "text", "sub", "kind": "name" or "chapter", "label", "d"}`) | `"lower_thirds": []` |
| a score made for it | `"score": "sparse low strings and a slow piano, no drums"`, `music_db` | `"score": "off"` |
| the narrator over the film | `voiceover_db`, `duck_db` | - |
| no end card | `tagline`, `cta`, `logo`, `end_card_s` | - |
| no colour look | `filter`, `filter_strength`, `vignette`, `look_id` | - |

The customer's own music track wins over a generated score: send it as `music_bed`.

## 7. An archival or period look (without grain)

- **Do the period in the prompt, the colour in packaging.** Ask the video model for a clean, readable 1920s scene (clothes,
  vehicles, buildings, light); never "old footage", "film grain", "scratches", "VHS noise" or film-stock names
  (no grain, anywhere).
- **Packaging filters:** `black_and_white`, `sepia`, `vintage` (faded, warm highlights), `faded` (matte), with
  `filter_strength` 0-1 and `vignette` 0.3-0.6. Preview first: `GET /api/v1/director/jobs/{id}/filter_preview` (free; `?filter=all` = every
  filter side by side; `?filter=sepia&vignette=0.4` for one).
- **Match a real archival still:** `POST /api/v1/director/looks` (free) with the still as `picture`; it answers with an `id`; send it as
  `look_id` in `package`.
- **Only part of the film archival** (a flashback in a modern piece): Montage Edit on that window
  (`POST /api/v1/director/videos/edit` with `job_id`, `start_s`/`end_s` 1-15 s, "Make this black and white"), spliced back with
  soft seams. It is billed per request (at least 16 credits) and has no free quote: tell the human and ask first. Or render the flashback as its own
  job, package it with the filter, and join the jobs with `POST /api/v1/director/videos/assemble`.
- `finish` can add a 2.39:1 letterbox (`scope: true`); keep `grain` 0.

## 8. Mixing in the customer's own footage

Join the documentary and the customer's clips with `POST /api/v1/director/videos/assemble` (priced like
`videos/finish` on the length made; fields in `references/montage/pixio-video-editing.md`). Real interview footage the customer owns goes in as an upload and is never relabelled as
dramatized; generated reconstructions stay labelled, and a viewer must be able to tell which is which.

## 9. Requests

Plan it, check it, price it (Basic; nothing starts on a dry run, which is free):

```bash
curl -X POST "$BASE/api/v1/director/videos/film?dry_run=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F film_type=documentary -F video_model=montage-basic -F duration=180 -F aspect=16:9 \
  --form-string "idea=The 1928 failure of the St. Francis Dam in California: declared safe that morning, gone by midnight, and what the inquest found." \
  -F doc_style=investigative -F interviews=few -F doc_chapters=3 -F narration_pace=1.8 -F storyboard=true \
  --form-string "style=1920s California canyon, clean natural light, steady slow camera, a clean digital cinema image" \
  -F 'package={"voiceover_voice": "am_michael", "filter": "sepia", "filter_strength": 0.6, "vignette": 0.3}'
```

Show the human `credits.quoted`, the planned length, the voice and the look; after a clear yes, send it again
without `dry_run`. With `storyboard=true` the written shot plan per clip is in
`GET /api/v1/director/jobs/{id}/storyboard` before anything renders.

A quiet 60 s nature piece with no interviews and no score:

```bash
curl -X POST "$BASE/api/v1/director/videos/film" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F film_type=documentary -F video_model=montage-basic -F duration=60 -F doc_style=observational -F interviews=none \
  -F narration_pace=1.6 --form-string "idea=A grey heron's patient morning hunt in a misty English river at dawn." \
  -F images=@grey_heron.png -F 'references=["a grey heron: grey back, white neck, black crest plume, yellow dagger bill"]' \
  -F 'package={"score": "off"}'
```

## 10. After the render

- Listen to the narrator: rushed reading or missing middle lines mean the script was long; lower `narration_pace`
  next time.
- Watch every chapter against its narration: does each shot show what the line says, right species, right era?
- One bad clip: `POST /api/v1/director/videos/film/{id}/redo` `{"clip": 4, "seed": 811}`. A misplaced or weak shot: re-cut
  with `GET /api/v1/director/jobs/{id}/shots` (free) and `POST /api/v1/director/jobs/{id}/edit` (keep, drop, reorder,
  trim; no new render; priced like packaging on the edited length, `?dry_run=true` is a free quote).
- Name and chapter cards wrong: re-package with your own `lower_thirds` (`POST /api/v1/director/videos/package` with `job_id`).

## Checklist

- [ ] Documentary (story) and not explainer (teaching) is the right mode; length a multiple of 15, 30-420
- [ ] `idea` has subject, angle, turn, era and places; must-say and must-not-say written in
- [ ] `doc_style`, `interviews`, `doc_chapters`, `narration_pace` chosen on purpose; word count fits
- [ ] Narrator id from `GET /api/v1/director/voiceover/voices` or a supplied sample; music: the customer's track first
- [ ] Real animals, machines and places have accurate reference pictures; real people not faked
- [ ] Period look from prompt content plus a packaging filter or `look_id`; no grain words
- [ ] Storyboard checked shot by shot; `credits.quoted` shown; a clear yes before the render
- [ ] After: narration pace heard, every shot matches its line, interviews labelled, claims re-read
