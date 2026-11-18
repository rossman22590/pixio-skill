---
name: pixio-social-formats
description: How to deliver Montage (Pixio's Director API) videos for TikTok, Instagram Reels, YouTube Shorts, YouTube and feeds - which shape to render natively and which to derive, lengths, platform safe areas (the exact fractions /api/v1/director/videos/graphics uses), cutdowns and extra shapes with POST /api/v1/director/videos/package (formats, reframe, cutdowns), trimming and cropping (POST /api/v1/director/videos/edit/crop, shot edits), captions that read with the sound off, seamless loops, and loudness. Use whenever you plan or package one video for one or more social platforms or need several shapes or lengths from one master. Not for writing the ad itself (that is pixio-ads) or caption lyrics on music videos (pixio-lyric-captions).
---

# Social formats: one master, every platform

Shoot once, deliver many. The rule is: **render the shape that matters most natively, compose it so the other
shapes can be cut from it, and let packaging make the rest** (shapes, lengths, captions, end card).

Base URL `$BASE` (`https://beta.pixio.myapps.ai`), key in `Authorization: Bearer $PIXIO_API_KEY`. Every render and
packaging call is billed in Pixio credits; poll `GET /api/v1/director/jobs/{id}` until `done`.

## House rules

- **Test on Basic.** Every test, draft or trial render uses `video_model: "montage-basic"` (also the default when
  `video_model` is left out). Premium or Ultra only when the user asks for it and has seen the quote
  (`?check=true`, `credits.quoted`).
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.

Captions and text are drawn by packaging or graphics, never by the video model, and never cover a face. Share
finished videos with the job's signed `output.url` (valid 6 hours; `GET /api/v1/director/jobs/{id}/video` gives a
fresh one) or the durable `output.assetPath` in your Pixio assets. Writing the ad itself (hook, UGC, variants) is in
`references/montage/pixio-ads.md`.

## 1. Decision rules

| Main destination | Render natively | Derive with `package.formats` |
|---|---|---|
| TikTok, Reels, Shorts | `aspect=9:16` (Basic renders about 640x1152) | `1:1`, `4:5` for feeds; `16:9` only if needed (`reframe: "fit"`) |
| YouTube, website, TV | `aspect=16:9` (1152x640) | `9:16` Shorts cut (`reframe: "crop"` follows faces) |
| Instagram / Facebook feed | `aspect=1:1` (832x832) or 9:16 | `4:5` from 9:16 or 1:1 |
| Everything equally | `9:16` if people talk to camera; `16:9` if it is wide, scenic or many people | the others |

Why native matters: a 9:16 render frames faces and products for the tall frame; a 9:16 crop of a 16:9 render keeps
only a middle slice (about a third of the width) and loses anything off-centre. If you know you'll crop, write the
prompt so the subject stays in the centre third of the frame.

Resolution: extra shapes are 1080-class only from a 1080p source, otherwise 720-class. For crisp
1080 deliverables, `POST /api/v1/director/videos/upscale` the master first (or `upscale=true` on a film), then package.

## 2. Length per platform (guidance, not API limits)

| Use | Good length | Hook by |
|---|---|---|
| TikTok / Reels / Shorts ad | 9-15 s (a 6 s cutdown for bumper slots) | 1.5 s |
| TikTok / Reels organic story | 15-45 s | 1.5 s |
| YouTube pre-roll | 15 s and 6 s | 2 s |
| YouTube video / site hero | 30-90 s | 3-5 s |
| Feed (1:1, 4:5) | 6-15 s | 1.5 s, works muted |

Render the longest version you need and get the shorter ones as `cutdowns`. Single clips are 5-15 s; films are a
multiple of 15 from 30 to 420 s.

## 3. Safe areas: where the app's buttons sit

On 9:16 the platform draws its own name, caption, buttons and progress bar over the video. `/api/v1/director/videos/graphics`
keeps elements clear of these fractions of the frame (left, top, right, bottom):

| `safe_area` | left | top | right | bottom |
|---|---|---|---|---|
| `tiktok` | 0.04 | 0.09 | 0.14 | 0.22 |
| `reels` | 0.04 | 0.12 | 0.12 | 0.20 |
| `shorts` | 0.04 | 0.08 | 0.12 | 0.19 |
| `all` (default on 9:16) | 0.04 | 0.12 | 0.14 | 0.22 |
| `none` (default on other shapes) | 0 | 0 | 0 | 0 |

Or send your own `{"left": .., "top": .., "right": .., "bottom": ..}` (0-0.45 each). Use the same numbers when you
write the prompt: faces and product in the middle band, nothing important in the bottom fifth or the right
seventh. Package captions on 9:16 already sit above the phone UI.

## 4. Shapes and lengths with POST /api/v1/director/videos/package

```json
{"job_id": "MASTER_JOB", "brand_id": "BRAND_ID",
 "formats": ["9:16", "1:1", "4:5"], "reframe": "crop",
 "cutdowns": [15, 6], "end_card_s": 2,
 "captions": "auto", "caption_style": "pop", "caption_words": 3, "caption_position": "center",
 "lufs": -14}
```
- `formats`: any of `16:9`, `9:16`, `1:1`, `4:5`, each at most once.
- `reframe`: `crop` follows the faces shot by shot and resets at every hard cut; `fit` shows the whole frame over
  a blurred copy (use it for wide shots, text-like layouts, or 9:16 -> 16:9).
- `cutdowns`: up to 3 different lengths of 5-120 s. Each keeps the **opening** plus the end card, in every shape:
  so the hook must be in the first seconds of the master, or the cutdown loses it.
- `end_card_s` 0-8: lies over the last seconds; the length never changes.
- The result: `output.url` is the master in its own shape and length; `deliverables` lists every extra file, each
  with `name`, `aspect`, `cutdownSeconds`, `width`, `height`, `durationSeconds`, its own signed `url` and `assetPath`.
- Price: by the seconds of video written (the master, each extra shape, and each cutdown in every shape), with a
  minimum; captions, fine print, the packshot and a typed voiceover do not change it. `?dry_run=true` is a free quote.
- On a single clip (`/api/v1/director/videos/text`, `/image`, `/reference`) or a film, send the same object as `package` and
  packaging starts by itself when the render is done (`packageJobId`, a `videos/package` job to poll for the
  packaged video and `deliverables`).

## 5. Precise trims and crops

- **Shot list:** `GET /api/v1/director/jobs/{id}/shots` (free) gives each hard-cut shot with start, end and a
  thumbnail.
- **Re-cut by shots:** `POST /api/v1/director/jobs/{id}/edit` with `{"shots": [1, 3, {"shot": 4, "trim_start": 0.3}]}` keeps
  those shots in that order (sound crossfaded at each join); any package field can ride along (priced like packaging on the edited
  length; `?dry_run=true` is a free quote). Use it to make a tighter 9-shot cut, drop a weak shot, or move the best moment to the front as the hook.
- **Trim or crop to a box or a shape:** `POST /api/v1/director/videos/edit/crop` with `start_s` / `end_s`, and either `x`,
  `y`, `width`, `height` (source pixels) or `aspect_ratio` (`9:16`, `1:1`, `4:5`, `2.39:1`...) around `focus_x` /
  `focus_y` (0-1). Use it when the subject sits off-centre and the face-following crop picks the wrong person.
  Frame-exact; priced like `videos/finish` on the seconds kept (at least 16 credits).
- **Join takes:** `POST /api/v1/director/videos/assemble` (clips from jobs or uploads, trims, `speed`, `transition_in`,
  `aspect_ratio`, `fit` `crop` / `letterbox` / `blur_fill`, `audio_tracks`; priced like `videos/finish` on the length
  made).

## 6. Captions that read with the sound off

- `captions: "auto"` transcribes the voiceover (or the video's own speech) and draws real pixels.
- Vertical viral look: `caption_style: "pop"`, `caption_words` 2-3, `caption_position: "center"`,
  `caption_uppercase: true`, a bold font (`caption_font` "Segoe UI Black" or "brand"), `caption_stroke_width`
  around 10-12, `caption_highlight_color` for the spoken word.
- Calm or 16:9: `caption_style: "subtitle"` at the bottom, sentence case.
- Translated: `subtitle_language` (any language name) translates the captions line by line, keeping the times.
- Word-by-word captions plus hooks, badges and buttons that dodge faces and platform UI: `/api/v1/director/videos/graphics`
  with `captions: true`, `safe_area`, `avoid_faces` (default true; leave it on). Captions from package **or**
  graphics, never both on the same video.
- Hook text on 9:16: a graphics `text` element at 0.2-2.4 s, `y` around 0.3 (inside the safe band), 3-6 words.

## 7. Seamless loops

A loop replays without a visible seam, which raises watch time on short-form feeds.
1. **Plan it in the prompt:** the last shot repeats the first shot's framing, subject position and motion
   direction (Basic: the same camera move in [Shot 1] and the last shot; Premium: "the take ends on the same framing
   as Shot 1").
2. **No end card on the loop cut** (`end_card_s: 0`); keep the branded card on the paid-ad master instead.
3. **Cut on the match:** find the frame where the last shot best matches the opening (`GET /api/v1/director/jobs/{id}/shots`),
   then trim there with `/api/v1/director/videos/edit/crop` (`end_s`).
4. Sound: avoid a music bed that ends on a final chord; either the video's own ambience or a bed that is still
   mid-phrase at the cut. Skip fade-outs at the end of a loop cut.
5. A narration loop: the last spoken line leads into the first ("...and that's why I always start with this.").

## 8. Sound levels

- `lufs: -14` (default) for social and streaming; `-23` for broadcast. Peaks stay under -1 dBFS.
- The customer's own music first (`music` file on package); a generated bed only when none was given.
- A voiceover (`voiceover_text` + `voiceover_voice`, or an uploaded `voiceover`) dips the music by `duck_db`.

## 9. A full multi-platform delivery, step by step

```bash
# 1) quote the master, 9:16, on Basic (free); after a yes send it again without ?check=true
curl -X POST "$BASE/api/v1/director/videos/film?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-basic -F aspect=9:16 -F duration=30 \
  -F film_type=commercial -F brand_id=BRAND_ID -F "images=@product.png" -F "images=@model.png" \
  -F "idea=..." -F 'product_pictures=[1]'
# 2) after approval: package all shapes and lengths from the finished job
curl -X POST "$BASE/api/v1/director/videos/package" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"job_id": "JOB_ID", "brand_id": "BRAND_ID", "formats": ["16:9", "1:1", "4:5"], "reframe": "crop", "cutdowns": [15, 6], "captions": "auto", "caption_style": "pop"}'
```
Then check each deliverable by eye: faces not cut off in `1:1` and `4:5`, captions out of the UI zones, the
hook present in the 6 s cutdown, the end card readable at phone size.

## Checklist

- Native render in the main platform's shape; subject centred enough for the other crops.
- Lengths from `cutdowns` (hook in the opening); shapes from `formats` with the right `reframe`.
- 9:16: safe area respected in the prompt and in graphics; captions on, readable muted.
- Upscale before packaging if 1080-class deliverables are required.
- Loop cuts have no end card and cut on a matched frame.
- `lufs` set for the destination; customer's music first.
- Basic test approved; the quote (`credits.quoted`) shown before every render and packaging; no grain.
