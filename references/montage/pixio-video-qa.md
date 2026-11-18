---
name: pixio-video-qa
description: How to check a finished Montage (Pixio's Director API) video before the user sees it and pick the cheapest right fix - reading the job (status, qa, qaIssues, faceFixReport, credits), the machine checks (/api/v1/director/videos/edit/analyze, /api/v1/director/understand/video and /audio), what the lip-sync measurements mean, your own frame and speech checks, and the defect-to-fix table (lip fix, relip, redo, Montage Edit, face fix, upscale, crop, assemble, finish). Use whenever a job is done and about to be delivered, or the user says a finished video looks or sounds wrong.
---

# Pixio video QA: check before you deliver, then fix cheaply

A finished job is not a finished video. Look at it before the user does, write down each defect with a time, then
fix only that part with the cheapest tool that fixes it. Never re-render a whole video for one bad stretch.

Base URL `$BASE` (`https://beta.pixio.myapps.ai`), key in `Authorization: Bearer $PIXIO_API_KEY`. Every check and fix
below is a Director job billed in Pixio credits (except where marked free); poll `GET /api/v1/director/jobs/{id}`.

## House rules

- **Test on Basic.** Every test, draft or trial render uses `video_model: "montage-basic"` (also the default when
  `video_model` is left out). Premium or Ultra only when the user asks for it and has seen the quote
  (`?check=true`, `credits.quoted`).
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.

QA rules: free reads first (the job itself, `…/shots`, `…/filter_preview`), then the cheapest checks and fixes. Free
quotes exist only on renders (`videos/text|image|reference|music|film` with `?check=true`) and on `videos/remake`,
`videos/package`, `series/{id}/episodes` and `jobs/{id}/edit` (`?dry_run=true`); for every other tool, read its
rate in `GET /api/v1/director/catalog`. Tell the user the price of paid fixes (Montage Edit, relip, Premium redos,
full Analyze) and get a yes first. Every fix makes a NEW job and leaves the original as it was: hand the user the
newest good job.

## 1. Read the job (free)

`GET /api/v1/director/jobs/{id}`:
- `status` must be `done`; otherwise read `error` (`failed` or `cancelled`). A `stage` and `progress` show where a
  running job is.
- `qa`: per part (clip or section) picture checks: `ok`, `lipSync` (the measured match to the audio), `borders`,
  `blendedFrames` (dissolves), `fightStillShots` (frozen fight poses).
- `qaIssues` (only with `visual_qa: "local"` or `"full"`): `type`, `part`, `timeSeconds`, `severity` (high / med /
  low), `evidence`, `suggestedFix`. Items marked `checkByEye` are hints, not verdicts. Films with `<d>` lines also
  get speech issues here: `speech_missing`, `speech_extra_words`, `speech_cut_off` (high), `speech_unscripted`
  (med), and a line in the wrong voice.
- `faceFixReport` (after a face fix): per section, likeness before and after and whether the change is `visible`.
- `faceFixJobId` (with `face_fix: "auto"`) and `lipCheckJobId` (with `lip_check` on a music video): the follow-up
  jobs. Poll them; the newest good one is what you deliver.
- `parts[]`: each clip or section's own URL, to review piece by piece; `pictures`: the reference pictures used
  (`GET /api/v1/director/jobs/{id}/pictures/{n}`).
- `credits` (`quoted`, `charged`): report it honestly, adding up every fix job.
- Lip fix and Montage Edit with `variant: "window"` give just the new window instead of the whole video.

When the job has no `qaIssues` (no `visual_qa`), do the face checks yourself (step 3).

## 2. Machine checks

| What | Route | Cost | Gives |
|---|---|---|---|
| Lip-sync only | `POST /api/v1/director/videos/edit/analyze`, `"checks": ["lipsync"]` | the minimum (16 credits) | `analysis.lipsync` stretches |
| Full QA watch | `POST /api/v1/director/videos/edit/analyze` (all checks) | about 16 credits a minute of video (`resolution: "low"` about a quarter) | `issues`, `sections` scores, `overallScore`, `suggestedFixes` |
| Measurements only | `POST /api/v1/director/understand/video`, `"measure_only": true` | the minimum | shots, cuts per minute, tempo, loudness, lip-sync |
| Deep read | `POST /api/v1/director/understand/video` | priced per request, at least 16 (a few minutes is about the minimum) | scenes, people, story, quality, answer to `question` |
| The sound | `POST /api/v1/director/understand/audio` | at least 16 | tempo, loudness, where voices sing or speak |
| Shot list | `GET /api/v1/director/jobs/{id}/shots` | free | every hard cut with a thumbnail |

**Analyze:** `checks` is any of `lipsync`, `faces`, `artifacts`, `text`, `continuity`, `prompt_match`;
`start_s`/`end_s` limit it to a window (times stay in the full video's seconds); `pictures` (default true) compares
faces with the job's references; `source` (`auto` default) picks the original-song version of a Premium music video;
`prompt` sets what `prompt_match` checks against (default: the job's own prompts). The done job's `analysis` holds
`summary`, `overallScore`, `checks`, `lipsync`, `lipsyncSummary`, `issues` and `sections`, and `suggestedFixes`:
ready Pixio requests (`endpoint`, `method`, `body`, `reason`) for lip fix, Montage Edit, face fix or a section / clip
redo on your job (`max_fixes`, default 6). Nothing is fixed until you send one. Read them, then decide.

**Understand:** the done job's `understanding` has a summary, mood and visual style, scenes with times, people
(described, never identified), on-screen text (kind and place only), the sound, the story (`hook`, beats), quality
notes and tips, and measurements (every shot, cuts per minute, tempo, loudness, where voices are, and with a voice
the lip-sync measured frame by frame in `measured.lipsync`). Ask a `question` (reply in `understanding.answer`) or set
a `focus` ("does the man in the grey coat appear in every scene?"). Words are never quoted back, so it cannot check
what was said. Its `source` defaults to `video`: send `"source": "song"` or `"auto"` on a Premium music video.

### Lip-sync measurements

The meter compares the mouth opening per frame with the isolated vocal. Each stretch has a `verdict` and `offset_ms`
(negative = the mouth leads).
- `in_sync`: within about 150 ms after the natural mouth lead is taken off.
- `early` / `late`: the stretches to fix.
- Not measurable (no clear face, sunglasses, fast rap; `analysis.lipsyncNote` says so): check by eye.
- Stretches below `min_confidence` (0.5) are weak evidence.

What to expect: Montage Basic locked to the song measures in sync almost everywhere; a Premium or Ultra music video
as delivered measures well against its own re-sung audio but clearly off against the customer's song (Ultra the
most), which is what relip and lip fix are for (`references/montage/pixio-lipsync-fixing.md`).

## 3. Your own frame and speech checks

Machines miss things. Pull about 1 frame per second (more where people move fast) and look at each:
- **Clones:** the same face twice in a frame, or twins where the prompt asked for two different people.
- **Missing or swapped people:** count faces against the prompt; each still looks like their picture; clothes not swapped.
- **Props:** right object, colour, costume. Small tech or flying props often turn into something else.
- **Wounds and blood:** only from the shot where the hit happens, on the right side and the right person.
- **Blur and warping:** far faces, smeared hands, melting during fast moves.
- **On-screen text:** burned-in subtitles, logos or garbled words nobody asked for (packaging captions are fine).
- **Posed tableaux:** a fight that stands still, a fist stopping short, a crowd lined up in a row.
- **Speech:** transcribe one 15 s clip at a time (longer audio with fight noise makes speech-to-text loop;
  `POST /api/v1/director/audio/transcribe` with `start_s`/`end_s`, 16 credits), compare with the `<d>` lines:
  missing, extra or cut-off words.

Write each defect as: time (s), clip or section, what is wrong, severity.

## 4. Defect -> fix

| Defect | Fix (cheapest first) | Cost |
|---|---|---|
| Lips off in one known stretch | `POST /api/v1/director/videos/lipfix`, a 4-14 s window | one Basic render, at least 16 |
| Lips off in many places, or unknown | `POST /api/v1/director/videos/lipfix/auto` (measures, fixes, re-measures, keeps the best) | only the tries it renders, each priced as a lip fix; slow |
| Premium / Ultra music video: lips follow the re-sung vocal | `POST /api/v1/director/videos/relip` with `"source": "song"` | per second of video (catalog) |
| One bad film clip (clone, wrong person, wound, line) | `POST /api/v1/director/videos/film/{id}/redo`: `clip`, new `seed`, corrected `prompt`, `clip_images` | one clip render (Premium: the part price it was sold at) |
| One bad music section | `POST /api/v1/director/videos/music/{id}/redo` with `section` | one section render |
| One wrong thing in a good shot (colour, object, costume, sky) | `POST /api/v1/director/videos/edit` (Montage Edit) on a 1-15 s window | priced per request, at least 16; higher `resolution` costs more |
| Small far faces smeared | `POST /api/v1/director/videos/facefix` with `sections`; `"people": "all"` for group shots | `faceFix` credits per section it visibly changed |
| Too soft | `POST /api/v1/director/videos/upscale` (`detail` 0-1, default 0.6) | per started 15 s (catalog) |
| Trim, cut-out or new shape | `POST /api/v1/director/videos/edit/crop` (`start_s`/`end_s`, `aspect_ratio`) | like `videos/finish` on the seconds kept, at least 16 |
| Drop or reorder shots | `GET /api/v1/director/jobs/{id}/shots`, then `POST /api/v1/director/jobs/{id}/edit` with `shots` | like packaging on the edited length; `?dry_run=true` free |
| Join clips, or swap one shot for new clips | `POST /api/v1/director/videos/assemble` (`clips`, or `replace`) | like `videos/finish` on the length made |
| Flat or wrong look | `POST /api/v1/director/videos/finish` (`grade`, `saturation`, `grain: 0`) or `filter` / `look_id` in `package` | like `videos/finish` per second |

How to choose:
- Lips: lip fix, not a redo. A redo throws away a good picture.
- Clones, missing or wrong people and misplaced wounds rarely edit out cleanly: redo that clip with a corrected
  prompt (rules: `references/montage/montage-basic-prompting.md` or `references/montage/montage-premium-prompting.md`;
  identity: `references/montage/pixio-characters.md`).
- Montage Edit when the picture is right except one thing you can say in one short sentence; it cannot fix bodies or
  faces (rules: `references/montage/montage-edit-prompting.md`). Unwanted burned-in text: Montage Edit ("Remove the
  text at the bottom of the frame.") on that window, or a redo.
- Order: content first (redo, Montage Edit, lips, faces), then trim / assemble, then upscale, then finish or filter.
- After every fix, check the new job again, at least the fixed window.

## 5. Request examples

```bash
# lip-sync measure (the minimum price)
curl -X POST "$BASE/api/v1/director/videos/edit/analyze" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" -d '{"job_id": "JOB_ID", "checks": ["lipsync"]}'

# measurements only (the minimum price)
curl -X POST "$BASE/api/v1/director/understand/video" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" -d '{"job_id": "JOB_ID", "measure_only": true}'

# fix the lips of 12-20 s (a music video follows the original song by default)
curl -X POST "$BASE/api/v1/director/videos/lipfix" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" -d '{"job_id": "JOB_ID", "start_s": 12, "end_s": 20}'

# find and fix every early / late stretch in 0-60 s
curl -X POST "$BASE/api/v1/director/videos/lipfix/auto" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" -d '{"job_id": "JOB_ID", "source": "auto", "start_s": 0, "end_s": 60}'

# redo clip 3 of a film with a corrected prompt
curl -X POST "$BASE/api/v1/director/videos/film/JOB_ID/redo" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" -d '{"clip": 3, "prompt": "CORRECTED CLIP 3 PROMPT"}'

# one-thing change in 40-46 s (billed; tell the user the price first)
curl -X POST "$BASE/api/v1/director/videos/edit" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"job_id": "JOB_ID", "prompt": "Make her jacket dark green.", "start_s": 40, "end_s": 46}'

# far faces in sections 2 and 5; finish without grain
curl -X POST "$BASE/api/v1/director/videos/facefix" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" -d '{"job_id": "JOB_ID", "sections": [2, 5]}'
curl -X POST "$BASE/api/v1/director/videos/finish" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" -d '{"job_id": "JOB_ID", "grade": "warm", "grain": 0}'
```

## 6. Before you hand it over

- Every high-severity item is fixed or told to the user.
- Lips `in_sync` wherever someone sings or speaks.
- Face counts and identities match the prompt in every shot; no unwanted text.
- Give the user the final job id, its `output.url`, what you fixed and the total `credits.charged` across the fix
  jobs.
- Next time: send `visual_qa: "local"` (a few credits per 15 s part) on films and music videos, and
  `lip_check: "measure"` on music videos, so the checks come back with the job.
