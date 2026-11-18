---
name: pixio-thumbnails-posters
description: How to make YouTube thumbnails, vertical video covers, posters and album or episode covers with Montage (Pixio's Director API) - concept from what the video really shows, one subject and one emotion, faces kept true to their pictures, empty space for the headline, sizes per platform, frames and reference pictures taken from finished jobs (job.pictures, GET /api/v1/director/jobs/{id}/pictures/{n}, GET /api/v1/director/jobs/{id}/shots and shots/{n}, storyboard stills), and POST /api/v1/director/images/text, /edit and /reference settings for finals. Use whenever you make a still image that advertises a video, a series, a song or an event. Not for general image generation or editing (that is `references/montage/pixio-image-generation.md` / `references/montage/pixio-image-editing.md`) or in-video graphics (`references/montage/pixio-graphics-titles.md`).
---

# Thumbnails, covers and posters

A thumbnail is judged at about 120-200 px wide in a crowded feed. It needs **one subject, one emotion, one idea,
strong separation and room for 2-4 words**. Everything else is clutter. The images come from Montage's image model
(`/api/v1/director/images/*`), a few credits each (prices in `GET /api/v1/director/catalog`); the people come from
the job's own reference pictures, so the face on the cover is the face in the video.

## House rules

- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE`
  (`https://beta.pixio.myapps.ai`) and `$PIXIO_API_KEY`.

A supplied face is always the face reference. Share pictures with the job's signed `output.url` (valid 6 hours) or
from the copy in the user's Pixio assets (`output.assetPath`). Truthfulness: the
cover shows only what the video really shows or claims; no invented results, people, products or numbers.

## 1. Decision rules

| Need | Endpoint and settings |
|---|---|
| A cover for a finished film or music video with its cast | `/api/v1/director/images/reference`: the job's face picture first, a place second; `megapixels=8`, `image_model=high` |
| A cover with no real person (a place, an object, a mood) | `/api/v1/director/images/text`, `megapixels=8` |
| Change only the expression, the background or the light of a picked cover | `/api/v1/director/images/edit` with "change only X; keep everything else exactly" |
| The exact composition of a moment in the video | take that shot's thumbnail as a composition reference plus the face picture (section 4) |
| A headline on the image | leave empty space in the prompt; add the words in your own layout step, or ask the image model for 1-4 quoted words and check them letter by letter |

## 2. Concept first (truthful, one information gap)

1. Watch or read the video (the finished file, `GET /api/v1/director/jobs/{id}` with its `parts` and `pictures`,
   `GET /api/v1/director/jobs/{id}/shots`; `POST /api/v1/director/understand/video` gives a structured read). List its real
   promise: what happens, who is in it, the strongest image.
2. Write 3-4 one-line concepts, each with one emotion and one question the viewer wants answered ("she opens the
   door - what's behind it?"). Pick the strongest gap that the video actually pays off.
3. Choose the emotion. If the human asks for a set without naming emotions, go down this ladder: shock, joy,
   awe, fear, determination, curiosity, smug, disgust. One emotion per image.
4. Plan the headline (2-4 words) and where it sits. It must not repeat the title word for word; it adds the hook.

## 3. Composition and light

- **One hero subject** on a third, large: chest-up or closer, about 40-60% of the frame. A face needs to read at
  120 px wide, so no wide shots of people.
- **Separation:** subject sharp and lit, background simpler and darker or brighter than the subject, a little
  depth blur.
- **Light:** a strong key that shapes the face, soft fill, and a bright rim or hair light outlining the
  silhouette. Colour accents in the rim, not on the face. Saturated, high contrast, deep blacks for energy; muted
  and softer only for calm or premium subjects.
- **Text space:** the opposite third is quiet (sky, wall, gradient). Say it: "the right third of the frame is an
  empty dark-teal gradient".
- **Props:** only the one signature object that explains the gap (the key, the box, the trophy).
- **Logos:** never near the face; never generated (add the brand's real logo in layout).

## 4. Taking pictures and frames from a job

- **Reference pictures of a film or music video:** `GET /api/v1/director/jobs/{id}` lists `pictures` (`number`,
  `tag` such as `<Picture N>`, `designed` true for ones the studio designed, `what`, and `url`). Download one with the
  key from its `url`, `GET /api/v1/director/jobs/{id}/pictures/{n}` (free). These are full-size: the best face
  reference for the cover.
- **Shots of any finished video:** `GET /api/v1/director/jobs/{id}/shots` (free) lists every hard-cut shot with
  `startSeconds`, `endSeconds` and `thumbnailUrl` (`GET /api/v1/director/jobs/{id}/shots/{n}`, a small JPEG, 1-based). Use it to pick the
  moment and as a **composition** reference, not as the face: it is small.
- **Storyboard stills:** a film made with `storyboard=true` has a still per shot at
  `GET /api/v1/director/jobs/{id}/storyboard/{clip}/{shot}` (PNG; a contact sheet at `.../storyboard/sheet.jpg`).
- **A full-size frame:** download the finished video (`output.url`, or `GET /api/v1/director/jobs/{id}/video`) and
  grab the frame yourself.

Face-first recipe for a cover of a scene:
```bash
curl -X POST "$BASE/api/v1/director/images/reference" -H "Authorization: Bearer $PIXIO_API_KEY"  \
  -F "images=@mara_face.png" -F "images=@shot4_thumb.jpg" -F aspect=16:9 -F megapixels=8 -F image_model=high \
  -F fix_prompt=safe \
  -F "prompt=The woman in <Picture 1>, with exactly her face, features and skin from <Picture 1>, in the scene and framing of <Picture 2>: a rain-wet night platform. Chest-up on the left third, turning toward the camera, eyes wide in shock, lips parted. A strong cool key light from the right shapes her face, a thin warm rim light outlines her hair. The right third of the frame is an empty dark blue-grey blur of the platform. Saturated, high contrast, deep blacks, sharp focus on her eyes, clean digital image."
```
Keep 1-2 pictures (face first). 3 or more are accepted (up to 8) but faces drift. A reference photo under 1024 px
on the short side is upscaled and loses skin detail, which is why the face comes from the job's full-size picture,
not the small shot thumbnail.

## 5. Keeping faces true

- Never describe a pictured face in words (eyes, brows, nose, jaw, lips, skin tone, makeup): write "with exactly
  her face, features and skin from `<Picture 1>`" and spend words on expression, pose, clothes, light, place.
  `fix_prompt=safe` on `/api/v1/director/images/reference` rewrites face descriptions for you.
- Expressions are fine to describe (eyes wide, a half smile, jaw set): they're acting, not identity.
- Medium shot or closer. Finals at `megapixels=8` (16 for the most detail) with `image_model=high` (closer face
  shape, priced 1.55x). More `steps` don't help.
- If the face drifted, do a lock pass: `/api/v1/director/images/reference` with the face picture first and the cover second:
  "Put the woman in `<Picture 1>` into `<Picture 2>`, replacing the woman there, in exactly the same pose, framing,
  expression, light and colours."
- Expression variants: `/api/v1/director/images/edit` on the chosen cover, "Change only her expression to a wide open-mouthed
  laugh. Keep her face, hair, clothes, pose, light and the background exactly the same."

## 6. Text on the image

Default: **no generated text**. Leave the space and lay the headline over it in your own layout tool (or a quick
script), with the brand font if there is one (`GET /api/v1/director/brands/{id}`), a bold sans-serif, an outline or shadow, 2-4
words, never over the face. If the human wants the image model to draw it: put the exact words in "quotes", say where they
sit and how big, render at 8 MP or more, and compare every letter; redo or fall back to an overlay if one is wrong.

Bad: `"A thumbnail for my video about the platform, with the title THE LAST TRAIN TONIGHT and the logo, dramatic,
film grain, lots going on"`
Good: the prompt in section 4 plus, only if text is wanted in-image: `large bold white letters reading "LAST TRAIN"
across the empty right third, outlined in black`.

## 7. Sizes and shapes

`/api/v1/director/images/text` and `/reference` take `aspect` `1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `9:16`, `16:9`, `21:9` and
`megapixels` 0.5-16 (default 4; best 4-16). `/api/v1/director/images/edit`
keeps the input's shape.

| Output | Aspect | Notes |
|---|---|---|
| YouTube thumbnail | 16:9 | 8 MP is about 3872x2176; downscale to 1280x720 yourself for upload |
| Shorts / Reels / TikTok cover | 9:16 | face in the upper two thirds; keep the bottom fifth and right edge clear of UI |
| Instagram feed cover / 4:5 | 3:4 | there is no 4:5 image aspect: render 3:4 and crop the top and bottom slightly |
| Poster, one-sheet | 2:3 | title space at the top or bottom third; 8-16 MP for print |
| Album / episode / podcast cover | 1:1 | subject centred; works as a tiny square |
| Banner / channel art | 21:9 or 16:9 | subject off-centre, text area large |

Download: `GET /api/v1/director/jobs/{id}/image` (key; 302 to the file) or the job's signed `output.url`. The
file is large; convert it to JPEG or WebP yourself for upload.

## 8. Recipes by kind

- **Music video / single cover (1:1):** the singer from the job's picture, close, one strong colour field behind,
  the mood of the song in the light (warm low sun, cold neon). Never print lyrics on the cover: the customer's
  lyrics are private. The song title only if the customer gives it for the cover.
- **Film or episode poster (2:3):** the lead chest-up in the top two thirds, the place as a soft silhouette behind,
  the title space in the bottom third. A second character only if the story is about the two of them: each from
  their own picture (one picture = one face; never "two people like `<Picture 1>`").
- **Product video thumbnail (16:9):** the product from its photo as `<Picture 1>` (exactly its shape, colours and
  printing; never spell the printing), one hand or face reacting, a clean background; the product big enough to
  recognise at 120 px.
- **Tutorial / explainer cover:** the result, not the process (the finished dish, the fixed bike), plus the person
  looking at it; 2-3 words of headline space.
- **Event poster:** the place and the mood from a text-only plate (`/api/v1/director/images/text`, starting "No people and no
  animals." when nobody should appear), dates and details laid on afterwards.

## 9. Variants and review

- Make about four concepts or expressions, same pictures and settings, varying only the concept, the expression
  or the camera angle. Use `seed` to redo one exactly. Cap a set at about 16 renders.
- Label each (A-shock-left, B-awe-centre...) and let the human choose before any edits.
- Check at thumbnail size: shrink to 160 px wide. Can you read the face, the emotion and the headline space?
- Check for stray text, extra fingers, a second face, a changed outfit; fix with a narrow `/api/v1/director/images/edit`.
- Series covers: same layout, same light, same font and position for the episode number; change only the
  subject and emotion.

## Checklist

- Concept is true to the video; one subject, one emotion, one gap.
- Face from the job's full-size picture, first in the list; never described; medium or closer; 8 MP, `high`.
- Strong key + rim light, clean separation, a quiet third for the headline; no grain words.
- No generated logo; text added in layout (or quoted, short, checked letter by letter).
- Right aspect for the platform; faces clear of 9:16 UI; downloaded as jpeg/webp for upload.
- Variants labelled; the human picks before edits.

