---
name: pixio-ads
description: How to make ads, product videos, UGC-style clips and short social videos with Montage (Pixio's Director API) - the 2-second hook and beat timing for 9:16 and 16:9, UGC formats, ad variations from one approved ad, brands (/api/v1/director/brands), film_type=commercial, POST /api/v1/director/videos/package (end card, logo, voiceover, music bed, shapes, cutdowns), POST /api/v1/director/videos/graphics (hooks, badges, captions) and spending approval. Use whenever you plan, render, vary or package anything that sells or promotes a product, brand or offer. Prompt wording is in montage-basic-prompting / montage-premium-prompting; narrated explainers are in pixio-explainers.
---

# Ads and short social videos with Montage

An ad is three steps: **render** a clean clip (no text in the picture), **package** it (end card, logo, sound,
shapes, cutdowns), then optionally **graphics** (hooks, badges, prices, captions). Video models garble lettering, so
every word on screen is drawn afterwards as real pixels.

Base URL `$BASE` (`https://beta.pixio.myapps.ai`), key in `Authorization: Bearer $PIXIO_API_KEY`. Every call that
makes something is a billed job you poll with `GET /api/v1/director/jobs/{id}`.

## House rules

- **Test on Basic.** Every test, draft or trial render uses `video_model: "montage-basic"` (also the default when
  `video_model` is left out). Premium or Ultra only when the user asks for it and has seen the quote
  (`?check=true`, `credits.quoted`).
- **The customer's own song first.** A music video uses the song the user gave you (`song`). `POST /api/v1/director/music/generate`
  is only a fallback when there is no song at all. The same goes for an ad's music bed: their track first.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight. The
  product photo is always a reference.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.

Ad rules: spend nothing without a yes (a free quote with `?check=true` / `?dry_run=true` where the endpoint has one,
show `credits.quoted`, wait); no generated text in frames;
captions and graphics never cover faces (keep `avoid_faces` at its default `true`).

## 1. The 2-second hook

The first 2 s decide whether anyone watches. Open on the strongest image, never a slow build:
- **Result first:** the payoff (the clean pan, the glowing skin), then how.
- **Macro action:** a pour, a crack, a cap twisting off, in extreme close-up with its sound.
- **Problem on screen:** the mess, the spill, the dead phone, the alarm at 6 am.
- **Direct look:** a creator says one short line into the lens in the first 2 s.
- **Odd juxtaposition:** the product where it doesn't belong (sneakers in a fridge).
- **Hands enter frame** or a **reveal** (cloth pulled away, lid lifted, light sweep in the dark).
- **Question line** (voiceover or caption, added later): "Still doing it the hard way?"

Beats in a 15 s clip (4-6 shots of 2-4 s; no 0.5-1 s micro-shots in one prompt):

| Time | Beat |
|---|---|
| 0-2 s | hook: the striking image or the first line |
| 2-9 s | proof: the product does ONE thing (start state, use, visible result) |
| 9-12 s | payoff: the result on a person or in the place |
| 12-15 s | packshot: locked, still, front-on; the end card lies over it |

30 s: 0-3 hook, 3-8 set-up, 8-20 proof (3-4 shots), 20-25 payoff, 25-30 packshot. A faster ~1 s montage is several
takes cut together (`/api/v1/director/videos/assemble`), not one prompt.

Per platform:
- **9:16 (TikTok, Reels, Shorts):** faces and product in the middle band; keep the top ~12 %, bottom ~22 % and right
  ~14 % free (platform UI; `safe_area: "all"`, the default on 9:16). Hook by 1.5 s; captions on for sound-off viewing.
- **16:9 (YouTube, TV, web):** shots breathe longer; a TV spot ends on a 3 s end card with `lufs: -23`.
- **1:1 / 4:5 (feeds):** make them from the master with `formats`; keep the product centred so the crop holds it.
- **Loops:** on 9:16, make the last frame echo the first and skip the end card (`end_card_s: 0`) on loop cuts.

## 2. UGC-style ads

UGC sells because it looks like a person, not a brand. Turn the benefit into a situation a creator would film: not
"long-lasting battery" but "I forgot my charger on a 3-day trip and it's still at 40 %".

Structure (10-15 s, one speaker): **problem** (0-3 s, one hook line to camera, handheld selfie medium close-up),
**benefit** (3-10 s, shows and uses the product once, result visible), **call to action** (10-15 s, a reaction or one
closing line, then a still product close-up).

Formats: **talking to camera** (one line, ordinary room light, room tone, no music); **unboxing** (top-down hands,
lid opens, product lifted to the lens); **tutorial** (3 steps, one per shot, hands close-up, steps in captions or
voiceover); **review** (holds it up, one honest pro, uses it, nods); **TV spot** (polished, no on-camera talking,
voiceover added in packaging, hero shots, calm last shot).

Prompt tips (format rules: `references/montage/montage-basic-prompting.md` / `references/montage/montage-premium-prompting.md`):
- One short spoken line per shot; everything else is voiceover or captions added later.
- The product's printing stays exactly as in its picture; never spell label words in the prompt.
- "slightly imperfect, handheld phone-video look", practical light, not studio polish.
- End on the product close-up held still, so captions and the end card have room.

Let the writer do a short ad: `POST /api/v1/director/prompts/write` with `mode: "reference"`, `duration` 6-15,
`film_type: "commercial"`, optional `brand_id`, `product_pictures` (e.g. `[1]`), `voiceover: true`, `end_card_s`,
`aspect`, `references`. Then render on `/api/v1/director/videos/reference` with the same pictures in the same order:

```bash
curl -X POST "$BASE/api/v1/director/videos/reference?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-basic -F aspect=9:16 -F duration=15 \
  -F "images=@product.png" -F "images=@creator.png" -F "images=@bathroom.png" \
  -F "prompt=<ugc_prompt.txt" -F brand_id=BRAND_ID \
  -F 'package={"formats": ["1:1"], "captions": "auto", "caption_style": "pop", "end_card_s": 3}'
```

(`prompt=<file` sends the file's text; `prompt=@file` would upload it as a file.)

## 3. Ad variations (the multiplier)

Once one ad is approved, make N versions for testing. Lock what worked; vary only what an audience reacts to.

| Keep fixed | Vary |
|---|---|
| product and its picture (same slot) | talent (a new person picture) |
| shot list, camera moves, framing, timing | wardrobe, setting / location picture |
| sound: music bed, voiceover script and timing | the hook line (first 2 s) |
| aspect, end card, brand, `package` | optionally `voiceover_voice` |

1. Copy the approved prompt N times; change only person / place / outfit descriptions and the hook line.
2. Swap the matching pictures; keep the product picture in the same slot; optionally reuse the approved `seed`.
3. Keep `duration`, `aspect` and the same `package` object.
4. `POST /api/v1/director/prompts/check` each variant (free); quote all N with `?check=true`, show the total, ask. Label them (A-hook1-talentB...).

Shortcut for exploring: `POST /api/v1/director/videos/film` with `idea`, `film_type=commercial` and `variants` 2-4 makes that many
jobs with new seeds and different hooks (`ad_style=auto` gives each its own format); ids in `versionJobIds`. Each extra version is billed like the first,
and every version is held up front.

## 4. Brands, commercial mode and packaging

**Brand (once per customer):**

```bash
curl -X POST "$BASE/api/v1/director/brands" -H "Authorization: Bearer $PIXIO_API_KEY" -F name="Cosmo Coffee" -F logo=@logo.png \
  -F tagline="Coffee that keeps up with you" -F cta="Try it today" -F accent_color="#E85D04" \
  -F description="cold brew in a slim red can" -F audience="students" -F voice="upbeat" -F banned_words="cheap"
```

Saving and listing brands is free (at most 50 per account). `GET /api/v1/director/brands` lists them;
`POST /api/v1/director/brands/{id}` changes only what you send. Brand text (`product_name`,
`description`, `audience`, `voice`, `look`, `banned_words`) briefs the writer; its end card and sound defaults
(`end_card_s`, colours, `logo_corner`, `music_db`, `voiceover_db`, `duck_db`, `lufs`) feed packaging.

**Commercial mode:**
- `POST /api/v1/director/videos/film` with `film_type=commercial` and `idea`: a 2 s hook, the product as the answer, hero shots,
  no on-screen text, a calm last shot; the writer reviews it against the ad rules (`adReview` credits, about 20-40 s
  more). `ad_style`: `auto` (default) or `problem_solution`, `product_hero`, `slice_of_life`, `demo`,
  `cinematic_story`, `comedy`, `sensory`, `montage`, `before_after`, `aspirational`, `reveal`.
  `product_pictures` (e.g. `[1]`) gets hero shots; `package.packshot_picture` puts one of your `images` on the end card. Add
  `brand_id`, `package`, `logo`, `music_bed`, `voiceover`.
- `POST /api/v1/director/videos/music`: `brand_id`, `package`, `logo`; the customer's song stays the soundtrack.
- Single clips (`/api/v1/director/videos/text`, `/image`, `/reference`): `brand_id` and `package` start a packaging job when the
  clip is done (`packageJobId`, a `videos/package` job to poll); `/image` and `/reference` also take `logo` and
  `packshot`. `?check=true` quotes `credits.clip` and `credits.packaging`.
- Narrated explainers (`film_type=explainer`): see `references/montage/pixio-explainers.md`.

**Premium for ads** (only after the user OKs the quote): Montage Premium holds a label from its picture and is strong
on product motion; up to 30 pictures per clip (6-9 work best; more can cost more, so re-quote); prompts in the
Premium format (`@Image1`), not Basic tags (`references/montage/montage-premium-prompting.md`).

**Package** (`POST /api/v1/director/videos/package`, a finished `job_id` or an uploaded `video` up to 7 min; priced by
the seconds of video it writes, `?dry_run=true` is a free quote):

```json
{"job_id": "JOB_ID", "brand_id": "BRAND_ID", "end_card_s": 3, "end_card_style": "blur",
 "logo_corner": "top-right", "formats": ["9:16", "1:1", "4:5"], "reframe": "crop", "cutdowns": [15, 6],
 "voiceover_text": "Mornings are hard. Your coffee shouldn't be. Cosmo. Try it today.",
 "voiceover_voice": "am_michael", "captions": "auto", "caption_style": "pop", "caption_words": 3,
 "caption_position": "center", "caption_uppercase": true, "legal": "Terms apply."}
```

- End card: `tagline`, `cta`, `end_card_s` (0-8; the video's length never changes, the card lies over the last
  seconds), `end_card_style` `blur` / `solid`, `packshot` file (product cut-out above the logo).
- Sound: `music` or `voiceover` files, or `voiceover_text` (up to 1,500 characters, read by a studio voice) with
  `voiceover_voice`; `score` (`auto` or a description) makes a bed; `music_db`, `voiceover_db`, `duck_db`,
  `keep_original_audio`, `lufs` (-14 streaming default, -23 broadcast).
- Shapes and lengths: `formats` (`16:9`, `9:16`, `1:1`, `4:5`), `reframe` (`crop` follows faces, `fit` letterboxes
  over a blur), `cutdowns` (up to 3 lengths, 5-120 s; opening plus end card, in every shape).
- Look: `filter`, `filter_strength`, `vignette`, or `look_id` (`POST /api/v1/director/looks`); preview with
  `GET /api/v1/director/jobs/{id}/filter_preview`.
- Result: `output.url` (the master) and `deliverables`, a list with `name`, `aspect`, `cutdownSeconds`, `width`,
  `height`, `durationSeconds`, `url` and `assetPath` each. Captions, fine print, the packshot and a typed voiceover do
  not change the price.

**Voiceover voices:** `GET /api/v1/director/voiceover/voices` lists the preset voices (free; `id`, `language`, `description`);
`am_michael` reads brand names clearly. A real person's voice (with their consent): upload `voiceover_sample` (5-15 s,
clean) and pick `voice_clone` (`natural` default, `fast` or `classic`; same price).

**Graphics** (`POST /api/v1/director/videos/graphics`; `/api/v1/director/videos/graphics/plan` suggests a list). Up to 40 elements: `text`,
`image`, `badge` (`shape` `pill` / `burst`), `arrow`, `checklist`, `button`, `end_card`; `t` in seconds or `beat:N` /
`downbeat:N`; `d` length; `x` / `y` 0-1.

```json
{"job_id": "JOB_ID", "brand_id": "BRAND_ID", "safe_area": "all", "snap_to_beat": true,
 "captions": true, "caption_style": "pop", "caption_position": "lower_third",
 "graphics": [
  {"type": "text", "text": "Still doing it the hard way?", "t": 0.2, "d": 2.2, "y": 0.3, "animation_in": "pop"},
  {"type": "badge", "text": "$4.99", "shape": "burst", "t": "beat:8", "d": 3, "x": 0.82, "y": 0.22},
  {"type": "button", "text": "Shop now", "t": 11.5, "d": 3, "y": 0.75}]}
```

- `safe_area`: `tiktok`, `reels`, `shorts`, `all` (default on 9:16), `none`, or your own fractions.
- `fix_layout` (default true) moves overlaps and lengthens text too short to read; never turn off `avoid_faces`.
- Graphics are priced like `videos/finish` on the video's seconds; the planner (`/graphics/plan`, or `auto: true` +
  `brief`) and a `music_prompt` bed each add their own charge (catalog): ask first. Graphics have no free quote. Put captions in graphics or in package, not both.

## 5. Spending: dry run, estimate, ask

1. Add `?check=true` to the render, film or music call, or `?dry_run=true` to the package call (free; nothing
   starts). Graphics, lip fix and the other tools have no free quote: use the rates in `GET /api/v1/director/catalog`.
2. Read `credits.quoted` and any note that the real request would be refused.
3. Tell the user what renders, on which model, how many variants, the total; wait for a clear yes.
4. Test on `video_model: "montage-basic"`; move to Premium only with the user's OK on the approved version.
5. Redos and variants are new jobs with their own `credits`; add them up for the running total.

## Checklist before you hand over

- Hook in the first 2 s; one idea; the product named and shown; a calm last 2-3 s for the end card.
- No generated text in frames; every word comes from package or graphics.
- Captions on for 9:16; nothing over faces; inside the platform safe area.
- Every customer picture used; product printing matches its photo; checked with `references/montage/pixio-video-qa.md`.
- `grain` 0; Basic for tests; every paid step approved.

