---
name: pixio-looks-styles
description: How to choose, preview and apply looks and styles on Montage (Pixio's Director API) - the different "look" tools and when each applies - render-time named looks and style blends (`look` and `styles: [{style, strength}]` on POST /api/v1/director/videos/text and /videos/image, listed by GET /api/v1/director/catalog), the film/music/remake `realism` switch, and after-render colour (package `filter`, `filter_strength`, `vignette`, matched looks from POST /api/v1/director/looks with `look_id` / `look_from_job`, GET /api/v1/director/filters, GET /api/v1/director/jobs/{id}/filter_preview, and the finish `grade`) - with no grain ever. Use whenever someone asks for a style, grade, colour filter, "make it look like this picture", sepia / black-and-white / vintage, or you set `look`, `styles`, `realism`, `filter` or `grade` on a request. Not for prompt-only style wording in 2D/3D (that is references/montage/pixio-anime-styles.md / pixio-3d-animation.md) or changing objects and weather in a finished video (that is references/montage/montage-edit-prompting.md).
---

# Looks, styles and colour filters

"Look" means several different things in this API. Pick the right tool before sending anything.

| tool | when it acts | fields | where it works | cost |
|---|---|---|---|---|
| **Named look** | during the render; changes what the model draws | `look` | `/api/v1/director/videos/text`, `/api/v1/director/videos/image` | part of the render |
| **Style blend** | during the render | `styles: [{"style", "strength"}]` (up to 3) | `/api/v1/director/videos/text`, `/api/v1/director/videos/image` | part of the render |
| **Realism switch** | during the render of films, music videos, remakes | `realism` (0-1) | `/api/v1/director/videos/film`, `/api/v1/director/videos/music`, `/api/v1/director/videos/remake` | part of the render |
| **Colour filter / matched look** | after the render, on the finished picture | `package.filter`, `filter_strength`, `vignette`, `look_id`, `look_from_job` | `package` on film, music, text, image, reference; or `POST /api/v1/director/videos/package` | packaging price; a filter adds nothing |
| **Cinema finish** | after the render | `grade` (neutral, warm, teal), `saturation`... (`grain` stays 0) | `POST /api/v1/director/videos/finish`; `finish` JSON on films and music videos | finishing price |

The word `look` means different things: `look` on `/api/v1/director/videos/text|image` = a named render look;
`look_id` in `package` = a measured colour look from `POST /api/v1/director/looks`; `/api/v1/director/videos/finish`
takes no `look` (use `grade`).

## House rules

- **Test cheaply on Basic.** Every test, draft or trial render sends `video_model: "montage-basic"` (it is also what
  renders when `video_model` is left out). Basic is billed in Pixio credits like everything else, just less.
  Premium or Ultra only when the user asks for it and has seen the `?check=true` quote (`credits.quoted`).
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE`
  (`https://beta.pixio.myapps.ai`) and `$PIXIO_API_KEY`.

## 0. Decision rules

1. **Verify names live.** `GET /api/v1/director/catalog` returns the current `looks` (each `{look, description}`)
   and `styles` (each `{style, description}`); `GET /api/v1/director/filters` (free) the colour filters. The names
   below are a snapshot. Send only names those calls return; check spelling against them, because fields and values
   the endpoint does not know are not applied.
2. **The API never picks a look or style from the prompt.** Without `look` or `styles` you get the default image.
3. **Looks and styles are text and image only.** `/api/v1/director/videos/reference`, films, music videos, remakes and
   episodes take neither: there the look comes from the words, `style`, `realism` and the post steps. They are made
   for Montage Basic; on Premium and Ultra expect little or no effect, so steer those with words and post colour.
4. **At most 3 styles per shot**, strength 0-1 each.
5. **Prefer a colour filter over a re-render** for any pure colour change: it is quick, adds nothing to the
   packaging price, and can be previewed free. Re-render only when the drawing itself must change (skin, style,
   light shape).
6. **Preview before packaging:** `GET /api/v1/director/jobs/{id}/filter_preview` (one JPEG frame, about a second,
   free).
7. **Age without grain.** If a look needs age, use the `vintage` or `faded` filter, never grain.
8. **A "make it look like this" picture is used too:** that is what `POST /api/v1/director/looks` is for.

## 1. Render time: `look` and `styles`

`GET /api/v1/director/catalog` lists them. Snapshot of the named looks (`look`):

| look | use it for | watch out |
|---|---|---|
| `default` | everything; a clean, neutral cinematic image | - |
| `realistic_people` | natural, matte skin and teeth on real people | faces rougher with `speed: "draft"` |
| `soft_portrait` | softest, most natural close-up faces | slower to render |
| `raw_skin` | rawest, unretouched skin for close-ups | describe the skin (pores, no makeup) in the prompt |
| `golden_hour` | warm, moody golden light | darker: a style, not an upgrade |
| `film_teal` | cool, contrasty teal film grade | darker |
| `anime_90s` | flat 1990s cel anime | 2D prompts only |
| `horror_80s` | soft, low-fi 1980s horror | not for clean modern looks |

Snapshot of the style blends (`styles[].style`):

| style | what it does | use for |
|---|---|---|
| `realistic_people` | natural, matte skin and teeth | any live-action person |
| `natural_faces` | clean teeth, polished faces | talking shots, presenters |
| `human_motion` | better walking, dancing, fighting | movement-heavy shots |
| `golden_hour` | warm, moody golden light | sunsets, romance, endings |
| `film_teal` | cool, contrasty teal grade | thrillers, night cities |
| `eighties_horror` | soft, low-fi 1980s horror film | horror, retro |
| `nineties_anime` | flat cel look | animated prompts only |

Rules:
- `strength` is 0-1. Start at about 0.6-0.8 for a mood style and 0.5-0.7 for a people or motion style; lower it if
  the picture gets darker or stiffer than you want.
- Up to 3 styles in one list. Combine one people or motion style with at most one mood style; two mood styles fight.
- A named `look` and `styles` can go together; keep the total effect modest and check a Basic draft first.
- On `/videos/text` (JSON) `styles` is a JSON array; on `/videos/image` (multipart) send it as JSON text in one form
  field.

**Text-to-video with a named look (JSON, quoted free first):**
```bash
curl -X POST "$BASE/api/v1/director/videos/text?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"video_model": "montage-basic", "look": "golden_hour", "duration": 5,
       "prompt": "integrated_multimodal_description: [Shot 1] Live-action, cinematic. An old fisherman mends a net on a wooden jetty at sunset and smiles to himself. The camera pushes in with small amplitude at slow speed.\noverall_soundscape: Gentle waves against the posts, gulls far off.\nnon_diegetic_music: N/A"}'
```
Drop `?check=true` to start it.

**Your own style blend (JSON `styles` list):**
```json
{"prompt": "...", "video_model": "montage-basic",
 "styles": [{"style": "realistic_people", "strength": 0.7}, {"style": "golden_hour", "strength": 0.6}]}
```

**Image-to-video (multipart: `look` as a form field, `styles` as JSON text):**
```bash
curl -X POST "$BASE/api/v1/director/videos/image" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "image=@portrait.png" -F "video_model=montage-basic" -F "look=realistic_people" \
  -F "prompt=For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description: [Shot 1] Live-action, cinematic. Continuing from the first frame, she smiles and says hello. Static Shot.
overall_soundscape: A quiet room.
non_diegetic_music: N/A"
```
Image endpoint form version of a blend: `-F 'styles=[{"style": "nineties_anime", "strength": 0.9}]'`.

**Choosing:** a real person talking: `realistic_people` (or `soft_portrait` for slow close-ups), or the
`natural_faces` style. A gritty documentary close-up: `raw_skin`. A mood: `golden_hour`, `film_teal`, `horror_80s`
(or the matching styles). 2D: `anime_90s` / `nineties_anime`. Movement: add `human_motion`. Fights: Fight Flow is
applied automatically to shots that read as a fight (`fight_flow`, see `references/montage/pixio-action-fights.md`);
you don't need a style for it.

## 2. Films and music videos: `realism`

`/api/v1/director/videos/film`, `/api/v1/director/videos/music` and `/api/v1/director/videos/remake` do not take
`look` or `styles`. They take `realism` (0-1): how photographic the result is.
- Live action with people: leave it unset (photographic by default).
- Any animation (2D, 3D, paper, stylized game art): `realism: 0`.
- The look of a film comes from its `style` sentence (with `idea`) and the look line in every clip, plus
  packaging filters afterwards.

## 3. After the render: colour filters

`GET /api/v1/director/filters` (free) lists them and the fields. Snapshot:

| filter | what |
|---|---|
| `sepia` | warm brown old-photo tones |
| `black_and_white` | clean black and white |
| `noir` | high-contrast black and white, deep blacks |
| `vintage` | faded film: softer colours, lifted blacks, warm highlights |
| `faded` | matte, washed out, lifted blacks |
| `warm` / `cool` | golden warmth / cold blue tint |
| `vivid` | richer colours, a bit more contrast |
| `cinematic` | teal shadows, orange highlights, more contrast |
| `dreamy` | soft glow, pastel tones |

Fields: `filter` (default none), `filter_strength` 0-1 (1 is full; 0.5 = half way), `vignette` 0-1 (0.3 subtle,
0.6 strong; works without a filter). The logo, captions, legal text and end card keep their own colours.

**Preview (free, one frame as a JPEG):**
```bash
# every filter side by side
curl -H "Authorization: Bearer $PIXIO_API_KEY" -o all.jpg "$BASE/api/v1/director/jobs/JOB_ID/filter_preview?filter=all"
# one filter, half strength, light vignette, at 4.5 s
curl -H "Authorization: Bearer $PIXIO_API_KEY" -o vint.jpg "$BASE/api/v1/director/jobs/JOB_ID/filter_preview?filter=vintage&filter_strength=0.5&vignette=0.3&t=4.5"
```
Show the human the sheet and let them choose before packaging.

**Apply to a finished job (priced like packaging; `?dry_run=true` quotes it free):**
```bash
curl -X POST "$BASE/api/v1/director/videos/package" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"job_id": "JOB_ID", "filter": "vintage", "filter_strength": 0.5, "vignette": 0.3}'
```
Or at render time inside `package` on `/api/v1/director/videos/film`, `/music`, `/text`, `/image`, `/reference`:
`"package": {"filter": "cinematic", "filter_strength": 0.6}` (JSON body) or `-F 'package={...}'` (forms).

## 4. Match a reference look

"Make it look like this picture / that video":
1. Measure it (free): `POST /api/v1/director/looks` with a `picture` (png, jpg, webp), a `video`, or the `job_id` of
   one of your finished videos (one of them):
   ```bash
   curl -X POST "$BASE/api/v1/director/looks" -H "Authorization: Bearer $PIXIO_API_KEY" -F "picture=@reference_still.jpg"
   ```
   The answer (`object: "director.look"`) has the look's `id` and says which filter it is closest to and why.
2. Preview: `GET /api/v1/director/jobs/JOB_ID/filter_preview?look_id=LOOK_ID` (or `look_from_job=OTHER_JOB`).
3. Apply: `package` with `"look_id": "LOOK_ID"` (or `"look_from_job": "OTHER_JOB"` with no upload).
   `filter_strength` blends the match; `vignette` still applies. `GET /api/v1/director/looks/{id}` shows a saved
   one. Only your own looks work.

Use this to make every clip of a series or every video of a brand match one hero frame.

## 5. Cinema finish (`grade`)

`POST /api/v1/director/videos/finish` with `job_id` (or an uploaded `video`, up to 7 min): `grade` neutral / warm
(default) / teal, `scope` (2.39:1 bars), `saturation` 0.7-1.1 (default 0.92), `deflicker`, `lufs`, and `grain` -
keep it 0. Films and music videos take the same as `finish` JSON: `-F 'finish={"grade": "neutral", "grain": 0}'`.
Order: render, upscale, finish, then package (see `references/montage/pixio-upscale-finish.md`).

## 6. Fixes

| problem | fix |
|---|---|
| look or style did nothing | wrong endpoint (reference, film, music, remake take none), unknown name (check the catalog), or a Premium / Ultra render; use words and a filter instead |
| more than 3 styles | keep the 3 that matter; drop extra mood styles first |
| faces too dark | drop `film_teal` / `golden_hour`; colour it after with a filter instead |
| plastic or beautified skin | `realistic_people` or `raw_skin`; write the skin out in the prompt |
| animation looks photoreal in a film | `realism: 0` |
| colour wrong after render | filter or matched look, previewed; no re-render |
| someone asks for film grain | explain grain is off by house rule; offer `vintage` or `faded` instead |

## 7. Checklist

- [ ] Right tool: `look` / `styles` (text and image), `realism` (film/music/remake), filter/matched look (after), `grade` (finish)
- [ ] Names checked live in `GET /api/v1/director/catalog` (`looks`, `styles`) and `GET /api/v1/director/filters`; at most 3 styles, strength 0-1
- [ ] `realism: 0` for animation films
- [ ] Filter or matched look previewed with `filter_preview` and approved by the human
- [ ] Grain 0 and no grain/noise words anywhere
- [ ] Test on `video_model: "montage-basic"`; `?check=true` quote shown before Premium
- [ ] API key never in prompts, URLs or logs
