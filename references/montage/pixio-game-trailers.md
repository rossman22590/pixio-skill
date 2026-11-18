---
name: pixio-game-trailers
description: How to make game intros, cinematic game trailers and co-op title screens on Montage (Pixio's Director API) - lock the art style with one approved confirmation still first, hero shots of the player characters from the user's pictures, no in-video UI or text, the game logo, title and call to action added by packaging, trailer pacing from tease to title, music and cutdowns. Use whenever someone asks for a game trailer, a game intro or title sequence, a launch or reveal video for a game, or a two-player / co-op character intro. Not for ads in general (that is pixio-ads) or fight choreography in depth (that is pixio-action-fights).
---

# Game intros and trailers

A game trailer sells a world, a hero and a promise in seconds, then lands on the logo. The video model makes
the world and the heroes; packaging makes the logo, title and call to action. Words and UI drawn by the
video model come out garbled, so they never go in the prompt.

Prompt FORMAT lives in `references/montage/montage-basic-prompting.md` and `references/montage/montage-premium-prompting.md`.
Film mechanics: `references/montage/pixio-film.md`. Faces that stay the same: `references/montage/pixio-characters.md`.
Fights: `references/montage/pixio-action-fights.md`. End card, logo and formats in depth:
`references/montage/pixio-brand-promo.md` and `references/montage/pixio-graphics-titles.md`.

## House rules

- **Test on Montage Basic.** Every test, draft or trial render runs on `video_model: "montage-basic"` (also what you
  get when `video_model` is left out). Montage Premium or Ultra only when the user asks for it and has seen the quote
  (`?check=true`, `credits.quoted`). Every render is billed in Pixio credits, Basic included.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `videos/finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE`
  (`https://beta.pixio.myapps.ai`) and `$PIXIO_API_KEY`.

Music: the customer's own track first (`music_bed` on a film); `package.score` only when there is none.

## 0. Decision rules

1. **Style first, and it rules everything.** Agree one art style (painterly fantasy, stylized 3D, cel anime,
   gritty realistic sci-fi, pixel-inspired). It sets palette, rendering, light and how the heroes look.
2. **One confirmation still before any video.** Make a single key-art still in the chosen style with the
   heroes in it. Show it. No video until the human says yes. Any change to style, heroes or mood goes back
   to the still.
3. **Use every picture supplied.** Player photos, concept art, character renders: each one is used as a
   reference (converted to the game's style with `/api/v1/director/images/reference` or `/api/v1/director/images/edit` if needed).
   Never drop one. From a photo, take the identity (face shape, hairstyle, outfit), not its real-world
   skin, light or camera look.
4. **No UI, menus, buttons, HUD, names or logos inside the video.** They garble. The real logo file, the
   title and the CTA go on with `package` (or `POST /api/v1/director/videos/package`). Never recreate another company's
   logo or a real game's branding.
5. **Montage Premium / Ultra** is stronger on action and allows violence and blood, but only after the human sees
   the `?check=true` quote and agrees.
6. **Realism:** for a stylized (non-photoreal) game send `realism=0` on film / music / remake jobs; leave `realism`
   at its default only for a photoreal live-action-style trailer.

## 1. The brief (ask once, repeat back)

| item | settle | notes |
|---|---|---|
| game title | exact spelling | goes in `package.title_card` / `tagline`, never in the prompt |
| genre and art style | one style sentence | becomes the film `style` and Shot 1's look line |
| heroes | names, 1-2 lines each, pictures | player 1 and player 2 for co-op |
| world | 1-3 places | each gets an empty set still |
| the promise | one line: what you do in this game | drives the hook and the climax |
| length and shape | film 30-420 s in steps of 15; 16:9 main, 9:16 cutdown | `duration`, `aspect`, `package.formats` |
| music | the customer's track, or a generated score | customer's own music always wins |
| end card | logo PNG, CTA ("Wishlist now"), date | `logo`, `cta`, `tagline` |

## 2. The confirmation still

Make it with `/api/v1/director/images/reference` when there are hero pictures (each `<Picture N>`), else `/api/v1/director/images/text`.
Fixed structure, style-driven fill:

- **Style:** the one style sentence, plus a palette of at most five colours (a main colour, a body colour,
  a highlight, one accent, red only for danger).
- **Composition:** 16:9 (or the agreed shape), full-frame world background, heroes centred, a clear focal
  point, space left for a logo in the lower third.
- **Heroes:** each with a distinct pose and a colour cue that tells them apart (player 1 warm orange
  scarf, player 2 cool teal visor). Different poses stop the model swapping identities.
- **Light:** a top key, a warm/cool split fill, rim light, contact shadows.
- **End with:** "No text, no letters, no logos, no interface."

```bash
BASE=https://beta.pixio.myapps.ai
curl -X POST "$BASE/api/v1/director/images/reference" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "images=@player1.jpg" -F "images=@player2.jpg" -F "aspect=16:9" -F "megapixels=4" -F "seed=21" \
  -F "prompt=Key art for a co-op adventure game, stylized painterly 3D, palette of ember orange, slate blue, bone white and a teal accent. A ruined sky-city at dawn fills the frame. The person in <Picture 1> as a rogue in a worn leather coat with an ember-orange scarf, sitting cross-legged on a broken pillar, leaning back and looking up. The person in <Picture 2> as an engineer with a teal visor pushed up, kneeling forward and looking at the camera. Top key light, warm left fill, cool rim light, soft contact shadows. Empty space in the lower third. No text, no letters, no logos, no interface."
```

Check: style visibly applied; each face matches its picture in that style; the two heroes are not swapped;
no stray writing. Redo the still (seconds) until it is right.

## 3. Trailer pacing

| part | share | what | shots |
|---|---|---|---|
| tease | first 2-3 s | one striking image of the world, no heroes yet; a sound sting | slow Push In or Static Shot |
| hook | to ~15 % | the hero appears; the promise in one action | medium, Tracking Shot |
| world | to ~45 % | 2-4 places, one beat each; scale shots | wide, slow Pan or Pedestal Up |
| rise | to ~80 % | threat, faster cuts (3 s shots), the co-op move | close-ups, Shake Slightly on impacts |
| hero shot | ~1 shot | both heroes together, low angle, the key-art pose | slow Push In, Static hold |
| title | last 3-5 s | a calm, held frame under the end card | Static Shot |

- One action and one trained camera move per shot; 3 s or more per shot; last cut 2 s before the end.
- Leave the final 3-5 s calm (a held wide or the hero pose): the end card's blur sits over it.
- Fast fights: one impact per shot on Montage Basic; for multi-blow exchanges see `references/montage/pixio-action-fights.md`.

## 4. Rendering

**A 60 s trailer from an idea (writer + storyboard + packaging):**
```bash
curl -X POST "$BASE/api/v1/director/videos/film?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "video_model=montage-basic" -F "duration=60" -F "aspect=16:9" -F "realism=0" -F "storyboard=true" \
  -F "idea=Game trailer. A rogue and an engineer climb a ruined sky-city to restart its heart before the storm-beast wakes. Tease the city, show their co-op grapple-and-shield move, end on both on the summit at dawn." \
  -F "style=Stylized painterly 3D game cinematic, ember orange and slate blue palette, strong rim light; no text or interface" \
  -F "images=@key_art.png" -F "images=@player1.jpg" -F "images=@player2.jpg" \
  -F 'references=["approved key art: style and both heroes", "Kai, the rogue: face", "Ren, the engineer: face"]' \
  -F "logo=@game_logo.png" -F "music_bed=@customer_theme.mp3" \
  -F 'package={"title_card": "SKYFALL RUINS", "title_card_s": 3, "tagline": "Climb together.", "cta": "Wishlist now", "end_card_s": 4, "end_card_style": "blur", "formats": ["9:16"], "cutdowns": [15]}'
```
- Read the quote, then send it again without `?check=true` to start.
- `logo` is the real logo file; the end card shows it with `tagline` and `cta`.
- No customer music? Use `"score": "auto"` (or a brief like "epic orchestral, rising strings, big drum hits
  on the title") inside `package` instead of `music_bed`; the score is priced on top (see the catalog).
- Review the storyboard (`GET /api/v1/director/jobs/{id}/storyboard/sheet.jpg`), redo stills, then
  `POST /api/v1/director/jobs/{id}/storyboard/approve` (see `references/montage/pixio-storyboarding.md`).

**Package a trailer you already rendered:**
```bash
curl -X POST "$BASE/api/v1/director/videos/package?dry_run=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "job_id=JOB_ID" -F "logo=@game_logo.png" -F "tagline=Climb together." -F "cta=Out March 3" \
  -F "end_card_s=4" -F 'formats=["9:16","1:1"]' -F 'cutdowns=[15,6]'
```
`?dry_run=true` is a free quote; drop it to start. `JOB_ID` is the Pixio job id of the finished trailer.

**Single hero shots** (5-15 s): `/api/v1/director/videos/reference` with the key art and hero pictures, or
`/api/v1/director/videos/image` starting from the approved key art ("Continuing from the first frame, ...").

## 5. Prompt pieces that work

- Look line first in Shot 1 of every clip, word for word.
- Heroes as subjects defined once, with their colour cue; in shots, only what is visible now.
- Scale words: "tiny figures against a colossal broken tower", "the camera pedestals up to reveal the city".
- Impacts: "a burst of sparks fills the frame, then the camera shakes slightly".
- Last line: "No subtitles, no watermark, no on-screen text, no interface, no logos."

**Bad:** `[Shot 1] The game title SKYFALL RUINS appears in gold letters over a menu with PLAY and OPTIONS buttons.`
Why: the title and buttons garble; put the title in `package.title_card` and keep menus out.

## 5b. A co-op title screen intro (10-15 s)

The short form: both players posed in the key art, the world alive behind them, then the title.
1. Approve the confirmation still (section 2) with both players in fixed, different poses.
2. Render `/api/v1/director/videos/image` from that still, `duration` 10-15, one slow move: "Continuing from the first
   frame, embers drift across the frame, the rogue's scarf lifts in the wind, the engineer's visor glints;
   the camera pushes in with small amplitude at slow speed." Keep both heroes in place; do not add actions
   that move them out of the pose.
3. Add the title and CTA with `package` (`title_card` at the start or `tagline` + `cta` on the end card),
   and the player names as `lower_thirds` if wanted - never in the prompt.
4. For a looping menu background, ask for "no camera move, a calm steady scene" so the start and end frames
   are close.

## 6. Fixes

| problem | fix |
|---|---|
| heroes swap faces or outfits | distinct poses and colour cues; one hero per close-up; per-clip `clip_images` |
| face drifts from the photo | keep the photo as a reference; "keeps exactly the same face, hair and outfit" |
| photo realism leaks into a stylized game | style line first; `realism=0`; key art as the style reference |
| weak style | rewrite the style sentence and palette; keep the structure |
| letters or UI in the frame | remove all text from prompts and stills; add titles in packaging |
| end card covers action | make the last 3-5 s a calm hold |

## 7. Checklist

- [ ] One art style + max five-colour palette agreed
- [ ] Every supplied picture used; confirmation still approved before any video
- [ ] No text, UI, logos or titles in any prompt or still; titles, logo and CTA via `package`
- [ ] Pacing: tease, hook, world, rise, hero shot, calm title hold
- [ ] `realism=0` for stylized games on film / music / remake jobs
- [ ] Customer music first (`music_bed`), else `package.score`
- [ ] Test on `video_model=montage-basic`; `?check=true` quote shown before Premium
- [ ] API key never in prompts, URLs or logs
- [ ] Watch the result (`references/montage/pixio-video-qa.md`): identities, no garbled text, end card readable in every format
