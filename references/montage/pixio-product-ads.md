---
name: pixio-product-ads
description: How to make premium product films with Montage (Pixio's Director API) - a start gate (product photos, variants, duration, ratio, copy), photo triage, anchor stills, hero close-ups, negative space, materials and light, macro, turntables, a beat storyboard, keeping the product identical to its pictures, and Montage Premium commercial prompting. Use whenever the subject of the video is a physical product and the goal is a clean, high-end product spot or packshot film. Not for the ad funnel, hooks, UGC or variations in general (that is pixio-ads), brand or app stories (pixio-brand-promo), or creator-style reviews (pixio-ugc-creator).
---

# Premium product films

A product film sells the object itself: its shape, its material, one thing it does, and a calm final frame.
`references/montage/pixio-ads.md` covers hooks, UGC, the variation multiplier and packaging. This skill goes deeper on
one job: making the **object** look expensive and exactly like its photo. Prompt syntax lives in
`references/montage/montage-basic-prompting.md` (Montage Basic) and `references/montage/montage-premium-prompting.md`
(Montage Premium and Ultra, including its Commercials section). Brands, packaging, graphics and the spending steps are
in `pixio-ads`; this skill only adds what is special to product films.

## House rules

- **Test on Montage Basic.** Every test, draft or trial render runs on `video_model: "montage-basic"` (also what you
  get when `video_model` is left out). Montage Premium or Ultra only when the user asks for it and has seen the quote
  (`?check=true`, `credits.quoted`). Every render is billed in Pixio credits, Basic included.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight. Every
  product photo is a reference.
- **No film grain.** Keep `grain` at 0 in `videos/finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE`
  (`https://beta.pixio.myapps.ai`) and `$PIXIO_API_KEY`.

No words, prices or logos drawn by the video model: copy is added afterwards (package or graphics).

## 1. Decision rules (read first)

| Situation | Do this |
|---|---|
| One product, 5-15 s, a clean spot | `/api/v1/director/videos/reference`, `duration` 5-15, the product photos as references |
| 30 s or longer, or several products | `/api/v1/director/videos/film`, `duration` a multiple of 15, `film_type=commercial`, `ad_style=product_hero` (or `sensory`, `reveal`, `demo`) |
| You want the AI to write it | `POST /api/v1/director/prompts/write` with `mode=reference`, `duration` 6-15, `film_type=commercial`, `product_pictures`, `end_card_s` |
| Label must stay sharp and legible | Montage Premium, product still or turning slowly, camera moves around it; or Montage Basic with a plain product |
| Product photo is weak (blurred, dark, cropped, busy background) | Stop and ask for a reshoot or make a clean anchor still first (section 4) |
| Several colourways | One photo per colourway, all used; "Color family" spine (section 3) |
| Any on-screen words | Never in the prompt: `package` (tagline, cta, legal) or `/api/v1/director/videos/graphics` text elements |

## 2. The start gate (ask before you write a word)

Collect these, in one short message, and repeat the answers back before rendering:

1. **Product photos.** Which one is the main (hero) picture? Front, side, back, detail? Any packaging?
2. **Variants.** One product, or several colours / sizes? Which is the lead variant?
3. **Duration.** 5, 10 or 15 s for a single spot (10 s is a good default); 30 s+ only as a film.
4. **Ratio.** 16:9, 9:16 or 1:1 for the render. The same ratio carries through every step; other shapes come
   later from `package.formats` (16:9, 9:16, 1:1, 4:5).
5. **Look template.** Pick one: *white tech* (bright seamless white, soft top light), *dark rim light* (black set,
   one hard side key, thin rim), *brand colour field* (a seamless background in the brand colour), *light
   lifestyle* (a real surface: walnut, marble, linen, by a window).
6. **Copy.** Customer's own words, or you propose 2-3 lines of 3-5 words each (material or sensory, not a slogan:
   "Cast in one piece", "Cold for 24 hours" only if the customer confirms the fact).
7. **Tier.** Montage Basic for the test. Montage Premium only for the approved final, after the `?check=true` quote is accepted.

## 3. Pick one narrative spine

Every product film is one of these. Pick from the product's form, not from habit.

- **Launch / reveal:** empty negative space -> the hero angle appears (light sweep or slow push) -> material or
  structure detail -> one natural action (lid lifts, strap clicks) -> calm full-product close.
- **Feature touch:** stillness -> a hand or trigger enters -> the feature works (start state -> operation ->
  visible result) -> macro of the result -> final hold.
- **Color family:** the lead variant alone -> the other variants slide or step into frame one by one -> they
  settle in a colour order -> the full set holds.
- **Material study** (`ad_style=sensory`): macro texture passes (leather pores, brushed metal, glaze) with
  their sounds, then one wide hero.
- **Turntable:** one continuous slow orbit of a still product with a light sweep, then a locked front hold. Good
  for 5 s cutdowns and e-commerce pages.

**Story ads (people using the product):** give the ad a four-beat spine (setup, problem, choice, resolution) and
give every clip one beat. Put the product inside the action (worn, held, used), not only in hero shots, and end on
a packshot. The product's own pictures win over everything else; send front and back pictures to fix its cut,
colours, print and logo. Words in the picture only come from a picture you send. Per shot: a start state, one
action, the change, an end state; a static wide first when a pose matters; heads in frame; one camera move; small
physical acting; nobody looks into the lens unless the format needs it. With several heroes, mirror their beats.
Commercial mode (`film_type: "commercial"` or a `brand_id`) writes ads this way for you.

Pacing by length: **5 s** = one small peak and a stable close (Basic: 1-2 shots). **10 s** = 1-2 peaks, 1-2 quiet
beats (Basic: 3 shots). **15 s** = 2-3 peaks, 2 quiet beats (Basic: 4-5 shots; Premium: 4-6). No shot under 2.5 s on
Basic; the last 2-3 s are always a locked packshot with room for the end card.

## 4. Photo triage and anchor stills

Look at every supplied photo before writing:
- **Usable:** sharp, evenly lit, product fills most of the frame, plain background, the front visible.
- **Weak:** motion blur, heavy shadows, product small in a busy scene, a hand covering it, cropped edges. Say what
  to reshoot ("front-on, eye level, on a plain grey card, daylight, the whole product in frame").
- **Note what moves:** lids, hinges, straps, buttons, screens, liquids. One of these becomes the action beat.

When the photos are usable but the scene isn't, make **anchor stills** with `/api/v1/director/images/reference` (the product
photo as `<Picture 1>`, `image_model=high`, `megapixels=8`). Make separate standalone pictures, never a grid:
1. the hero view on the chosen set (template from the start gate);
2. a material / mechanism detail;
3. the final composition with the empty space where the copy will go.
Then render with the original photo **and** the anchors as references. The original is never replaced; the
anchors only add the set and the light.

```
Product photography of the kettle in <Picture 1>, exactly its shape, proportions, colours and surface finish
from <Picture 1>. It stands on a seamless warm-grey studio sweep, on the right third of the frame; the left two
thirds are empty soft gradient. One large soft key light from the upper left, a thin rim light from behind on
the right, no other light. Shallow depth of field, clean digital image.
```

## 5. Composition: hero close-ups and negative space

- **Hero close-up:** the product fills at least a third of the frame, front facing camera, sharp, lit by a named
  key. At least one per clip.
- **Negative space:** put the product on a third and leave the other side empty and even (a gradient, a soft
  wall). That empty side is where the package tagline or a graphics `text` element goes. Say it in the prompt:
  "the left two thirds of the frame are empty soft grey".
- **Macro:** one detail per macro shot (the stitch, the knurled dial, the condensation bead). Say what stays
  sharp and what falls into blur.
- **Scale once:** give the real size against a hand or a known object ("fits in one palm"), then keep it.
- **One subject per frame** in the hero shots: no props competing in colour or size.
- **The product's colour is locked.** "Premium" changes the set, light and framing, never the body colour. No
  white flashes, random particles, fake HUDs, glass cards or mirror floors: they cheapen the shot.

## 6. Materials and light (write the set-up, not a mood)

| Material | Light set-up that works | Write also |
|---|---|---|
| Glass, clear plastic | rim light from behind plus a soft fill; dark or gradient background | "the glass stays clear; no new reflections" |
| Polished metal, chrome | large soft key, a slow light sweep across it | "reflections move smoothly across the metal" |
| Brushed metal, anodised | hard side key raking across the brushed lines | "fine brushed lines visible" |
| Matte ceramic, stone | soft window light from one side, no fill | "matte surface, no shine" |
| Leather, fabric | low raking light to show texture, warm | "the leather texture / weave is visible up close" |
| Liquids | back or side-back light to make it glow | "it fills to two thirds and the surface settles" |
| Screens | the screen shows a plain colour or soft glow | real UI is added afterwards (`references/montage/pixio-brand-promo.md`) |

One grade phrase, the same words in every clip ("natural colour, soft contrast, cool shadows, warm highlights").
Never "8K", "masterpiece", glow, sparkle or gloss stacks, and never grain or film-stock words.

## 7. Turntables and camera moves

- Move the **camera around a still product**, not the product. A spinning product breaks its printing.
- **Montage Basic:** use only the trained camera words: "Arc Shot with small amplitude at slow speed", "The camera
  pushes in with small amplitude at slow speed", "Truck Left", "Static Shot". Not "orbit", "dolly" or "crane".
- **Montage Premium / Ultra:** "slow orbit of at most 90 degrees", "slow push-in", "lateral slide", "locked-off
  camera". A full 360 only as one short shot, and only on a product with no printing.
- One move per shot. The packshot is always static.

## 8. Keep the product identical (consistency)

- The product is **`<Picture 1>` / `@Image1`**, first in every list, and named in every shot it appears in.
- Bind several angles as one object: Premium "@Image1-@Image3 are the same kettle from the front, side and back;
  exactly one kettle appears"; Basic `<Subject 1> is the kettle in <Picture 1> and <Picture 2>`.
- **Never spell the printing**, and never invent printing the photo doesn't show. On Basic, a product with no text is
  "plain" every time; don't write "label", "logo" or the brand name on it.
- Describe the real mechanism with a measure and what never happens ("the lid lifts about 30 degrees on its
  hinge; the body never opens"), never a vague "it changes state".
- Hands never cover the front. Liquids follow gravity and end in a named state.
- On films, `product_pictures` (e.g. `[1]`) tells the writer which of your `images` show the product, so it plans hero
  product shots. Check every clip by eye against the product photo (`GET /api/v1/director/jobs/{id}/shots` gives a
  thumbnail per shot, free), or run Montage Analyze (`POST /api/v1/director/videos/edit/analyze` with `job_id`,
  `checks: ["prompt_match", "text"]`) for a report. Redo a clip whose product looks wrong before packaging.

## 9. The beat storyboard (write it before the prompt)

Show the human a table like this and wait for approval:

| Time | Shot | Purpose | Camera | Rhythm |
|---|---|---|---|---|
| 0-3.5 s | ECU: light sweep across the spout, steam starts | hook / reveal | push in, slow | setup -> impact |
| 3.5-7 s | CU 45 degrees: water pours in a clean arc | proof (one function) | Arc Shot, slow | commit |
| 7-10 s | MCU front-on, product on the right third, left empty | packshot / copy space | static | brake -> settle |

Copy is planned in the same table but drawn later: at most one short line at a time, one mid-film moment and one
final line, single line, never stacked, never over the product.

## 10. Prompt examples

**Montage Basic, 10 s, reference format** (abbreviated; the full detailed_description is 350-500 words):
```
subject_definitions:
<Subject 1> is the matte black kettle in <Picture 1> and <Picture 2>, with a long curved spout and a pale wood
handle, about as tall as a forearm is long, plain with no text on it.
<Subject 2> is the warm-grey seamless studio set in <Picture 3>.
summary:
[reference generation] <Subject 1> stands alone on <Subject 2>; a light sweep reveals it, water pours from its
spout, and it ends front-on and still with the left of the frame empty.
retention_analysis:
<Subject 1> (appears in [Shot 1], [Shot 2], [Shot 3]): fully_preserved - shape, proportions, colours and finish.
<Subject 2> (appears in [Shot 1], [Shot 3]): partially_preserved - the backdrop kept; the light is new.
detailed_description:
Live-action commercial product film, clean digital image, studio light, shallow depth of field. [Shot 1]
Extreme close-up of the spout of <Subject 1>; a narrow band of light slides across the matte black surface from
left to right and a thin curl of steam rises. The camera pushes in with small amplitude at slow speed. [Shot 2]
At 00:03.500, the camera cuts to ... [Shot 3] At 00:07.000, the camera cuts to a medium shot, front-on:
<Subject 1> stands still on the right third of <Subject 2>; the left two thirds are an empty soft grey
gradient. Static Shot, holding.
overall_soundscape: Shot 1: a soft hiss of steam. Shot 2: water pouring into a cup. Shot 3: quiet room tone.
non_diegetic_music: Sparse warm electric piano, slow tempo, a few soft notes, no drums.
```

**Montage Premium / Ultra**: use the `[Assets] [Summary] [Shot list] [Continuity] [Sound] [Constraints]` block format
and the Commercials rules in `references/montage/montage-premium-prompting.md`. Premium jobs with
`film_type=commercial`, a `brand_id` or a `package` get the commercial rules added to the prompt for you.
`POST /api/v1/director/prompts/write` has no `video_model` field and writes in the Montage Basic format: for a Premium
commercial, use its plan as your starting point and write the Premium prompt yourself (Premium films with an `idea`
are written for Premium by the studio).

Bad vs good:
- Bad: "A stunning premium kettle, 8K, cinematic, glowing, the BREWLINE logo on the side, spinning 360."
- Good: "The kettle in `<Picture 1>` stands still; the camera arcs slowly from its side to its front; one soft key
  from the left, a thin rim light behind; it stays exactly as in `<Picture 1>`."

## 11. Render, check, package

```bash
BASE=https://beta.pixio.myapps.ai
curl -X POST "$BASE/api/v1/director/videos/reference?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-basic -F duration=10 -F aspect=16:9 \
  -F "images=@kettle_front.png" -F "images=@kettle_side.png" -F "images=@set_anchor.png" \
  -F "prompt=<kettle_prompt.txt" -F brand_id=BRAND_ID -F "packshot=@kettle_cutout.png" \
  -F 'package={"end_card_s":3,"tagline":"Pours like a promise","formats":["9:16","1:1"]}'
```
The free check returns `credits.clip` and `credits.packaging` and the prompt report. Drop `?check=true` after the
plan looks right. Poll `GET /api/v1/director/jobs/{id}`; when the clip is done, the packaging runs as its own job,
`packageJobId` on the shot (poll it for the packaged video and its `deliverables`). Packaging options worth using
on product films: `packshot` (a cut-out product PNG on the end card), `end_card_style` `blur` or `solid`,
`logo_corner`, `legal`, `filter` (preview with `GET /api/v1/director/jobs/{id}/filter_preview`, free; never a grain
look). New shapes come out at the source's class unless upscaled: run `POST /api/v1/director/videos/upscale`
(~1080p) first when the client needs 1080-class deliverables.

## Checklist

- Start gate answered: hero photo, variants, duration, ratio, look template, copy, tier.
- Every product photo used; the product is reference 1; its printing never spelled.
- One spine; one action per shot; a hero close-up per clip; negative space where the copy goes.
- Light written as a set-up; one grade phrase; no grain, no quality stacks.
- Camera moves around a still product; trained camera words only on Montage Basic.
- Last 2-3 s locked packshot; copy, logo and prices only via package or graphics.
- Every clip checked against the product photo; `?check=true` quote shown; Basic test approved before Premium.
