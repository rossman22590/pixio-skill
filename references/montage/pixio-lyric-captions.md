---
name: pixio-lyric-captions
description: How to put karaoke lyric captions (word-by-word subtitles) on a finished music video with POST /api/v1/director/videos/graphics on Montage (Pixio's Director API) - lyric_captions and the lyrics field, timing to the isolated vocal, caption_* styles, face avoidance, platform safe areas, mixing captions with ad graphics, and checking the result. Use whenever a user wants lyrics, subtitles or karaoke text on a music video, or speech captions on any video. Not for making the music video itself (that is references/montage/pixio-music-video.md) or for titles, badges and end cards on their own (that is references/montage/pixio-graphics-titles.md).
---

# Lyric captions on music videos

Lyric captions are burned into a **finished** video by `POST /api/v1/director/videos/graphics`. The song's vocal is
separated, every sung word is heard with its timestamps, and each caption chunk lights up word by word as it is
sung. Captions never sit on a face, never sit under platform buttons, and step aside for other graphics.

It is billed like `videos/finish` on the video's seconds (`finishPerSecond`, at least `finishMinimum`), plus a
planning pass (about 16 credits) when you add `auto: true`, or a music bed (about 26) with `music_prompt`.
`GET /api/v1/director/catalog` has the rates. There is no free quote for graphics (`?dry_run=true` answers
`400 preflight_unavailable`), so work the price out from the video's length and tell the human.

## House rules

- **Test on Basic.** Video tests, drafts and trial renders run on Montage Basic (leave `video_model` out). Montage
  Premium or Ultra only when the user asks for it and has seen the `?check=true` quote.
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.

Lyric privacy:

1. **Lyrics are the customer's.** They go in exactly one place: the `lyrics` field of
   `/api/v1/director/videos/graphics`. Never in `idea`, `sections`, a video prompt, a file name, a log line, a
   ticket, a commit or a chat summary. On your side, build the request in memory, don't write the lyrics to a temp
   file you forget about, and don't echo the request body.
2. **Never write lyrics into a video prompt** (Montage Basic, Premium or Ultra) to get on-screen text. Rendered text
   is garbled anyway, and it spreads the words into prompts. Captions are always a post step.

## Decision rules (read first)

| situation | do this |
|---|---|
| Customer gave the lyric text | `lyric_captions: true` + `lyrics` (exact spelling and their line breaks) |
| No lyric text | `lyric_captions: true` alone: the heard words are used (spelling may differ from the real lyrics; say so to the user) |
| Spoken video (ad, explainer, dialogue) | `captions: true` (speech, not song). Never both `captions` and `lyric_captions` (refused) |
| Montage Premium music video | `source: "auto"` (or `"song"`) so captions go on the version with the customer's original song |
| Captions plus promo graphics | same call: `graphics` list or `auto: true` + `brief`, with `lyric_captions: true` |
| 9:16 for TikTok / Reels / Shorts | leave `safe_area` unset (9:16 defaults to `all`) or name the platform |
| Video has no sound | nothing to time; no captions are drawn |

`lyrics` without `lyric_captions: true` is refused. Any `caption_*` field without `lyric_captions` or `captions` is
refused. `lyrics` is up to 20,000 characters (longer gets `400 invalid_request` naming the field, before anything
is held).

## 1. The request

JSON (`job_id` of any finished Director video job) or multipart (`video` file, URL or asset path instead of
`job_id`; never both).

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/graphics" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"job_id": "JOB_ID", "source": "auto", "lyric_captions": true,
       "lyrics": "<the customer lyrics, built in memory, never logged>",
       "caption_style": "pop", "caption_words": 4, "caption_position": "bottom"}'
```

Multipart, any mp4:

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/graphics" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "video=@mv.mp4" -F "lyric_captions=true" -F "lyrics=<lyrics.txt" -F "safe_area=reels"
```

(`-F "lyrics=<lyrics.txt"` reads the file's text into the field; delete the file afterwards if you made it.)

A music video already has its song, so never add `music_prompt` / `music_job` to one.

Poll `GET /api/v1/director/jobs/{id}` every 10-30 s; the result is a new video job with `output.url` (signed, 6
hours) and `output.assetPath`. Never resubmit on a timeout: keep polling the same id.

## 2. How the timing works (and how to help it)

- The vocal is isolated and every sung word is heard with start and end times.
- With `lyrics`: your lines are matched word by word to what was heard. Words that match exactly or nearly take the
  heard times; words that were missed are spread evenly between their matched neighbours (about 0.35 s a word at
  the ends). Your spelling and your **line breaks** are kept: one line of `lyrics` = one caption line before
  chunking.
- Without `lyrics`: heard words are grouped into lines at pauses over 0.7 s or every 7 words.
- Chunks then show `caption_words` words at a time (default 4 for lyric captions) and only one chunk is on screen at
  once (a chunk ends when the next starts).

To get clean timing:

- Send the lyrics **exactly as sung**, in order, once per time they are sung. A chorus sung three times must appear
  three times. Do not write "[Chorus x3]" or "(repeat)".
- Remove section tags, speaker labels and notes (`[Verse 1]`, `Her:`, `(ad-lib)`): every token in `lyrics` is a word
  to draw. Keep real ad-libs only if they are clearly sung.
- One sung phrase per line. Long paragraphs give long caption lines that chunk awkwardly.
- If the highlight drifts from the singing, the lyrics are usually out of order, missing a repeat, or for a
  different edit of the song. Fix the text and run again (each run is billed, so check the text before the first).
- Heavy effects, growls, choirs or rap over a loud mix match less well. Bigger, shorter chunks (`caption_words` 2-3)
  hide small timing errors.

Good `lyrics` (shape only):

```
first sung line exactly as heard
second sung line
first chorus line
second chorus line
first chorus line
second chorus line
```

Bad `lyrics`: `[Verse 1]` lines, `Chorus (x2)`, a single paragraph with no breaks, the album version's words when
the video uses the radio edit.

## 3. Styles

| field | values | notes |
|---|---|---|
| `caption_style` | `pop` (default for lyric captions) or `subtitle` | pop = bold karaoke chunk with the sung word highlighted; subtitle = calmer, plain line |
| `caption_words` | 1-8 (default 4) | 1-2 for fast rap or hype edits, 3-4 for pop, 5-6 for slow ballads |
| `caption_position` | `bottom` (default), `center`, `lower_third` or 0-1 (height) | a preference: the chunk still moves off faces and graphics |
| `caption_size` | 1.5-15 (% of frame height) | default 6 for pop, 4.2 for subtitle |
| `caption_font` | `brand` or a font name, e.g. `impact`, `arial black`, `bahnschrift`, `segoe ui black`, `georgia bold` | bold faces read best |
| `caption_color` | `#RRGGBB` | default the brand's text colour |
| `caption_highlight_color` | `#RRGGBB` | the word being sung; default the brand accent, or gold |
| `caption_stroke_color`, `caption_stroke_width` | outline colour, width (% of text size) | use an outline on busy or bright footage |
| `caption_shadow` | true / false | soft shadow |
| `caption_uppercase` | true / false | capitals |
| `caption_animation` | `none`, `pop` (default), `fade` | how each chunk appears |

Add `brand_id` (a saved `/api/v1/director/brands` brand, free to save) and its colours and font become the
defaults.

Style by genre (starting points, not rules):

- **Pop / dance, 9:16:** `pop`, 2-3 words, `caption_uppercase: true`, white text, bright accent highlight, stroke on.
- **Ballad / acoustic:** `subtitle`, 5-6 words, `fade`, `georgia bold` or the brand font, no uppercase, lower size.
- **Hip-hop / rap:** `pop`, 1-2 words, `impact` or `arial black`, thick stroke, `caption_position: "center"` only if
  the shots are wide (faces small); otherwise keep `bottom`.
- **Cinematic story video:** `subtitle`, `lower_third`, small size, soft shadow, no highlight colour clash with the
  grade.

## 4. Faces and safe areas

- Faces are tracked through the whole video. A chunk that would cover a face moves to the nearest free height,
  shrinking if needed. With no free spot it stays off the face and hides only while it would cover another element.
- Captions are never allowed over a face (`avoid_faces` stays at its default `true`), so you don't have to place
  them around the singer yourself. You do help by choosing a position the shots leave free: performance close-ups
  fill the middle, so `bottom` usually works; a `center` preference on close-ups will move nearly every chunk.
- `safe_area` keeps captions and graphics out of platform UI: `tiktok`, `reels`, `shorts`, `all` (the largest of
  each edge) or `none`, or your own `{"left", "top", "right", "bottom"}` fractions (0-0.45). Default: `all` on 9:16
  (and other tall shapes), `none` on 16:9 and 1:1.
- On 16:9 for YouTube keep `none`; for a 1:1 feed post consider `{"bottom": 0.1}`.
- `fix_layout` (default on) nudges graphics apart when they collide; leave it on.

## 5. Captions with promo graphics

One call can carry both. Lyric captions run in a band near the bottom; with `auto: true` the planner keeps the
lower part of the frame free while someone sings.

```json
{"job_id": "JOB_ID", "source": "auto", "lyric_captions": true, "lyrics": "<in memory>",
 "auto": true, "brief": {"product": "the new single", "cta": "Stream now", "tone": "bold"},
 "safe_area": "all", "caption_words": 3}
```

To plan first without rendering: `POST /api/v1/director/videos/graphics/plan` with `"lyric_captions": true` (no
lyrics there: it only leaves room for them). It returns `plan.graphics` to edit and send back (a plan alone is
about 16 credits). Hooks, badges and end cards are covered in `references/montage/pixio-graphics-titles.md`.

## 6. Technique (what good lyric text looks like)

- **One text event at a time.** Never two lines of lyrics on screen; the API already shows one chunk at a time.
- **Words match the performance exactly.** If the singer changes a word on the third chorus, the lyrics must too.
- **Text follows the music.** Chunk breaks should land on breaths and phrase ends, not mid-phrase: write line breaks
  where the singer breathes, then pick `caption_words` so a line splits evenly (a 6-word line with 3 words a chunk,
  an 8-word line with 4). `snap_to_beat` lines graphics up with the beat.
- **Never on the eyes or mouth.** Lip-sync is the point of a music video; text over the mouth hides it. Handled by
  `avoid_faces`, but don't fight it with a forced `center` on close-up-heavy videos.
- **Instrumental breaks stay clean.** No text while nobody sings; the timing does this for you as long as the lyrics
  have no extra words.
- **Same look all the way through.** One font, one size, one colour pair for the whole video.

## 7. Check the result

1. Watch the first chorus and one verse: is the highlighted word the one being sung (within a few frames)?
2. Spot-check 1 frame per second on close-ups: no text on a face, no text under platform buttons (9:16).
3. Chunks missing or jumping around: try `bottom`, a smaller `caption_size`, fewer `caption_words`, or `subtitle`
   style.
4. Highlight out of step: clean the lyrics (order, repeats, the right edit) and run again.
5. If the job ends `failed`, send it again with the lyrics (nothing is charged for a job that fails before
   rendering).

Never paste the captioned words back into your report. Report what you checked and what you changed.

## Checklist

- [ ] Finished music video exists (made from the customer's own song); Premium: `source` `auto` or `song`.
- [ ] Lyrics only in the `lyrics` field; not in prompts, logs, files kept, tickets or your reply.
- [ ] Lyrics cleaned: no section tags, every repeat written out, one sung phrase per line, right song edit.
- [ ] `lyric_captions: true`; not combined with `captions`; no `music_prompt` on a music video.
- [ ] Style chosen for the genre; `caption_words` suits the tempo.
- [ ] `safe_area` right for the platform (9:16 defaults to `all`).
- [ ] Price worked out from the video's length (and `auto` if used) and told to the human.
- [ ] After render: a chorus and a verse watched, frames checked for text on faces.
