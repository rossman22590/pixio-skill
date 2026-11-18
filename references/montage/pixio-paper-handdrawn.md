---
name: pixio-paper-handdrawn
description: How to make paper-collage, papercraft stop-motion and hand-drawn videos on Montage (Pixio's Director API) - editorial cut-paper collage, layered paper dioramas and puppets, crayon/chalk/pencil doodles living in a real phone-filmed room - textures, stepped stop-motion feel, camera rules, end-frame stills, explainers in these styles, tactile sound. Use whenever someone asks for a paper, collage, cut-out, papercraft, pop-up book, stop-motion, doodle, crayon or chalk look, or a hand-drawn creature in a real space, on /api/v1/director/videos/* or /api/v1/director/videos/film. Not for anime or cel cartoons (that is pixio-anime-styles) or 3D animated shorts (that is pixio-3d-animation).
---

# Paper and hand-drawn looks

Three related styles, each with its own rules. Pick one per video.

| style | what it is | best for | camera |
|---|---|---|---|
| **A. Paper collage** | flat colour fields, black-and-white halftone photo cut-outs, a few coloured card accents, cream keylines, soft paper shadows | short editorial explainers, idea-driven metaphors, social clips | locked off |
| **B. Papercraft stop-motion** | a miniature paper diorama: layered card with visible thickness, puppets with joints, pull-tabs, real shadows between layers | science / education / kids explainers, story pieces | slow, miniature moves |
| **C. Hand-drawn in a real space** | glowing crayon, chalk or pencil doodles that live in a phone-filmed room and touch a real hand | playful 15 s social clips, brand moments | handheld, lagging behind |

Prompt FORMAT lives in references/montage/montage-basic-prompting.md and
references/montage/montage-premium-prompting.md. Narrated explainers (voice, captions, timing) live in
references/montage/pixio-explainers.md; this skill covers the look.

## House rules

- **Test on Basic.** Every test, draft or trial render runs on Montage Basic (`video_model: "montage-basic"`, or
  leave `video_model` out). Every render is billed in Pixio credits; Basic is the cheapest. Premium or Ultra only
  when the user asks for it and has seen the quote (`?check=true`).
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `videos/finish`; never write grain, noise or film-stock words in a prompt
  or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.

## 0. Decision rules

1. **Plan, then a still, then the clip.** Approve the plan; make one still per segment with Montage's image model
   (`POST /api/v1/director/images/text`, quick); approve it; only then render video. Never skip the gates.
2. **The still is the last frame.** For A and B, the approved still is the finished composition; the clip
   shows the pieces arriving and settling into it (image-to-video from the still, or the still as a
   reference).
3. **One idea per shot.** Meaning should read without on-screen text. Overloaded frames fail.
4. **Realism off** for films, music videos and remakes: `realism: 0` (the default 0.7 adds photoreal skin).
   Style C is the exception when the live-action room and hand should look real: keep the default there.
5. **Paper texture words:** "visible fibres, torn edges, soft paper shadows" - never "grain" or "noise".
6. **No text in the picture.** The models garble letters. Labels, titles and captions go on in packaging
   (`package.title_card`, `captions`, `lower_thirds`).

## 1. Style A - paper collage

**Look line (good):**
`Premium editorial paper collage, flat bold colour field background, black-and-white halftone photo cut-outs as the main shapes, a few coloured cardstock accents, warm cream keylines around each piece, cleanly torn edges with fine fibres, soft physical paper shadows, clear foreground, midground and background layers.`

**Colour:** one main field colour per segment, chosen for meaning (burnt orange for urgency, mustard for
warnings, ink green for calm thinking, deep purple for memory, teal for teamwork). Unity across a series
comes from texture, halftone, keylines and shadows, not one fixed hue.

**Texture limits:** clean and refined. No kraft brown base, no yellowed or stained paper, no heavy creases,
unless the user asks for an aged look.

**Motion:** stepped arrivals. Each piece appears, slides or pops in, bounces lightly, presses flat, pauses,
locks. Foreground first, then midground, then background; secondary pieces one at a time. About 4 s per
segment.

**Camera:** Static Shot only. All interest comes from the paper moving.

**Avoid:** global fades, smooth digital layer drifting, fast spins, pieces flying around, morphing.

**Bad:** `A collage about burnout, lots of elements, cinematic camera orbit, fade between scenes, text saying BURNOUT.`

## 2. Style B - papercraft stop-motion

**Look line (good):**
`Handmade papercraft stop-motion, a miniature paper diorama in a shadow box, layered cardboard cut-outs with visible thickness, matte paper with fibres, folds, seams and tabs, paper puppets with brass-fastener joints, real drop shadows between layers, macro miniature photography with slight depth of field.`

**Depth:** at least four planes - foreground occluder (paper leaves, a curtain), midground with the key
idea, background, far background. 4-7 layers per shot.

**Mechanisms make the motion:** pull-tabs, sliders, rotating discs, page flips, pop-up folds, a cardboard
door opening, paper clouds sliding.

**Stop-motion feel:** "small stepped movements with brief holds, a slight rebound as each piece settles,
hinged puppet gestures". Not smooth CG motion, not melting, not plastic.

**Camera (trained moves):** slow Push In to enter the box; slow Truck Left/Right with layer parallax;
Static Shot for explanation; close-up for texture; slight top-down for cross-sections. Avoid fast moves,
full Arc Shots and anything that reveals the set is flat.

**Transitions between clips:** a page flip, a pop-up unfold, a pull-tab slide, a paper cloud passing the
lens, a circular paper iris. Write them as the last action of one shot and the first of the next.

**Explainer pacing:** hook, explanation, an example, a memory line. Rough guide: 30 s = 5-6 shots,
60 s = 7-9 shots, each 3-7 s. Hold a moment after a key reveal; do not cut before the mechanism is clear.

## 3. Style C - hand-drawn in a real space

A single glowing hand-drawn creature (crayon, chalk, coloured pencil, pastel or rough brush) appears in a
real phone-filmed room and plays with the person filming. 15 s, one location, no cuts to elsewhere.

**Rules for a fresh idea each time:** pick a new room (a rainy kitchen sink, a balcony, a bookshop aisle), a
new creature and colour, a morph chain, how it touches the hand, where it runs, how the filmer reacts and
the big final picture.

**Time windows (15 s):** 0-3 s it touches a real hand or object (wraps a finger, lands in a palm);
3-6 s it morphs (a line becomes a fish), keeping a trace of the old form; 6-10 s a chase or prank, the
filmer reaches; 10-13 s a small comic beat (a stumble, a dot lagging behind); 13-15 s it spreads across the
walls or window into one big image (a doodle town, a sky of stars) and a soft laugh.

**Texture:** "slightly wobbly lines, uneven smudges, fuzzy glowing edges, a redrawn-every-frame feel". Not
clean vector lines, not smooth neon, not 3D or plush.

**Camera:** "handheld phone camera with a slight delay; it pans only after the drawing has left the frame
edge", never neatly centred.

**Tone:** cute and gentle. No teeth, threats, giant eyes, pounces or sudden blackouts.

## 4. Requests

**Step 1 - the end-frame still (collage, 16:9):**
```bash
curl -fsS -X POST "$BASE/api/v1/director/images/text" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"prompt": "Premium editorial paper collage, flat ink-green colour field, a black-and-white halftone cut-out of a hand holding an hourglass in the centre, three mustard cardstock gears behind it, warm cream keylines, cleanly torn edges with fine fibres, soft paper shadows, generous empty space. No text, no letters, no logos.", "aspect": "16:9", "megapixels": 4, "seed": 7}'
```
Poll `GET /api/v1/director/jobs/{id}`; the still is at `output.url` (or `GET /api/v1/director/jobs/{id}/image`).
Show it, get a yes, then:

**Step 2 - pieces arrive into it (image-to-video; the still is the anchor):**
```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/image" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "image=@collage_end.png" -F "video_model=montage-basic" -F "duration=5" \
  --form-string "prompt=For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description: [Shot 1] Paper collage stop-motion. Continuing from the first frame, the gears lift away and re-enter one at a time: each slides in, bounces lightly, presses flat and locks with a small paper shadow; the hourglass hand settles last. Static Shot.
overall_soundscape: Soft paper slides, a light pop as each piece lands, a faint tap as it presses flat.
non_diegetic_music: N/A"
```
Instead of uploading the file again you can pass the still's `output.assetPath` (a path from your own Pixio
assets) or its URL as `image`. Image-to-video starts from the still; if you need the still as the END instead, use
`/api/v1/director/videos/reference` with the still as `<Picture 1>` and say "the shot ends exactly on the
composition of <Picture 1>". Check which works for the scene on Basic first.

**A papercraft explainer film (quote first):**
```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/film?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "video_model=montage-basic" -F "duration=60" -F "film_type=explainer" -F "realism=0" -F "storyboard=true" \
  --form-string "idea=How bees turn flower nectar into honey" \
  --form-string "style=Handmade papercraft stop-motion diorama, layered card with visible thickness, paper puppets with joints, pull-tabs and sliders, soft real shadows, warm daylight; small stepped movements" \
  --form-string 'package={"filter": "warm", "filter_strength": 0.4}'
```
`film_type: "explainer"` writes, reads and captions the narration (see references/montage/pixio-explainers.md).
After a yes, send it without `?check=true`, review the storyboard stills
(`GET /api/v1/director/jobs/{id}/storyboard`), redraw any with `POST .../storyboard/redo`, then
`POST .../storyboard/approve`.

**Hand-drawn in a real room (text-to-video, 15 s):** write the five time windows as shots in the Montage Basic
format with the style line first: "Live-action phone video of a real rainy kitchen sink, with a flat glowing
hand-drawn crayon creature...". Leave `realism` alone on single clips (it is a film / music video / remake field).

## 5. Sound

- Collage and papercraft: tactile sounds only by default - paper slides, pops, snips, card taps, rustles,
  tape peels. Put them in `overall_soundscape`, timed to the arrivals. `non_diegetic_music: N/A` unless the
  user wants music.
- If music is wanted: light marimba, xylophone, pizzicato strings or soft percussion for science topics;
  match the culture of the topic otherwise. Keep it under narration (`package.duck_db`), or have packaging make
  one with `score` (`"auto"` or a description).
- Hand-drawn: real room ambience (tap water, rain on the window) plus soft magical chimes; a small laugh at
  the end.
- Customer's own music always wins: send it as `music_bed` (film) or `music` on `/api/v1/director/videos/package`.

## 6. Fixes

| problem | fix |
|---|---|
| looks like a flat illustration with a paper filter | add layers, thickness, real shadows between planes, a mechanism that moves |
| looks like smooth CG | "small stepped movements with brief holds and a slight rebound"; fewer moving pieces |
| paper looks old and brown | remove kraft/aged words; "clean bright paper" |
| frame too busy | fewer pieces, more empty space, one idea |
| fake text or UI in the still | redo the still (do not try to fix it in the video prompt) |
| clip ends far from the still | say the still is the finished composition; reference it as the end frame |
| drawing in style C too clean | "wobbly crayon lines, smudged edges, redrawn every frame" |
| camera too steady in style C | "handheld, lags behind, pans only after it leaves the frame" |
| wrong mood colour | package `filter` (`warm`, `faded`, `dreamy`) previewed free with `GET /api/v1/director/jobs/{id}/filter_preview?filter=all` |

## 7. Checklist

- [ ] One style (A, B or C) for the whole video; look line first in every clip and in `style`
- [ ] Plan approved, then one still per segment approved, then video
- [ ] Every user picture used
- [ ] One idea per shot; no text, letters or UI in any still or clip; titles via packaging
- [ ] A: Static Shot, stepped arrivals; B: four depth planes, mechanism motion, slow trained moves;
      C: one room, touch in 0-3 s, handheld lag, cute tone
- [ ] `realism: 0` on film / music / remake jobs in styles A and B
- [ ] No grain or noise words; tactile sounds in `overall_soundscape`
- [ ] Test on Montage Basic; `?check=true` quote shown before Premium
- [ ] Every job id stored at once and polled, never resubmitted; never put the API key in a prompt, URL or log
- [ ] Watch every clip (references/montage/pixio-video-qa.md) before delivery
