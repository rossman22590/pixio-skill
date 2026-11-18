---
name: pixio-video-editing
description: How to edit finished videos on Montage (Pixio's Director API) without rendering them again - trim and crop or reshape (9:16, 1:1) with POST /api/v1/director/videos/edit/crop, cut by shots with GET /api/v1/director/jobs/{id}/shots and POST /api/v1/director/jobs/{id}/edit, join clips from any jobs and uploads with music beds and voiceovers (audio_tracks), speed ramps and transitions with POST /api/v1/director/videos/assemble, swap one shot of a film (assemble `replace`), change what is in the picture with Montage Edit (POST /api/v1/director/videos/edit) or make a short new clip from pictures with Montage Create (POST /api/v1/director/videos/edit/create), and hand over the finished file. Use whenever a video already exists and the user wants it shorter, reshaped, re-ordered, joined, re-scored, partly changed or delivered. Not for wording Montage Edit instructions (that is references/montage/montage-edit-prompting.md), lips (references/montage/pixio-lipsync-fixing.md), upscale or grade (references/montage/pixio-upscale-finish.md), or captions and titles (references/montage/pixio-graphics-titles.md).
---

# Editing finished videos

Most edits are fast and cheap: crop, cut-by-shots and assemble work on the finished file in seconds and are priced
by the seconds they write, like finishing. Only Montage Edit and Montage Create make new pixels with a model, and
they cost more. Never re-render a whole film to change its length, order, shape or music.

## House rules

- **Test on Basic.** Video tests, drafts and trial renders run on Montage Basic (leave `video_model` out). Montage
  Premium or Ultra only when the user asks for it and has seen the `?check=true` quote.
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.

## Decision rules (read first)

| The user wants | Endpoint | Cost |
|---|---|---|
| A shorter piece, or one stretch cut out as its own video | `POST /api/v1/director/videos/edit/crop` with `start_s` / `end_s` | like finishing, on the seconds kept (`finishPerSecond`, at least `finishMinimum`) |
| A new shape (9:16 for Reels / TikTok, 1:1, 4:5) | `POST /api/v1/director/videos/edit/crop` with `aspect_ratio` (+ `focus_x` / `focus_y`) | same |
| Drop, re-order or tighten shots of one video | `GET /api/v1/director/jobs/{id}/shots` (free), then `POST /api/v1/director/jobs/{id}/edit` | like packaging on the edited length; `?dry_run=true` quotes it free |
| Join clips from several jobs and/or uploads, add music or a voiceover, speed changes, transitions | `POST /api/v1/director/videos/assemble` | like finishing, on the length made |
| Swap one bad shot of a film for a new clip, keeping the soundtrack | `POST /api/v1/director/videos/assemble` with `replace` | same, plus the new clip's own render |
| Change something IN the picture (colour, weather, an object, a costume) in a 1-15 s stretch | `POST /api/v1/director/videos/edit` (Montage Edit) | priced from the studio's quote of the exact request, at least 16 credits |
| A short new clip (3-15 s) with sound from 1-6 pictures | `POST /api/v1/director/videos/edit/create` (Montage Create) | priced from the studio's quote, at least 16 credits |
| Several frame shapes and shorter cuts of one video at once | `POST /api/v1/director/videos/package` with `formats` / `cutdowns` | like packaging; `?dry_run=true` quotes it free |

Exact rates: `GET /api/v1/director/catalog` -> `prices`.

Working rules:
- Every edit makes a NEW job; the source job is never changed. Give the user the newest good job id.
- Order of work: fix content first (redo, Montage Edit, lips, faces), then trim / shots / assemble, then upscale,
  then finish or filters last. Do not upscale or grade footage you will cut.
- Only `jobs/{id}/edit` and `videos/package` have a free quote (`?dry_run=true`). Crop, assemble, Montage Edit and
  Montage Create answer `400 preflight_unavailable` to it: price them from the catalog (and the minimum), tell the
  human, and ask before the Montage Edit / Create calls.
- Never resubmit after a timeout: poll the job id from the `202`, or find the job in `GET /api/v1/director/jobs`.
- Music videos keep the customer's own song. When you re-cut one, keep its sound (`audio: "keep"`, or `sound:
  "original"` in `replace`) instead of laying a different track over it.

All of these endpoints take JSON with `job_id` (a finished Director job id from this API), or multipart with an
uploaded file, a URL (`video_url`) or a path from your Pixio assets. A job used by `job_id` must be `done`
(`409 conflict` otherwise). Montage Premium music videos: `source: "song"` uses the version over your original song,
`auto` uses it when there is one, `video` (default) uses the delivered video.

## 1. Trim, crop, reshape: `POST /api/v1/director/videos/edit/crop`

Frame-exact, done in seconds. Send at least one change.

| field | what |
|---|---|
| `job_id` or `video` | the source (one or the other) |
| `source` | `video` (default), `song`, `auto` (with `job_id` only) |
| `start_s`, `end_s` | keep this window (at least 0.25 s); default start / end |
| `x`, `y`, `width`, `height` | a crop box in source pixels; all four together |
| `aspect_ratio` | or a shape: `9:16`, `1:1`, `4:5`, `16:9`, `2.39:1` ... the largest such rectangle |
| `focus_x`, `focus_y` | 0-1, where the shape is centred (default 0.5 / 0.5) |
| `max_side` | scale so the longer side is this many px (16-4096) |
| `audio` | `keep` (default) or `mute` |
| `audio_fade_s` | 0-5, default 0.01 (stops a click at the cut; 0 = hard cut) |

A box and `aspect_ratio` together are refused. For a vertical cut of a 16:9 video where the person stands left of
centre, set `focus_x` around 0.3. Look at a frame first (`GET /api/v1/director/jobs/{id}/shots/{n}`, free).

```bash
# 9:16 version of 10-25 s, framed a little left, scaled to 1920 px tall
curl -fsS -X POST "$BASE/api/v1/director/videos/edit/crop" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"job_id": "JOB_ID", "start_s": 10, "end_s": 25, "aspect_ratio": "9:16", "focus_x": 0.35, "max_side": 1920}'
```

## 2. Cut by shots: `GET /api/v1/director/jobs/{id}/shots` + `POST /api/v1/director/jobs/{id}/edit`

`GET /api/v1/director/jobs/{id}/shots` (free) finds every hard cut of a finished video and returns
`{ object: "list", jobId, fps, data: [{ shot, startSeconds, endSeconds, seconds, thumbnailUrl }] }`; each
thumbnail (a mid-shot frame, JPEG) is at `GET /api/v1/director/jobs/{id}/shots/{n}`, 1-based. `409 conflict` until
the job is done. Look at the thumbnails, then send the shots to keep, in play order. A shot left out is dropped; a
shot can be used more than once. Each can be trimmed at either end. The sound is crossfaded at each join.

```bash
curl -fsS -X POST "$BASE/api/v1/director/jobs/JOB_ID/edit?dry_run=true" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"shots": [1, 2, {"shot": 4, "trim_start": 0.3, "trim_end": 0.5}, 3]}'
```

Drop `?dry_run=true` to start it. The result is a new job, priced like packaging on the edited length, so any
packaging field can ride along in the same body (`captions`, `filter`, `look_id`, `score`, end card, `formats`,
`cutdowns`, `subtitle_language`, `dub_language`...). See `references/montage/pixio-graphics-titles.md` and
`references/montage/pixio-localization.md` for those.

Use this for "drop the boring shot", "start on the explosion", "make it 10 s shorter by cutting shots". For a cut
inside one shot, use crop or assemble with `start_s` / `end_s`.

## 3. Join anything: `POST /api/v1/director/videos/assemble`

One video from clips of your finished jobs (by `job_id`) and uploads (multipart `videos`, up to 20, referenced by
`upload` number), with audio tracks over it (multipart `audio`, up to 8, or a job's sound). Mixed sizes and frame
rates are conformed.

Clip fields (`clips`, in play order):

| field | values | default |
|---|---|---|
| `job_id` or `upload` | `upload` = which multipart `videos` file (1 = first) | |
| `source` | `video`, `song`, `auto` | `video` |
| `start_s`, `end_s` | trim in the source | whole clip |
| `speed` or `ramp` | 0.25-4 (sound time-stretched, pitch kept); `ramp: {"from": 1, "to": 0.3}` | 1 |
| `transition_in` | `cut`, `crossfade`, `dip_to_black`, `dip_to_white`, `wipe_left`, `wipe_right` | `cut` |
| `transition_s` | 0.04-5 | 0.5 |
| `audio` | `keep`, `mute`, `duck` (dips under the audio tracks) | `keep` |
| `volume_db` (-60 to 24), `duck_db` (-60 to 0) | | 0 / -12 |

A dip on the first clip fades in from that colour. Crossfades and wipes overlap the two clips by `transition_s`.

Audio track fields (`audio_tracks`): `job_id` (a song job or a video job's sound) or `upload` (a multipart `audio`
file), `source`, `start_s`, `end_s`, `offset_s` (where on the timeline it starts), `volume_db`,
`duck_under_clips_db` (dip under clips whose `audio` is `keep`, e.g. -12), `fade_in_s`, `fade_out_s` (0-60).

Output fields: `width` + `height`, or `aspect_ratio` (default: the first clip's size), `fit` (`crop` default,
`letterbox`, `blur_fill`) for clips of another shape, `fps`, `fps_resample` (`pick` default or `blend`),
`loudness_lufs` (-40 to -5, e.g. -14 for social).

```bash
# a 3-clip trailer from two films and an upload, the customer's song under everything, ducked under the dialogue clip
curl -fsS -X POST "$BASE/api/v1/director/videos/assemble" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "videos=@logo_sting.mp4" -F "audio=@customer_song.mp3" \
  -F 'clips=[{"upload": 1, "transition_in": "dip_to_black"},
             {"job_id": "FILM_A", "start_s": 12, "end_s": 18, "transition_in": "crossfade", "audio": "duck"},
             {"job_id": "FILM_B", "start_s": 40, "end_s": 44, "ramp": {"from": 1, "to": 0.4}, "transition_in": "dip_to_white"}]' \
  -F 'audio_tracks=[{"upload": 1, "volume_db": -6, "fade_in_s": 1, "fade_out_s": 2}]' \
  -F loudness_lufs=-14
```

In multipart, `clips`, `audio_tracks` and `replace` are JSON text. In JSON, send them as normal lists / objects.
Every `job_id` inside them must be one of your own finished Director jobs.

### Swap one shot of a finished film: `replace`

```json
{"replace": {"job_id": "FILM_ID", "shot": 7, "sound": "original", "transition_out": "cut"},
 "clips": [{"job_id": "NEW_CLIP_JOB", "start_s": 0.5}]}
```

`shot` numbers come from `GET /api/v1/director/jobs/{id}/shots`. `sound: "original"` (default) keeps the film's
soundtrack and fits the new clip(s) to exactly the old shot's time (too short is refused, so render the new clip a
bit longer than the shot). `sound: "clips"` keeps each new clip's own sound and the length may change. Make the new
clip on Montage Basic first, check it, then replace. For a whole bad film clip,
`POST /api/v1/director/videos/film/{id}/redo` is usually simpler (`references/montage/pixio-film.md`).

## 4. Change what is in the picture: Montage Edit

`POST /api/v1/director/videos/edit` changes one thing you can say in a short sentence: colour, weather, light,
style, add / remove / replace an object, a costume. The whole video (up to 15 s), or a 1-15 s window (`start_s` /
`end_s`) of a longer one, spliced back with soft seams. It cannot fix bodies, faces, clones or lips (redo, face fix
or lip fix instead; `references/montage/pixio-video-qa.md`).

Key fields: `job_id` or `video`, `prompt` (up to 2,000 characters; keep it to one sentence), `start_s`, `end_s`,
`images` (up to 6 reference pictures), `job_pictures`, `audio` (`original` default, `model` for new sound such as
thunder), `resolution` (`auto` default, up to 4k), `single_shot`, `negatives` (up to 500 characters), `seed`,
`variant` (`full` or `window`), `keep_rest`, `blend_s`, `pad_s`, `stretch_s` (how much context is sent around the
window, default 15 s; 0 = just the window plus `pad_s`; shorter costs less).

**Write the instruction with `references/montage/montage-edit-prompting.md`.** There is no free quote for Montage
Edit: work the price out with the human from the catalog (it is quoted per request, at least 16 credits, and grows
with the seconds sent, so keep `stretch_s` small when the change is local) before the call.

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/edit" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"job_id": "JOB_ID", "prompt": "Make her jacket dark green.", "start_s": 40, "end_s": 46, "single_shot": true, "stretch_s": 0}'
```

Montage Create, `POST /api/v1/director/videos/edit/create`: 1-6 `images` (required), a `prompt` naming each
picture's role in words (no `<Picture N>` tags, up to 2,000 characters), `duration_s` 3-15, `aspect_ratio` `16:9`
or `9:16`, `resolution`, `seed`, `single_shot`, `negatives`. It makes its own sound. Use it for a quick insert
shot; for story clips Montage Basic (`videos/reference`) is cheaper and better wired to references
(`references/montage/pixio-tier-choice.md`).

## 5. Hand over the result

When a job is `done`:
- `output.url` is a signed URL valid 6 hours: give it for a quick look.
- `output.assetPath` is the durable copy in the user's Pixio assets.
- `GET /api/v1/director/jobs/{id}/video` redirects (302) to the finished file; it needs the API key, so use it in
  your own downloads, never in a link you hand to someone.
- Packaging and shot edits also list their other shapes and cutdowns in `deliverables[]`, each with its own `url`
  and `assetPath`.

Reading the job again (`GET /api/v1/director/jobs/{id}`) gives a fresh signed URL. Never hand over a URL with the
API key in it.

## Recipes

- **Cutdowns for social:** crop the 16:9 master to 9:16 (`aspect_ratio`, `focus_x`) and to 1:1, trim each to the
  hook (first 3 s matter most; `references/montage/pixio-hooks-openings.md`), then caption with a package field. For
  many formats at once, `package` `formats` / `cutdowns` may be simpler (`references/montage/pixio-social-formats.md`).
- **Supercut:** read `GET /api/v1/director/jobs/{id}/shots` of several jobs, then one assemble with `start_s` /
  `end_s` per clip, `crossfade` 0.3 s, and the customer's song as an audio track.
- **Slow-motion hit:** split the clip at the hit into two assemble clips; the second gets `ramp: {"from": 1,
  "to": 0.3}`.
- **Voiceover on a finished ad:** assemble with one clip (`audio: "duck"`) and the voiceover file as an audio track
  with `offset_s`; or packaging's `voiceover` / `voiceover_text` (`references/montage/pixio-ads.md`).

## Checklist

- [ ] Cheapest endpoint chosen that can do the job; Montage Edit / Create only for in-picture changes, after the
      human's OK to the price.
- [ ] Content fixed before cutting; cutting before upscale; finish / filters last; grain 0.
- [ ] Shots read from `GET /api/v1/director/jobs/{id}/shots` thumbnails, not guessed.
- [ ] No resubmit on a timeout; result watched before handing over.
- [ ] Music videos keep the customer's song; no lyrics pasted into logs or public places.
- [ ] User gets the newest job id plus `output.url` / `output.assetPath`; no API key in any link or message.
