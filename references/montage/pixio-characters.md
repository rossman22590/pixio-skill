---
name: pixio-characters
description: How to keep people, products and places looking the same across shots, clips, films, music videos and series episodes on Montage (Pixio's Director API) - what a good reference picture is, making and fixing references with /api/v1/director/images/text, /api/v1/director/images/reference and /api/v1/director/images/edit, picture limits per model, binding pictures and voices to people (film cast, series cast), per-clip pictures (clip_images), and wardrobe and injury continuity. Use whenever a person, product or place must stay recognisable in more than one shot, clip or episode, or a render shows twins, clones or face drift. Prompt tag syntax is in references/montage/montage-basic-prompting.md / montage-premium-prompting.md.
---

# Characters, products and places that stay the same

Video models fill every gap with the most generic version of a word. Words drift; pictures hold. So every person,
product and place that comes back gets its own reference picture, checked by eye, before any video is made. A
picture takes seconds; a clip takes minutes. Fix things at the picture stage.

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

## The loop

1. Story approved. List everyone and everything that appears more than once: people, props, products, places.
2. Collect the customer's pictures; every one is used.
3. Make the missing references (`/api/v1/director/images/*`), one subject per picture.
4. Check every picture by eye; regenerate with a new seed until right.
5. Bind pictures and voices to names (`cast`); choose each clip's pictures (`clip_images`, your own clips only).
6. Write prompts (montage-basic-prompting.md / montage-premium-prompting.md) and run
   `POST /api/v1/director/prompts/check` (free).
7. Render on Basic, check frames (references/montage/pixio-video-qa.md), redo only the bad clip.

## What a good reference picture is

- **Plain background** (plain grey wall, even light). A busy background leaks into the video.
- **No text, logos or numbers:** they come out garbled. Never rely on a name written in a picture.
- **Adults only.**
- **One picture = one person.** Never "two guards dressed like the guard in `<Picture 5>`": that renders identical
  twins. Give each extra their own picture, or describe each so they can only be someone different ("a heavyset
  bald man with a grey moustache" / "a tall young woman with her hair in a bun") and use the picture only for the
  uniform.
- **Neutral pose** (arms down, facing the camera): a reference pose gets copied into the video.
- **Face large and sharp:** medium shot or closer, high resolution.
- **One hairstyle per person** across all their pictures; a bun in one and loose hair in another gets mixed.
- **A prop looks the same in every picture it is in**, or leave it out of the place picture.
- **Empty places:** start the picture prompt with "No people and no animals."

Per picture: right person, right object (right end, right shape), no text, adult, one subject, plain background,
the hair and clothes the story needs.

## WHO vs WHAT THEY DO

The picture carries WHO (face, hair, build, clothes). The prompt carries WHAT THEY DO (action, emotion, position,
where they look). Spend the words on behaviour.

- Never describe a pictured face in words (eyes, brows, nose, jaw, lips, skin tone, makeup): the model redraws it
  from the words and drifts. Write "the woman in `<Picture 1>`, with exactly her face, features and skin from
  `<Picture 1>`".
- Describe a person once with 2-3 stable anchors (coat, hair, a prop), then always use the same name.
- Feelings through behaviour: "she lowers her head, holds a breath, then grips the railing", not "she is sad".
- In action shots name everyone by build so nobody becomes a copy: "only two men in the shot: heavy tattooed Kane
  and lean young Danny".

```text
Weak:  Mara, a pale woman with green eyes and freckles, is nervous.
Good:  Mara from <Picture 1> stands at the platform edge, turns her ticket over twice, glances at the clock, steps back.
```

## Making missing references

Montage's image model makes and edits the pictures. Each call is a job (poll `GET /api/v1/director/jobs/{id}`),
billed in credits by size (`megapixels`).

| need | endpoint | how |
|---|---|---|
| a new person, prop or place from words | `POST /api/v1/director/images/text` (JSON) | `prompt`, `aspect` (`2:3` people, `16:9` places), `megapixels`, `seed` |
| a customer's photo cleaned up (plain background, neutral pose) or put in a new place | `POST /api/v1/director/images/reference` (multipart `images`, 1-8) | 1-2 pictures are tested, 3-8 experimental; face first, place second |
| one thing changed (outfit, a wound, text removed) | `POST /api/v1/director/images/edit` (multipart `image`) | say what changes and what stays |

- Finals where likeness matters: `image_model: "high"` (the higher-quality image model, priced 1.55x),
  `megapixels: 8`.
- `/api/v1/director/images/reference` with `fix_prompt=safe` (free) replaces worded face clauses with the "exactly
  her face" wording.
- Download a picture: `GET /api/v1/director/jobs/{id}/image`.
- Describe objects so they can only be one thing (how it is built, which end does what), then make the picture.

```bash
# a person, plain background, neutral pose
curl -X POST "$BASE/api/v1/director/images/text" -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"prompt": "Waist-up photo of a woman in her late forties, shoulder-length greying auburn hair, navy scrubs and a long grey knitted cardigan, arms down, facing the camera, plain grey wall, even soft light, no text", "aspect": "2:3", "megapixels": 8, "seed": 11}'

# lock a customer's face onto a clean reference
curl -X POST "$BASE/api/v1/director/images/reference" -H "Authorization: Bearer $PIXIO_API_KEY" -F "images=@customer.jpg" -F aspect=1:1 \
  -F megapixels=8 -F image_model=high \
  -F "prompt=Tight close-up portrait of exactly the same woman as in <Picture 1>, with exactly her face, features and skin from <Picture 1>, facing the camera, lips closed, plain studio wall"

# wardrobe change, everything else kept
curl -X POST "$BASE/api/v1/director/images/edit" -H "Authorization: Bearer $PIXIO_API_KEY" -F "image=@mara.png" \
  -F "prompt=Change her coat to a long red wool coat. Keep her face, hair, pose and the background exactly the same."
```

One character in many places: make the cast with text, lock the face from one picture, make the places with text,
then hero frames with face + place; check each face beside its reference.

## How many pictures each model takes

Live numbers: `GET /api/v1/director/catalog` (each endpoint's `files` list gives the `max` per field).

| where | pictures | notes |
|---|---|---|
| Montage Basic clip, film clip or music section | up to 9 | plus up to 3 videos and 3 voice samples on `/api/v1/director/videos/reference` |
| Film with `idea` | the pictures you send (Basic: up to 9) | every clip gets all of them |
| Film with your own `clips`, or music video, with `clip_images` | more uploads than one clip uses | each clip / section picks its own set (Basic: at most 9 per clip) |
| Montage Premium and Ultra | up to 30 per request | 6-9 a clip works best; more pictures can cost more, so check the `?check=true` quote |
| `/api/v1/director/images/reference` | 1-8 | 1-2 tested |

Premium follows pictures closely: give one per character plus a head close-up for each main character, each
location and the key props, but at most 4 people per take.

## Films: `cast` and `clip_images`

- **`cast`** binds pictures and voices to one person each (unique names; a picture or audio belongs to one
  person). Positions are 1-based in `images` and `ref_audios`:

  ```json
  [{"name": "Mara", "pictures": [1, 2], "audio": 1, "description": "the baker"},
   {"name": "Tom", "picture": 3, "audio": 2}]
  ```

  With `idea` the writer gets the exact bindings; with your own `clips` only missing definition lines are added.
  The writer, voice lock and the voice check follow it, so every line is spoken in the right voice.
- **`clip_images`** (your own `clips` only; with `idea` every clip gets all the pictures): each clip's pictures as a
  list of lists of 1-based positions in `images`, 1-9 each, e.g. `[[1,2,3],[1,2,4],[1,2,5,6],[1,2,7]]`. Keep the
  main characters in every clip and add that clip's place, crowd and props. Inside a clip `<Picture 1>` is the first
  of ITS list. A supplied picture no clip uses is reported as a warning in `promptCheck`: add it somewhere.
- Voices: `ref_audios` (0-3) bound by `cast` `audio`; with `idea`, `voices` names whose each is; `voice_lock: true`
  keeps voices the same without samples.
- A wrong clip: `POST /api/v1/director/videos/film/{id}/redo` (multipart) with `images` + `clip_images` adds a
  picture to just that clip; `POST /api/v1/director/videos/music/{id}/redo` works the same way for a section.
- `face_fix: "auto"` redraws faces that still drifted (billed per fixed section); `visual_qa: "local"` flags clones
  (billed per 15 s part). Both opt-in.

## Series: one cast for every episode

A series stores a named cast (person / place / thing, each with a picture and a voice). Each clip of an episode
gets up to 9 cast pictures and 3 voices: the members the episode's `idea` names first, then the regulars.

```bash
# add or change one member (matched by name); send only what changes
curl -X POST "$BASE/api/v1/director/series/SERIES_ID/cast" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F name=Mara -F "what=the night-shift nurse, navy scrubs, grey cardigan" -F kind=person \
  -F picture=@mara.png -F voice=@mara_voice.wav
```

- Make the series: `POST /api/v1/director/series` with `cast` (a JSON list of `{name, what, kind}`), then each
  member's `picture` and `voice` with the cast call above (or the simple way: `pictures` + `references`,
  `voice_samples` + `voices`). See it: `GET /api/v1/director/series/{id}`.
- Remove: `DELETE /api/v1/director/series/{id}/cast/{name}` (`?part=picture` or `?part=voice` for one part). Files:
  `GET /api/v1/director/series/{id}/cast/{name}/picture` and `/voice`.
- Name the members in the episode `idea`; that puts their pictures first. Add new characters with a picture before
  the episode; without a voice they get one by voice lock in their first episode. The writer may design a few
  newcomers per episode, who then join the cast.
- Make episode N+1 after episode N is done, so its recap (injuries, deaths, open threads) and voices exist.
  Details: references/montage/pixio-series-showrunner.md.

## Wardrobe and injury continuity

- Every word in a character description shows in every shot. "A small cut on his lower lip" gave a bloody mouth
  through a whole fight he was never hit in.
- Put an injury in a description only if it should always show. Otherwise write "mouth and lips clean and unhurt"
  and add the wound only in the shot where it happens, at a named spot.
- From that shot on the wound is part of the look: carry it into later clips, or make an
  `/api/v1/director/images/edit` version of the picture with the wound and use it from then on.
- A wardrobe change is a new picture (edit the old one), used from the clip where the change happens; never mix old
  and new outfit pictures in one clip.
- Give every prop a fixed place ("his crossbow slung on his back") and keep a room's layout the same in every shot.

## Writing references into prompts

| | Montage Basic | Montage Premium / Ultra |
|---|---|---|
| tags | `<Picture N>`, `<Audio N>`, `<Subject N>` | `@Image1`, `@Audio1`, `@Video1` |
| several pictures of one person | one subject, all its pictures bound to it | say they are the same person |
| anti-twin | "`<Subject N>` is the only person in the frame"; front-on two-shots, no over-the-shoulder | state there are no duplicate or twin characters |

Exact syntax: **references/montage/montage-basic-prompting.md** and
**references/montage/montage-premium-prompting.md**. Never mix the two tag styles in one prompt.

## Common failures

- Twins: one picture for two people, two subjects for one person, over-the-shoulder two-shots, mirrors.
- Clone crowds: write "every one a clearly different person: different ages, builds and hair", plain unmarked
  clothes, medium-wide shot.
- Face drift: the face worded in the prompt, the face too small (keep named people knees-up or closer), 3+ pictures
  in one image job.
- Posed action: "exactly as in `<Picture N>`" freezes action; use keyframes only for still moments.

Some techniques adapted from an open-source (MIT) community skills collection.
