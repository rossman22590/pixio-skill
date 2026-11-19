---
name: pixio-tier-choice
description: How an AI agent picks the render tier on Montage (Pixio's Director API) - Montage Basic (the default), Montage Premium (sharper, more lifelike, quoted per job), Montage Ultra (the highest-quality model on every shot) or a tier mix (tier_mix auto|manual) - by content (sung and spoken close-ups, lip-sync to the customer's audio, dialogue, fights and action, products, animation, looks and styles, long films, many pictures), by size, wait and price, and when no new render is needed at all. Use whenever you choose or change video_model, plan a Premium or tier-mix job, or a user asks which tier suits their video. Not for prices and budgets (that is references/montage/pixio-cost-control.md) or prompt wording (that is references/montage/montage-basic-prompting.md / references/montage/montage-premium-prompting.md).
---

# Choosing the tier: Basic, Premium, Ultra or a mix

Every tier uses the same endpoints, fields, job JSON and downloads; only the picture, the prompt format and the
price differ. Choose with `video_model` in the request body on `videos/text`, `videos/image`, `videos/reference`,
`videos/music`, `videos/film`, `videos/remake` and `series/{id}/episodes`. **Left out, it is always
`montage-basic`.** `GET /api/v1/director/catalog` -> `videoModels` lists each model's `videoModel`, `name`,
`description` and whether it is `available` right now (`premiumAvailable`).

| Tier | `video_model` | In one line |
|---|---|---|
| Montage Basic | `montage-basic` (or leave it out) | the default; lip-sync locked to the customer's own audio; named looks, `styles`, `realism`, `fight_flow`; draft then final; the lowest price |
| Montage Premium | `montage-premium` | sharper, more lifelike, richer motion, camera work and native sound; priced from a quote per job |
| Montage Ultra | `montage-ultra` | the highest-quality model on every shot; works like Premium and costs more |
| Montage Ultra Plus | `montage-ultra-plus` | Ultra at native 1080p; costs more than Ultra; no `resolution` / `upscale` |
| Montage Max | `montage-max` | Ultra at native 4K, the top tier and the highest price; no `resolution` / `upscale` |
| Tier mix | `tier_mix: "auto"` or `"manual"`, with `montage-premium` or `montage-ultra` | each 15 s clip / section on the tier it suits, each at its own tier's price |

All three bill in Pixio credits; Basic is the cheapest, not free.

## House rules

- **Test on Basic.** Tests, drafts and trial renders run on Montage Basic. Premium or Ultra only when the user asks
  for it and has seen the `?check=true` quote.
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.

## Decision rules (read these first)

1. **Start on Basic.** Move a job to Premium only for what Premium does better, and only after the human has seen
   the quote (`references/montage/pixio-cost-control.md`).
2. **Lips must match the customer's real song or voice in close-up?** Basic, or a tier mix that puts those
   close-ups on Basic. Premium sings the vocal on its own clock: by default it keeps its own sung audio (in sync,
   but not your mix); `music_sync: "song"` keeps your exact song and re-times the lips onto it, for a little more.
3. **Action, fights, big camera moves, dance energy, crowds, many pictures in one shot?** Premium (Ultra for a hero
   shot). Basic with `fight_flow` is the cheaper option.
4. **A named `look`, `styles`, `realism` or `fight_flow`?** Basic. On Premium these Basic settings have no effect.
5. **Premium not offered right now?** (`videoModels.premiumAvailable` false; a request answers
   `400 premium_unavailable` before anything is held.) Ask before falling back to Basic: it is a different look.
6. **Nothing new to render?** A colour, weather, object or text change on a finished video is Montage Edit or
   graphics, not a new render on any tier.

## By content

| You are making | Use | Why |
|---|---|---|
| Music video with singing close-ups to the song | Basic | each section locks to its slice of the song; mouths follow the real audio |
| Music video that lives on movement (dance, big camera) | Premium or tier mix | richer motion; measure close-ups with `lip_check`, put them on Basic in a mix |
| Talking to camera: UGC, dialogue, interviews | Basic | voice samples, `voice_lock` and `<d>` lines keep each voice; draft then final keeps retakes cheap |
| Long films (1-7 min) with the same characters | Basic | the lowest per-clip price over many clips; draft first; face fix for far faces |
| Many reference pictures in one shot | Premium | up to 30 `images` per job (6-9 a clip works best); Basic takes 9 |
| Fights and action | Premium / Ultra (Basic + `fight_flow` is cheaper) | Premium excels at fights, stunts and chases; on `videos/reference` it can also follow a muted reference video's movement |
| Lip-synced close-ups and action in one video | tier mix | spoken / sung close-ups on Basic; wide, action and cutaways on Premium |
| A hero shot that must be the best possible | Ultra | the highest-quality model on every shot |
| Product in most shots, many angles | Premium | it binds the product to its picture closely; packaging adds logos and prices on either tier (`references/montage/pixio-ads.md`) |
| Animation (anime, stylised 3D, paper) | either | Basic: `realism: 0`, a named look such as `anime_90s`, and name the style; Premium: name the style and "not photorealistic" |
| Change a finished video (colour, weather, an object) | Montage Edit (`/api/v1/director/videos/edit`) | changes only what you name; any tier's video |
| Text, prices, arrows, captions | graphics (`/api/v1/director/videos/graphics`) or packaging | drawn as real pixels over any tier's video |

Premium renders blood, wounds and violence where the story needs them, so write them in Premium prompts when
they belong.

## Size, wait and price at a glance

| | Basic | Premium | Ultra |
|---|---|---|---|
| Output | single shots 1152x640 (`quality: "fast"`) to 1344x768 (`quality: "quality"`); films and references 1152x640; `speed: "draft"` smaller | `resolution` `480p` or `720p` (720p about twice the cost); default in `videoModels.premiumResolution` | as Premium |
| About 1080p | `upscale: true` or `/api/v1/director/videos/upscale` (priced per started 15 s) | `upscale: true` | same |
| Draft then final | yes (`speed: "draft"`, then `/final`) | no: already full quality | no |
| Versions | `variants` 1-4 on films | one version at a time | one version at a time |
| Wait | the line (`queue.ahead` on the job, `GET /api/v1/director/queue`); a 15 s clip renders in a few minutes, a draft faster | takes run in parallel | as Premium |
| Price | catalog prices per section / clip / second | the studio's quote of the takes plus `premiumPrompts` for writing their prompts; only `?check=true` gives the number | as Premium, higher |

Exact numbers: `GET /api/v1/director/catalog` and the free `?check=true` quote
(`references/montage/pixio-cost-control.md`).

## What changes between tiers

| Work | Basic | Premium / Ultra |
|---|---|---|
| Prompt format | Montage Basic format (`references/montage/montage-basic-prompting.md`) | Premium format (`references/montage/montage-premium-prompting.md`); a Basic-format prompt is converted for you unless `verbatim: true` |
| Prompt length | `prompt` up to 8,000 characters | up to 30,000 |
| Pictures | 9 | 30 |
| Music videos | your song under every section, lips locked to it | Premium's own sung audio (plus a free copy over your song, `output.withOriginalSong`), or `music_sync: "song"` |
| Looks and styles | `look`, `styles` (on text and image shots), `realism`, `fight_flow` | no effect |
| Face fix, lip fix, upscale, finish, package, graphics, edit | the same tools on every tier's video | same |
| Pictures, storyboard stills, songs | the same image and music models on every tier | same |

If Premium can't be quoted when a job starts, the job starts on Basic at the Basic price (the job's
`videoModel` says `montage-basic`), and whatever the studio renders on Basic instead is charged at the Basic price.
Always read `videoModel` and `videoModelName` on the finished job before you describe it to the human.

## Tier mix

Send `tier_mix` on `POST /api/v1/director/videos/film` or `/api/v1/director/videos/music` together with
`video_model: "montage-premium"` or `"montage-ultra"`:

- `auto`: every clip / section whose shots are sung (music videos) or spoken (films: `<d>` lines) face close-ups
  renders on Basic; wide, establishing, action, instrumental and cutaway units on Premium. Action goes to Premium
  even with a face in frame, unless it also has a sung / spoken close-up.
- `manual`: `basic_clips` (film) or `basic_sections` (music video), 1-based (`[1, 3]`), go to Basic.
- `tier_mix_size`: `larger` (default), `basic` or `premium`: the one frame size every unit is brought to.
- `tier_mix_retime` (music videos): re-time each Premium section's picture onto its slice of your song.
- Your own `clips` / `sections` must be in Montage Basic format (Premium units are converted); `verbatim: true`
  cannot mix.
- Music videos keep the customer's song under the whole video. Basic parts keep the Basic price, Premium parts the
  Premium price, so a mix costs less than all-Premium.
- A redo keeps the unit's tier.

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/music?check=true" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-premium -F resolution=480p -F tier_mix=auto \
  -F "song=@customer_song.mp3" -F "images=@singer.png" -F "images=@street.png" \
  -F "idea=A neon city at night; the singer performs on a rooftop, the band rides through the streets."
```

Read `credits.quoted`. With `auto` and an `idea` the units are decided after writing, so the quote can price more
of it as Premium than ends up rendering there; only what renders is charged at each tier's price. Show the quote,
and send the same request without `?check=true` only after a yes.

## Changing tier on an existing job

- A redo follows the original job's tier. A Premium retake costs the part price it was sold at and never switches
  to Basic (`503 premium_unavailable` if Premium can't be quoted, nothing charged).
- `/final` exists only for Basic drafts.
- To put two tiers in one video, use a tier mix from the start rather than redoing clips on another tier.
- Premium music video with lips off the song: measure it (`lip_check: "measure"` at render time, or
  `POST /api/v1/director/videos/edit/analyze` with `checks: ["lipsync"]`), then relip it to the song
  (`POST /api/v1/director/videos/relip`, or `lip_check: "relip"` at render time, best for Premium and Ultra) or
  lip-fix the stretches that are off (`/videos/lipfix/auto`). All are billed; see
  `references/montage/pixio-lipsync-fixing.md`.

## Good and bad choices

- Good: "Singer close-ups to the customer's mp3, 3 minutes" -> Basic, the customer's song as `song`, a draft first.
- Good: "Rooftop chase with a fight, 15 s" -> Premium after a yes to the quote, or Basic with `fight_flow` if the
  human wants it cheaper; two takes either way (`references/montage/pixio-batch-variants.md`).
- Good: "2-minute music video, half performance, half dance and city shots" -> `tier_mix: "auto"`.
- Bad: Premium for a test "to see the quality". Quote one Premium shot and ask.
- Bad: Premium with `look: "realistic_people"` and `styles` (no effect on Premium).
- Bad: a generated song because Premium "sounds better". Always the customer's song.
- Bad: leaving out a user's picture to keep a take small. Send them all; the quote prices it.

## Explaining the choice

Say what the tier gives, what it costs (the quote, never a guess) and the alternative:

> "For the singer close-ups I'd use Montage Basic: the lips lock to your own song, and a draft of the whole video
> quotes at about X credits. The dance and city shots would look richer on Montage Premium; a tier mix puts only
> those on Premium and quotes at about Y credits. Shall I render a Basic draft first, or go straight to the tier
> mix?"

Bad: "Premium is better quality, so I used it." Better at what, at what price, and did the human agree?

## Quick decision path

1. Test, draft or seed hunt? -> Basic.
2. Mouths must follow the customer's own audio in close-up? -> Basic for those shots (all-Basic or tier mix).
3. The selling point is motion (fights, stunts, chases, dance, sweeping camera, crowds, effects)? -> Premium for
   those shots, Ultra for a hero shot, after a yes to the quote.
4. A named look, `styles`, `realism`, a draft-then-final workflow, or 1-7 minutes at the lowest price? -> Basic.
5. More than 9 pictures in one job? -> Premium.
6. Only a colour, weather, object or text change? -> Montage Edit, graphics or packaging; no new render.

## Checklist

- [ ] Started from Basic; moved to Premium / Ultra only for a reason above, after checking `premiumAvailable`.
- [ ] Lip-sync-critical close-ups on Basic or in a tier mix (or Premium with `music_sync: "song"` / a relip).
- [ ] Looks, `styles`, `realism` and `fight_flow` only counted on for Basic.
- [ ] `resolution` chosen on Premium (480p about half of 720p); `upscale: true` for about 1080p.
- [ ] Paid tier priced with `?check=true` and approved by the human.
- [ ] Prompts written with the right skill: `references/montage/montage-basic-prompting.md` (Basic) or
      `references/montage/montage-premium-prompting.md` (Premium / Ultra).
- [ ] Read `videoModel` on the finished job before reporting which tier rendered it.
