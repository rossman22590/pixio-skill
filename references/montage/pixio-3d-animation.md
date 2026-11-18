---
name: pixio-3d-animation
description: How to make stylized 3D animated shorts on Montage (Pixio's Director API) - the family-feature 3D cartoon feel without naming any studio - story spine, locked character design sheets and empty set cards made with Montage's image model, materials and lighting words that hold, a per-second shot table, rendering on Montage Basic or Montage Premium, and QC. Use whenever someone asks for a 3D animated short, a cute 3D cartoon, a CG character story, or you plan a /api/v1/director/videos/film or /api/v1/director/videos/text job in a stylized 3D look. Not for 2D anime or cartoons (that is references/montage/pixio-anime-styles.md) or papercraft and collage (that is references/montage/pixio-paper-handdrawn.md).
---

# 3D animated shorts

The target: rounded, appealing characters with rich materials, warm light and big acting - the feel of a
family 3D feature, without ever naming a studio. Montage Basic does this well when the look is named first and the
characters are pinned with design sheets; it fails when photo references or realism words sneak in.
Prompt FORMAT lives in `references/montage/montage-basic-prompting.md` and
`references/montage/montage-premium-prompting.md`. Film mechanics live in `references/montage/pixio-film.md`;
character consistency in `references/montage/pixio-characters.md`.

## House rules

- **Test cheaply on Basic.** Every test, draft or trial render sends `video_model: "montage-basic"` (it is also what
  renders when `video_model` is left out). Basic is billed in Pixio credits like everything else, just less.
  Premium or Ultra only when the user asks for it and has seen the `?check=true` quote (`credits.quoted`).
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE`
  (`https://beta.pixio.myapps.ai`) and `$PIXIO_API_KEY`.

## 0. Decision rules

1. **Story before pictures, pictures before video.** Agree the story (section 1), then the design sheets and
   set cards (stills are quick and cheap), then render. Do not spend on video before the human approves each stage.
2. **Settle shape and length first:** `aspect` (16:9, 9:16 or 1:1) and `duration` (film: a multiple of 15
   from 30 to 420). If the ask is 40 s, say so and agree 30 or 45; never round silently.
3. **Realism off:** `realism: 0` on `/api/v1/director/videos/film`, `/api/v1/director/videos/music` and
   `/api/v1/director/videos/remake` (left unset, people come out photographic).
4. **Use every picture the user gave.** If they gave photos of real people or pets, turn each into a 3D
   character sheet with `/api/v1/director/images/reference` or `/api/v1/director/images/edit`; keep using it, never
   drop it.
5. **Never name a studio or film.** Describe traits: rounded shapes, big expressive eyes, soft warm light.
6. **No subtitles unless asked**, and no text in the picture.
7. **Dialogue language:** ask. Do not assume English.

## 1. Story spine (approve before any picture)

Write a short brief and get a yes:
- **Premise as a "what if"**: "What if a lighthouse robot was afraid of the dark?"
- **Hero**: what they want, what they really need, the flaw that gets in the way.
- **World rule**: one thing that is true here and matters to the ending.
- **Beats**: 6-8 cause-and-effect beats (because of this, then that). No rescue by coincidence; the crisis
  comes from the flaw; the hero acts to solve it.
- **Emotional anchor**: an object or gesture shown early that pays off at the end (a dented lantern, a wave).
- **Dialogue**: few lines; each shows the relationship changing. Silent shorts work very well.

On a film one 15 s clip carries roughly one beat. 30 s = 2 beats, 60 s = 4, 120 s = 8.

## 2. The look line

Put this (or your variant) first in Shot 1 of every clip, word for word, and in the film `style` field:

`Stylized 3D animated feature look: rounded simplified shapes, big expressive eyes, soft global light with a warm key and cool fill, rich clean materials, smooth appealing motion. Not live action, not photoreal, not 2D.`

### Characters
- Friendly proportions: cute characters 2.5-3 heads tall, big head, small body, clear silhouette.
- Simplified geometric forms, detailed materials: felt-like fabric, soft rubber, painted metal, glossy eyes.
- Hair and fur as sculpted clumps with a few soft flyaway strands.
- Skin: warm, soft light glowing through ears, cheeks and fingertips (say "soft warm translucency").
- Acting: squash and stretch, strong brows and mouth shapes, a clear line of action in poses.

### Sets and light
- Name light states per scene: "late-afternoon warm key from the window, cool blue fill from the sky".
- Use soft contact shadows and a rim light to separate characters from the set.
- Keep sets slightly simplified and tidy; clutter becomes mush.

**Good:** `Stylized 3D animated feature look... A small round robot with a dented brass lantern for a head and soft rubber feet waddles across a cluttered workbench at dusk, warm desk-lamp key, cool window fill.`

**Bad:** `<famous studio>-style robot, hyperrealistic, 8k, ray-traced, cinematic film grain, shot on 35mm.`
Why: a studio name, photoreal words and grain; "35mm" pulls to live action.

**Avoid:** plastic or waxy skin, stiff mannequin poses, dead eyes, realistic human anatomy, flat 2D shading.

## 3. Design sheets and set cards (Montage's image model)

**Character design sheet**, one per character, 16:9, via `POST /api/v1/director/images/text` (or
`/api/v1/director/images/reference` when the user gave pictures):
```json
{"prompt": "Character design sheet for a stylized 3D animated feature, plain light grey background, one character shown four times in a row: front view, three-quarter view, side view, back view, plus a row of three facial expressions (happy, scared, determined). A small round robot, about 2.5 heads tall, dented brass lantern head with a warm glowing bulb, teal painted body with chipped edges, soft black rubber feet, one bent antenna. Soft even studio light. No text, no labels.",
 "aspect": "16:9", "megapixels": 4, "seed": 11}
```
Keep "No text, no labels": the image model garbles writing, and labels can leak into videos.

**Identity lock**: write one line per character and reuse it everywhere: age or size, body shape, colours,
signature prop, what must never change ("the antenna is always bent left").

**Set cards**: environment only, nobody in it, via `/api/v1/director/images/text`: "an empty scene with nobody in
it". Make one per location and light state (day and night). Note 1-2 landmarks whose screen position must stay
the same (the workbench lamp on the left, the window on the right).

Check every still by eye. Redo stills, not clips. A design change later means redoing everything after it.

## 4. Shot table

Plan every clip as a table before writing prompts. One row per shot:

| clip | shot | time | framing + camera | action (one) | anchors | sound |
|---|---|---|---|---|---|---|
| 1 | 1 | 0-3.5 s | wide, Static Shot | robot wakes, bulb flickers on | robot sheet, workshop card (lamp left) | hum, click |
| 1 | 2 | 3.5-7 s | medium, slow Push In | robot sees the dark window and shrinks back | robot sheet | wind, nervous beeps |
| 1 | 3 | 7-11 s | close-up, Static Shot | robot hugs its dented lantern | robot sheet | soft whirr |
| 1 | 4 | 11-15 s | wide, slow Pull Out | robot creeps toward the door | workshop card | creak |

Rules: one action and one trained camera move per shot; 4-5 shots per 15 s clip; each shot 3 s or more;
the last cut at least 2 s before the end. Each clip ends in a state the next clip starts from (where the
hero is, what they hold, the light). Strip table labels from the prompts: they are planning notes only.

## 5. Rendering

**Let the writer do it (fastest):**
```bash
curl -X POST "$BASE/api/v1/director/videos/film?dry_run=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "video_model=montage-basic" -F "duration=60" -F "aspect=16:9" -F "realism=0" -F "storyboard=true" \
  -F "idea=A little lighthouse robot afraid of the dark must climb the tower when the lamp fails, using the dented lantern on its head to guide a lost boat home." \
  -F "style=Stylized 3D animated feature look: rounded shapes, big expressive eyes, soft warm key and cool fill, rich clean materials; not live action, not 2D" \
  -F "images=@robot_sheet.png" -F "images=@lighthouse_card.png" \
  -F 'references=["the robot: character design sheet", "the lighthouse interior, empty"]'
```
After the yes, send it without `?dry_run=true`. When the job shows `storyboard.waiting: true`, review
`GET /api/v1/director/jobs/{id}/storyboard/sheet.jpg`; redo any still with
`POST /api/v1/director/jobs/{id}/storyboard/redo` (`{"clip": 2, "shot": 3, "note": "..."}`); then
`POST /api/v1/director/jobs/{id}/storyboard/approve`.

**Write clips yourself:** `POST /api/v1/director/prompts/write` with `story`, `mode: "film"` and `duration` (a writer
job: poll it, the clips are in its `result`), edit the clips against your shot table, check with
`POST /api/v1/director/prompts/check` (free), then send them as `clips` on `/api/v1/director/videos/film` with the
same `images` and `realism=0`.

**Single shots:** `/api/v1/director/videos/text` (no refs) or `/api/v1/director/videos/reference` (sheets as
`<Picture N>`, up to 9 images on Basic). `look` and `styles` work on `/api/v1/director/videos/text` and
`/api/v1/director/videos/image` only, and the catalog has no 3D style: do not expect a style to rescue a weak look
line (`references/montage/pixio-looks-styles.md`).

**Premium:** same flow with `video_model: "montage-premium"` once approved and quoted. Looks and styles do not
apply there; the words carry the look. Premium follows design sheets well; still state the 3D look and "no change
in head-to-body ratio".

**Music and sound:** each clip's `non_diegetic_music:` should name the same instruments so the cut flows;
or score the whole film once with `package.score` ("auto" or a brief), or the customer's own track as
`music_bed`. Dialogue ducks the bed (`package.duck_under_dialogue: true`).

## 6. QC (watch every clip; see `references/montage/pixio-video-qa.md`)

- Characters match their sheets in every shot: colours, proportions, signature prop, the "never changes" item.
- Landmarks stay on the same side of the frame across cuts.
- No live-action drift (pores, real-world camera look, photographic lighting).
- No text, labels, arrows or sheet borders leaked into the picture.
- Shot order matches the table; each clip hands off cleanly to the next.
- Music sits under dialogue and key sound effects; no subtitles unless asked.
- A drifted shot: redo that clip (or face-fix / lip fix where it applies) - never ship it silently.

## 7. Fixes

| problem | fix |
|---|---|
| looks photoreal | `realism=0`; look line first; remove 8k/ray-traced/35mm words; refs must be 3D sheets, not photos |
| proportions change | identity lock line + "no change in head-to-body ratio"; one character per close-up |
| plastic, waxy faces | say "soft warm translucency in ears and cheeks, matte skin" and give more acting |
| stiff poses | name the line of action and a squash-and-stretch beat in the one action |
| sheet labels appear in video | regenerate the sheet with "No text, no labels" |
| washed-out colour | package `filter=vivid` at `filter_strength` 0.5 (preview free first) |

## 8. Checklist

- [ ] Story spine approved; aspect and duration agreed (film = multiple of 15, 30-420)
- [ ] Every user picture used (as a 3D sheet if needed); design sheets and empty set cards checked by eye
- [ ] Look line first in every clip and in `style`; no studio names; no grain or photoreal words
- [ ] `realism=0` on film / music / remake
- [ ] Shot table: one action + one trained camera move per shot, landmarks and hand-offs noted
- [ ] `storyboard=true` reviewed and approved before the render
- [ ] Test on `video_model: "montage-basic"`; quote shown and agreed before Premium
- [ ] API key never in prompts, URLs or logs
- [ ] QC passed on every clip before delivery
