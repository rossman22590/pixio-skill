---
name: pixio-image-generation
description: How to make still pictures on Montage (Pixio's Director API) with Montage's image model - POST /api/v1/director/images/text (words to picture) and POST /api/v1/director/images/reference (a new picture from 1-8 reference pictures) - fields, sizes, aspect, image_model, steps, enhance, fix_prompt, prompts that work, casting people, clean character references, places, props, hero frames and start frames for video, and getting the file. Use whenever you need a new picture, a reference for a video, a start frame for /api/v1/director/videos/image, or a cast for a film, music video or series. Not for changing an existing picture (that is references/montage/pixio-image-editing.md), and not for keeping a cast consistent across a whole film (that is references/montage/pixio-characters.md).
---

# Making pictures with Montage's image model

A picture takes well under a minute once it starts. A video clip takes minutes. Every person, place and prop that
will appear in a video should exist as a checked picture first. Get the picture right here, then animate it.

## House rules

- **Test on Basic.** Video tests, drafts and trial renders run on Montage Basic (leave `video_model` out). Montage
  Premium or Ultra only when the user asks for it and has seen the `?check=true` quote.
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.

## Decision rules (read first)

| You want | Endpoint | Body |
|---|---|---|
| A new picture from words only (a person, a place, a prop, a poster idea) | `POST /api/v1/director/images/text` | JSON |
| A new picture that must contain someone or something from a photo | `POST /api/v1/director/images/reference` | multipart, `images` 1-8 (or `images_urls`) |
| The same picture with one thing changed | `POST /api/v1/director/images/edit` | see `references/montage/pixio-image-editing.md` |

- Pictures are Director jobs: they wait in the same line as your video jobs (`queue.ahead` on the job) and count
  toward the 8 Director jobs you can run at once. Each picture is billed in credits by its size and model
  (`GET /api/v1/director/catalog` has the price). There is no free quote for pictures: `?check=true` /
  `?dry_run=true` answer `400 preflight_unavailable`.
- Drafts: default `megapixels` (4) and the standard image model (leave `image_model` out). Finals where a face
  matters: `megapixels: 8` and `image_model: "high"` (priced about 1.55x).
- References: send 1-2 pictures. 3-8 are accepted, but in tests 3+ made faces drift.
- Every picture the customer gave you is used somewhere. If a photo is messy, clean it with
  `/api/v1/director/images/reference` or `/api/v1/director/images/edit`; never silently drop it.
- Adults only in people pictures. No text, logos or numbers in a reference picture (they come out garbled in video).

## Fields

Both endpoints:

| field | values | default | notes |
|---|---|---|---|
| `prompt` | 1-8,000 characters | required | long, concrete English works best |
| `aspect` | `1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `9:16`, `16:9`, `21:9` | `1:1` | 2:3 for people, 16:9 for places and video frames |
| `megapixels` | 0.5-16 (1 MP = 1024x1024) | 4 | priced between 0.5 and 16; below 4 MP the picture is rendered larger and shrunk |
| `seed` | integer | random | send one and keep it to re-make the same picture; change it for a new take |
| `steps` | sampling steps | 6 | 8 and 12 looked the same as 6 in tests; leave it (more steps cost more in proportion) |
| `sampler` | `euler` or `lcm` (Basic only) | `euler` | same price. For pictures of people, `megapixels: 16` + `sampler: "lcm"` + the default 6 `steps` gives clean, even skin and lips; 12 steps with `lcm` brings back sheen and lip cracks |
| `image_model` | `high`, `premium`, or leave it out | standard | `high`: closer face shape and eyes, a little more skin detail, about 1.55x the time and price. `premium`: made in the cloud (up to 14 reference pictures), priced from the studio's quote, ignores `seed`/`steps`; 409 `not_available` while it is off |

Only on `/api/v1/director/images/text`: `enhance` (default false). The studio rewrites a short prompt into a
detailed caption first, adding about 25-30 s. Useful for a quick idea; skip it when you have written a full prompt
yourself.

Only on `/api/v1/director/images/reference`: `images` (1-8 files, URLs as `images_urls`, or paths from your Pixio
assets; `<Picture 1>`, `<Picture 2>`... in upload order), `exif_rotate` (phone photos are turned upright), and
`fix_prompt` (`off` default, or `safe`: face words in the prompt are replaced with the "exactly her face, features
and skin from `<Picture N>`" wording; free).

There is no `look` or `styles` field on the image endpoints. Named looks and styles are for video shots (listed in
`GET /api/v1/director/catalog` under `looks` and `styles`). For a picture, put the style in words.

Typical render times (default steps, no line in front): text 4 MP ~12 s, 8 MP ~17 s, 16 MP ~28 s; reference with
2 pictures at 4 MP ~24 s, 8 MP ~26 s, 16 MP ~33 s.

## Size guide

| use | aspect | megapixels | image_model |
|---|---|---|---|
| casting takes (pick one of several) | 2:3 | 4 | standard |
| final face reference for video | 1:1 or 2:3 | 8 | `high` |
| place / background reference | 16:9 (or 9:16 for vertical videos) | 4-8 | standard |
| start frame for `/api/v1/director/videos/image` | the video's shape (16:9, 9:16 or 1:1) | 4-8 | `high` if a face matters |
| poster, thumbnail with words in it | the poster's shape | 8-16 | `high` |

Text in a picture renders best at higher megapixels. Bigger pictures cost more and are bigger files (a PNG is about
4.5-8 MB at 4 MP, 30 MB at 16 MP), so stay at 4 MP for takes you only look at.

## Prompts that work

Montage's image model follows long, concrete descriptions. Write what a camera would see: subject, clothes, pose,
place, light, lens, colour. Prompt format rules shared with video are in
`references/montage/montage-basic-prompting.md`; this section is picture-specific.

Structure that works: shot size and subject -> clothes and props -> pose and where they look -> place -> light ->
style / medium -> what must NOT be there (as plain words, e.g. "no text").

```text
Bad:  a cool detective
Good: Waist-up photo of a man in his fifties, short grey hair, a rumpled tan trench coat over a white shirt and loose
      dark tie, arms down, facing the camera, standing against a plain grey wall, soft even light from the front,
      realistic photograph, no text, no logos.
```

```text
Bad:  a spooky house, cinematic, 8k, masterpiece
Good: No people and no animals. A tall wooden Victorian house at the end of a gravel road at dusk, peeling white
      paint, one lit upstairs window, bare oak trees on both sides, low fog over the grass, cold blue sky with a thin
      orange band at the horizon, wide shot from road level, realistic photograph.
```

- Quality tags ("8k, masterpiece, trending") do nothing useful. Spend the words on what is in the frame.
- Text you want drawn goes in "quotes" with its place: `a shop sign above the door reads "BAKERY" in red letters`.
- Notes to yourself inside a prompt ("v2:", "TODO") get drawn. Keep notes out of the prompt.
- Describe an object so it can only be one thing: how it is built, what each end does, what colour each part is.
  "A crossbow" drifts; "a black hunting crossbow with a short curved bow at the front, a wooden stock and a red
  string" holds.
- An empty place starts with "No people and no animals." or someone will appear in it.
- In scene pictures, hands rest on something (a railing, a cup, a table); hands on the body or face come out odd
  more often. Reference pictures keep the hands empty (next section).

## Character references for video

A video model copies what it sees in a reference picture: face, hair, clothes, pose, background, light. So a good
reference shows only what must carry over.

- **One person per picture.** Never one picture for two people: it renders twins.
- **Neutral grey background, soft even light from the front, empty hands, arms down.** Props are separate pictures:
  anything drawn into the person's hands is glued to them in every shot. A dramatic pose gets copied too.
- **No "studio" in the prompt** (you get a photo studio, lamps and backdrop in frame); write "plain grey wall".
  **No rim light or backlight**: it is copied into every scene, even ones lit from the front.
- **Face large:** medium shot or closer. In a full-body frame at 4 MP the face is only ~330 px tall and loses
  likeness; at 8 MP a medium shot gives a face of ~780 px.
- **One state per picture.** One hairstyle, one outfit, one condition. Clean, soaked and injured are three pictures;
  make each later state by editing only what changed on the approved picture
  (`references/montage/pixio-image-editing.md`), never by generating the whole person again.
- **Character sheet = separate pictures, one view each**, bound to the same person (film `cast` `pictures`, see
  `references/montage/pixio-characters.md`):
  1. **Face source:** a large three-quarter close portrait (head and shoulders, turned about 30 degrees), 8 MP,
     `image_model: "high"`. It carries the identity; full-body pictures do not (their small face is copied soft).
  2. **Neutral close-up and smiling close-up** for anyone who speaks or laughs: without a smile picture the model
     invents the teeth.
  3. **Waist-up or full body** for the costume and build.
  A turnaround sheet (several copies of one person in one picture) helps a human approve a design, but as a video
  reference it puts several of the same face in one frame, which invites clones.
- **Test the cast cheaply** before a long film: a few short Montage Basic shots of the person walking, talking,
  laughing and crying, next to the places and co-stars they share frames with. If the same fault keeps coming back
  after the words are fixed, remake the picture.

### Casting from words

Make 3-4 takes with different seeds, same prompt, 2:3, 4 MP. Put the person in a setting that belongs to the
story, not a catalog backdrop. The customer picks one. Then lock that face (next section).

```bash
curl -fsS -X POST "$BASE/api/v1/director/images/text" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"prompt": "Waist-up photo of a woman in her late forties, shoulder-length greying auburn hair, navy scrubs and a long grey knitted cardigan, standing in a quiet hospital corridor at night, arms down, facing the camera, soft overhead light, realistic photograph, no text", "aspect": "2:3", "megapixels": 4, "seed": 11}'
```

### Locking a face from a photo (`/api/v1/director/images/reference`)

Skin in pictures of people: write "natural healthy skin with an even tone and a soft, smooth, realistic
texture, smooth natural lips", never "visible pores", and only when a person is in the shot. Make every picture
of a person straight from their original casting picture, never from a picture made from another picture (each
pass sharpens the skin more; by the third the mouth goes patchy).

Never describe a pictured face in words (eyes, brows, nose, jaw, lips, skin tone, makeup). The model redraws the
face from the words and it drifts from the photo. Name the picture and say "exactly her face".

```bash
curl -fsS -X POST "$BASE/api/v1/director/images/reference" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "images=@customer.jpg" -F aspect=1:1 -F megapixels=8 -F image_model=high -F seed=4 \
  --form-string "prompt=Close portrait, head and shoulders, of exactly the same woman as in <Picture 1>, with exactly her face, features and skin from <Picture 1>, head turned three-quarters to the left, lips closed, plain grey wall, soft even light from the front, natural healthy skin with an even tone and a soft, smooth, realistic texture, smooth natural lips"
```

```text
Bad:  The woman from <Picture 1> with almond-shaped green eyes, thin arched brows and red lipstick, smiling.
Good: The woman in <Picture 1>, with exactly her face, features and skin from <Picture 1>, in a navy wool coat,
      standing at a rainy bus stop at night, looking down the street, medium shot.
```

If you are not sure your prompt is clean, send `fix_prompt=safe`.

Reference photos: sharp, face large, plain background, at least 1024 px on the short side (2048 best). A smaller
photo is upscaled first and loses detail (skin, freckles).

### Two people in one picture

Upload each person's picture, mention every `<Picture N>` in the prompt, and keep each one's identity from their
own picture:

```bash
curl -fsS -X POST "$BASE/api/v1/director/images/reference" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "images=@mara.png" -F "images=@tom.png" -F aspect=3:2 -F megapixels=8 \
  --form-string "prompt=The woman from <Picture 1> and the man from <Picture 2> sit side by side on a wooden bench in a sunny botanical garden, both laughing. Keep each person's face, hair and clothing faithful to their own reference picture."
```

## Places, props and hero frames

- **Places:** `/api/v1/director/images/text`, 16:9, "No people and no animals." first, then place, time of day,
  light, colour. Seen at a three-quarter angle (not flat-on), wide or medium, one clear light direction, and one
  anchor object people can be placed against later (a lamp, a column, a counter). Worn real surfaces (rust, cracks,
  water marks, tape) read as real; a period is a rule ("nothing newer than 1995: no mobile phones").
  A matching second angle of the same place: `/api/v1/director/images/reference` with the first place picture
  ("the same room as `<Picture 1>`, seen from the doorway").
- **Props:** plain background, the prop alone, the angle that shows how it works. If a place picture also shows the
  prop, it must match the prop picture, or leave the prop out of the place.
- **Hero frames / start frames** (a person in a place, used as the first frame of `/api/v1/director/videos/image`
  or as a film reference): `/api/v1/director/images/reference` with 2 pictures, **face first, place second**, 8 MP.
  Write the outfit in words, use one cinematic camera angle (low angle, three-quarter, mid-stride) rather than a
  frontal standing pose, which looks pasted in.
- **Face-first lock pass** when the face in a hero frame drifted: `/api/v1/director/images/reference` with the face
  picture first and the hero frame second: "The woman in `<Picture 1>`, exactly the same person with exactly her
  face from `<Picture 1>`. Put her into `<Picture 2>`, replacing the woman there, in exactly the same pose, framing,
  head angle and expression, with the same hair, outfit, place, light and colours." Keep whichever face matches
  better. The reverse order barely changes the face.

## Reading the job and getting the file

POST answers `202` with a `director.job`. Poll `GET /api/v1/director/jobs/{id}` every 10-30 s until `status` is
`done` (or `failed` / `cancelled`). When done:

- `output.url` is a signed URL to the picture, valid 6 hours; `output.assetPath` is the durable copy in your Pixio
  assets; `GET /api/v1/director/jobs/{id}/image` redirects (302) to the finished file.
- Record the `seed` you sent with the job id so the picture can be made again.

```bash
curl -fsSL -o mara.png "$BASE/api/v1/director/jobs/$JOB_ID/image" -H "Authorization: Bearer $PIXIO_API_KEY"
```

- To use the picture in a video request you do not have to re-upload it: pass `output.assetPath` (or, within 6
  hours, `output.url`) as the media field or in `images_urls`. Download it too if you want a local copy to look at.
- Look at every picture beside its source photo before it goes into a video.

## Checklist

- [ ] Every recurring person, place and prop has its own picture; every customer photo is used.
- [ ] One subject per picture, plain grey background, empty hands, face large, adult, no text or logos.
- [ ] Face source is a three-quarter close portrait; speakers also have a neutral and a smiling close-up.
- [ ] No "studio", rim light or backlight in a reference prompt; one state (outfit, condition) per picture.
- [ ] No face words for a pictured person; "exactly her face ... from `<Picture N>`" instead (or `fix_prompt=safe`).
- [ ] 1-2 reference pictures per request; face first.
- [ ] Finals at `megapixels` 8 and `image_model` `high`; drafts at the defaults.
- [ ] Each picture checked by eye beside its source photo; new `seed` until right.
- [ ] No grain, noise or quality-tag words; no notes inside the prompt.
- [ ] `seed` recorded so the picture can be made again.
