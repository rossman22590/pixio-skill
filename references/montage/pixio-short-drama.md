---
name: pixio-short-drama
description: How to make vertical micro-drama episodes and whole seasons (the style of the vertical micro-drama apps) with Montage (Pixio's Director API) - film_type=short_drama on POST /api/v1/director/videos/film, /api/v1/director/prompts/write and /api/v1/director/series, the 3-second hook, one beat per 15 s clip, close-ups and reaction shots, dialogue pacing, tropes (drama_trope) and a cliffhanger every episode with the same cast and voices. Use whenever you plan, write or render a short drama, micro-drama, vertical drama, soap-style mini-series or cliffhanger episodes.
---

# Short dramas (vertical micro-dramas) with Montage

A short drama is a phone-first soap: 9:16, 1-3 minute episodes, a hook in the first 3 seconds, big feelings shown on
faces, short sharp lines, a cliffhanger at the end of every episode, and the same cast across the whole season.
Montage has a mode for it: `film_type=short_drama`, priced like any AI-written film.

## House rules

- **Test cheaply on Basic.** Every test, draft or trial render sends `video_model: "montage-basic"` (it is also what
  renders when `video_model` is left out). Basic is billed in Pixio credits like everything else, just less.
  Premium or Ultra only when the user asks for it and has seen the quote. Start with `?dry_run=true`.
- **Use every picture the user supplied.** Each cast member's picture goes in `images` with a line in `references`.
- **No film grain.** Never write grain, noise or film-stock words in `idea` or `style`; keep `finish.grain` at 0.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE`
  (`https://beta.pixio.myapps.ai`) and `$PIXIO_API_KEY`.

## One episode

```bash
curl -X POST "$BASE/api/v1/director/videos/film?dry_run=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-basic \
  -F idea="Ava, a waitress mocked at a billionaire's gala, is secretly the heiress who owns the hotel." \
  -F duration=90 -F film_type=short_drama -F drama_trope=hidden_identity \
  -F images=@ava.png -F images=@leo.png -F references='["Ava, a young waitress", "Leo, the cold CEO"]'
```

- `duration`: 60-180 s is typical (4-12 clips of 15 s).
- `aspect`: 9:16 when you don't send it.
- `drama_trope`: `auto` (default), `revenge`, `hidden_identity`, `rich_poor`, `betrayal`, `second_chance`,
  `contract_marriage`, `fated_mate` (werewolf / vampire / god romance), `secret_baby`.
- `cliffhanger`: `true` (default) ends on an unresolved shock; `false` ends on the payoff (a finale).
- The dry run answers `{object: "director.preflight", credits.quoted, ...}` and starts nothing; a note says if the
  real request would be refused. Show the quote, then drop `dry_run` to render and poll
  `GET /api/v1/director/jobs/{id}`.
- `POST /api/v1/director/prompts/write` with `{"mode": "film", "film_type": "short_drama", "story": "...", ...}`
  writes the clips only (a writer job; the clips land in its `result`), so you can edit them and send them as
  `clips`.

## A season (same cast, voices, running story)

1. `POST /api/v1/director/series` (free) with `name`, `premise`, `film_type=short_drama`, optional `drama_trope`,
   the cast pictures + `references`, and voice samples + `voices` if you have them. Aspect defaults to 9:16.
2. Optional: `POST /api/v1/director/series/{id}/season` `{"idea": "...", "episodes": 10}` plans the arc (a writer
   job, `writerRound` credits); every episode ends on a cliffhanger and the biggest reveal is saved for the finale.
3. `POST /api/v1/director/series/{id}/episodes` with `duration` (and `idea` unless the season planned it).
   Episode 2+ opens by picking up the last cliffhanger. Per episode you may send `film_type`, `drama_trope`, or
   `cliffhanger=false` for the finale. `?dry_run=true` quotes it free. The show learns faces and voices after
   episode 1, so later episodes keep them. More in references/montage/pixio-series-showrunner.md.

## Writing a good idea

- Name the people and the conflict in one or two sentences: who is wronged, who holds power, what secret exists.
- Give the episode one turn ("Leo finds the hotel deed in Ava's bag") and say where it should stop ("cut on Leo's
  face").
- Let the mode do the grammar: it already asks for a hook, close-ups, reaction shots after big lines, ~2.6 words/s
  speech with a one-second hold, and no on-screen text. Don't ask for subtitles in the picture; add them afterwards
  with `package` captions if you need them.
- Keep it melodrama played straight: humiliation, reveals, slaps, confessions, triumphs. No gore needed on Basic.
- Prompt wording per model: references/montage/montage-basic-prompting.md (Basic) and
  montage-premium-prompting.md (Premium).

## What the hit apps run on (the formula)

The drama apps' catalogues repeat one engine: **an underdog is wronged in public** (humiliated, scorned, cast out,
mocked as poor or weak), **a hidden worth or power is planted** early and shown in flashes, and **the people who
scorned them start to regret it** - the classic payoff is the ex, the family or the rival on their knees begging.
Settings run from glossy modern (billionaires, CEOs, weddings, hospitals) to polished fantasy (werewolf packs and
alphas, vampire heirs, gods in disguise, dragons). Titles are long and promise the payoff up front ("the husband she
scorned is the ..."). Pick a trope that delivers that reversal and say who scorns whom in your `idea`.

## Craft that keeps a season consistent

Lessons from studying professionally built AI films (our own words):

- **Plan shots before prompting.** For each beat know the goal, the character's task as a verb (expose, shame,
  beg), what changes from start to end, and how it hooks into the next beat. A beat with no goal shows up before you
  spend a render.
- **One picture per state.** A character clean, slapped, soaked or in a wedding dress are separate pictures, not
  one picture plus a note. Make the new state by editing only what changed on the existing picture
  (`POST /api/v1/director/images/edit`), never by redrawing the person. A prop that is thrown, taken or handed over
  (a ring, a contract, a phone) gets its own picture too.
- **Character pictures:** a big close portrait (three-quarter view) is the face source; plain grey background, soft
  even light, empty hands. For speaking leads also make a smiling close-up, or the first laugh gets someone else's
  teeth.
- **A fixed description per lead, pasted the same every time:** how they stand, talk, and what their face does
  when they lose. The writer is told to keep one tell per lead; put it in `references` / `cast` so it is identical.
- **A fixed voice per lead:** age, pitch, pace, accent (with one or two sound markers), written once and reused
  verbatim in `voices`; better still, give a voice sample in `ref_audios` / the series cast.
- **Places:** a three-quarter view (not flat front-on), no people, one light direction, one anchor object to block
  people against ("at the window, facing the door"). A place picture sets surfaces and light, not the framing.
- **Colour rules work as positive statements** ("the dominant colour is cold teal; warm light only inside the
  lamp"), not as bans.
- **Stress-test the leads on Basic** before a season: a few cheap 15 s clips of each lead crying, laughing,
  shouting and in a two-shot with their co-star, in their real locations. If the same face breaks twice after
  fixing the words, rebuild the picture.
- **Slaps and fights** run at real speed (no slow motion), cross the cut mid-motion, and lean on short inserts (the
  hand, the cheek) - see references/montage/pixio-action-fights.md for longer fights.
