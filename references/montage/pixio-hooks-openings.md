---
name: pixio-hooks-openings
description: How an AI agent makes the first 1-3 seconds of a Montage (Pixio's Director API) video stop the scroll - opening patterns and cold opens for films, music videos, ads and social posts, prompting the first shot on Montage Basic and Montage Premium / Ultra, title and hook-text timing (title_card, lower_thirds, graphics), A/B hooks with variants, cutdowns that keep the hook, and endings that loop. Use whenever you write or review the opening of any video, add an opening title or hook text, or plan a looping ending. Not for the full prompt format (that is montage-basic-prompting / montage-premium-prompting) or ad structure as a whole (that is pixio-ads).
---

# Pixio hooks and openings

Viewers decide in the first second or two. A video that opens on a slow drift over scenery loses them before the
story starts. The hook is not a trick added later: it is the first shot, written first and checked first.

## House rules

- **Test on Basic.** Every test, draft or trial render runs on Montage Basic (`video_model: "montage-basic"`, or
  leave `video_model` out). Every render is billed in Pixio credits; Basic is the cheapest. Premium or Ultra only
  when the user asks for it and has seen the quote (`?check=true`).
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `videos/finish`; never write grain, noise or film-stock words in a prompt
  or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.

## Decision rules (read first)

1. **Frame 0 already shows something.** Motion, a face, a strange detail. No black, no fade-in, no slow establishing
   drift before anything happens.
2. **By second 1-2, something is wrong, strange, wanted or at stake.** A call light for a room that is empty; a
   bloody hand on a door; a woman cutting her own wedding dress.
3. **Open in the state, not the wind-up.** On Montage Basic a shot written "already lunging, his fist swinging" has
   action from about 0.5 s; a stance or a pose opening is about 3 s of nothing. Everyone is already in place at
   frame 0.
4. **The hook is the first shot of the first clip, and it is short:** 1.5-3 s, then cut. The first cut arrives early.
5. **Sound starts at frame 0** (a sound tied to the picture, or the song), never silence that waits for music.
6. **Titles never come before the hook.** A title card covers the opening seconds, so either the image under it must
   hook on its own, or put the title later (`lower_thirds` or `graphics` at a chosen time).
7. **Test hooks on Basic** (`speed: "draft"`; `variants` for A/B). Premium only after a shown quote and a yes.

## Opening patterns

| Pattern | First shot | Best for |
|---|---|---|
| Cold open mid-action | the action is already happening: a chase, a fall, a slap landing | thrillers, fights, game trailers |
| The wrong detail | one close detail that should not be there: a wet footprint inside a locked room | mystery, horror, drama |
| Face mid-reaction | a close-up of someone reacting to something we have not seen yet | drama, comedy, reaction-led social |
| The question | a person doing something that makes no sense yet: burying a suitcase at dawn | story films, music videos |
| The end first | the climax image, then the story rewinds (a clip join with a time cut) | longer films, documentaries |
| Contrast | two things that do not belong together: a ballerina in a scrapyard | music videos, brand films |
| Sound-first | a sharp sound tied to a visible action at frame 0: a slammed door, a match strike, a gunshot off screen | horror, trailers |
| Direct address | a person looks into the lens and says one short line | UGC, ads, explainers, creators |
| Process hook | a pour, a crack, a tear, a cut at macro: something changes state | product ads, food, crafts |

Pick one. Two hooks in the first shot cancel each other.

## By format

**Films (`POST /api/v1/director/videos/film`)**
- Shot 1 of clip 1 carries the hook. Clip 1 is setup *and* hook; the rest of the setup can wait for clip 2.
- With `idea`, write the hook into the idea itself ("Opens on a nurse answering a call light from a room that was
  emptied this morning"): the writer builds the opening from it. Check the storyboard (`storyboard: true`) and make
  sure Shot 1 shows it; or write the clips first with `POST /api/v1/director/prompts/write` and read clip 1 in its
  `result`.
- `variants` (2-4 versions in all) renders separate versions, each with a different opening hook when you send
  `idea`; the extra versions are their own jobs in `versionJobIds`. Each version is billed like the first and all
  are held up front, so quote `variants` x the single price (`?check=true`) before starting. Not with `storyboard`;
  Premium and Ultra render one version at a time.
- Documentaries (`film_type: "documentary"`): the writer builds a cold open that hooks; review it, don't replace it
  with a title.

**Music videos (`POST /api/v1/director/videos/music`)**
- Use the customer's own song. The song's own intro decides the hook: if the vocal starts late, Montage finds the
  instrumental stretch and keeps lips closed until the vocal. Do not open on a singer's close-up during a long
  instrumental intro; open on the story, a look, a place or a striking image, then land the first performance shot
  on the first vocal line.
- The first sung line is a performance shot (MCU or CU, eyes on the lens or on someone).
- Open on the song's strongest visual idea, not on the city skyline.

**Ads (`film_type: "commercial"`, or `POST /api/v1/director/prompts/write` with `mode: "reference"`,
`film_type: "commercial"`)**
- The writer follows an ad structure with a 2 s hook and the product as the answer; `ad_style` picks the format and
  each of `variants` gets its own. Your job: check that the first 2 s show a problem, a sensory moment or the
  product doing something, not a logo.
- Premium ad rhythm: Shot 1 (1-2 s) is the hook; 4-6 shots per 15 s; no 0.5-1 s micro-shots.
- `cutdowns` in `package` (up to 3 lengths, 5-120 s) keep **the opening plus the end card**: the first seconds must
  work as a 6 s ad on their own.

**Social (9:16)**
- Render 9:16 (`aspect` on the render) or add `formats: ["9:16"]` in `package` (`reframe: "crop"` follows faces).
- One hook line spoken in the first 3 s at most; captions `"auto"` with `caption_style: "pop"` and
  `caption_position: "center"` so the line reads with the sound off.
- Text hooks over the picture: `POST /api/v1/director/videos/graphics` with a text element at `t: 0.2`, a short `d`,
  and `safe_area` (on 9:16 it keeps text clear of the social apps' buttons); graphics never land over a face.

## Prompting the first shot

**Montage Basic**
- Open the prompt with the dramatic context in one line (what is happening, who, how long), then Shot 1.
- Shot 1 has no timestamp. It starts with the look sentence, then goes straight to the hook action in the same shot.
- Make Shot 1 short (2.5-3 s) and give the cut at `00:02.500` or `00:03.000`; one action, one camera move.
- Open mid-action: "is already turning", "the glass is already falling". Never a stance or a slow reveal.
- Energy: one move "with large amplitude at fast speed", or a static shot on something that moves.
- Image-to-video: the picture IS frame 0. Choose a picture that already hooks, then describe only what happens
  next ("Continuing from the first frame: the cup slips from her fingers").
- A first line of dialogue: at about 2.6 words per second plus 1 s of silence, a 3 s shot holds about 5 words.

```
integrated_multimodal_description: [Shot 1] Live-action, cinematic, 35mm lens, practical light only, clean digital cinema image; every transition is a clean hard cut, no dissolves or double exposures. A close-up of a bride in a white dress already cutting through her own skirt with kitchen scissors, the fabric splitting fast. The camera holds a static shot.
[Shot 2] At 00:02.500, the camera cuts to a medium shot: she drops the scissors on the church floor and walks out through the side door. The camera pans right with small amplitude at slow speed.
...
```

**Montage Premium / Ultra**
- `Shot 1 (0-2s)` is the hook; give it one dominant beat, already in progress. A slow wide "establishing" first shot
  is improvised filler.
- Put the hook state in the `[Summary]` too, so the take is built around it.
- A first spoken line starts early in its shot (late starts are common); about 1.6 words per second, so a 3 s hook
  shot holds about 4 words.
- No camera move during the hook line; save a whip pan or push-in for the cut that follows.

```
Shot 1 (0-2s): [Close-up, front-on, fixed shot] Lena is already cutting through her own wedding skirt with kitchen scissors, the fabric splitting fast. <scissors snip>, <fabric tearing>.
Hard cut.
Shot 2 (2-5s): [Medium shot, slow pan right] Lena drops the scissors on the stone floor and walks out through the side door. <echoing footsteps>.
```

## Good vs bad openings

| Bad | Better |
|---|---|
| "A slow aerial drift over the city at sunrise." | "A close-up of a man on a rooftop edge already letting go of a briefcase; it falls out of frame." |
| "Our hero wakes up and stretches." | "A close-up: her eyes snap open; a stranger's coat is draped over her." |
| "Logo reveal, then the product." | "Macro: cold brew pours over ice, the ice cracks." (logo on the end card) |
| "She stands in guard, circling her opponent." | "Her kick is already swinging into his ribs; he folds sideways." |
| "Title: THE LAST TRAIN" over black for 4 s | the hook shot first; the title later with `lower_thirds` |

## Titles and text: timing

- `package.title_card` (up to 160 characters, 3 lines, the first big) is drawn over the **first** `title_card_s`
  seconds (1-10, default 4). Use it only when the opening image hooks without help (a striking still moment). Pair
  with `music_until_s` to run the music bed only under the opening.
- For a title after the hook, use `package.lower_thirds`: name cards `{t, text, sub}` or chapter cards
  `{kind: "chapter", label, text, t, d}` (`t` in seconds); or `POST /api/v1/director/videos/graphics` with a text
  element at any time (`snap_to_beat: true` lands it on the music).
- Never ask either model for on-screen text, titles or captions in the prompt: they come out garbled. All text is
  added in packaging or graphics.

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/graphics" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"job_id": "JOB_ID", "graphics": [{"type": "text", "t": 0.2, "d": 2.2, "text": "She had 10 minutes to leave"}]}'
```

Not sure of the element fields? `POST /api/v1/director/videos/graphics/plan` with `job_id` and a `brief` returns a
ready `plan.graphics` list to edit and send back. Graphics are priced like `videos/finish` on the video's seconds
(a plan alone is 16 credits).

## Loop endings (social)

A loop works when the last frame flows into the first.
- Write the last shot to return to the first shot's composition: same size, same subject position, same light
  ("the camera ends on the same close-up of the closed door it opened on").
- Do not end on a held still or a fade if it must loop: films default to `fade` 0.5 s, so send `fade: 0`; end cards
  break loops, so leave them out of the loop version.
- Then find the loop point by eye and trim: `GET /api/v1/director/jobs/{id}/shots`, then
  `POST /api/v1/director/jobs/{id}/edit` with `trim_start` / `trim_end` per shot, or
  `POST /api/v1/director/videos/assemble` with trims.
- Story loops are easier than motion loops: end on the question the video opened with (the same doorbell ringing).

## Requests

Three Basic draft versions of a film opening, each with a different hook (quote first):

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/film?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-basic -F duration=30 -F speed=draft -F variants=3 \
  --form-string "idea=A night nurse answers a call light from a room that was emptied this morning. Open on the light." \
  -F images=@nurse.png --form-string 'references=["Ruth, 48, the night nurse"]'
```

After a yes, send it without `?check=true`; the first version is the returned job, the others are in its
`versionJobIds`.

Social deliverables from a finished job, keeping the hook in every cutdown (quote with `?dry_run=true` first):

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/package" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"job_id": "JOB_ID", "formats": ["9:16"], "cutdowns": [6, 15], "captions": "auto", "caption_style": "pop", "caption_position": "center"}'
```

Poll `GET /api/v1/director/jobs/{id}` until `done`; the main video is `output.url`, the shapes and cutdowns are in
`deliverables`.

## Related skills

references/montage/pixio-camera-language.md, references/montage/pixio-emotion-acting.md,
references/montage/pixio-ads.md, references/montage/pixio-product-ads.md, references/montage/pixio-social-formats.md,
references/montage/pixio-graphics-titles.md, references/montage/pixio-music-video.md,
references/montage/pixio-film.md, references/montage/pixio-game-trailers.md,
references/montage/pixio-batch-variants.md.

## Checklist

- [ ] Frame 0 shows motion, a face or a strange detail; no fade-in, black or slow drift.
- [ ] Something is wrong, wanted or at stake by second 1-2; one hook, not two.
- [ ] Shot 1 opens mid-action, is 1.5-3 s long, and the first cut comes early.
- [ ] Sound tied to the picture from frame 0 (or the customer's song).
- [ ] Music videos: no singer close-up during an instrumental intro; first vocal line is a performance shot.
- [ ] Ads: the first 2 s work as a 6 s cutdown; no logo-first opening.
- [ ] No text in the prompt; titles and hook text via `package` or `graphics`, timed after the hook unless the image carries it.
- [ ] Loops: last shot returns to the first composition; `fade: 0`; no end card on the loop version.
- [ ] Hooks A/B tested on Basic (`variants`, each version billed); Premium only after a quote and a yes.
