---
name: pixio-lighting-color
description: How an AI agent lights and colours videos made with Montage (Pixio's Director API) - light written as physical set-ups that Montage Basic and Montage Premium both obey, time of day, palettes per story world, the named looks and styles, colour filters and matched looks in packaging, finishing (POST /api/v1/director/videos/finish, no grain), relighting a finished clip with Montage Edit, and keeping light words identical across clips. Use whenever you choose the look, light, colour, grade, filter or finish of a clip, film, music video or ad. Not for camera framing (that is references/montage/pixio-camera-language.md) or prompt format (montage-basic-prompting.md / montage-premium-prompting.md).
---

# Pixio lighting and colour

Light is written in the prompt; colour is mostly decided after the render. Get that split right and every clip of a
film looks like the same film.

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

## Decision rules (read first)

1. **Write light as a physical set-up: source, direction, softness, colour.** "A warm table lamp from the left,
   cool blue window light behind her" beats "moody lighting" or "cinematic lighting" on every Montage model.
2. **One look line for the whole film, copied word for word** into every clip (Basic: the style sentence of Shot 1;
   Premium: the `[Continuity]` line). A synonym in clip 3 is a different look in clip 3.
3. **No grain words, not even negated** (no stock names either). Send `"grain": 0` in every finish. Write "clean
   digital cinema image" instead.
4. **Stylised colour belongs in post, not in the prompt.** Black and white, sepia, noir, vintage, teal-orange: render
   clean, then apply `filter` in packaging (or match a reference with `look_id`). Never prompt Basic for a sepia or
   black-and-white look.
5. **Named looks and styles (`look` / `styles`) only exist on `/api/v1/director/videos/text` and
   `/api/v1/director/videos/image`.** Reference mode, films and music videos take neither; there the light comes from
   the words, `realism`, and the post steps (`references/montage/pixio-looks-styles.md`).
6. **Order of operations:** generate -> (upscale) -> finish -> package. Preview filters before packaging.
7. **Decide the look before the first render,** per "world" of the story, then hold it. Test looks on Basic.

## Lighting set-ups (vocabulary every model follows)

| Set-up | How to write it | Feel |
|---|---|---|
| Soft key + fill | "soft window light from the right, gentle fill from a white wall" | natural, honest, daytime drama |
| Hard key | "one hard light from high left, sharp shadows across the wall" | interrogation, noir, tension |
| Rim / edge light | "a thin warm rim light on her hair and shoulders from behind" | separates a face from a dark background |
| Practicals | "lit only by the bedside lamp and the fridge light" | intimate, real, night interiors |
| Motivated light | name the source in the scene: "the open doorway throws a slab of light across the floor" | believable; the model keeps it consistent |
| Top light | "a single bare bulb overhead, eyes in shadow" | menace, cells, back rooms |
| Under light | "firelight from below" | campfire stories, horror |
| Backlight / silhouette | "she stands against the bright window, a dark silhouette" | mystery, hides a face (useful for far shots of named people on Basic) |
| Neon / signage glow | "pink and cyan neon reflected on wet asphalt" | night city; Basic renders rain, neon and moonlight well |
| Studio product light | "dark seamless background, one hard key from the side, rim light, a controlled highlight on the glass" | ads (see references/montage/pixio-product-ads.md) |

Light the reference pictures evenly on a plain grey background, so the scene's light comes from the prompt, not the
photo. No rim light in a character picture (it follows them into every scene), and don't write "studio" in the
picture prompt (a photo studio appears in frame). On Premium say what not to copy: "take only her face, hair and
coat, not the pose, background or lighting".

**Motivated light with one warm accent:** every source has a reason in the scene (a window, a lamp, a sign), and one
small warm accent comes from a visible object ("the brass desk lamp is the only warm light"). Location pictures with
a single clear light direction keep clips consistent.

## Time of day and weather

- **Golden hour:** "low warm sun from behind, long shadows, warm rim on the hair". Good for endings and romance.
- **Blue hour:** "deep blue dusk sky, the first street lights on, warm windows". Transitional, melancholy.
- **Overcast day:** "flat grey daylight, soft shadowless faces". Documentary, realism, grief.
- **Hard noon:** "high sun, short hard shadows, squinting". Heat, exposure, westerns.
- **Night exterior:** "street lamps every ten metres, pools of orange light, dark gaps between". Name the sources;
  "night" alone gives a flat murky picture.
- **Night interior:** practicals only.
- **Rain / fog / snow:** state it in every shot of the scene, plus where light hits it ("rain streaking through the
  headlight beams"). Premium: leave out water, wave and echo words unless the scene needs them; they can cause
  bubbling or echoing audio.

Time of day is continuity. If clip 2 ends at dusk, clip 3 is still dusk unless the story jumps, and a jump in time
is where a clip join should go (references/montage/pixio-transitions-continuity.md).

## Palettes

- **Base field, accent, counter-note.** Most of each frame is one base colour field; a small accent comes from a real
  object (a lamp, a door, a red coat); a tiny counter-note keeps it alive. Put the accent in a costume or prop that is
  in the reference picture so it anchors the eye across clips.
- **One palette per world.** A film with two worlds (the farm and the city, now and the flashback) gives each its own
  palette; when two palettes are similar, separate them by finish and age: patina, dust and wear against polish.
- **Real surfaces beat a render look:** rust, cracks, tape, oil stains, water marks, worn paint read as real light on
  real things. Stacked quality words do not.
- **A period is a rule:** "nothing newer than 2011: no smartphones, no LED signs" in every location and prompt.
- Contrast pairs that read clearly: warm lamp vs blue window; orange street light vs cyan neon; green fluorescent
  vs red exit light.
- Wardrobe and set colours are part of the palette. Contrasting outfits also help every model keep two people apart.
- Avoid stacked quality words (8K, masterpiece, ultra-detailed) and "glow", "sparkle" on products. On anime, avoid
  "cinematic lighting", "volumetric light" and "4k render": they pull the image toward 3D or live action.

## Model notes

**Montage Basic**
- Put light in the style sentence of Shot 1 and repeat the relevant part in a shot when it changes ("the lamp is
  switched off; only the window light remains").
- Night windows and shiny surfaces show reflections, which become a second copy of the person. Light her from the
  city side or put a dark wall behind her, and write "no reflections of her in glass or mirrors".
- `realism` (films, music videos and remakes, 0-1) sets how photographic people look; set `realism: 0` for
  animation. Write the skin out for real people ("natural skin with visible pores, fine lines, no makeup"), or faces
  look plastic under any light.
- Named looks on `/api/v1/director/videos/text` and `/api/v1/director/videos/image` (`look`, listed in
  `GET /api/v1/director/catalog` under `looks`): `realistic_people`, `soft_portrait` (softest close-ups, slower),
  `raw_skin`, `golden_hour` (warm, moody, darker), `film_teal` (cool, contrasty, darker), `anime_90s`,
  `horror_80s`. `golden_hour` and `film_teal` darken the picture: brighten the light in the words to compensate.
  The same endpoints take `styles: [{"style": "...", "strength": 0.7}]` (up to 3, strength 0-1; the catalog's
  `styles` list has the keys).

**Montage Premium and Ultra**
- Light goes in `[Continuity]` as a set-up (key direction and softness, rim or edge light, background) plus one grade
  phrase, the same words in every clip: "Cold corridor light with one warm lamp; realistic skin detail."
- Premium follows pictures closely, including their light: plain, evenly lit references keep control in the prompt.
- Downscale reference pictures to no more than the output size; large AI pictures can print fingerprint-like
  textures in grass and foliage.
- Strong emotion in a close-up can make eyes glow under dramatic light: add "normal human eyes, no glowing eyes".

## Good vs bad lines

| Bad | Good |
|---|---|
| "Cinematic moody lighting." | "A single desk lamp from the left; the rest of the office is dark; cool blue light from the window behind him." |
| "Beautiful sunset." | "Low orange sun behind her, a warm rim on her hair, her face in soft shadow, long shadows on the sand." |
| "Black and white noir look, film grain." | "Hard key from high left through blinds, deep shadows, clean digital cinema image." + `filter: noir` in packaging |
| "Night." | "Night street lit by sodium lamps every ten metres; dark gaps between; wet asphalt reflecting the orange light." |
| "Shot on <a camera brand>, <a film stock>." | "Shot on a cinema camera, 35mm lens, practical light only, clean digital cinema image." |

## Finishing: `POST /api/v1/director/videos/finish`

| field | values | default |
|---|---|---|
| `grade` | `neutral`, `warm`, `teal` (film curve plus a small split-tone) | `warm` |
| `saturation` | 0.7-1.1 (AI video is usually a bit oversaturated) | 0.92 |
| `scope` | `true` adds 2.39:1 letterbox bars inside the frame | `false` |
| `grain` | 0-8 | 0. **Always 0** (house rule) |
| `deflicker` | cut-aware brightness smoothing | `true` |
| `lufs` | loudness target, e.g. -14 | -14 |

```bash
curl -X POST "$BASE/api/v1/director/videos/finish" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"job_id": "JOB_ID", "grade": "neutral", "saturation": 0.92, "grain": 0}'
```

Priced by the seconds of video it writes (the catalog has the rate). Given a `job_id` it finishes that job's
video. Films and music videos take the same object as a form field: `-F 'finish={"grade": "neutral", "grain": 0}'`
(priced like `videos/finish`). Pick `warm` for golden, human stories, `teal` for thrillers and night cities,
`neutral` when the light in the prompt already carries the mood.

## Filters and matched looks (packaging)

Send in `package` on `/api/v1/director/videos/film`, `/music`, `/text`, `/image`, `/reference`, or on
`POST /api/v1/director/videos/package` with a finished `job_id`:

- `filter`: `sepia`, `black_and_white`, `noir`, `vintage`, `faded`, `warm`, `cool`, `vivid`, `cinematic` (teal
  shadows, orange highlights), `dreamy` (`GET /api/v1/director/filters`, free).
- `filter_strength` 0-1 (1 is full; 0.5 is half way). `vignette` 0-1 (0.3 subtle, 0.6 strong).
- Captions, logo and end card keep their own colours; the filter covers the picture only.
- A filter does not change the packaging price.

Preview before you package (one frame as a JPEG, about a second, free):
`GET /api/v1/director/jobs/{id}/filter_preview?filter=all` (all filters side by side),
`?filter=noir&filter_strength=0.7`, or `&t=12` for another moment.

Match the look of a picture, a video or another job: `POST /api/v1/director/looks` (free) with a `picture`, a `video`
or a `job_id`. It answers with the look's `id` and which filter it is closest to. Then `"look_id": "..."` in
`package` (or `look_from_job` with one of your finished jobs, no upload). Use this to make a new clip match an earlier
film's colour.

```bash
curl -X POST "$BASE/api/v1/director/videos/package" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"job_id": "JOB_ID", "filter": "noir", "filter_strength": 0.8, "vignette": 0.3}'
```

## Relighting a finished clip: Montage Edit (priced from a quote)

When the render is right except the light or weather, `POST /api/v1/director/videos/edit` changes only that, on the
whole clip (up to 15 s) or a `start_s`/`end_s` window, with one short sentence: "Change the lighting to be more
dramatic." / "Make it night with heavy rain." It is priced from the studio's quote of the exact request, at least 16
credits, and has no free quote (`?dry_run` answers `400 preflight_unavailable`): tell the human it is a paid step
and wait for a yes; the started job's `credits.quoted` shows the hold. Try a filter or a matched look first when only
the colour is wrong. Wording rules: references/montage/montage-edit-prompting.md.

## Light from an inspiration video (films)

With `idea` on `/api/v1/director/videos/film`, send 1-3 `inspiration` videos (up to 120 s each) and
`inspiration_notes` ("the lighting and slow push-ins"): the studio studies camera, light, colour and pacing, and the
writer borrows only that style, never people or shots. Each video is priced like `understand/video` (at least 16
credits) on top of the film; it shows in the film's `?check=true` quote. Ask before using it.

## How light carries across clips

- Same look line, same light set-up words, same palette and accent colour in every clip, word for word.
- Same reference pictures in the same order; a location picture shot in one light pulls that light into every clip.
- Change light only with a cause in the story (a lamp switched off, a door opened, dawn arriving) and put the change
  inside a shot or at a clip join where time passes.
- One `finish` and one `filter` for the whole film (films apply them once after assembly). When you cut clips from
  different jobs together with `/api/v1/director/videos/assemble`, finish and filter the assembled job, not each
  part, or match them with `look_from_job`.

## Related skills

All in `references/montage/`: pixio-camera-language, pixio-transitions-continuity, pixio-looks-styles,
pixio-upscale-finish, pixio-video-editing, pixio-horror, pixio-product-ads, montage-edit-prompting.

## Checklist

- [ ] Every scene's light named as source + direction + softness + colour; no "cinematic lighting".
- [ ] One look line and one palette with one accent colour, identical in every clip.
- [ ] Time of day and weather stated in every shot of the scene; changes only with a story cause.
- [ ] No grain, noise, film-stock or camera-brand words; `grain: 0` in every finish.
- [ ] Stylised colour (B&W, sepia, noir, teal-orange) done with `filter` / `look_id`, previewed first.
- [ ] Named looks and styles only on text and image clips; `realism: 0` for animation.
- [ ] Reflections avoided at night windows on Basic; "normal human eyes, no glowing eyes" on emotional Premium close-ups.
- [ ] Motivated sources with one warm accent; a palette per world; a period rule repeated where it applies.
- [ ] Tests on `video_model: "montage-basic"`; Montage Edit and Premium only after the human's OK on the price.
