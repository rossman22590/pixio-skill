---
name: pixio-brands
description: How to set up and use a brand kit on Montage (Pixio's Director API) - POST/GET /api/v1/director/brands, GET/POST/DELETE /api/v1/director/brands/{id}, GET /api/v1/director/brands/{id}/logo, every field and its limit (name, tagline, cta, product_name, description, audience, voice, look, banned_words, logo, font, text/accent/background colours, end-card and sound defaults), what each endpoint takes from a brand_id (the AI writer, packaging, single clips, films, music videos, graphics), override order, and keeping one brand consistent across films, ads, thumbnails and graphics. Use whenever you create, update, inspect or apply a brand, or need on-brand colours, logo or tone in any output. Not for writing the ad itself (that is `references/montage/pixio-ads.md` / `references/montage/pixio-product-ads.md` / `references/montage/pixio-brand-promo.md`).
---

# Brand kits on Montage

A brand is saved once and referenced everywhere by its `brand_id` (an opaque Pixio id; only your own brands work). It holds three kinds of
things: **words for the AI writer** (what the brand is, who it's for, its tone, words to avoid), **identity files**
(logo, font, three colours) and **packaging defaults** (end card, logo corner, sound levels). The video models never
draw the logo or text; packaging and graphics draw them as real pixels from the brand.

## House rules

- **Test on Basic.** Every test, draft or trial render runs on Montage Basic (`video_model: "montage-basic"`, also
  what you get when `video_model` is left out). Basic is billed in credits too, just least. Premium or Ultra only
  when the user asks for it and has seen the quote (`?check=true`).
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE`
  (`https://beta.pixio.myapps.ai`) and `$PIXIO_API_KEY`.

Use the customer's real logo file, never a redrawn one. Only facts the customer confirms go into `description` (no
invented claims). Brand calls are free; the renders that use a brand are billed like any render. At most 50 brands
per account (a 51st answers `409 conflict`).

## 1. The endpoints

| Call | What it does |
|---|---|
| `POST /api/v1/director/brands` (multipart) | create; `name` is required; answers 201 with the brand (`object: "director.brand"`) |
| `GET /api/v1/director/brands` | `{"object": "list", "data": [...]}`: every saved brand |
| `GET /api/v1/director/brands/{id}` | one brand: its fields plus `has_logo`, `has_font`, `logoUrl` |
| `POST /api/v1/director/brands/{id}` (multipart) | change only the fields you send; `remove_logo=true`, `remove_font=true` drop files |
| `DELETE /api/v1/director/brands/{id}` | delete; jobs already submitted keep their own copy of its files |
| `GET /api/v1/director/brands/{id}/logo` | the stored logo PNG (404 if none) |

An unknown id, or one that is not yours, answers `404 not_found`. Bad values answer `400 invalid_request` with the
reason.

## 2. Every field

**Words for the AI writer** (text, trimmed; longer than the limit is refused with a 400):

| Field | Max | Write it like this |
|---|---|---|
| `name` | 80 | the official spelling: "Lumen Bikes" |
| `tagline` | 120 | also drawn on the end card: "Ride home tonight" |
| `cta` | 60 | also the end-card pill: "Book a repair" |
| `product_name` | 120 | the hero product, if one: "Lumen Folder 2" |
| `description` | 1500 | what it is, plainly and physically: "a canal-side bike repair and rental shop; same-day repairs; matte black folding bikes with orange cables" |
| `audience` | 500 | "commuters 25-40 who ride daily, and weekend riders" |
| `voice` | 300 | tone: "warm, plain-spoken, a little dry; never hype" |
| `look` | 500 | one style sentence used for every clip: "natural colour, soft morning light, real streets and workshops, clean digital image" |
| `banned_words` | 50 items x 60 chars | comma-separated or a JSON list: "cheap, guaranteed, best in town" |

**Identity files:**
- `logo`: any picture (PNG with transparency works best), up to 10 MB. It is converted to RGBA PNG, shrunk to at
  most 2048 px, and its empty transparent margins are trimmed, so it sizes by what is visible. Send a version that
  reads on dark and light backgrounds, or pick colours so it does.
- `font`: a `.ttf` or `.otf` (up to 10 MB) the studio can draw with; used for the end card, package captions with
  `caption_font: "brand"` and graphics with `font: "brand"`.

**Colours and packaging defaults** (same meaning and ranges as on `/api/v1/director/videos/package`):
`text_color`, `accent_color`, `background_color` (`#RRGGBB`; defaults white, white, black), `end_card_s` (0-8),
`end_card_style` (`blur` / `solid`), `logo_corner` (`none`, `top-left`, `top-right`, `bottom-left`,
`bottom-right`), `logo_scale` (0.04-0.3 of the frame width), `music_db` (-40 to 6), `voiceover_db` (-20 to 6),
`duck_db` (-30 to 0), `lufs` (-30 to -8).

There is no palette list or second font: a brand has exactly three colours and one font. Put secondary colours in
words in `look` if they matter to the picture.

## 3. Create, check, update

```bash
curl -X POST "$BASE/api/v1/director/brands" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F name="Lumen Bikes" -F logo=@lumen_logo.png -F font=@LumenSans-Bold.otf \
  -F tagline="Ride home tonight" -F cta="Book a repair" \
  -F description="A canal-side bike repair and rental shop. Same-day repairs. Matte black folding bikes with orange cables." \
  -F audience="Daily commuters and weekend riders" -F voice="warm, plain-spoken, never hype" \
  -F look="natural colour, soft morning light, real streets and workshops, clean digital image" \
  -F banned_words="cheap,guaranteed,best in town" \
  -F text_color="#FFFFFF" -F accent_color="#F26B1D" -F background_color="#111111" \
  -F end_card_s=3 -F end_card_style=solid -F logo_corner=top-right -F logo_scale=0.1 -F lufs=-14
# -> 201 {"id": "BRAND_ID", "object": "director.brand", ..., "has_logo": true, "has_font": true,
#          "logoUrl": "https://beta.pixio.myapps.ai/api/v1/director/brands/BRAND_ID/logo"}

curl "$BASE/api/v1/director/brands/BRAND_ID" -H "Authorization: Bearer $PIXIO_API_KEY"          # check what was saved
curl -X POST "$BASE/api/v1/director/brands/BRAND_ID" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F cta="Book today"                                                        # change one field only
curl -X POST "$BASE/api/v1/director/brands/BRAND_ID" -H "Authorization: Bearer $PIXIO_API_KEY" -F remove_font=true
```
After every create or update, `GET` it and show the human the saved values and the logo (`logoUrl`, with the key).

## 4. What each endpoint takes from `brand_id`

| Endpoint | Uses from the brand |
|---|---|
| `POST /api/v1/director/prompts/write` (`mode` film or reference) | product_name, description, audience, voice (tone), look and banned words brief the writer; with `film_type=commercial` it writes an ad |
| `POST /api/v1/director/videos/film` | briefs the writer (with `idea`), and packages the film: logo, end card, colours, font, sound defaults |
| `POST /api/v1/director/videos/music` | packaging only (logo, end card); the song stays the soundtrack, no music bed |
| `/api/v1/director/videos/text`, `/image`, `/reference` | starts a packaging job by itself when the clip is done (`packageJobId` on the shot's job; poll it for the packaged video) |
| `POST /api/v1/director/videos/package` | all packaging defaults, logo, font, tagline, cta, colours |
| `POST /api/v1/director/videos/graphics` and `/graphics/plan` | text and accent colours, background colour, font and logo are the defaults; `"image": "logo"` places the logo; an `end_card` element uses the brand's colours and logo |

On Premium, a job with a `brand_id` is treated as a commercial and gets the Premium commercial rules when its
prompts are written. Read AI-written clips (`?check=true`, `prompts/write` or a storyboard) for banned words before
the full render.

**Override order:** the studio's defaults, then the brand's saved values, then whatever you send in that request's
`package` (or graphics element). So send only what differs for this one video ("this ad has no corner logo":
`"logo_corner": "none"`; "this one ends with a sale CTA": `"cta": "20% off this week"`). A `logo` file sent with
the request replaces the brand's logo for that job only.

## 5. One brand, every output

Keep a short **brand lock** in your notes and reuse it word for word:
```
Brand lock - Lumen Bikes (BRAND_ID)
Spelling: Lumen Bikes (never LUMEN, never Lumen Bike)
Colours: text #FFFFFF, accent #F26B1D (orange), background #111111 (near black)
Font: LumenSans Bold (saved) - end card, captions "brand", graphics "brand"
Look sentence: natural colour, soft morning light, real streets and workshops, clean digital image
Logo: the saved PNG only; corner top-right at 0.10; never in a prompt
Words to avoid: cheap, guaranteed, best in town
```
- **Films and ads:** send `brand_id`; let the `look` carry the style; describe products and places from their
  pictures; never ask the video model for the logo or the name in the frame.
- **Graphics:** leave element colours empty so they default to the brand; `font: "brand"`.
- **Captions:** `caption_font: "brand"`, `caption_highlight_color` = the accent.
- **Thumbnails and posters** (`/api/v1/director/images/*`, see `references/montage/pixio-thumbnails-posters.md`): image endpoints don't take a
  `brand_id`. Describe the colours in words ("a deep near-black background with one bright orange accent"), not
  hex codes, and add the real logo afterwards in your own layout step.
- **Series and campaigns:** one brand per product line or campaign tone when tagline, CTA or audience differ; the
  logo and colours can be the same files.

## 6. Good vs bad brand text

- Bad `description`: "The world's most innovative, award-winning, #1 bike experience, loved by millions." (unproven
  claims; nothing the camera can show).
- Good: "A small repair shop by the canal with a roll-up door and a long wooden workbench; bikes hang on the wall;
  same-day repairs; matte black folding bikes with orange cables."
- Bad `look`: "cinematic film grain, 35mm Kodak, ARRI look" (grain is banned, and film-stock and camera names pull
  toward a grainy film look).
- Good `look`: "natural colour, soft contrast, warm skin tones, practical light, clean digital image".

## 7. Mistakes to avoid

- Creating a new brand per video: reuse the id; update fields instead.
- A logo with a big white box around it: send a transparent PNG (margins are trimmed only when transparent).
- Accent equal to text colour on the CTA pill (both white by default): set `accent_color` so the pill shows.
- Tagline over 120 or CTA over 60 characters: `400 invalid_request`; shorten.
- Deleting a brand that a planned job still needs: running jobs keep their copy, but new jobs with that id 404.

## Checklist

- `name` spelled officially; logo is the customer's real transparent PNG; font accepted (no 400).
- Three colours set; accent differs from the text colour; logo readable on `background_color`.
- `description` only confirmed facts; `voice`, `audience`, `look` physical and grain-free; `banned_words` filled.
- `GET /api/v1/director/brands/{id}` reviewed with the human after every change.
- Requests send `brand_id` plus only the per-video overrides.
- No logo, brand name or hex code inside video prompts.

