---
name: pixio-lipsync-fixing
description: How to measure and fix lip-sync on Montage (Pixio's Director API) in depth - POST /api/v1/director/videos/lipfix (one 4-14 s window re-rendered on Montage Basic), POST /api/v1/director/videos/lipfix/auto (measure, fix every early / late stretch, re-measure, keep the best), POST /api/v1/director/videos/relip (re-mouth a Premium / Ultra video to the original song, only the mouth and jaw change), lip_check on music videos, the source / audio_from switches, reading before / after measurements, Basic vs Premium mouths and tier mix. Use whenever lips in a finished video do not match the song or the spoken lines, or before you deliver a music video or dialogue scene. Not for finding every kind of defect (that is pixio-video-qa) or for writing the render prompts (montage-basic-prompting, montage-premium-prompting).
---

# Pixio lip-sync fixing: measure, pick the right tool, prove it got better

Three tools fix lips. They work in different ways, cost different amounts and suit different videos. Pick one from
the decision table, always measure before and after, and never redo a whole video for a few bad seconds.
Finding the defects in the first place is covered in `references/montage/pixio-video-qa.md`. This skill goes deeper
on the lips.

Base URL `$BASE` (`https://beta.pixio.myapps.ai`), key `$PIXIO_API_KEY` in the `Authorization: Bearer $PIXIO_API_KEY`
header only. Every call below is a billed Pixio-credit job you poll with `GET /api/v1/director/jobs/{id}`; prices
are in `GET /api/v1/director/catalog`.

## House rules

- **Test on Basic.** Every test, draft or trial render uses `video_model: "montage-basic"` (also what you get when
  `video_model` is left out). Premium or Ultra only when the user asks for it and has seen the quote
  (`?check=true` on the render, `credits.quoted`).
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.
- Cheapest fix first: a tight lip fix window, then lip fix auto, then relip. Lip fix, lip fix auto and relip have no
  free quote (`?check` / `?dry_run` answer `400 preflight_unavailable`), so read the rates in
  `GET /api/v1/director/catalog`, tell the human what it will cost and get a yes before the bigger ones. The start
  response's `credits.quoted` is what is held; a `402` means nothing started.
- Lips must follow the customer's song, not a re-sung copy. Never echo private lyrics into a log, note or message.
- Every fix is a NEW job. The original never changes. Hand over the newest good job id. Store the id a start call
  returns; on a timeout keep polling that id and never resubmit.

## 1. Why lips go wrong (know this before choosing)

- **Montage Basic** renders each section locked to the original song's slice, so its mouths follow the real audio
  (measured offset about 0 frames). When Basic lips drift, it is local: a few stretches, a fast run of words, a
  turned head.
- **Montage Premium / Ultra** re-sing the vocal they are sent, on their own clock. Their lips match THEIR singing,
  not your song. Against its own audio Premium measures well in sync; the same picture against the customer's song
  measures clearly worse, with offsets of several frames either way, and Ultra drifts further. Re-timing cannot fix
  a re-sung performance. Only a lip-sync pass driven by the song's vocal can (relip), or a Basic re-render of those
  windows (lip fix).
- A Premium music video has two versions: the delivered one (Premium's own sung sound, so it looks in sync) and the
  original-song version (`output.withOriginalSong`, or `GET /api/v1/director/jobs/{id}/video?variant=song`: the same
  picture with the customer's song). Always judge and fix lips against the original-song version. That is what
  `source` controls.

## 2. Decision table

| Situation | Tool | Cost / time |
|---|---|---|
| Basic video, you know the bad stretch | `POST /api/v1/director/videos/lipfix`, a 4-14 s window | priced per request, at least 16 credits; one Basic render (about 4.5 min for a 15 s window) |
| Basic video, many stretches or you don't know where | `POST /api/v1/director/videos/lipfix/auto` | holds `max_windows` x `tries` x an 8 s lip fix, charged only for the tries it renders; 10-40 min per 30 s |
| Premium / Ultra music video, keep the Premium picture | `POST /api/v1/director/videos/relip` | priced per second of video (catalog); a few minutes per 15 s |
| Premium music video, OK to swap bad windows to Basic shots | `POST /api/v1/director/videos/lipfix/auto` with `source: "song"` | as lip fix auto; those windows become Basic renders (a tier mix inside one video) |
| New spoken line or new words in a window | `POST /api/v1/director/videos/lipfix` multipart with `audio` | as lip fix |
| Analyze says the lip-sync could not be measured (sunglasses, hood, fast rap, side face) | check by eye | - |
| Prevent it next time on a music video | `lip_check` on `POST /api/v1/director/videos/music` | as the tool it starts |

Rules of thumb:
- Lip fix replaces the whole window's picture with a new Basic render. With `start: "video"` it starts from the
  window's own frames (`start_denoise`, default 0.65), so shots, cuts and faces stay put, but it is still a new
  render. Relip changes ONLY the mouth and jaw; every other pixel is the source's.
- So on a Premium video you love the look of: relip. On a Basic video: lip fix (relip has no advantage there).
- Long windows fix worse. Keep lip fix windows tight around the bad stretch, 4-8 s when you can.

## 3. Measure first

```bash
# Montage Analyze, lip-sync only: measured frame by frame, the minimum price.
# source "auto" (the default here) = a Premium music video's original-song version
curl -X POST "$BASE/api/v1/director/videos/edit/analyze" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"job_id": "JOB_ID", "checks": ["lipsync"], "start_s": 0, "end_s": 60}'
```

Poll the job; when it is `done`, read `analysis.lipsync`: each stretch has its times, a `verdict` and `offset_ms`.
- `early` (negative offset, the mouth leads) and `late` are the targets. `in_sync` is within about 150 ms after the
  natural mouth lead is taken off. A stretch the meter could not pair (or `analysis.lipsyncNote` saying it could not
  be measured) is not a pass: check it by eye.
- `min_confidence` (default 0.5) sets how sure the meter must be before a bad stretch becomes a suggested fix; weaker
  stretches are weak evidence.
- `analysis.suggestedFixes` already holds ready Pixio requests (`endpoint`, `body`, `reason`), usually lip fix
  windows of 4-14 s on your job. Read them; don't send blindly. `max_fixes` (default 6) caps them.
- `analysis.lipsyncSummary` and `overallScore` give the overview.

A cheaper alternative read: `POST /api/v1/director/understand/video` with `"measure_only": true` returns
`understanding.measured.lipsync` (stretches with verdict and `offset_ms`) at the minimum price.

## 4. POST /api/v1/director/videos/lipfix (one window)

JSON with `job_id`, or multipart with `video` (an mp4) and optional `audio`.
Required: `start_s`, `end_s` (window 4-14 s, any start time, not tied to sections).

What it does: the window's own footage plus `pad_s` (default 0.5 s) each side is the video reference, the window's
vocal (music stripped when `isolate_vocal` is on) is the audio it locks to, and an auto-written prompt says "keep the
video, the person sings the vocal". One Basic render, scaled back to the source size, crossfaded in with `blend_s`
(default 0.25 s) at both seams, the full song laid back on.

Fields that matter:
- `source` (`auto` default): with a Premium music video, auto fixes the original-song version. `video` = the
  delivered video, `song` = require the song version.
- `audio_from`: whether the window's audio is the ORIGINAL SONG's own slice (music videos, Basic or Premium) or the
  video's own sound. An uploaded `audio` file always wins.
- `start` (`none` default, or `video`) and `start_denoise` (0.3-1.0, default 0.65 with `start: "video"`):
  `start: "video"` starts from the window's own frames so even less changes; lower denoise keeps more of the original
  picture but the mouth moves less. If the mouth barely changed, try 0.8-0.9.
- `ref_frames` (0-4): stills of the window also sent as pictures of the person, when the face drifts.
- `seed` for a second try; `prompt` (up to 8,000 characters, official Basic format, see
  `references/montage/montage-basic-prompting.md`) only when the auto prompt fails; `verbatim`.
- `isolate_vocal` (default true), `blend_s`, `pad_s`, `steps`.
- `variant`: what the job's output is, `full` (default: the whole video with the window replaced) or `window` (just
  the new window).

```bash
# Basic music video, lips late at 31-38 s
curl -X POST "$BASE/api/v1/director/videos/lipfix" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" -d '{"job_id": "JOB_ID", "start_s": 31, "end_s": 38}'

# any mp4 with a new line for 12-17 s (the person says the new audio)
curl -X POST "$BASE/api/v1/director/videos/lipfix" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "video=@scene.mp4" -F "start_s=12" -F "end_s=17" -F "audio=@new_line.wav"
```

An uploaded mp4 has no stored song. To make its lips follow a song, send that song's slice for the window as
`audio`. Fix lips BEFORE you upscale: lip fix works at the render size, and you would upscale twice.

## 5. POST /api/v1/director/videos/lipfix/auto (find and fix everything)

The meter finds every early / late stretch, turns each into a lip fix window (chained: each fix is made on the
previous result), re-measures each window, re-renders while it is still off, keeps the attempt with the smallest
error, and never uses a fix that measures worse than the original. One video comes back.

| Field | Default | Notes |
|---|---|---|
| `source` | `video` | NOT auto here. Send `auto` or `song` for a Premium music video, or you fix against Premium's own sung sound |
| `start_s` / `end_s` | whole video | only fix stretches in this range |
| `tries` | 3 (1-3) | renders per window at most; stops early once in sync |
| `denoise_ladder` | [0.9, 0.8, 1.0] | how strongly each try redraws the mouth (lower keeps more of the old mouth) |
| `max_window_s` | 8 (4-14) | long windows fix worse; the hold is priced on it |
| `passes` | 2 | re-measure and fix what is still off with fresh window edges |
| `max_windows` | 12 (1-12) | cap on windows; lower it to cap the hold |
| `tol_ms` / `min_conf` | 150 / 0.5 | what counts as off, and how sure the meter must be |

It runs for a long time (10-40 minutes for 30 s). Don't resubmit; poll the same id.

```bash
curl -X POST "$BASE/api/v1/director/videos/lipfix/auto" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"job_id": "JOB_ID", "source": "auto", "start_s": 0, "end_s": 60}'
```

## 6. POST /api/v1/director/videos/relip (only the mouth changes)

A lip-sync pass re-mouths the video to the song's isolated vocal. Then only a feathered lower-face patch (under the
nose to below the chin) is pasted into the ORIGINAL frames, colour-matched and sharpened. Same size, fps and frame
count; outside the mouth it equals the source up to the final encode. The original song is the soundtrack.

Fields: `source` (`video` or `song`; send `song` for a Premium music video), `only_sung` (true: the mouth changes
only where the vocal is heard), `sung_pad_s` (default 0.2), `isolate_vocal` (default true), `soundtrack`,
`mask_grow` (default 1.6; 1.0 = mouth and chin only, larger takes more of the new face), `feather` (default 0.10),
`sharpen` (default 1.0), `color_match` (default true), `offset_s` (advanced shift). Multipart: `video` plus optional
`audio` (the song or voice to sync to).

```bash
# after the human has seen the price (catalog rate x seconds of video) and said yes
curl -X POST "$BASE/api/v1/director/videos/relip" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" -d '{"job_id": "PREMIUM_JOB", "source": "song"}'
```

## 7. Reading before / after

- Run lip-sync Analyze on the original and on the NEW job (at least over the fixed windows). Count the seconds that
  are `early` / `late` before and after, and the mean |`offset_ms`|. The goal is `in_sync` wherever someone sings or
  speaks.
- Numbers are not the whole story. Look at the fixed windows at full size: teeth, a seam on the chin, a stubble
  change, a soft mouth on a sharp face. If the relip paste mask shows, try `mask_grow` 1.3 or `feather` 0.15; if the
  mouth is soft, `sharpen` 1.3.

## 8. lip_check on music videos (prevention)

`POST /api/v1/director/videos/music` field `lip_check` (default `off`): when the video is done, one follow-up job
starts on it, always against the customer's original song:
- `measure`: a lip-sync Analyze (its report is that job's `analysis`), the minimum price.
- `fix`: lip fix auto, held and charged like `videos/lipfix/auto`; gives a fixed copy.
- `relip`: relips the whole video to your song, priced like `videos/relip`. Best for Premium and Ultra; only with the
  human's OK.
The video job's `lipCheckJobId` names the follow-up job. Poll that id; with `fix` or `relip` it is the one to
deliver. Short of credits, the check is skipped (`lipCheckSkipped`). Retakes and finals are checked the same way.

## 9. Tier mix (Basic mouths, Premium look)

Instead of fixing afterwards, render the singing close-ups on Basic from the start: `tier_mix: "auto"` (or
`manual` with `basic_sections` / `basic_clips`) on a Premium or Ultra music video or film. Whole 15 s sections are
the unit. Sung / spoken close-ups go to Basic (its lip-sync follows your real audio), wide, action and instrumental
shots to Premium; Basic parts keep the Basic price, so a mix costs less than all-Premium. `tier_mix_size` sets the
one size every part is brought to. After the fact, `lipfix/auto` with `source: "song"` gives the same kind of mix
window by window. A redo of a whole Premium job on Basic re-renders every clip, so don't use it just for lips. Tier
choice in general: `references/montage/pixio-tier-choice.md`.

## 10. Common mistakes

- Fixing a Premium video against `source: "video"` (the default on lipfix/auto): it already matches Premium's own
  sound, so nothing improves. Use `auto` or `song`.
- Upscaling first, then lip fixing: you would upscale twice.
- One 14 s window over a cut and two singers when the bad part is 3 s: tighten it.
- Writing a prompt for a lip fix by default. The auto prompt is tuned; write your own only after a failed try.
- Choosing relip on a Basic video. Basic is already the best mouth; lip fix it.

## Checklist

- [ ] Measured first (Analyze `checks: ["lipsync"]`) and wrote down the bad stretches with times.
- [ ] Picked the tool from the table; Premium music video -> `source` auto or song.
- [ ] Told the human the price from the catalog before lip fix auto or relip, and got a yes.
- [ ] Windows 4-14 s, tight; lips fixed before upscale, finish and graphics.
- [ ] Measured again on the new job; before / after reported (seconds early / late, mean offset).
- [ ] Looked at the fixed windows by eye (seam, teeth, softness).
- [ ] Delivered the newest job id with its `output.url` and the credits it charged (`credits.charged`).
