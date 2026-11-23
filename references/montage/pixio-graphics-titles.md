---
name: pixio-graphics-titles
description: How to put real on-screen graphics over a finished Montage (Pixio's Director API) video - POST /api/v1/director/videos/graphics and POST /api/v1/director/videos/graphics/plan in depth - every element type (text hooks and titles, image and picture cards, price badges, arrows, checklists, call-to-action buttons, end cards; lower thirds built from text), positions, anchors, animations, brand colours and fonts, timing to the beat or the speech, safe_area for TikTok / Reels / Shorts, never covering faces, readable durations, and auto planning from a brief. Use whenever a video needs titles, a hook line, prices, arrows, a CTA or an end card, or you are tempted to ask the video model to draw text. Not for lyric caption styling in depth (that is pixio-lyric-captions), brand setup (pixio-brands) or the grade (pixio-upscale-finish).
---

# Pixio graphics and titles: real text, drawn after the render

Video models garble text. Never ask Montage Basic, Premium or Ultra to draw a headline, a price, a URL or a logo.
Render the picture clean, then burn real graphics over it with `/api/v1/director/videos/graphics`. It works on any
tier's finished video, and it never covers a face.

## House rules

- **Test on Montage Basic.** Every test, draft or trial render runs on `video_model: "montage-basic"` (also what you
  get when `video_model` is left out). Montage Premium or Ultra only when the user asks for it and has seen the quote
  (`?check=true`, `credits.quoted`). Every call is billed in Pixio credits.
- **The customer's own song first.** A music video uses the song the user gave you (`song`). `POST /api/v1/director/music/generate`
  is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `videos/finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE`
  (`https://beta.pixio.myapps.ai`) and `$PIXIO_API_KEY`.
- Graphics go LAST: after lips, face fix, upscale and finish (`references/montage/pixio-upscale-finish.md`), so the
  grade never shifts your brand colours and you never redraw over a stretch you later replace.
- Only facts the user gave: never invent a price, an address, a claim or a product name.
- Don't add a `music_prompt` bed over a music video. Lyrics are private: never echo them in notes, logs or messages.
- Ask before spending: graphics are priced like finishing (per second of video, with a minimum); `auto` and the plan
  add a writer charge, and `music_prompt` adds a music bed. Current prices are in `GET /api/v1/director/catalog`.
  There is no free quote on these two endpoints (`?check=true` / `?dry_run=true` answer `400 preflight_unavailable`).

## 1. Two routes

| Route | What it does | Cost |
|---|---|---|
| `POST /api/v1/director/videos/graphics/plan` | Listens (tempo, beats, loudness, where someone sings) and watches (shots, faces, a likely product / subject), then the writer drafts a ready list. Renders nothing | a small fixed writer price (catalog) |
| `POST /api/v1/director/videos/graphics` | Draws your `graphics` list (or `auto: true` = plan and render in one call) over the video | like finishing, per second of video; `auto` adds the plan |

Best practice: plan, read and edit the list, then render it. Use `auto: true` only for a quick first look.
Input for both: `job_id` (any finished video job of yours; `source` `video` (default), `song` or `auto` for a Montage
Premium music video's original-song version) or a multipart `video`. Output: a normal job; when done,
`output.url` (signed, 6 hours) and `output.assetPath` have the video with the graphics burned in at the source's own
size and frame rate; the sound is copied unchanged (unless you add a music bed).

## 2. Every element

Common fields: `type`, `t` (start, required), `d` (seconds, 0.2-600), `x`, `y` (0-1 of the frame), `w` (0.02-1 of
the frame width), `anchor` (`top_left`, `top`, `top_right`, `left`, `center`, `right`, `bottom_left`, `bottom`,
`bottom_right`: which point of the element sits on x, y), `animation_in` / `animation_out` (`none`, `pop`, `fade`,
`slide_left`, `slide_right`, `slide_up`, `slide_down`, `bounce`), `animation_s` (0.05-3, default 0.4), `color` and
`background` (`#RRGGBB`; background also `none`), `font` (`brand` or a name such as `segoe ui black`, `arial black`,
`impact`, `bahnschrift`, `georgia bold`), `size` (text height, 1-25 % of the frame's short side). Colours and font
default to the brand's (`brand_id`). Emoji are drawn in colour. Positions are fractions, so one list fits any shape.

| type | Specific fields | Defaults | For |
|---|---|---|---|
| `text` | `text` (required, up to 200, may have line breaks), `align` (left / center / right), `uppercase`, `effect` (`none` / `type`), `cps` (2-60) | top centre, y 0.06, w 0.9, size 7.5, 3 s, pop in | hooks, headlines, titles, lower thirds |
| `image` | `image` (`"logo"` with a brand that has one, or 1..N = the Nth `graphics_images` file), `rounded`, `shadow`, `frame`, `title` (60), `price` (20) | centre, w 0.3, 4 s | product photo, logo; with title / price = a picture card with a frame |
| `badge` | `text` (required, 40), `shape` (`burst` / `pill`), `rotate` (-45 to 45; burst default -10) | x 0.82, y 0.22, size 6, 4 s | prices, "NEW", "-30%" |
| `arrow` | `to_x`, `to_y` (required: the point it aims at), `text` label (80), `effect`, `cps` | 3 s, fade | point at the product |
| `checklist` | `items` (1-8, each up to 80), `stagger` (0.1-3 s, default 0.6), `title` (80) | top left at 0.06, 0.3, w 0.7, 5 s | selling points ticking in one by one |
| `button` | `text` (required, 40), `url` (80, drawn under it) | x 0.5, y 0.8, 4 s | the call to action |
| `end_card` | `text` (120), `cta` (40), `url` (80), `colors` (two hex, top and bottom of the gradient), `particles` (`none` / `snow` / `sparkle`), `logo` (bool, default true), `image`, `button_color` | full frame, 3 s, fade in | the closing card |

An `end_card` takes only `type`, `t`, `d`, the animations, `color`, `font`, `size` and its own fields; no `x`,
`y`, `w`, `anchor` or `background`. Limits: up to 40 elements, up to 10 `graphics_images` (PNG / JPEG / WebP, 10 MB
each, resized to 2048 px at most). An unknown field is refused with an error that lists what the type takes.

**Lower thirds:** there is no lower-third type. Build one from `text`: anchored `bottom_left`, left-aligned, a
`background`, a slide in. Name on the first line, role on the second:

```json
{"type": "text", "text": "Maya Ortiz\nHead roaster", "t": 2.0, "d": 4.0, "x": 0.05, "y": 0.86,
 "anchor": "bottom_left", "w": 0.42, "align": "left", "size": 4.5, "background": "#111111", "color": "#FFFFFF",
 "animation_in": "slide_right", "animation_out": "fade"}
```

Keep it away from the speaker's face side; face avoidance will move it anyway (section 4). (Packaging also has
`lower_thirds` name and chapter cards: `references/montage/pixio-documentary.md`.)

## 3. Timing

- `t` is seconds, or `"beat:N"` / `"downbeat:N"` (counted from 1): the start lands exactly on that beat of the
  video's sound. A beat that doesn't exist, or a video with no steady beat, is refused.
- `snap_to_beat: true` moves each numeric `t` onto the nearest beat within 0.25 s.
- A `t` at or after the end is refused; an element running past the end is shortened.
- Readability: text must stay at least 0.6 s + 0.25 s per word (plus typing time with `effect: type`, plus the
  stagger of a checklist). With `fix_layout` (default true) text too short to read stays up longer.
- To time to speech or singing, plan first and read the plan job's `result.plan.video` (what it heard and saw:
  where voices sing or speak, sections, shots), then start titles in the gaps and the CTA over the last section.
  For a deeper read, `POST /api/v1/director/understand/video` gives scenes with times and where voices are.
- Fast tempo: `pop` / `bounce`, `animation_s` 0.25-0.35. Calm: `fade` / `slide`, 0.5-0.8.

## 4. Faces, overlaps and the safe area

- `avoid_faces` (default true): faces are tracked through the video and each box padded. An element that would
  cover a face while shown moves to the nearest free spot (shrinking a little at most), else hides for those
  frames. Leave it on.
- `fix_layout` (default true): elements that overlap each other are moved apart, and short text is lengthened.
- `safe_area`: keeps elements clear of platform buttons and captions. `tiktok`, `reels`, `shorts`, `all` (the
  union) or `none`, or your own `{"left", "top", "right", "bottom"}` fractions (0-0.45). Default: `all` on tall
  video (9:16), `none` otherwise. On vertical social video, don't put a CTA in the bottom 20 % or along the right
  edge.
- An `arrow` should point at a product / subject box, never into a face.
- Watch the result (or `GET /api/v1/director/jobs/{id}/shots` thumbnails, free): if many things moved or hid, your
  layout fought the shots. Move them yourself to the calm part of each shot the plan reports.

## 5. Captions and music bed (in the same render)

- `captions: true`: word-by-word karaoke captions of the speech. `lyric_captions: true`: of the song's isolated
  vocal; send the real `lyrics` (up to 20,000 characters) for exact spelling. Not both at once.
  The words are drawn into the pixels only, never stored or returned. With `lyrics` the words are timed one by
  one to the sung vocal, so fast non-stop singing keeps every line.
- Captions only: send `graphics: []` with `captions` or `lyric_captions`; no dummy element needed.
- Style: `caption_style` (`subtitle` / `pop`), `caption_words` (1-8, default 4), `caption_position` (`bottom`,
  `center`, `lower_third` or 0-1), `caption_font`, `caption_size` (1.5-15 % of the height), `caption_color`,
  `caption_stroke_color`, `caption_stroke_width`, `caption_shadow`, `caption_highlight_color`,
  `caption_uppercase`, `caption_animation` (`none` / `pop` / `fade`). Captions also move off faces and graphics.
- Caption quality (opt-in, same price): `caption_never_hide: true` (a caption with no free spot moves or shrinks
  instead of hiding), `caption_min_s` (0.2-2: each caption stays up at least this long; fast lines merge),
  `caption_fill_gaps: true` (lyric captions stay up through short sung gaps). Use all three for lyric videos.
  In depth: `references/montage/pixio-lyric-captions.md`.
- Music bed (ads without music only): `music_prompt` (up to 2000 characters; makes an instrumental of the video's
  length; priced on top, see the catalog) or `music_job` (one of your finished `/api/v1/director/music/generate`
  jobs). It dips under the voice and comes up on the end card. Not both. The customer's own track comes first:
  for an uploaded track use packaging (`POST /api/v1/director/videos/package` with `music`).

## 6. Requests

```bash
BASE=https://beta.pixio.myapps.ai
# 1) plan; 2 product photos will come with the render
curl -X POST "$BASE/api/v1/director/videos/graphics/plan" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"job_id": "JOB_ID", "brand_id": "BRAND_ID", "image_count": 2,
  "brief": {"product": "Cosmo cold brew", "price": "$3.99", "cta": "Try it today", "url": "cosmo.example",
            "points": ["Zero sugar", "Double strength"]}}'
# poll GET $BASE/api/v1/director/jobs/PLAN_ID; read result.plan.graphics (the list) and result.plan.video; edit; then:

# 2) render the edited list
curl -X POST "$BASE/api/v1/director/videos/graphics" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "job_id=JOB_ID" -F "brand_id=BRAND_ID" -F "graphics_images=@can.png" -F "graphics_images=@pack.png" \
  -F 'graphics=[{"type":"text","text":"Coffee that keeps up","t":"beat:1","d":2.5},
                {"type":"image","image":1,"t":3,"d":3,"x":0.75,"y":0.5,"w":0.3,"price":"$3.99"},
                {"type":"checklist","items":["Zero sugar","Double strength"],"t":"downbeat:3","d":4},
                {"type":"end_card","t":12,"d":3,"cta":"Try it today","url":"cosmo.example","particles":"sparkle"}]'
```

In multipart, `graphics`, `brief` and `safe_area` are JSON text; `graphics_images` repeat, numbered 1, 2, ... in
the order sent. `job_id` is a Pixio job id from this API (an opaque string).

Good vs bad hook:
- Good: `{"type": "text", "text": "Cold brew, zero sugar", "t": 0.2, "d": 2.5, "size": 8}`: 2-6 words, in the
  first 0.5 s, on screen long enough to read.
- Bad: `{"type": "text", "text": "Introducing our amazing brand new cold brew coffee experience for busy people", "t": 0, "d": 1}`:
  too long, too short on screen, and it would be lengthened or crowd the frame.

Good vs bad picture prompt (the render before graphics):
- Good: "...the can sits on the left third of the table, the right half of the frame is clean dark wall."
- Bad: "...the can with the words COSMO COLD BREW $3.99 written above it." Text in a prompt comes out garbled;
  draw it as a graphic.

## Checklist

- [ ] The picture is final (lips, faces, upscale, finish done); no text was asked of the video model.
- [ ] Planned first (or wrote the list by hand), and every fact came from the user's brief.
- [ ] Hook in the first 0.5 s, 2-6 words; CTA or end card over the last section, to the end.
- [ ] Starts on beats (`beat:N`, `downbeat:N` or `snap_to_beat`) for music; titles in speech gaps for dialogue.
- [ ] `avoid_faces` and `fix_layout` left on; `safe_area` right for the platform.
- [ ] Price told before spending (catalog); no music bed over a customer's song.
- [ ] Watched the result; re-placed anything that moved or hid a lot.
- [ ] Delivered the newest job id and its `output.url` (or `GET /api/v1/director/jobs/{id}/video`).
