---
name: pixio-brand-promo
description: How to make brand, app, website and shop promo videos with Montage (Pixio's Director API) - collecting brand facts and asset provenance, a brand truth sheet, choosing a narrative direction, a beat plan, real UI and real footage instead of generated screens, claims you may and may not make, the manifesto format, inspiration videos, and the logo end card via packaging. Use whenever the video promotes a company, an app or SaaS, a website, a shop, a restaurant, a service or a launch rather than one physical product. Not for product packshot films (that is pixio-product-ads), the general ad funnel and variations (pixio-ads), or creator-style reviews (pixio-ugc-creator).
---

# Brand, app, site and shop promos

A brand promo tells a short true story about a business: who it is for, what it does, the proof, the promise, the
logo. The hard parts are not the shots; they are **getting the facts right** and **using the real assets**
(logo, UI, storefront, team) instead of model-invented look-alikes.

`references/montage/pixio-ads.md` has the shared basics (hook timing, packaging, graphics, variations, spending);
this skill adds the brand-specific craft: facts, provenance, claims, real UI and the brand story.

## House rules

- **Test on Montage Basic.** Every test, draft or trial render runs on `video_model: "montage-basic"` (also what you
  get when `video_model` is left out). Montage Premium or Ultra only when the user asks for it and has seen the quote
  (`?check=true` / `?dry_run=true`, `credits.quoted`). Every render is billed in Pixio credits, Basic included.
- **The customer's own song first.** A music video uses the song the user gave you (`song`). `POST /api/v1/director/music/generate`
  is only a fallback when there is no song at all. The same goes for a promo's music bed: their track first.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `videos/finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE`
  (`https://beta.pixio.myapps.ai`) and `$PIXIO_API_KEY`.

Text, logos and screens with writing are never generated: `package` or `/api/v1/director/videos/graphics` draws them.

## 1. Decision rules

| The brand is... | Spine | Main endpoint |
|---|---|---|
| An app / SaaS / website | need -> intent -> the product doing one job (real UI) -> output -> proof -> logo | `/api/v1/director/videos/film` 30 s, or clips + `/api/v1/director/videos/assemble` with real screen recordings |
| A shop, café, salon, studio | the place -> the craft (hands, process) -> the customer moment -> the result -> logo | `/api/v1/director/videos/film`, `film_type=commercial`, `ad_style=slice_of_life` |
| A service (cleaning, legal, trades) | context (the problem) -> process -> evidence -> outcome -> promise -> logo | `film_type=commercial`, `ad_style=problem_solution` or `before_after` |
| An image-led / mission brand | authentic imagery -> motif -> benefit -> emotional payoff -> logo | `film_type=commercial`, `ad_style=aspirational` or `montage`, with the manifesto written into the `idea` (section 7) |
| A launch / announcement | hook -> what is new (one thing) -> how it looks in use -> when / where -> logo + CTA | 15-30 s, `ad_style=reveal` |

Default length: 15 s for a fast launch, 30 s for a brand story, 45-60 s only for a manifesto or a site hero video.

## 2. Intake: ask once, in one message

- **Assets:** logo file (PNG with transparency), brand font (.ttf/.otf), colours (hex), product or storefront
  photos, team photos (with consent), real UI screenshots or screen recordings, existing footage, the official URL.
- **Facts:** official name and spelling, what it does in one sentence, audience, the 1-3 features to show, any
  numbers they want to claim, the call to action, required disclaimers.
- **Delivery:** duration, ratio, where it runs (site hero, YouTube pre-roll, Reels...), language of the voiceover
  and of the on-screen copy, captions yes/no.
- **Music:** the customer's own track if they have one (always first); a generated bed only as a fallback.

## 3. The brand truth sheet and asset provenance

Before writing, build two short lists and show them to the human.

**Brand truth sheet** (only what a source supports):
```
Name: Lumen Bikes (spelling from the logo file and the website footer)
One line: bike repair and rentals in one shop by the canal (website, About page)
Audience: commuters and weekend riders (customer brief)
Show: same-day repair; rentals by the hour; the canal-side workshop (customer brief)
Claims allowed: "Same-day repairs" (on the website); NOT "fastest in town" (no source)
CTA: "Book a repair at lumenbikes.example" (customer)
Disclaimer: none given
```

**Provenance manifest**, one row per identity-bearing asset:

| ID | What | Source | Status |
|---|---|---|---|
| A1 | logo.png | customer upload | user-supplied |
| A2 | workshop_front.jpg | customer upload | user-supplied |
| A3 | booking-page.mp4 (screen recording) | customer upload | user-supplied |
| A4 | the mechanic's face | AI-designed character | concept, not a real employee |

Source order: the customer's originals first, then the official website or press kit. Never logo aggregators,
search thumbnails, fan art or a model-redrawn logo. If a logo or UI can't be verified, ask for the original rather
than approximating it. If the customer can't confirm they may use an asset, say the piece is a concept and that
publishing it commercially needs their permission.

## 4. Claims: never invent

- Names, features, numbers, prices, awards, ratings and slogans come from the customer or the official site, word
  for word. No source, no claim.
- No made-up statistics ("10,000 happy riders"), testimonials, review stars, certifications or "No. 1" lines.
- An AI-generated person is not a real customer or employee: never caption them as one.
- Disclaimers from the brief go in `package.legal` (up to 300 characters; `legal_always: true` to show it for the
  whole video).
- Put the brand's forbidden words in `banned_words` on the brand (`references/montage/pixio-brands.md`); the writer
  never uses them. Still read the written script yourself.

## 5. Present 2-3 directions, then plan beats

Give the human 2-3 one-paragraph directions (spine, mood, one signature image each), recommend one, and wait.
Then a beat plan: 15 s = 5-8 beats, 30 s = 8-12 beats. Each beat states: time, the visual owner (which asset ID or
which generated shot), the one action, what it proves, the copy line (if any), and its rhythm intent
(setup / anticipation / impact / brake / settle). Plan 2-3 energy peaks with quieter beats around the key message.

A 15 s app promo, for example:

| Time | Visual owner | Action | Proves | Copy (drawn later) |
|---|---|---|---|---|
| 0-2 s | generated: a rider with a flat tyre at dawn | looks at the wheel, sighs | the need | - |
| 2-5 s | A3 screen recording (real UI) | the booking flow, 3 taps | it is easy | "Book in 3 taps" |
| 5-9 s | generated + A2 picture: the workshop | mechanic fixes the wheel | the service is real | - |
| 9-12 s | generated: the rider rides away along the canal | relief | the outcome | "Same-day repairs" |
| 12-15 s | end card: A1 logo, tagline, CTA | hold | the brand | CTA |

## 6. Real UI, real places, real people

- **Screens:** video models garble UI and text. In generated shots, a phone or laptop screen "shows a plain soft
  blue glow" (no writing). The real UI comes from the customer's own screen recording, cut in with
  `POST /api/v1/director/videos/assemble` (clips from finished jobs and uploaded `videos`, each with a trim and a
  `transition_in`), or a screenshot laid over a shot with a graphics `image` element (`graphics_images` upload).
- **Places:** the customer's storefront or interior photo is a reference picture (`<Picture N>` on Montage Basic,
  `@ImageN` on Premium), bound as a place ("take only the place"). Don't describe its sign text.
- **People:** real staff only with their photo and consent; otherwise an AI-designed character, clearly a concept.
- **Logo:** never in a prompt. It is drawn on the end card or corner by `package` (`brand_id` or a `logo` file),
  or by a graphics `image` element with `"image": "logo"` (needs a `brand_id` whose brand has a logo).

## 7. Style without copying: inspiration and the manifesto

- `/api/v1/director/videos/film` with `idea` takes `inspiration`: 1-3 reference videos (up to 120 s each) that are
  studied for camera, light, colour, pacing and staging, plus `inspiration_notes` saying what to take from each.
  Each video is priced like `understand/video` on top of the film (see the catalog): quote with `?check=true` and
  ask. People, faces, logos and exact shots are never copied, and the videos are not kept.
- **The manifesto** (opt-in only, never the writer's default): a second-person voiceover over a rhythmic montage of
  different people alone in frame, practical light, a few held images; the brand appears through its effect, then
  the logo over the last live shot. There is no manifesto `ad_style`: ask for it in the `idea` (with
  `film_type=commercial`, `ad_style=montage` or `aspirational`) and give the script as `package.voiceover_text` (or
  the customer's recorded `voiceover`).
- Montage rhythm (about 1 s per shot) is made in the edit: render takes of 3-6 shots of 2-4 s, then cut them
  tighter with `POST /api/v1/director/jobs/{id}/edit` or `/api/v1/director/videos/assemble`. Never ask one prompt for 0.5-1 s micro-shots.

## 8. Request examples

A 30 s brand film written by the AI, packaged with the brand:
```bash
BASE=https://beta.pixio.myapps.ai
curl -X POST "$BASE/api/v1/director/videos/film?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-basic -F duration=30 -F aspect=16:9 \
  -F film_type=commercial -F ad_style=slice_of_life -F brand_id=BRAND_ID \
  -F "images=@workshop_front.jpg" -F "images=@workshop_inside.jpg" -F "images=@mechanic.png" \
  -F "idea=A commuter's bike breaks at dawn; Lumen Bikes by the canal fixes it the same day; she rides away. Show the workshop in Picture 1 and 2." \
  -F 'package={"end_card_s":3,"voiceover_text":"Flat tyre at 7? Book in three taps. Ride home tonight. Lumen Bikes.","voiceover_voice":"am_michael","captions":"auto","caption_style":"pop"}'
```
Pick `voiceover_voice` from `GET /api/v1/director/voiceover/voices` (free) and write the script in that voice's
language. When the writer makes a commercial, a self-review pass against the ad rules is added (a small extra
charge, in the quote).

Real UI joined to generated shots (`POST /api/v1/director/videos/assemble`, priced like finishing on the finished
length; see the catalog). Multipart: the screen recording is the `videos` file (`"upload": 1` = the first one) and
`clips` is JSON text:
```bash
curl -X POST "$BASE/api/v1/director/videos/assemble" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "videos=@booking-page.mp4" -F fit=blur_fill \
  --form-string 'clips=[{"job_id": "SHOT1_JOB"}, {"upload": 1, "start_s": 0, "end_s": 3.5, "transition_in": "crossfade"}, {"job_id": "SHOT3_JOB", "transition_in": "cut"}]'
```
Clips of another shape are conformed by `fit` (`crop`, `letterbox`, `blur_fill`); `audio_tracks` can lay
the customer's music or a voiceover over the whole timeline. `SHOT1_JOB` and `SHOT3_JOB` are Pixio job ids of your
finished shots.

Then brand it: `POST /api/v1/director/videos/package` with `job_id`, `brand_id`, `end_card_s`, `cta`, `legal`, `formats`
(`?dry_run=true` is a free quote).

## 9. Prompt wording for brand shots

Bad: "A modern innovative tech company office, people using the Lumen app on their phones, logo on the wall,
happy customers, 5-star reviews."

Good (Montage Basic, one shot): "[Shot 2] At 00:03.000, the camera cuts to a medium close-up: `<Subject 1>` sits on a canal
wall at dawn holding her phone; the screen shows a plain soft blue glow; she taps it twice and smiles slightly.
Static Shot."

- Name the place from its picture; describe what is physically there.
- One action per shot; the brand's effect (the fixed bike, the clean room, the full table), not abstract words.
- Brand `look` (a style sentence on the brand) is used in every clip the writer writes: keep it physical
  ("warm morning light, natural colour, real places") and grain-free.
- Too generic: add a real product interaction or a sourced claim. Too busy: one visual owner per beat. Too slow:
  shorter holds. On-screen copy follows the brand's audience language, not the chat language.

## 10. The end card

`package` draws it: the brand's logo, `tagline` (up to 120 characters), `cta` (up to 60, a pill in
`accent_color`), `end_card_s` (it lies over the last seconds; the length never changes), `end_card_style`
`blur` (last shot blurred behind it) or `solid` (`background_color`), the brand font if one is saved, `legal`
under it; `tagline_size` and `cta_size` set the text size. Keep the final 2-3 s of the film calm so the card sits
over a quiet shot. Use the package end card or a graphics `end_card` element, not both.

## Checklist

- Intake done; truth sheet and provenance manifest shown to the human.
- Every claim traceable to the customer or the official site; disclaimers in `legal`.
- 2-3 directions offered; one chosen; beat plan approved.
- Real logo, UI and places from originals; screens in generated shots show plain light.
- Customer's own music first; voiceover via `voiceover_text` or their recording.
- Montage Basic test first; `?check=true` quote shown; Premium only on a yes. No grain anywhere.
