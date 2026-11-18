---
name: pixio-anime-styles
description: How to make 2D-animated videos on Montage (Pixio's Director API) - anime, cel-shaded cartoon, retro 90s cel, watercolour, gouache, flat vector and other drawn styles on Montage Basic and Montage Premium / Ultra - style lines that hold, keeping a character on-model across clips, drawn-motion language, the anime_90s look and styles, and the realism switch that must be off. Use whenever someone asks for anime, a cartoon, a 2D animation, a drawn or painted style, or you write a /api/v1/director/videos/* or /api/v1/director/videos/film request in a 2D style. Not for 3D animated shorts (that is pixio-3d-animation) or paper, collage and hand-drawn-over-live-action looks (that is pixio-paper-handdrawn).
---

# 2D animation styles: anime, cartoon, cel, watercolour

Montage's video models were trained mostly on live action. Left alone, they drift toward photoreal skin, film light
and 3D shading. A 2D style holds only when it is stated at the start of every clip, the realism setting is
switched off, and the reference pictures are drawn in that same style. Prompt FORMAT (sections, shots,
timestamps, dialogue tags) lives in `references/montage/montage-basic-prompting.md` and
`references/montage/montage-premium-prompting.md`; this skill covers only what changes for 2D.

## House rules

- **Test on Montage Basic.** Every test, draft or trial render runs on `video_model: "montage-basic"` (also what you
  get when `video_model` is left out). Montage Premium or Ultra only when the user asks for it and has seen the quote
  (`?check=true`, `credits.quoted`). Every render is billed in Pixio credits, Basic included.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `videos/finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE`
  (`https://beta.pixio.myapps.ai`) and `$PIXIO_API_KEY`.

## 0. Decision rules (read first)

1. **Pictures first, in the target style.** Make or convert every character and place picture into the 2D
   style before any video (`/api/v1/director/images/text`, `/api/v1/director/images/reference`, `/api/v1/director/images/edit`). A photo reference
   pulls the clip back to live action. Use every picture the user supplied - convert it, never drop it.
2. **Realism off.** Films, music videos and remakes take `realism` (0 to 1: how photographic the result is).
   Send `realism=0` for every 2D job (`/api/v1/director/videos/film`, `/api/v1/director/videos/music`,
   `/api/v1/director/videos/remake`).
3. **One style line, word for word, in every clip.** Write it once and paste it into Shot 1 of every clip
   (and into the film `style` field when the writer makes the clips).
4. **One style per video.** Do not stack labels ("anime watercolour pixel-art"). Pick one family.
5. **No studio, artist or franchise names.** Describe the visual traits instead (see section 2).

## 1. Which tier for which 2D style

| want | Montage Basic | Montage Premium / Ultra |
|---|---|---|
| flat 90s cel anime | best: `look=anime_90s` on `/api/v1/director/videos/text` and `/api/v1/director/videos/image` | style line only (looks and styles are not applied there) |
| modern clean anime, line art, simple shadows | good with a strong style line + drawn refs | very good; follows drawn pictures closely |
| watercolour / gouache / painterly | good for slow scenes; keep motion small | good; say "visible brush strokes, paper texture" |
| flat vector / motion-graphic cartoon | good, keep shapes simple | good |
| fast action (sword clash, chase) | keep to one impact per shot | stronger; violence and blood allowed on Premium |

`look` and `styles` work only on `/api/v1/director/videos/text` and `/api/v1/director/videos/image` (Montage Basic).
`/api/v1/director/videos/reference` takes neither. On Premium and Ultra, `look`, `styles` and `realism` do not apply;
the style sentence carries the look.

## 2. Style lines that hold

Put the style first in Shot 1 (Basic) or in the opening style sentence (Premium). Name the medium, the line,
the shading, the background treatment and what it is NOT.

**Clean anime (good):**
`2D Japanese-style anime, clean consistent black line art, flat cel shading with one shadow tone, soft hand-painted background, simple highlights in the eyes. Not 3D, not photoreal, no realistic skin texture.`

**Retro 90s cel (good, with look=anime_90s):**
`Flat 1990s television cel animation, thick ink outlines, limited colour palette, painted backgrounds with soft edges, hard-edged shadows.`

**Watercolour (good):**
`Hand-painted watercolour animation, soft bleeding colour edges, white paper showing through the highlights, loose pencil under-drawing, gentle pastel palette. Not 3D, not photoreal.`

**Cel-shaded cartoon (good):**
`Bold cel-shaded cartoon, thick outlines, two-tone shading, saturated primary colours, exaggerated rounded shapes, simple flat sky.`

**Bad:** `Anime in the style of <famous studio>, cinematic lighting, 8k, ultra-realistic, volumetric fog, film grain.`
Why: a studio name (not allowed and unreliable), "cinematic lighting / 8k / ultra-realistic / volumetric" pull
toward live-action 3D, and grain is banned.

Words that break 2D: cinematic lighting, photoreal, 4k/8k render, volumetric light, depth of field bokeh,
skin pores, subsurface, ray-traced, 35mm, anamorphic. Leave them out.

## 3. Keeping a character on-model

2D characters drift faster than real faces: hair spikes multiply, eye shapes change, outfits gain stripes.

1. **Make a model sheet still** with `/api/v1/director/images/text` (or `/api/v1/director/images/reference` from the customer's
   pictures): front, three-quarter and side view of one character, plain background, same style line.
   Check it by eye. Redo stills (seconds) instead of clips (minutes).
2. **Turn a photo into the style** with `/api/v1/director/images/edit` ("Redraw this person as a 2D anime character with
   clean line art and flat cel shading; keep the hairstyle, hair colour and outfit"). Keep the original too.
3. **Lock 3-4 traits in words**, once, in the subject definition: hair shape and colour, eye colour, one
   outfit colour block, one prop. Do not describe the face in detail; the picture carries it.
4. **Same outfit in every clip** unless the story changes it. Write "keeps exactly the same outfit" in each.
5. **One character per close-up.** Two similar 2D characters in one shot often swap colours.
6. On films, use `clip_images` so each clip gets only the pictures it needs (see `references/montage/pixio-characters.md`).

## 4. Drawn-motion language

2D reads as 2D partly through how it moves.

- **Held poses and snappy changes:** "she freezes in a pose for a beat, then snaps to the next pose".
- **Smear and speed lines** for fast moves: "a smear frame on the sword swing, speed lines behind her".
- **Hair and cloth on a loop:** "her scarf flutters in a steady loop".
- **Limited background motion:** "the painted background stays still while the clouds slide slowly".
- **Camera:** Montage Basic's trained moves only (Push In, Pan, Truck, Tilt, Static Shot, Tracking Shot...), slow and
  small for dialogue; one strong move for the hero beat. A slow Pan or Truck across a painted background
  reads very 2D. Avoid Arc Shot on 2D characters: rotating around a flat drawing exposes 3D drift.
- **One action per shot**, 3 s or longer. Many fast actions blur into 3D-looking mush.
- **Impacts:** "a white flash frame on impact, then a held pose" works better than a long exchange of blows.

## 5. Looks and styles (Montage Basic only)

Check what exists before you send it: `GET /api/v1/director/catalog` lists the named `looks` (for the `look` field)
and the `styles` you can send as `styles: [{"style": "<key>", "strength": 0.7}]` (up to 3, strength 0-1). The list
can change, so read it each time.

At the time of writing:
- `look=anime_90s`: the flat 1990s cel look. Use with 2D prompts only.
- A matching retro-anime entry in the catalog's `styles`, sent through `styles`, lets you set the strength yourself.
- Nothing in the catalog helps watercolour or modern clean anime; use the style line and drawn refs.

Colour filters (packaging, after render, any tier) also help 2D: `vivid` for saturated cartoons, `dreamy`
for soft watercolour, `faded` for a nostalgic look. Preview first with `GET /api/v1/director/jobs/{id}/filter_preview`
(free).

## 6. Requests

**Text-to-video, Montage Basic, 90s cel look (JSON):**
```bash
BASE=https://beta.pixio.myapps.ai
curl -X POST "$BASE/api/v1/director/videos/text?check=true" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{
    "video_model": "montage-basic",
    "look": "anime_90s",
    "duration": 10,
    "aspect": "16:9",
    "prompt": "integrated_multimodal_description: [Shot 1] Flat 1990s television cel animation, thick ink outlines, limited colour palette, painted backgrounds. A schoolgirl with a short black bob and a red scarf sprints down a station platform at dusk. The camera tracks alongside her at fast speed.\n[Shot 2] At 00:04.000, the camera cuts to a close-up: the train doors slide shut in front of her and she freezes, mouth open. Static Shot.\n[Shot 3] At 00:07.000, the camera cuts to a medium shot: she bursts out laughing, hands on her knees. The camera pulls out with small amplitude at slow speed.\noverall_soundscape: Running footsteps on concrete, a chime and the hiss of closing doors, then her laugh over the hum of the departing train.\nnon_diegetic_music: Light upbeat synth-pop, bright drum machine, steady tempo.\nNo subtitles, no watermark, no on-screen text."
  }'
```
Drop `?check=true` to render after checking the quote and the prompt report.

**Image-to-video from a drawn still (multipart; `styles` is JSON text):**
```bash
curl -X POST "$BASE/api/v1/director/videos/image" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "image=@hero_cel.png" -F "video_model=montage-basic" -F "duration=5" \
  -F 'styles=[{"style": "STYLE_KEY_FROM_CATALOG", "strength": 0.9}]' \
  -F "prompt=For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description: [Shot 1] Flat 1990s cel animation, thick ink outlines. Continuing from the first frame, the swordsman slowly draws his blade as rain streaks past; a smear frame on the draw, then a held pose. The camera pushes in with small amplitude at slow speed.
overall_soundscape: Heavy rain, a metallic ring as the blade clears the sheath.
non_diegetic_music: N/A"
```

**A 2D film from an idea (realism off, drawn style everywhere):**
```bash
curl -X POST "$BASE/api/v1/director/videos/film?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "video_model=montage-basic" -F "duration=60" -F "realism=0" -F "storyboard=true" \
  -F "idea=A shy fox spirit lights paper lanterns across a sleeping village so a lost child can find home." \
  -F "style=2D anime, clean consistent line art, flat cel shading, soft hand-painted night backgrounds, warm lantern glow; not 3D, not photoreal" \
  -F "images=@fox_sheet.png" -F "images=@child_sheet.png" \
  -F 'references=["the fox spirit: model sheet", "the child: model sheet"]'
```
`storyboard=true` stops after one still per shot so the human can check the style before any clip is rendered
(`GET /api/v1/director/jobs/{id}/storyboard`, then `POST /api/v1/director/jobs/{id}/storyboard/approve`; see
`references/montage/pixio-storyboarding.md`). The stills are charged per still.

**Montage Premium (after the human approves the quote):** same requests with `video_model=montage-premium`; leave out
`look` and `styles` (not applied). Write the Premium prompt per `references/montage/montage-premium-prompting.md`
(style sentence, then "Not 3D, not photorealistic; no realistic skin texture" in the constraints).

## 7. Fixes

| problem | fix |
|---|---|
| looks like live action or 3D | style line first in every clip; `realism=0`; drawn refs, not photos; remove "cinematic/8k/realistic" words |
| character changes between clips | model-sheet still as reference; lock 3-4 traits; same outfit sentence each clip |
| line art boils or melts on fast moves | slower action, one move per shot, Static Shot or slow Pan |
| face turns 3D when the camera circles | no Arc Shot; use Pan or Truck |
| text, signs or speech bubbles garbled | keep text out of the picture; add titles with `package.title_card` or captions |
| colours too dull | package `filter=vivid` (preview first) |
| style drifts on Premium | stronger style sentence and "Not 3D" constraint; looks and styles do not apply there |

## 8. Checklist

- [ ] Every user picture used, converted to the style if needed; model sheets checked by eye
- [ ] One style line, pasted word for word into every clip (and `style` for films)
- [ ] No studio, artist or franchise names; no cinematic/photoreal/8k words; no grain words
- [ ] `realism=0` on film, music and remake jobs
- [ ] `look` / `styles` only on `/api/v1/director/videos/text` or `/api/v1/director/videos/image`, names checked in `GET /api/v1/director/catalog`
- [ ] One action and one trained camera move per shot; no Arc Shot on 2D faces
- [ ] Test on `video_model=montage-basic`; `?check=true` quote shown before any Premium render
- [ ] Never put the API key in a prompt, URL or log
- [ ] Watch the result (`references/montage/pixio-video-qa.md`) for 3D drift and off-model frames before delivering
