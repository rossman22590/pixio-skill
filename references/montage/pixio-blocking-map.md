---
name: pixio-blocking-map
description: The Montage (Pixio's Director API) staging-reference method - a colour-coded outline drawing (a blocking map) made with POST /api/v1/director/images/edit or /api/v1/director/images/text and sent as one extra reference picture to POST /api/v1/director/videos/reference (or a film clip) so every person lands where you planned, facing the right way - figures bound to letters in the prompt text only, geometry only with no style bleed, on Montage Premium / Ultra (video_model montage-premium or montage-ultra, @ImageN) and as a test-first experiment on Montage Basic (montage-basic, <Picture N>). Use whenever a user attaches a frame and asks for a blocking map or staging reference, a clip needs exact multi-person staging (who stands where, facing which way), people swap places or seats between shot sizes, or you plan a movement, camera or trajectory path. Not for writing the rest of the clip prompt (references/montage/pixio-prompt-director.md), picture prompts in general (references/montage/pixio-image-prompter.md) or storyboards (references/montage/pixio-storyboarding.md).
---

# Montage blocking map

A **staging reference** (blocking map) is a deliberately simple, colour-coded **outline drawing** sent to the video
model next to the real character and place pictures. It tells the model **who is where** and nothing else: position,
pose, facing direction, crop. It carries as much geometry and as little style as possible, because style bleeding
from the drawing into the shot is the method's one known enemy.

Base URL `$BASE` (`https://beta.pixio.myapps.ai`), key `$PIXIO_API_KEY` in the `Authorization: Bearer` header only.

## House rules

- **Test on Basic.** Every test, draft or trial render runs on Montage Basic (`video_model=montage-basic`, or leave
  `video_model` out: v1 then renders on Basic). Every render is billed in Pixio credits, Basic included, but Basic is
  the cheapest place to find staging mistakes. Premium or Ultra only when the user asks for it, after they have seen
  `credits.quoted` from a free `?check=true` and said yes.
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.

The map is **your** picture, not the user's: it never takes a slot from a supplied picture. If the clip has no room
for it (Basic: 9 pictures per clip; Premium and Ultra: up to 30 per request, with 6-9 a clip working best), leave the
map out and stage in words (`references/montage/pixio-prompt-director.md`, section 5).

## Status: where this method is proven

- **Developed on premium-class video models.** On Montage Premium and Ultra it is the expected use, but it is **not
  yet measured on Montage**: compare one clip with the map against the same clip with text blocking only before
  relying on it for a whole film.
- **Montage Basic is an experiment. Test it on Basic first** (`video_model=montage-basic`, `speed=draft`). The known
  Basic rule: given a grid, contact sheet or labelled storyboard as a reference, **Montage Basic copies the panels,
  labels and arrows into the video**. A schematic drawing can be copied the same way: white background, outlines,
  coloured figures. Basic also follows written, time-coded staging well, so on Basic text blocking is the default and
  the map is only for staging that words did not fix. If any drawn line, white field or figure colour shows up in the
  Basic draft, drop the map from that clip.

## Why it looks the way it does: three layers against bleed

Bleed has three feeds. Close all three.

1. **The picture.** Figures are thin, muted-colour **outlines**: no fills, no colour blocks, no shading. Line work
   reads as a plan; big flat colour fields read as a look. The grid is very faint: it is an authoring tool for paths
   (Extensions), not a signal to the model.
2. **The words.** The video prompt is written in **positive form** and never names the drawing's graphic style, not
   even to ban it. "No flat illustration, no vector shapes, no grid" still puts *flat, vector, grid* into the prompt
   and primes the very look you are refusing. The video prompt only says where style *does* come from: the place and
   character pictures. Graphic words exist in exactly one place: the drawing's own image prompt, which never reaches
   the video.
3. **The order.** The map is uploaded **last**, after every character and place picture, so the photographs win the
   style vote. This also keeps the Premium rule "characters in the order they first appear" intact.

## The workflow: two steps, in order

**Step 1: the user gives a frame (or describes one) -> you deliver the drawing prompt.** Deliver together:
1. the **image prompt** for the drawing (templates below) and the request;
2. the **file names** to give the result and the source frame (naming below);
3. a **one-line colour key**: what each colour is in the source frame ("BLUE = the captive soldier, centre
   foreground; ORANGE = the officer, screen-right, standing").

Translate every person's position, pose, facing direction, crop and anchoring furniture into explicit words: the
words carry the staging, the source picture pins the outline. Do not move to step 2 until asked: drawing first.

**Step 2: when asked -> you deliver the connector** (templates below), where the user binds each letter to their own
character. Letters exist only in the prompt; the drawing carries only colours.

## Step 1: making the drawing

| You have | Endpoint | Notes |
|---|---|---|
| A frame in the video's shape (16:9, 9:16 or 1:1) | `POST /api/v1/director/images/edit` | the frame is the one `image` file (`<Picture 1>`); the output keeps its shape (no `aspect` field) |
| A frame in another shape | `POST /api/v1/director/images/reference` | the frame as `<Picture 1>` in `images`, `aspect` = the video's shape |
| No frame, only a plan | `POST /api/v1/director/images/text` | every figure described in words; `aspect` = the video's shape |

Video shapes on Montage are `16:9`, `9:16` and `1:1`: make the map in the shape of the video it steers. `megapixels`
4 (the default) is plenty, since a map has no fine detail; on Premium and Ultra downscale it to no more than the
video's `resolution` (720p at most) before the upload. Every image call is billed in Pixio credits
(`GET /api/v1/director/catalog` has the prices). Montage's image-model rules apply
(`references/montage/pixio-image-prompter.md`): flowing prose, size and shape as fields, short plain exclusions only,
no `--flags`, no camera or brand names. A conversion from photo to drawing is a full repaint, not a surgical edit, and
is not yet measured on Montage: check every result by eye beside its source.

**Template A: from a frame (`/api/v1/director/images/edit`, or `/api/v1/director/images/reference` with the frame as `<Picture 1>`):**

```text
Edit the image: redraw it as a simple staging plan for a film scene.
CHANGE: the whole look becomes a minimal line drawing on a plain white background with a very faint, thin, light-grey graph-paper grid. Every person becomes a clean thin outline in one muted colour, with no fill, no shading, no texture and no face detail. [N] outline figures: [for each person, in prose: screen position and depth, the outline colour, what is visible (full body / head and shoulders only / torso and arms only), the pose exactly as in the image (seated / standing / head tilted far back, face angled up / back to camera), the facing direction, any signature prop as a simple outlined shape pinned to the body ("a thin outline of a blade across the throat, under the chin, not at the chest")]. [Anchoring furniture or architecture as thin grey outlines, and where - or: an open background with nothing else in it.] [Background extras as tiny faint grey silhouettes in one named area - or leave this out.]
PRESERVE EXACTLY: the framing, camera angle and crop; the position, pose, facing direction and size of every person. A body cut off by the frame edge stays cut off at the same place; nothing is added that is not in the image.
ONLY CHANGE the look into the outline drawing. No text, no letters, no labels, no ground line, no extra props, no extra figures.
```

**Template B: from words (`/api/v1/director/images/text`):**

```text
A minimal staging plan for a film scene, drawn as a simple line drawing on a plain white background with a very faint, thin, light-grey graph-paper grid, seen from the camera's position at [eye level / low / high], front view, not from above. [N] figures, each a clean thin outline in one muted colour with no fill, no shading and no face detail: [the same per-person prose as template A]. [Furniture as thin grey outlines, or an open background.] No text, no letters, no labels, no ground line, nothing else in the drawing.
```

Palette, one per figure, as distinct as possible: muted blue, muted orange, muted yellow, muted purple, muted red,
muted green. Colour is identity only, never wardrobe.

**Four traps to check before you deliver step 1:**
1. **Crops:** a body cut by the frame edge is described as cut, and completion is forbidden.
2. **Head and gaze:** head angle and gaze direction spelled out ("tilted far back, face angled up").
3. **Prop height:** pinned to anatomy with a contrast ("across the throat, under the chin, not the chest").
4. **Nothing extra:** anything you are tempted to add that is not in the frame: leave it out.

```bash
curl -X POST "$BASE/api/v1/director/images/edit" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "image=@loc_HARBOR_dock_s07_v1.png" -F megapixels=4 -F seed=11 -F "prompt=<staging_HARBOR_s07_v1.txt"
# send it once (there is no idempotency key: a second POST is a second billed job)
# poll GET /api/v1/director/jobs/{id}; save output.url as staging_HARBOR_s07_v1.png; note the seed you sent
```

## Naming (files and versions)

Montage has no tag library: a picture is referenced by its upload position (`@Image4` on Premium and Ultra,
`<Picture 4>` on Basic). Names live in the file names and your notes, so maps and retakes never collide:

- `loc_[PROJECT]_[place]_[scene]_[version]` for the source frame (`loc_HARBOR_dock_s07_v1.png`) and
  `staging_[PROJECT]_[scene]_[version]` for the drawing (`staging_HARBOR_s07_v1.png`).
- `[PROJECT]` in capitals; pair the staging name with its place name so they read as belonging together.
- Bump `_v2`, `_v3` on every retake and send only the active version for a shot: a stale map gives ghost blocking.

## Step 2: the connector (into the video prompt)

Positive form only. Never write flat, vector, schematic, grid, colour blocks, diagram, illustration, drawing, lines or
outline in the video prompt, not even as negations. The connector is one self-contained block: the locks are its last
lines, so it is pasted in one place.

**Letters.** Montage prompts already define one name per person ("Define the woman in the red coat in `@Image1` as
Mara"); the letter is the bridge from a colour on the map to that name. Write the letters plain (A, B, C), never with
`@`: on Premium and Ultra `@` belongs to `@Image` / `@Audio` / `@Video` tags. In the shots use the defined names; an
unnamed extra can keep the letter as its name ("figure C, the waiter").

**Premium and Ultra** - inside `[Assets]` and `[Continuity]` of the skeleton in
`references/montage/pixio-prompt-director.md`, the map last:

```text
[Assets] @Image1 is Mara: take only her face, hair and coat, not the pose or background. @Image2 is Joel: take only his face, hair and jacket, not the pose or background. @Image3 is the dock at night: take only the place: geography, materials, landmarks, light. @Image4 is a position reference only: read from it where each person stands, their pose and the direction they face inside the dock of @Image3. Every visual quality of the shot - style, light, colour, faces, wardrobe, environment, props - comes only from @Image1, @Image2 and @Image3. The shot is a fully photoreal live-action frame. Define the woman in the red coat in @Image1 as Mara and the man in the grey jacket in @Image2 as Joel.
Letter legend (letters exist only in this prompt): A = the blue figure in @Image4 = Mara: screen-left foreground, standing, three-quarter back to camera, facing Joel. B = the orange figure in @Image4 = Joel: screen-right midground, 3 meters from Mara, seated on a bollard, facing Mara.
Render rule: place the real people from @Image1 and @Image2 into the dock of @Image3 at the positions @Image4 defines, and take nothing else from @Image4.
...
[Continuity] Style, light and texture come only from @Image1, @Image2 and @Image3; @Image4 defines positions only. The colours of @Image4 only tell who is who; wardrobe and grade come from the character and place pictures. Everyone stays in their mapped position until their scripted action.
```

**Montage Basic, experimental** - the official six-section format (`references/montage/montage-basic-prompting.md`).
Basic has no "positions only" retention marker, and the official rule keeps `<Picture N>` inside a subject line
except as a frame anchor; a map is neither a person, a place nor a first frame. So the map gets **no** subject line
and is never "the shot begins from" (that asks Basic to start on the drawing). Name it once, in the style sentences
of `detailed_description`:

```text
subject_definitions:
<Subject 1> is the woman in the red coat in <Picture 1>, ...
<Subject 2> is the man in the grey jacket in <Picture 2>, ...
<Subject 3> is the dock at night in <Picture 3>, ...
...
detailed_description:
Live-action, cinematic, clean digital cinema image. <Subject 1> and <Subject 2> are the only people anywhere in the video. Their positions follow <Picture 4>, a position reference only: <Subject 1> stands where its blue figure stands, screen-left in the foreground, her back three-quarters to the camera; <Subject 2> sits where its orange figure sits, on a bollard screen-right, 3 meters from her, facing her. All style, light, colour and wardrobe come from <Picture 1>, <Picture 2> and <Picture 3>. [Shot 1] ...
```

Write the same positions in words in every shot as well (Basic follows time-coded words): if the map then bleeds, you
delete one sentence and the staging survives.

**Upload order: characters first (in order of first appearance), then places and props, the map last.**

```bash
# Basic draft first (billed, but the cheapest pass): look at the first frames for any drawn line, white field or figure colour
curl -X POST "$BASE/api/v1/director/videos/reference" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-basic -F speed=draft -F duration=10 -F aspect=16:9 -F seed=7 \
  -F images=@mara_face.png -F images=@joel_face.png -F images=@loc_HARBOR_dock_s07_v1.png \
  -F images=@staging_HARBOR_s07_v1.png -F "prompt=<s07_basic.txt"

# Premium: machine check, then the free quote; render only after the user saw credits.quoted and said yes
curl -X POST "$BASE/api/v1/director/prompts/check" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d @s07_check.json   # {"prompt": "<the clip>", "refs": 4, "duration": 10}
curl -X POST "$BASE/api/v1/director/videos/reference?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-premium -F duration=10 -F aspect=16:9 \
  -F images=@mara_face.png -F images=@joel_face.png -F images=@loc_HARBOR_dock_s07_v1.png \
  -F images=@staging_HARBOR_s07_v1.png -F "prompt=<s07_premium.txt"
```

`?check=true` returns `credits.quoted` and the `promptCheck` report; nothing starts and nothing is charged. The real
render is the same request without `?check=true`, sent once.

In films, use maps only with your own `clips` (the writer behind `idea` does not know a picture is a map and may cast
it as a person): send the map in `images`, give it only to its clip with `clip_images` (last in that clip's list), keep
it out of every `cast` entry, and send `verbatim=true` so your connector reaches the render unchanged (on Premium and
Ultra it also skips the prompt-writing charge).

## Rules

- **Letters live in the prompt, colours live in the picture.** No letters, labels or typography on the map: rendered
  text is unreliable and a drawn letter can bleed into the shot (on Montage Basic it will).
- **One muted, maximally distinct colour per figure.** Outlines, never fills. Colour is the letter's identity only.
- **Front view from the camera's side**, never top-down: video models think in frames, not floor plans.
- **Pose is geometry:** unusual poses exactly (perched, upside down, back to camera, head in hand). **Crop is
  geometry:** a figure cut by the frame edge is drawn cut.
- **The grid is for you, not the model.** Keep it faint; never mention it in the video prompt.
- **Never trade signal for stealth.** An almost invisible map (ultra-faint lines everywhere) removes bleed and blocking
  together: the model reads geometry through the same pixels that could bleed. Reduce style mass (outlines, muted
  colour, faint grid), never line contrast.
- Small drawing inaccuracies are fine: the legend text overrides them.
- At most 4 people per Premium clip (`references/montage/pixio-prompt-director.md`); a map does not raise that limit.

## Known failures

| Failure | Cause | Fix |
|---|---|---|
| The map's look enters the shot | colour-block fills; graphic words in the video prompt (even negated); the map sent before or instead of strong photo pictures | fix the layer that fed it: mute and thin the outlines; delete graphic words; upload the map last. If it persists in a moving shot, keep movement plain and physical ("real, live-action gestures", never "come alive"); last resort, drop the map from that shot |
| Figure colour becomes wardrobe (blue figure, blue shirt) | fills, saturated colours | outlines only, muted palette; the legend routes identity to the character picture; the `[Continuity]` line routes wardrobe to the character pictures |
| The drawing invents what is not in the frame (completes a cropped body, adds a helmet, adds furniture) | missing guard | "nothing is added", "a body cut off stays cut off", per-figure crop described; name the invented item in the exclusion line once it has appeared |
| Prop at the wrong height (blade drifts from throat to chest) | prop not pinned | anatomy plus a contrast: "across the throat, under the chin, not the chest" |
| Ghost blocking | an old map version sent | send only the active `_vN` |
| Basic draft shows white fields, drawn lines or arrows | Montage Basic copying the reference | drop the map from that clip; keep the staging words |

## QA checklist

On the **drawing**, before you name it:
1. Thin outlines only: no fills, colour blocks or shading.
2. No text, letters or labels anywhere.
3. Cropped bodies stay cropped; nothing invented (heads, helmets, furniture, extra figures).
4. Props at the exact anatomical height and place the frame shows.
5. Poses match the frame: head angle, gaze, mouth, unusual positions.
6. Framing, crop and shape match the source frame and the video's `aspect`.

On the **video** (look at about one frame per second; free first: `GET /api/v1/director/jobs/{id}/shots` thumbnails;
for a machine read, `POST /api/v1/director/videos/edit/analyze` with `"checks": ["lipsync"]` for lines and
`POST /api/v1/director/understand/video` with `"measure_only": true`, both billed, at least 16 credits; method in
`references/montage/pixio-video-qa.md`):
1. Fully photoreal: no flat or graphic look anywhere.
2. No white or grid background, no drawn-line edges.
3. No map colours in wardrobe, armour or grade.
4. No letters or typography.
5. Everyone in their mapped position, facing the mapped direction, until their scripted action.
6. A failed check: fix the layer that fed it (picture: thinner, more muted; words: remove graphic tokens; order: map
   last), bump the version, re-render the smallest unit (`references/montage/pixio-prompt-director.md`, section 17).
   Every re-render bills: on Premium and Ultra show `credits.quoted` from `?check=true` first.

## Extensions (same conventions)

- **Movement maps:** a dashed line in the figure's colour for a cross from mark to mark. The legend names START,
  PATH, END and WHEN (tied to a line or a beat): "the dashed blue line = Mara's walk, from the bollard to the ladder,
  straight along the edge, as Joel finishes his line".
- **Trajectory maps:** a bullet, a bird, a thrown object: design the curve on the faint grid with real coordinates,
  deliver it as a dashed path in its own muted colour, bound with START, PATH shape, END and TRIGGER ("the dashed red
  line = the bottle's flight, from B's hand, a high arc, exiting frame-right, on the shout").
- **Camera path maps:** arrows for a push or pan direction; the legend says "arrows = camera path only".
- **Arrows and dashed paths are Premium and Ultra only for now.** Montage Basic copies arrows from references into
  the video; on Basic, write paths and camera moves in words with Basic's trained camera vocabulary
  (`references/montage/montage-basic-prompting.md`).

Montage has no 3D previs: for camera moves, walks and exact lenses, stage with a blocking map (plus movement or camera
path maps on Premium and Ultra) and spell the move out in words (`references/montage/pixio-camera-language.md`).

## Related skills

`references/montage/pixio-prompt-director.md` (the block skeleton, blocking in words, the workbench),
`references/montage/pixio-image-prompter.md` (image prompt craft), `references/montage/pixio-image-editing.md`,
`references/montage/pixio-camera-language.md`, `references/montage/pixio-transitions-continuity.md`,
`references/montage/pixio-photoreal-shorts.md`, `references/montage/pixio-video-qa.md`,
`references/montage/montage-basic-prompting.md`, `references/montage/montage-premium-prompting.md`.

## Checklist

- [ ] Step 1 delivered alone first: image prompt + request, file names, colour key; the four traps checked.
- [ ] Map in the video's shape, outlines only, no text; checked against the QA list.
- [ ] Connector in positive form, no graphic words; letters plain, bound colour -> letter -> defined name.
- [ ] Map uploaded last; every user picture still sent; picture count within the tier's limit.
- [ ] Staging also in words; Basic draft checked for bleed before any Premium spend.
- [ ] `POST /api/v1/director/prompts/check` with the right `refs`; Premium or Ultra only after `credits.quoted` and a yes.

Adapted from the studio's production skills with permission.
