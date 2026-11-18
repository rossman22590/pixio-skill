---
name: pixio-upscale-finish
description: How to take a finished Montage (Pixio's Director API) video to delivery quality - POST /api/v1/director/videos/upscale (the upscaler, target_height, detail), POST /api/v1/director/videos/finish (film grade, deflicker, letterbox, loudness; grain always 0), POST /api/v1/director/videos/facefix (small far faces re-rendered sharp, people=all for groups), the upscale / finish / face_fix switches on film and music requests, resolution choices, when to upscale vs render at a higher resolution on Montage Premium, and the right order with cost and time. Use whenever a video is approved and needs more resolution, a cinema look, cleaner far faces or a final loudness pass. Not for lips (references/montage/pixio-lipsync-fixing.md), content defects (pixio-video-qa.md) or on-screen text (pixio-graphics-titles.md).
---

# Pixio upscale and finish: the last mile, in the right order

Upscale, face fix and finish are post steps. They run after the content is right. Each one makes a NEW job and
leaves the source as it was. Get the order right and you never upscale or grade a stretch you later throw away.

## House rules

- **Test cheaply on Basic.** Every test, draft or trial render sends `video_model: "montage-basic"` (it is also what
  renders when `video_model` is left out). Basic is billed in Pixio credits like everything else, just less.
  Premium or Ultra only when the user asks for it and has seen the `?check=true` quote (`credits.quoted`).
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE`
  (`https://beta.pixio.myapps.ai`) and `$PIXIO_API_KEY`.
- `grain` is 0 by default on `/api/v1/director/videos/finish` and in the `finish` object of film / music requests:
  send `"grain": 0` explicitly anyway, and never raise it.
- Every post step is billed in credits (prices in `GET /api/v1/director/catalog`). Upscale, finish and face fix
  have no free quote (`?dry_run` answers `400 preflight_unavailable`): work the price out from the catalog and tell
  the human before a long video. A `402 insufficient_credits` means nothing started.
- Face fix compares faces against the supplied pictures, so keep them on the job.

## 1. The order

1. Content fixes: redo, Montage Edit, cuts (`references/montage/pixio-video-qa.md`, `pixio-video-editing.md`).
2. Lips: lip fix / lip fix auto / relip (`references/montage/pixio-lipsync-fixing.md`). Lip fix refuses sources
   over 1920x1088, so it must come before a 1080p upscale.
3. Far faces: `POST /api/v1/director/videos/facefix`. It only takes music video and film jobs (it rebuilds
   sections), so it must come before upscale, whose result is an `upscale` job.
4. Upscale: `POST /api/v1/director/videos/upscale`.
5. Finish: `POST /api/v1/director/videos/finish` with the upscale job's id (or the render's, when you skip upscale).
6. Graphics, captions, packaging last (`references/montage/pixio-graphics-titles.md`), so the grade never shifts
   brand colours.

## 2. Resolution: what each render gives

| Render | Size (16:9) | Notes |
|---|---|---|
| Basic text / image, full quality, 5-15 s | 1344x768 | the largest Basic gives |
| Basic `quality: "fast"` | 1152x640 | |
| Basic `speed: "draft"` | 960x544 | for trying prompts and seeds |
| Basic reference mode, films and music videos | 1152x640 (about 0.7 MP, always) | higher pasted the reference's background into the shot |
| Premium / Ultra `resolution` | `480p` or `720p` | 720p costs about twice as much |

9:16 and 1:1 are the same pixel counts turned (640x1152, 832x832, ...). Nothing near 1080p is rendered on Basic,
so there is no "render at 1080p" on Basic. That is what upscale is for.

### Upscale or render higher?

- **Basic:** always render at the native size and upscale. For a single text / image clip, full quality
  (1344x768) gives the upscaler more to work with than fast. Reference renders are fixed at about 0.7 MP.
- **Premium:** 720p is about twice the price of 480p. Choose 720p at render time when faces are small in frame or
  there is fine texture (crowds, fabric, text-like detail) the upscaler would have to invent. Otherwise 480p plus
  an upscale is the cheaper path. Show the human both `?check=true` quotes if unsure; never test on Premium. Model
  and price choices: `references/montage/pixio-tier-choice.md`, `pixio-cost-control.md`.
- Smeared far faces are not a resolution problem. Upscaling a smear gives a sharp smear. Face fix them first.
- The cheapest 1080p look at a clip: `speed: "draft"`, then an upscale.

## 3. POST /api/v1/director/videos/upscale

JSON `{"job_id": ...}` of a finished video job (not a picture, not already an upscale), or a multipart `video`
(an uploaded clip up to 15 s). Audio and frame rate are kept. Priced per started 15 s of video (`upscaleMostDetail`
in the catalog).

| Field | Values | Default | Notes |
|---|---|---|---|
| `target_height` | pixels, e.g. `1080` | 1080 | the SHORT side of the result. 1152x640 -> about 1945x1080; portrait 640x1152 -> about 1080x1944. Refused if the video is already that size |
| `detail` | 0-1 | 0.6 | how much added detail is kept. 0.6 looks natural on faces; 1.0 is sharper but can look plastic on skin and halo hair; 0.4 is softer |
| `method`, `blend` | | | leave unset (advanced tuning; the price is the same) |

```bash
# standard 1080p upscale of a finished job
curl -X POST "$BASE/api/v1/director/videos/upscale" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" -d '{"job_id": "JOB_ID", "target_height": 1080}'
# a softer, more natural result on close-up faces
curl -X POST "$BASE/api/v1/director/videos/upscale" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" -d '{"job_id": "JOB_ID", "target_height": 1080, "detail": 0.45}'
```

Poll `GET /api/v1/director/jobs/{id}`; `stage`, `progress` and `etaSeconds` show how far it is. Long videos take
longer; the `queue` object shows the estimated completion while it waits or renders.

## 4. POST /api/v1/director/videos/finish (cinema finishing)

A film-curve grade (soft highlight roll-off, lifted blacks, slightly less saturation), cut-aware deflicker, an
optional 2.39:1 letterbox, and the audio normalised to a loudness target. Frame count, size and fps stay the same.
Input: a `job_id` or a multipart `video` up to 7 min. Priced by the seconds of video it writes, with a minimum
(the catalog has the rate).

| Field | Values | Default | Use |
|---|---|---|---|
| `grade` | `neutral`, `warm`, `teal` | `warm` | teal = cool shadows, warm skin (thrillers, sci-fi); neutral for products and brand colours |
| `scope` | true / false | false | 2.39:1 bars inside the frame. Not for 9:16 social, and never where captions or graphics will sit |
| `grain` | 0-8 | 0 | **always 0** |
| `lufs` | e.g. -24 to -12 | -14 | -14 streaming / social, -23 broadcast |
| `deflicker` | true / false | true | leave on; turn off only if a strobe or lightning effect is meant to flicker |
| `saturation` | 0.7-1.1 | 0.92 | 1.0 = unchanged. AI video is usually a little oversaturated; 0.85-0.9 for a filmic look, 1.0 for bright brand work |

The field is `grade`, not `look` (`look` is the named look on text and image shots; see
`references/montage/pixio-looks-styles.md`).

```bash
curl -X POST "$BASE/api/v1/director/videos/finish" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"job_id": "JOB_ID", "grade": "teal", "grain": 0, "saturation": 0.9, "lufs": -14}'
```

Good vs bad:
- Good: `{"job_id": "...", "grade": "neutral", "grain": 0, "saturation": 1.0}` for a product ad whose red must
  stay the brand red.
- Bad: `{"job_id": "...", "grain": 4, "scope": true}` on a 9:16 social clip: grain is never used, and bars eat a
  vertical frame already crowded by platform buttons.

## 5. POST /api/v1/director/videos/facefix (small, far faces)

Basic renders reference clips at about 0.7 MP, so a face that fills little of the frame (wide, full-body, overhead,
someone far down a corridor) comes out smeared. Face fix tracks the face in each chosen section, crops it so it is
big, re-renders that crop using the section's own prompt, reference pictures and sound (so lips still follow),
then colour-matches and feathers it back. Big faces are only lightly touched. The tracker restarts at every hard
cut.

- Only for finished music video and film jobs (`job_id`). The result is a new job of the same kind: other sections
  reused, the video rebuilt with the song and finish, like a redo.
- `sections`: 1-based section (music) or clip (film) numbers. Without it, the sections whose prompts the far-face
  check flags; if none are flagged, you are asked to name them.
- `strength`: 0.3 gentle clean-up, about 0.45 default, 0.6+ re-draws the face (may drift from the original look).
- `feather`: the seam softness in pixels (24 = a softer seam).
- `people`: `largest` (default, one pass on the largest face) or `all` (group shots: one pass per person the
  section's prompt names, each matched to their own picture; about one section render per person, so slower and
  priced by the passes).
- `seed`.
- Billing: `faceFix` credits per section, charged only for sections it visibly changed. The done job's
  `faceFixReport` gives, per section, the likeness before and after and whether the change is `visible`.

```bash
curl -X POST "$BASE/api/v1/director/videos/facefix" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" -d '{"job_id": "JOB_ID", "sections": [3, 7], "people": "all", "feather": 24}'
```

Automatic: `face_fix: "auto"` on film / music requests checks every section's faces against the reference pictures
when the video is done and starts a face fix of the drifted sections as a new job (`faceFixJobId` on the video).
Sections whose drifted shots all show two or more people are skipped and not billed. Prevention is better: keep
visible faces chest-up or closer, show far people from behind or as silhouettes
(`references/montage/montage-basic-prompting.md`).

## 6. Doing it at render time

Film (`/api/v1/director/videos/film`), music (`/api/v1/director/videos/music`) and remake requests take, as form
fields:
- `upscale` (bool, default false): upscale to about 1080p when rendered, priced like `videos/upscale`. Leave
  `upscale_method` unset.
- `finish` (film and music): a JSON object as for `/api/v1/director/videos/finish`, e.g.
  `{"grade": "teal", "grain": 0}`, priced like `videos/finish`.
- `face_fix` (`auto`), as above.

These are included in the request's `?check=true` quote. Use them for a hands-off final. Do the steps by hand instead
when you expect to fix content or lips first: an upscaled build cannot be lip fixed, and a redo means paying the
upscale again. A draft film or music video can also be finished later with `.../{id}/final`, which takes `upscale`.

## 7. Cost and time summary

| Step | Price (from `GET /api/v1/director/catalog`) | Time |
|---|---|---|
| upscale | per started 15 s of video | about a minute or two per 15 s; long videos longer |
| finish | per second written, with a minimum | about 3 min per 15 s at 1080p |
| facefix | `faceFix` per visibly changed section (times the passes with `people: "all"`) | about 3 min per 15 s section, per person |

## Checklist

- [ ] Content and lips are final before any of this (lip fix needs 1920x1088 or smaller).
- [ ] Far faces checked; `facefix` run on the music / film job BEFORE upscaling.
- [ ] Upscale `detail` chosen (0.6 natural faces; higher only for texture-heavy shots).
- [ ] Price worked out from the catalog for long videos; the human told.
- [ ] Finish with `grain: 0`, a `grade` that fits, `lufs` for the platform, no letterbox on vertical video.
- [ ] Graphics and captions after finishing.
- [ ] Delivered the newest job id, its `output.url` (signed, 6 hours) or `assetPath`, and the `credits.charged`.
