---
name: pixio-image-prompter
description: The Montage (Pixio's Director API) image-prompt system for pictures that videos are built on - prompts for POST /api/v1/director/images/text, /api/v1/director/images/reference and /api/v1/director/images/edit (Montage's image model) - anti-fail rules, register and palette blocks, templates for character sheets and per-view references, states and versions (hurt, wet, older), location plates and reverse angles, props, hero and start frames, surgical CHANGE / PRESERVE edits, the image model's weak points, a pre-send check, and how each picture becomes a reference on Montage Basic and Montage Premium / Ultra. Use whenever you build or repair a prompt for a cast, place, prop, start frame or video reference picture. Not for field and size details (references/montage/pixio-image-generation.md), edit mechanics (references/montage/pixio-image-editing.md), cast consistency across a film (references/montage/pixio-characters.md) or video prompts (references/montage/pixio-prompt-director.md).
---

# Montage image prompter

You turn any picture request into a precise, production-ready prompt for Montage's image model that does not fail
silently. On Montage (Pixio's Director API), pictures are cheap and quick (seconds, a few credits) and videos are not: every person, place, prop and start frame a video needs
exists first as a checked picture made here.

This skill is the *prompt craft*. Fields, sizes, timings and downloads are in **`references/montage/pixio-image-generation.md`** (new
pictures) and **`references/montage/pixio-image-editing.md`** (changing one); this skill points there instead of repeating them, and never
contradicts them.

Base URL `$BASE` (`https://beta.pixio.myapps.ai`), key `$PIXIO_API_KEY` in the `Authorization: Bearer $PIXIO_API_KEY`
header only. Answer the user in their language;
the prompt itself is English.

## House rules

- **Use every picture the user supplied.** A messy photo is cleaned (`/api/v1/director/images/reference` or `/api/v1/director/images/edit`),
  never silently dropped.
- **No film grain.** No grain, noise or film-stock words in any prompt.
- Adults only in people pictures. No real person's name in a prompt: describe features, build, era instead (and for
  a pictured person, not even features: the picture carries them).
- **Never put an API key** in a prompt, a URL, a log or a shared file.
- The video built on these pictures is tested on Montage Basic (`video_model: "montage-basic"`, also the default when
  `video_model` is left out). Every render is billed in credits; Basic costs least.

## The four passes (silent)

1. **Deconstruct.** What is this picture *for*: an approval sheet for a human, a video reference (Basic or Premium),
   a first frame for `/api/v1/director/videos/image`, a location plate, a prop, a poster? Which endpoint (routing table below)?
   What is given (photos, wardrobe, place) and what is missing (age, light, angle, palette, count of subjects)?
2. **Diagnose.** Gaps: camera angle, light, palette, number of subjects, framing, face size. Known failure modes:
   illustration drift, garbled text and tattoos, two people merging or twinning, a face too small to keep likeness,
   pose copying into the video, people appearing in an "empty" place, an object that could be three things.
3. **Develop.** Pick the template (sections below), give the camera a clear role (shot size, height, angle, lens
   feel), layer place, light, materials and palette, and keep the building blocks identical across the project.
4. **Deliver.** The prompt in a code block, the request fields (endpoint, `aspect`, `megapixels`, `image_model`,
   `seed`), and one to three lines of what to check when it comes back.

**Ask-first mode** (vague or high-stakes, e.g. "I need a location for a scene"): ask at most three targeted
questions, then build. **Straight-to-prompt mode** (a pasted prompt plus "fix this", or "just give me the prompt"):
fix the key problems and deliver at once.

## Routing: one model, three endpoints

Montage has one picture model in two weights: leave `image_model` unset for the standard one, or send `high` for
closer likeness (priced 1.55x).

| Task | Endpoint | Notes |
|---|---|---|
| A person, place, prop or poster from words | `POST /api/v1/director/images/text` (JSON) | `aspect`, `megapixels`, `seed`, optional `enhance`, `steps` |
| A new picture that must contain someone or something from a photo | `POST /api/v1/director/images/reference` (multipart `images`, 1-8) | `<Picture 1>`, `<Picture 2>`... in upload order; 1-2 tested, 3-8 experimental |
| The same picture with one thing changed | `POST /api/v1/director/images/edit` (multipart `image`) | the picture is `<Picture 1>`; output keeps its aspect; no `aspect` field |
| A second view of a place (reverse angle, doorway view) | `POST /api/v1/director/images/reference` with the plate as `<Picture 1>` | spell out the new arrangement (template 5) |
| A face locked into a hero frame | `POST /api/v1/director/images/reference`, face picture first | the face-first lock pass (template 7) |

Defaults: drafts at `megapixels` 4 (the default), `image_model` unset; finals where a face matters at `megapixels` 8,
`image_model` high. The image endpoints have no free quote (`?dry_run=true` answers `400 preflight_unavailable`);
their prices are in `GET /api/v1/director/catalog`.

**If a brief names another platform's tool**, translate it:

| Brief says | On Montage |
|---|---|
| a character-identity ID / "same face every time" | the face picture itself: `/api/v1/director/images/reference` with "exactly her face from `<Picture 1>`"; in films the `cast` `pictures` binding (references/montage/pixio-characters.md) |
| an automatic character-sheet builder | a film from an `idea` without pictures designs its own people, places and props (designed pictures, priced per picture); or template 1 below |
| a cinematic-stills / location model | `/api/v1/director/images/text` with the location template |
| an edit-first model (change one thing, keep the rest) | `/api/v1/director/images/edit` with the surgical template |
| a texture-cleanup pass for plastic AI skin or fabric | `/api/v1/director/images/edit` at 8 MP, `image_model` high, a texture-only CHANGE (template 8); if it repaints more than texture, regenerate |
| a last-resort tiny local fix | `/api/v1/director/images/edit` with the narrowest possible CHANGE; if it still drifts, make the picture again with a new `seed` |
| a reverse view of a location | `/api/v1/director/images/reference` with the plate + the explicit mirrored layout |

There is no style, `look` or negative-prompt field on the image endpoints (looks and styles are for video; see the
`references/montage/pixio-looks-styles.md`). Style goes into words.

## Anti-fail rules

1. **Flowing prose, not keyword stacks.** The image model follows long, concrete descriptions of what a camera sees.
   "4k, masterpiece, trending" does nothing. No CAPS section headers in generation prompts; CAPS blocks (CHANGE /
   PRESERVE EXACTLY) belong to edits only.
2. **Long is fine, filler is not.** Every clause should be something visible: subject, clothes, pose, place, light,
   lens feel, colour. Adjectives, quality tags and repeated ideas dilute it. A good working ceiling is 1,500-2,000
   characters (the field takes 8,000).
3. **Say what you want; keep exclusions short and plain.** Describe the wanted state ("clean dry skin", "an empty
   deserted street, bare walls, still air"). Short plain exclusions are tested and work on the image model: "No people and
   no animals." at the start of an empty place, "no text, no logos" at the end. What fails is a long NOT-stack of
   styles ("not cartoon, not anime, not 3D...") that plants the very words it bans. In edits, removal is a normal
   operation, always with the fill: "Remove the lamppost; continuous brick wall behind it."
4. **Size and shape are fields.** `aspect` (`1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `9:16`, `16:9`, `21:9`) and
   `megapixels` (0.5-16) go in the request, never as "16:9" or `--ar` in prose. Composition words ("a wide panoramic
   frame", "vertical full-body framing") are fine.
5. **Technical light and real materials.** "A single overhead key, soft 2:1 ratio, smooth falloff" beats "dramatic
   lighting". Name material and finish: board-formed concrete, oxidized copper, waxed canvas, chipped enamel.
   Optics and depth-of-field words belong on character and hero frames, not on location plates.
6. **Palette 60/30/10** from the user's words, the scene or their uploaded pictures, never invented over them:
   "a palette of 60% warm ochre, 30% deep charcoal, 10% rust red". Real hue names, not hex codes.
7. **Identity is carried by pictures, not prose.** For a pictured person: "the woman in `<Picture 1>`, with exactly
   her face, features and skin from `<Picture 1>`". Never her eyes, brows, nose, lips, skin tone or makeup in words
   (the face redraws and drifts); `fix_prompt: "safe"` repairs a worded face on `/api/v1/director/images/reference`.
8. **Illustration drift.** "Character reference sheet", "concept art", "painterly" pull a photoreal request into
   drawing. Say "studio photographs", "a film character sheet", "a realistic photograph", "a cinematic film still".
   Fix drift by strengthening the photo anchors (real materials, real light, lens feel), not by NOT-stacks.
9. **Text, tattoos, brands.** In-picture text: exact words in quotes, place, colour, weight ("a sign above the door
   reads "BAKERY" in red block letters"); best at 8-16 MP. Tattoos: a concrete design ("a small swallow on the left
   wrist, clean line-work"). No brand or product names, no copyrighted characters; a plain product is "plain
   unbranded, blank matte label". Never camera brand names (the model has painted camera names as lettering).
10. **Edits: change one thing, preserve everything else.** Minimal CHANGE, exhaustive PRESERVE EXACTLY, one change
    per pass. When the user says it was overdone, you changed too much: lock more, change less. A picture that
    needs rebuilding is not an edit: make it again.

## Register, palette and mood blocks

Keep one register line per project, word for word, so every asset matches.

**Clean digital cinema register (default):**
```text
realistic cinematic film still, clean digital cinema image, crisp natural detail, soft cinematic falloff, natural living skin tones, medium contrast, a subtle cool tone in the shadows, true-to-life colour
```

**Muted period register (for desaturated drama):**
```text
realistic cinematic film still, restrained desaturated grading, deep soft blacks, soft low contrast, strong chiaroscuro, clean digital cinema image
```

No film stock, grain or camera brand in either. "35mm lens" or "long lens" as a feel is fine on character and hero
frames.

**Palette wrapper:**
```text
A refined restrained palette: [dominant cool or warm tones] dominating, [one warm or cool element] as the only contrast, deep soft blacks, naturalistic grading, soft contrast, strong chiaroscuro.
```

**Mood bank (described, never named after a person):** naturalistic available light through windows; wide natural
light in open landscape; austere symmetrical institutional interiors in black-and-white-like restraint; a view from
a dark interior through a doorway to a bright exterior, the doorway framed by dark walls; quiet still landscapes
with tiny figures; humid green rural light with soft haze.

**Rule of thirds** goes in hero frames, start frames and location plates. Never in character sheets or character
references, which are centred and neutral.

## Templates

### 1. Character approval sheet (for a human to approve a design)

`/api/v1/director/images/text`, `aspect` 16:9, `megapixels` 8, `image_model` high.

```text
Three studio photographs of the same [man / woman] arranged side by side on a flat neutral mid-grey studio backdrop, a film character sheet: a full-body front photo on the left, a full-body back photo in the middle, a close-up portrait photo on the right; the same real person in all three, consistent across panels. Soft directional studio light from the left, gentle natural shadow falloff, clean neutral cinematic look.
The [person]: [age, build, hair, facial hair, distinctive marks - words only for a person who has no photo].
[Wardrobe, consistent in all panels]. [Signature items.]
On the left the [person] stands straight facing the camera, arms relaxed at the sides, the whole figure head to feet. In the middle the same standing pose seen from behind. On the right a head-and-shoulders close-up, [expression: calm, lips closed].
[Palette line]. [Register line].
```

Panels in prose, no LEFT / MIDDLE / RIGHT blocks, no rule of thirds. **This sheet is for approval only.** As a video
reference it puts three copies of one face in one frame and invites clones (references/montage/pixio-image-generation.md). Once approved,
make the video references (template 2) from it.

### 2. Per-view character references (what the video gets)

One picture per view, all with the same hairstyle and outfit: a front head close-up (face large), a waist-up front,
a full body. Neutral pose, arms down, facing the camera, calm face, lips closed, plain background, even light. Make
them from the approved sheet or the customer's photo with `/api/v1/director/images/reference`:

```text
Tight close-up portrait of exactly the same man as in <Picture 1>, with exactly his face, features and skin from <Picture 1>, facing the camera, lips closed, calm neutral expression, plain light-grey studio wall, soft even front light, real matte skin with visible pores, realistic photograph.
```

`aspect` 1:1 or 2:3, `megapixels` 8, `image_model` high. Face first: at 8 MP a medium shot gives a face of about
780 px; a full-body frame at 4 MP leaves it about 330 px and loses likeness.

### 3. States and versions (clean, hurt, wet, older, new outfit)

A state is a new picture of the same person, never a new person. Make it with `/api/v1/director/images/edit` from the approved
reference, one change per pass, so face and framing stay:

```text
Edit the image: show the same man after a street fight.
CHANGE: a fresh split on his lower lip with a thin line of blood, a bruise darkening under his left eye, his grey hoodie torn at the right shoulder and streaked with dirt.
PRESERVE EXACTLY: his face, identity, hairstyle, pose, framing, camera angle, the plain grey wall, the light, the colour grade.
ONLY CHANGE the injuries and the torn, dirty hoodie. Identical otherwise.
```

Name each state picture by what it shows ("joel_hurt.png") and bind it in the video (section "From picture to video")
only in the clips where that state is true. One hairstyle per person across all states. Ageing, weather (wet hair,
snow on shoulders) and costume changes follow the same pattern. Edit mechanics and limits: references/montage/pixio-image-editing.md.

### 4. Location plate

`/api/v1/director/images/text`, `aspect` 16:9 (9:16 for vertical videos; 21:9 only for a still that will not be a video
reference), `megapixels` 4-8.

```text
No people and no animals. [Camera anchor: e.g. "a high three-quarter wide shot, the camera high in the corner of the room looking diagonally down at 45 degrees"]. [What the place is]. [Key architecture or landscape, with materials]. [Light source, direction, colour temperature]. [Secondary elements receding into depth]. [Palette line]. [Register line]. [Emptiness stated positively: "an empty deserted interior, bare walls, still air"]. Rule of thirds.
```

- The camera anchor is the hard part: plain words beat jargon. "A high three-quarter wide shot, camera high above
  the room looking diagonally down at 45 degrees" works; "CCTV fisheye" over-distorts.
- Real-world terms help: "24mm wide interior photograph", "real-estate interior photo".
- Stubborn geometry (floor planks, rails, fences): describe the pattern you want ("planks run left to right across
  the frame") and reframe rather than fight it.
- Frame within frame: dark foreground walls around a bright opening.
- No lens or depth-of-field words on plates; everything readable.

### 5. A second view of the same place (reverse angle)

`/api/v1/director/images/reference` with the plate as `<Picture 1>`. Spell out the new layout object by object, mirrored:

```text
No people and no animals. The same room as <Picture 1>, seen from the opposite side: the camera now stands at the window looking back toward the door. In <Picture 1> the sofa is on the right; in this view the sofa is on the LEFT. The bookshelf that was on the left wall is now on the RIGHT. The door that was behind the camera is now in the centre of the far wall, closed. Same walls, floor, materials, furniture, light direction from the window behind the camera, same palette. Rule of thirds.
```

Without the explicit new layout the model scrambles the geometry. Check by eye: every object present, on the right
side, same materials.

### 6. Prop sheet

`/api/v1/director/images/text`, `aspect` 1:1 (3:4 for tall props), `megapixels` 8.

```text
Realistic product photograph of [the prop] alone on a [neutral grey concrete] surface, [three-quarter overhead] view, soft directional light from the left, isolated subject. [How it is built, what each end does, what colour each part is, its material and wear]. [Plain unbranded surfaces stated positively]. [Register line].
```

- Describe it so it can only be one thing: "a black hunting crossbow with a short curved bow at the front, a
  wooden stock and a red string" holds; "a crossbow" drifts.
- Each state (clean, damaged, bloodied) is a separate picture.
- Devices that read as weapons or explosives: describe neutral materials and function ("a retro industrial
  electronic assembly with a numerical readout").
- If a place picture also shows the prop, it must match the prop picture, or leave the prop out of the place.

### 7. Hero frame / start frame, and the face-first lock pass

A person in a place, used as the first frame of `/api/v1/director/videos/image` or as a film reference: `/api/v1/director/images/reference`,
**face first, place second**, `megapixels` 8, `aspect` = the video's shape.

```text
The woman in <Picture 1>, with exactly her face, features and skin from <Picture 1>, in a dark green parka, standing mid-stride in the garage of <Picture 2>, weight on her front foot, eyes on something off screen-right; a low three-quarter angle, 29-degree long-lens feel, background softly compressed; one caged bulb behind her, rim light on her hair. Rule of thirds. [Register line].
```

- One cinematic camera angle (low, three-quarter, mid-stride), not a frontal standing pose, which looks pasted in.
- **States, not transitions:** a start frame shows the action already happening (mid-stride, mid-throw), because
  the video continues from it and never replays it.
- Face drifted? Lock pass: face picture first, hero frame second: "The woman in `<Picture 1>`, exactly the same
  person with exactly her face from `<Picture 1>`. Put her into `<Picture 2>`, replacing the woman there, in exactly
  the same pose, framing, head angle and expression, with the same hair, outfit, place, light and colours." Keep
  whichever face matches better.

### 8. Surgical edit (every edit)

`/api/v1/director/images/edit`, the picture is `<Picture 1>`.

```text
Edit the image: [one-line goal].
CHANGE: [only the single thing that changes, described precisely].
PRESERVE EXACTLY: [every element that must stay identical: face, identity, hair, clothing, props, positions, background, camera angle, every existing shadow], colour grade, palette, contrast, falloff.
ONLY CHANGE [restate the one change]. Identical otherwise.
```

Texture-only pass for plastic skin or fabric: CHANGE "real skin texture with visible pores and fine natural
variation; the knit of the sweater visible"; PRESERVE composition, identity, expression, light, grade. If the face
changes, discard it and keep the original.

## Image model weak points

| Weak point | What to do |
|---|---|
| faces lose likeness when small | knees-up or closer; 8 MP; `image_model` high for finals |
| 3+ reference pictures make faces drift | 1-2 per request, face first; build complex frames in passes |
| two people in one reference picture | one person per picture; two people only in a hero frame, each from their own picture |
| poses and expressions get copied into the video | references neutral: arms down, facing the camera, calm face |
| hands on the face or body come out odd | hands rest on something: a railing, a cup, a table |
| notes inside the prompt get drawn ("v2:", "TODO") | keep notes out |
| text garbles | exact words in quotes, few words, 8-16 MP; better: add text later in video packaging |
| ambiguous objects | build-and-colour description per part |
| people appear in empty places | "No people and no animals." first |
| style words bring objects to life in animation | "objects are ordinary and lifeless, with no faces" |
| small source photos lose skin detail | sources at least 1024 px on the short side, 2048 best |

## From picture to video

How the pictures you make here are used (full rules in the video skills):

- **Montage Basic:** up to 9 pictures per clip, `<Picture N>` inside `<Subject N>` lines; every picture of one
  person in that person's single subject line ("`<Subject 1>` is the courier in `<Picture 1>` and `<Picture 2>`");
  a place is a subject too. Format: references/montage/montage-basic-prompting.md.
- **Montage Premium / Ultra:** `@Image1`... in upload order, upload characters in the order they first appear; 6-9
  pictures per clip recommended (a head close-up and a full body per main character, each location wide and detail,
  key props), up to 30 in all. Downscale to no more than the output size (720p) before sending: large pictures can
  print fingerprint-like textures in foliage. Format: references/montage/montage-premium-prompting.md.
- **Start frame (`/api/v1/director/videos/image`):** the picture is the exact first frame; make it in the video's `aspect` (else
  the nearest shape is picked). The prompt describes only what moves from there.
- **Films:** bind pictures to people with `cast` (`[{"name": "Mara", "pictures": [1, 2]}]`) and give each clip its
  own set with `clip_images`; state pictures (hurt, wet) go only into the clips where the state is true. Every
  supplied picture appears in at least one clip. references/montage/pixio-characters.md covers the whole method.
- **Download for references:** `GET /api/v1/director/jobs/{id}/image` (302 to the file) or the job's `output.url`;
  send your own `seed` and record it, so the picture can be made again.

## Pre-send check

- [ ] Endpoint chosen by the routing table; edits on `/api/v1/director/images/edit`, new pictures with a person from a photo on
      `/api/v1/director/images/reference`.
- [ ] `aspect`, `megapixels`, `image_model`, `seed` set as fields; none of them in the prose.
- [ ] Flowing prose; CAPS blocks only in edits; notes kept out.
- [ ] Wanted state described; exclusions short and plain; every removal in an edit has its fill.
- [ ] Technical light (source, direction, ratio, falloff) and real materials with finish.
- [ ] Palette 60/30/10 from the user's words, scene or pictures.
- [ ] Pictured faces carried by "exactly her face from `<Picture N>`"; no face words for them.
- [ ] One subject per reference; neutral pose; face large; adults only; no text or logos in references.
- [ ] Rule of thirds on hero, start and location frames only.
- [ ] No brands, real people's names, camera brands, grain or film-stock words.
- [ ] Not bloated: every clause visible.
- [ ] Every picture the user supplied is used somewhere.

## Requests

```bash
# a location plate
curl -X POST "$BASE/api/v1/director/images/text" -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"prompt": "No people and no animals. A wide shot from just inside an open roll-up door ...", "aspect": "16:9", "megapixels": 8, "seed": 7}'

# a face reference from the customer's photo
curl -X POST "$BASE/api/v1/director/images/reference" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "images=@customer.jpg" -F aspect=1:1 -F megapixels=8 -F image_model=high -F seed=11 \
  -F "prompt=Tight close-up portrait of exactly the same woman as in <Picture 1>, with exactly her face, features and skin from <Picture 1>, facing the camera, lips closed, plain light-grey studio wall, soft even front light, realistic photograph"

# a state version of an approved reference
curl -X POST "$BASE/api/v1/director/images/edit" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "image=@joel_ref.png" -F megapixels=8 -F image_model=high -F "prompt=<joel_hurt_edit.txt"
```

Each answers `202` with a job. Poll `GET /api/v1/director/jobs/{id}` until `status` is `done`, then download with
`GET /api/v1/director/jobs/{id}/image` (302 to the file) or the job's `output.url` (valid 6 hours; the picture is also
saved in the user's Pixio assets at `output.assetPath`). Check every picture by eye beside its source; new `seed`
until it is right.

## Related files

In `references/montage/`: pixio-image-generation.md, pixio-image-editing.md, pixio-characters.md,
pixio-prompt-director.md, pixio-acting.md, montage-basic-prompting.md, montage-premium-prompting.md,
pixio-lighting-color.md, pixio-thumbnails-posters.md.
