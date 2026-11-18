---
name: pixio-image-editing
description: How to change an existing picture on Montage (Pixio's Director API) with POST /api/v1/director/images/edit (Montage's image model, one picture plus an instruction) - what it changes well, how to keep the face and everything else the same, size and aspect rules, image_model, enhance, and how to make variants of one reference for video continuity (outfit changes, wounds and blood, dirt, age, props, removing text or a background) - plus when to use /api/v1/director/images/reference instead. Use whenever you change, clean up or make a variant of a picture, or need a "later" version of a character reference. Not for making a new picture from scratch (that is pixio-image-generation) and not for editing a video (Montage Edit, see montage-edit-prompting and pixio-video-editing).
---

# Editing pictures with Montage's image model

`POST /api/v1/director/images/edit` takes ONE picture and an instruction, and gives back the same picture with that change. The
uploaded picture is `<Picture 1>`. The instruction goes to the model exactly as written, so the instruction is the
whole job: say what changes, and say what must stay.

## House rules

- **Test on Montage Basic.** Every video test, draft or trial render runs on `video_model: "montage-basic"` (also
  what you get when `video_model` is left out). Montage Premium or Ultra only when the user asks for it and has seen
  the quote (`?check=true`, `credits.quoted`). Every call is billed in Pixio credits, image edits included.
- **The customer's own song first.** A music video uses the song the user gave you (`song`). `POST /api/v1/director/music/generate`
  is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `videos/finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE`
  (`https://beta.pixio.myapps.ai`) and `$PIXIO_API_KEY`.

## Decision rules (read first)

| You want | Use |
|---|---|
| Same picture, same framing, one thing different (coat colour, a wound, glasses off, text removed) | `/api/v1/director/images/edit` |
| The same person in a different pose, place or framing | `/api/v1/director/images/reference` with that picture (see `references/montage/pixio-image-generation.md`) |
| A messy customer photo turned into a clean reference (plain wall, neutral pose) | `/api/v1/director/images/reference` ("Close portrait of exactly the same woman as in `<Picture 1>` ... plain grey wall"; never write "studio", it puts a studio in frame) |
| Two pictures combined (a person put into a place) | `/api/v1/director/images/reference` with 2 pictures, face first |
| A change in a finished video | Montage Edit `POST /api/v1/director/videos/edit` (see `references/montage/montage-edit-prompting.md`, `references/montage/pixio-video-editing.md`) |

- Edit is for changes that keep the composition. Asking it for a new pose or a new camera angle fights the input;
  reference mode is built for that.
- One change (or one closely linked group of changes) per edit. For two unrelated changes, run two edits in a row,
  checking each result. A long list of changes tends to change things you did not ask for.
- The original picture is never touched; every edit is a new job with its own picture.
- A customer's photo you edited still counts as their picture: use the edited version in the video and keep the
  original too if the video needs it.
- One state per picture: clean, soaked and hurt are three pictures, each made by editing only what changed.

## Fields (multipart)

| field | values | default | notes |
|---|---|---|---|
| `image` | one file (or a URL / your own Pixio asset path) | required | `<Picture 1>` in the instruction |
| `prompt` | up to 8,000 characters | required | the instruction, passed as written |
| `megapixels` | 0.5-16 | 4 | output keeps the picture's own aspect; priced by size; above 8 MP is experimental |
| `seed` | integer | random | new seed = a new try of the same edit |
| `steps` | sampling steps | 6 | leave it; more costs more in proportion |
| `image_model` | `high`, or leave unset | standard | `high` (the higher-quality image model, priced 1.55x) kept faces closer in tests and takes longer |
| `enhance` | true / false | false | a small writer rewrites a short instruction first (+~30 s). Off for careful edits: you want your exact words |
| `exif_rotate` | true / false | true | phone photos turned upright first |

There is no `aspect` on edit: the output has the input's shape, scaled to `megapixels` and rounded down to a
multiple of 32 px. To change the shape, edit first, then make a new framing with `/api/v1/director/images/reference`.
There is no `fix_prompt` on edit; keep face words out yourself.

Typical times: 4 MP ~20 s, 8 MP ~27 s. There is no free quote on image endpoints (`?check=true` / `?dry_run=true`
answer `400 preflight_unavailable`); the price per megapixel is in `GET /api/v1/director/catalog`.

## Writing the instruction

Shape: **verb + the thing + the new state. Keep + the list of things that must not move.**

```text
Change her coat to a long red wool coat. Keep her face, hair, pose and the background exactly the same.
```

Rules:
- Start with a clear verb: Change, Replace, Remove, Add, Make.
- Point at the thing so it can only be one thing: "the mug in his right hand", "the sign above the door", "the
  jacket she is wearing", not "it" or "the object".
- Describe the new state concretely: colour, material, length, where exactly. "A shallow cut on the left cheekbone,
  a thin line of dried blood" beats "injured".
- Always end with a keep sentence naming face, hair, pose, background, light, and anything else at risk.
- Do not describe the face you are keeping. "Keep her face exactly the same" is enough; listing her features
  invites the model to redraw them.
- Keep it short. Two or three sentences. Extra description becomes extra change.

```text
Bad:  Make him look like he has been in a fight, more dramatic and gritty, cinematic.
Good: Add a fresh bruise under his left eye and a small cut on the left eyebrow with a little dried blood. Keep his
      face, hair, clothes, pose, the background and the light exactly the same.
```

```text
Bad:  Remove the text.
Good: Remove the white caption text across the bottom of the picture and fill that area with the same grey wall.
      Keep the woman, her clothes and pose exactly the same.
```

```text
Bad:  Change the outfit and the background and make it night and give her a sword.
Good (edit 1): Change her clothes to a dark leather travelling cloak over a grey linen shirt. Keep her face, hair,
               pose and the background exactly the same.
Good (edit 2, on edit 1's picture): Put a plain steel sword in a brown leather scabbard on her left hip. Keep
               everything else exactly the same.
```

To chain edits, send edit 1's finished picture as the next `image`: its URL from `output.url`, or its durable
`output.assetPath` (a path in your own Pixio assets).

## What edit does well

- Clothing: colour, material, a different garment, adding or removing a jacket, hat or glasses.
- Marks on a person: wounds, blood, bruises, dirt, soot, sweat, rain-wet hair, torn sleeves.
- Props: swap, add or remove one object in a hand or on a table.
- Clean-up: remove text, captions, logos, a watermark-like stamp, a stray object or a person in the background.
- Background: replace a busy background with a plain grey wall (the subject stays put). This is the quickest way to
  turn a customer's snapshot into a usable reference when the pose is already neutral. Also take out anything
  the person holds (a reference should have empty hands; a prop is its own picture) and any rim light or
  backlight ("soft even light from the front"): both get copied into every shot.
- Colour and light of the whole picture: "make it a cold blue night", "warm sunset light from the left".

What it is weaker at (use reference mode or a new picture instead): a new pose, a new camera angle, moving a person
in the frame, adding a second full person, changing the shape of the picture.

## Variants of one reference for video continuity

The video model copies what the reference shows. So a story change (new outfit, a wound, getting older, getting
dirty) is a new picture, used from the clip where the change happens. Rules from
`references/montage/pixio-characters.md` apply: never mix the old and new versions of one person in the same clip.

Make each variant from the approved base picture (not from the previous variant), unless the change builds on the
last one (a wound that gets worse). This stops small drifts piling up.

| variant | instruction pattern |
|---|---|
| outfit change | "Change his clothes to X. Keep his face, hair, pose and the background exactly the same." |
| wound appears | "Add X at Y (exact side and spot). Keep everything else exactly the same." Then use it only from the clip where the hit lands |
| clean -> dirty | "Cover his face, hands and shirt with dust and dry mud after a long walk. Keep his face shape, hair, clothes, pose and background the same." |
| night version of a place | "Make it night: the sky dark blue, the street lamps on, wet ground reflecting them. Keep every building and the layout exactly the same." |
| older or younger | "Make him look about 20 years older: grey hair at the temples, lines around the eyes. Keep his face shape, pose, clothes and the background the same." Check the likeness by eye; age changes move the face more than any other edit |
| text removed from a product shot | "Remove all printed text from the label and leave it plain white. Keep the bottle shape, colour, light and background exactly the same." |

Wounds: name the side and spot, and say what stays clean ("his mouth and lips clean and unhurt"). A wound that
should not show in early clips must not be in their reference picture.

```bash
BASE=https://beta.pixio.myapps.ai
# base reference -> "after the fight" variant for clips 5-8
curl -X POST "$BASE/api/v1/director/images/edit" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "image=@kane_base.png" -F megapixels=8 -F image_model=high \
  --form-string "prompt=Add a fresh cut across his right cheekbone with a thin line of dried blood running down to the jaw, and dust on his shoulders. His mouth and lips stay clean and unhurt. Keep his face, hair, clothes, pose, the background and the light exactly the same."
```

Then give the film both pictures and choose per clip with `clip_images` (base picture in clips 1-4, wounded one in
5-8). See `references/montage/pixio-characters.md` and `references/montage/pixio-film.md`.

## Checking an edit

Poll `GET /api/v1/director/jobs/{id}` until `done`, download it (`GET /api/v1/director/jobs/{id}/image`, a redirect to
the finished file) and put it beside the input:
- Did exactly the asked thing change, and nothing else? Look at the face, the hands, the background edges.
- Is the face still the same person? If it drifted: same instruction with a new `seed`, then `image_model=high`, then
  a shorter instruction. If it still drifts, make the change with `/api/v1/director/images/reference` instead and do a face-first
  lock pass (`references/montage/pixio-image-generation.md`).
- Any new garbled text or extra fingers? Edit again with "Remove ..." or retry with a new seed.
- Check the size you got against what you asked for (above 8 MP is experimental).

## Request example: a plain-background reference from a snapshot

```bash
curl -X POST "$BASE/api/v1/director/images/edit" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "image=@customer_snapshot.jpg" -F megapixels=8 -F image_model=high \
  --form-string "prompt=Replace the background behind the man with a plain light grey wall and soft even light. Keep the man, his face, hair, clothes and pose exactly the same."
```

When you are unsure of the result, try it cheaply first at the default 4 MP with the standard model, check it, then
run the final at `megapixels=8` with `image_model=high`:

```bash
curl -X POST "$BASE/api/v1/director/images/edit" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "image=@customer_snapshot.jpg" \
  --form-string "prompt=Replace the background behind the man with a plain light grey wall. Keep the man exactly the same."
```

## Checklist

- [ ] Edit (not reference) is right: same framing, one change.
- [ ] Instruction = verb + exact thing + new state + a keep sentence. Two or three sentences.
- [ ] No face features described; no grain or noise words; `enhance` off for exact edits.
- [ ] One change per edit; chain edits for more, checking each.
- [ ] Variants made from the approved base picture; wounds with an exact side and spot.
- [ ] Result checked beside the input for drift; new seed or `image_model=high` if needed.
- [ ] Variants mapped to the right clips (`clip_images`); old and new never in one clip.
- [ ] The customer's original picture still used where the story needs it.
