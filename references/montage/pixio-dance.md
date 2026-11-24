---
name: pixio-dance
description: How to make dance and choreography videos with Montage (Pixio's Director API) - dancing in music videos (POST /api/v1/director/videos/music with sections, tier_mix, music_sync), finding the tempo (POST /api/v1/director/understand/audio, POST /api/v1/director/music/plan) and cutting on the beat, solo vs group dance, writing moves as body mechanics (counts, direction, weight, arms and legs) with one move-phrase per shot, camera that serves dance, avoiding limb glitches and merged dancers, move reference videos (@Video1 on POST /api/v1/director/videos/reference), Montage Basic vs Montage Premium for dance, and QA of dance takes. Use whenever a video has someone dancing or moving to music. Not for the prompt format itself (that is references/montage/montage-basic-prompting.md / montage-premium-prompting.md) or the whole music-video workflow (that is references/montage/pixio-music-video.md).
---

# Pixio dance

Dance is the hardest motion to render. Arms, legs and bodies cross over each other, the motion is fast, and the
viewer expects it to land on the music. Most failed dance takes go wrong in one of three ways: the move was named
instead of described, there were too many dancers, or the camera was too close to show the body.

## 0. Decision rules (read first)

1. **Spell out the move. Don't name it.** "Pirouette", "moonwalk", "popping" or "grooves" mostly render as generic
   swaying. Write body part + direction + count: "steps out on the right foot with a knee dip on 1, drags the left
   foot in on 2, quarter-turn left on the ball of the foot on 3-4".
2. **One move-phrase per shot.** One 8-count (or less) per shot. Every Montage model merges or drops a second action
   in the same shot.
3. **One or two dancers per shot.** Show a group as one mass in a wide shot. Synchronised group choreography is the
   riskiest thing you can ask for. Ask for it only when the user wants it, and only on Montage Premium or Ultra.
4. **Show the whole body.** Use a full or wide shot for footwork and travelling moves. Use medium or tighter only
   for upper-body moves, faces and sung lines.
5. **Cut on the music.** Get the tempo first (section 2). Put each cut on a phrase start or a drop, not on every
   beat.
6. **Model choice.** Dance-heavy sections go to Montage Premium when the customer pays for it (`tier_mix: "auto"`
   does this). Sung close-ups stay on Montage Basic. **Every test render runs on Basic.**
7. **A move too complex to describe** → use a muted reference video (`@Video1` on Premium, section 7).

## 1. House rules

- **Test cheaply on Basic.** Every test, draft or trial render sends `video_model: "montage-basic"` (it is also what
  renders when `video_model` is left out). Basic is billed in Pixio credits like everything else, just less.
  Premium or Ultra only when the user asks for it and has seen the `?check=true` quote (`credits.quoted`).
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE`
  (`https://beta.pixio.myapps.ai`) and `$PIXIO_API_KEY`.

Spread many dancer pictures over sections with `clip_images` rather than dropping one for an easier group shot.
Never copy lyrics into prompts, `idea`, logs or file names.

## 2. Tempo first: measure the song

Measure the song before you write a single move.

```bash
# the measured read only (tempo, beats, changes, voice stretches); billed, at least 16 credits
curl -X POST "$BASE/api/v1/director/understand/audio" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "audio=@song.mp3" -F "measure_only=true"
```

Poll `GET /api/v1/director/jobs/{id}`; the done job's `understanding` holds the measured sound: the tempo, the beat
length, the loud changes (drops and builds, breakdowns) and where the voice sings. Without `measure_only` the deep
read also gives the song's parts (verse / chorus / drop with start, end and energy). It never returns the words.

`POST /api/v1/director/music/plan` with the `song` (or a finished `song_job`) plans the 15 s sections and where the
voice sits in each. It is a writer job: it returns `202` with a job id, runs for a few minutes, and the plan lands
in the job's `result` (`sections`, `song_s`, and with an `idea` a `treatment`). Without an `idea` it costs
`songAnalysis` credits; with one, a writer round. `GET /api/v1/director/catalog` has both prices.

**Turn beats into shots.** An 8-count lasts `8 x` the beat length (60 / BPM seconds):

| tempo | beat | one 8-count | shots per 15 s section |
|---|---|---|---|
| 80 BPM | 0.75 s | 6.0 s | 2-3 (count in 4s, a half-phrase per shot) |
| 100 BPM | 0.60 s | 4.8 s | 3 |
| 120 BPM | 0.50 s | 4.0 s | 3-4 |
| 140 BPM | 0.43 s | 3.4 s | 4 |

On Montage Basic every shot must be at least 2.5 s (3 s or more is better), with 4-5 shots per 15 s. At high tempos,
give a shot one 8-count rather than half of one. Put the shot timestamps on multiples of the beat from the section
start, and move the big change (a camera change, the dancer stopping dead, then exploding) onto a drop time. Timing
inside a shot is approximate on every model, so cut on phrases, not on single beats.

Music-video sections are fixed 15 s windows joined by hard cuts at the 15 s marks: plan inside each one.

## 3. Writing moves as body mechanics

Fit the moves to the time: about one move-phrase per 8 counts, never a routine crammed into a 5 s shot. For each
phrase name the support foot and where the weight transfers, and list the motions that must not happen (no
spins off the support foot, no feet sliding, no arms passing through the body). Check the take against that list.

Every move-phrase answers: **which body part, which direction, on which count, where the weight goes, what the
arms do, and where the eyes look.**

Bad:
> She does an energetic hip-hop routine with some popping and a spin.

Good:
> On 1-2 she drops her weight into her left hip and both shoulders roll back; on 3-4 two sharp head nods; on 5-6 she
> steps out on the right foot with a knee dip and drags the left foot in; on 7-8 a quarter-turn left on the ball of
> the right foot, arms snapping out to shoulder height. Her eyes stay on the camera.

Words that work:
- **Dynamics instead of style labels:** slow sustained arms, a sudden explosive turn, sharp isolations, a loose
  bounce in the knees, suspension then release, floor work, a hard stop.
- **Weight and contact:** "plants the left foot", "the heel lands on the beat", "sinks into a deep knee bend, heels down",
  "pushes off the back foot".
- **Arms and hands:** where they start and end ("arms sweep from low left to high right"), and whether they are
  sharp or flowing.
- **States, not wind-ups:** open the shot mid-move ("already mid-groove, knees bouncing"). Don't start from a dancer
  standing still waiting for the beat; the model spends the shot getting started.
- **Same-direction chains:** fill a long shot with moves that travel one way (three step-drags travelling frame
  right). Back-and-forth moves often come out reversed or stuttering.
- **The face is part of the dance:** the eyes have a target (the camera, a partner, the crowd) and the breath shows,
  plus one facial beat on the drop ("a grin builds", "eyes close on the held note").

Lock the move to the music in words: "steps land on the downbeats", "the spin releases on the drop", "arms hit on
the snare". On Basic, also say the tempo feel in `non_diegetic_music` ("steady mid-tempo, about 100 BPM, heavy kick
on every beat"). On Premium, the section's vocal or the song already drives the timing.

## 4. Camera for dance

| moment | camera | Montage Basic words | Montage Premium words |
|---|---|---|---|
| footwork, travelling, full routine | wide or full shot, steady | Static Shot / Tracking Shot | "wide shot, locked-off" / "slow lateral tracking" |
| power moves, jumps | low angle, full body | low-angle full shot + Static Shot or Push In at slow speed | "low angle, full body, slow push-in" |
| a contemporary build | a circle that tightens | Arc Shot with small amplitude at slow speed | "slow 90-degree orbit that tightens as the moves grow" |
| emotional or slow | slow move in | Push In with small amplitude at slow speed | "slow dolly-in" |
| a hit or a drop | a sudden change of framing | a hard cut to a new framing on the drop time | "quick push-in on the drop" |
| floor finish | from above | Tilt Down / Pedestal Up toward an overhead view | "overhead shot" |

- **Basic uses only its trained camera words:** Push In/Pull Out, Pan, Truck, Tilt, Pedestal, Arc Shot, Tracking
  Shot, Static Shot, Zoom, Shake, POV, Roll, with "small/large amplitude" and "slow/fast speed". Never write orbit,
  dolly or crane for Basic; use Arc Shot. `fix_prompt: "safe"` (free) converts off-vocabulary camera words for you.
- **Basic only cuts where the framing changes.** Give every shot a different size or angle (wide → low-angle full →
  medium → wide), or two shots melt into one long take.
- **One camera move per shot**; fast-cut edits are many shots or sections, never "rapid cuts" inside one shot.

## 5. Solo, duo, group

**Solo.** The easiest case. A plain or negative-space set, wardrobe that contrasts with it, one hard light. No strobe
and no colour changes in the middle of a clip (they break the body outline).

**Duo.** Contrasting outfits and builds ("red bomber jacket, shaved head" against "grey hoodie, long blond hair").
Fixed sides: "Mia stays frame left, Jon frame right". A stated gap: "about 2 metres apart". Keep partner contact
simple (one hand hold, one lift at most) and short. Long body overlap is where bodies merge.

**Group (3+).**
- Premium takes at most 4 people per take. More dancers = several sections, or a crowd as a mass in the background.
- Stagger them ("each dancer starts the arm sweep a quarter-beat after the one on her left") unless unison is the
  point. Unison makes clones look worse.
- Faces: on Basic, a named face stays recognisable only when it fills about 13 % of the frame height or more. In wide
  group shots, show named dancers from behind, in silhouette or turned away, or send `face_fix: "auto"` on the music
  job.
- **One picture = one person.** Never reuse one dancer's photo for "backup dancers"; it makes identical twins.
  Give extras their own picture or a clearly different description.
- **Basic has no negative prompt.** "No other dancers" draws dancers. When only the cast should appear, describe the
  place positively as empty ("the studio floor is empty around her").

## 6. Montage Basic vs Montage Premium for dance

| | Basic (`video_model: "montage-basic"`) | Premium (`video_model: "montage-premium"`) |
|---|---|---|
| price | the lowest Director price, billed in credits | priced from a quote (`?check=true`); offered when `videoModels.premiumAvailable` is true in `GET /api/v1/director/catalog` |
| motion | simpler moves, 1 move-phrase per shot; tends toward slower motion | richer, faster movement and camera work; the better choice for dance |
| lips | best on the customer's song (it follows the real audio) | re-sings the vocal; use `music_sync: "song"` or fix later |
| people | name exactly who appears; faces need size | at most 4 per take; 6-9 pictures per clip recommended |
| prompt | up to 8,000 chars, six-section format (montage-basic-prompting.md) | up to 30,000 chars, [Assets]...[Constraints] (montage-premium-prompting.md) |

Montage Ultra (`montage-ultra`) works like Premium with the highest-quality model on every shot, and costs more.

- **Tier mix** (Premium or Ultra): `tier_mix: "auto"` sends dance, wide, action and instrumental sections to Premium
  and keeps sung close-ups on Basic. Basic sections keep the Basic price, Premium sections the Premium price, so a
  mix costs less than all-Premium. `tier_mix: "manual"` with `basic_sections: [1,3]` lets you choose.
- **Basic motion dial:** `fight_motion` (0.1-0.6) adds energy to Basic motion, also in music mode. It was measured on
  fights (0.4 recommended there; much higher smeared faces). For dance it is untested, so try 0.3-0.4 on a Basic
  draft first.
- **Premium in a music video:** dance shots go in vocal gaps, as full or wide shots. A dancing singer sings only in a
  medium shot or tighter. With `music_sync: "song"` the song renders in short phrase takes re-timed onto the exact
  song, and instrumental parts become non-singing takes ("dancers, the crowd, the place").
- **Story dance (nobody sings):** say it in the `idea` and in every section ("nobody sings; every mouth stays
  closed").

## 7. Reference videos for moves (`@Video1`)

Some moves are faster to show than to describe. `POST /api/v1/director/videos/reference` accepts up to 3 `videos` on
every model. The tag is `@Video1` on Premium and `<Video 1>` on Basic. The facts:

- 0-3 reference videos, each at least 2 s; only the first 15 s count. They are scaled down a lot, so fingers and
  faces don't carry over; body paths and timing do.
- **Always mute a move reference** (`video_audio=false`): on Premium a reference video's own sound wins over yours.
- Premium: a take with a video reference can cost more; quote it with `?check=true` first. Basic sees only the part
  matching the output length; its value for choreography is unproven.
- `/api/v1/director/videos/music` and `/api/v1/director/videos/film` take no reference videos: make the dance shot on
  `/reference` and join it in the edit (references/montage/pixio-video-editing.md).
- In the prompt take only the movement ("copy only the dancer's movement, timing and path, not her face, clothes,
  place or camera"); the person comes from a picture (`@Image1`). Use footage the customer has the right to use.

```bash
curl -X POST "$BASE/api/v1/director/videos/reference?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "video_model=montage-premium" -F "duration=10" -F "aspect=9:16" \
  -F "images=@dancer.png" -F "images=@warehouse.png" -F "videos=@moves.mp4" -F "video_audio=false" \
  -F "prompt=<the Premium prompt below>"
```

Premium prompt (shape from montage-premium-prompting.md):

```
[Assets] @Image1 is Kai, a dancer in a white tank top and black cargo pants: take only his face, hair and clothes. @Image2 is an empty concrete warehouse with one high window: take only the place. @Video1 is a choreography reference: copy only the movement, timing and path, not the person, clothes, place or camera.
[Summary] Kai dances alone in the warehouse in a single hard shaft of window light; live-action, cinematic, real-time speed; hard cuts only.
[Shot list]
Shot 1 (0-4s): [Wide shot, full body, locked-off] Already mid-groove, Kai does the first phrase of @Video1: two step-drags travelling frame right, knees bouncing, arms loose.
Hard cut.
Shot 2 (4-7s): [Low angle, full body, slow push-in] On the drop he plants the left foot, spins a half-turn on the ball of the right foot and freezes, arms out at shoulder height.
Hard cut.
Shot 3 (7-10s): [Medium shot, slow 90-degree orbit] Sharp chest isolations forward and back on each beat, eyes locked on the lens, breath visible.
[Continuity] Kai looks exactly like @Image1 in every shot. One hard window light, no colour changes.
[Sound] Music only as tempo: a steady 100 BPM beat. No voices.
[Constraints] Keep facial and body proportions stable, limb anatomy natural and motion continuous, with no stiffness, clipping, stuttering or distorted limbs. All movement follows real-world physics. Real-time speed, no slow motion. No subtitles, on-screen text, logos, watermarks or twin characters.
```

## 8. A dance music video, end to end

```bash
# 1) measure the tempo (section 2), then quote a Basic draft; ?check=true is free and starts nothing
curl -X POST "$BASE/api/v1/director/videos/music?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "song=@song.mp3" -F "images=@lena.png" -F "images=@garage.png" \
  -F 'references=["Lena, the dancer and singer: woman, red jacket, black leggings", "the empty parking garage"]' \
  -F "idea=Lena dances alone through an empty parking garage at night; she sings the chorus to the lens" \
  -F "style=one hard white light, wet concrete, full-body dance in the instrumental parts" \
  -F "video_model=montage-basic" -F "speed=draft" -F "aspect=9:16" -F "visual_qa=local" -F "face_fix=auto"
# 2) same call without ?check=true starts the job; poll GET /api/v1/director/jobs/{id}
```

Writing `sections` yourself: one per 15 s in Basic's six-section format; each dance shot gets one move-phrase in
counts, full-body framing and one trained camera move: `[Shot 2] At 00:04.800, the camera cuts to a low-angle full
shot: <Subject 1> steps out on the right foot with a knee dip on 1, drags the left foot in on 2, quarter-turns left
on 3-4; her lips stay closed. The camera pushes in with small amplitude at slow speed.` (4.8 s = one 8-count at
100 BPM.)

Then: fix weak sections with `POST /api/v1/director/videos/music/{id}/redo` (`{"section": 3, "seed": 777}`, an
optional corrected `prompt`) and render the final with `POST /api/v1/director/videos/music/{id}/final`. If the
customer wants Premium for the dance, `?check=true` with `video_model: "montage-premium"` and `tier_mix: "auto"`
shows the quote. Ask before you render it.

## 9. QA of dance takes

Look at about 1 frame per second, then scrub the dance shots at full speed:

| failure | what it looks like | fix |
|---|---|---|
| extra or fused limbs | a third arm mid-spin, hands melting together | simpler phrase, fewer crossings, redo with a new seed; Premium: anti-breakage line |
| merged dancers | two bodies become one where they overlap | more gap in metres, fixed sides, contrasting outfits, fewer dancers |
| clones | the same dancer twice in a frame | one picture = one person; `visual_qa: "local"` flags clones |
| face drift in wides | the dancer stops looking like her photo | `face_fix: "auto"`, or a wide from behind |
| foot sliding / floating | feet glide without stepping | "the heel lands on 1", "weight in the left foot", real-time speed |
| slow motion or wind-up | the move takes the whole shot to start | open mid-move; "real-time speed, no slow motion"; Basic: try `fight_motion` |
| reversed or stuttering moves | the travel goes back and forth | a same-direction chain |
| off the beat | hits miss the drop | move the shot start onto beat multiples / a drop time |
| singing in instrumentals | mouths move with no vocal | "every mouth stays closed"; check with `lip_check: "measure"` |

- `visual_qa: "local"` (`visualQaLocal` credits per 15 s part) reliably flags clones and unwanted text in the job's
  `qaIssues`. Its AI judge (`full`) reports hands, action and physics only as low-severity `checkByEye` notes, so
  judge limbs yourself.
- `POST /api/v1/director/understand/video` with a `job_id` and a `question` ("At which seconds do the dancers' limbs
  merge or glitch?") gives a timed second opinion in the done job's `understanding`. It is billed (at least 16
  credits; the catalog has the price).
- Lips: references/montage/pixio-music-video.md and pixio-lipsync-fixing.md; more on review: pixio-video-qa.md.

## 10. Checklist

- [ ] Tempo measured (`/api/v1/director/understand/audio`, sections from `/api/v1/director/music/plan`); shot times on beat multiples; big change on a drop.
- [ ] Each move written as body part + direction + count + weight + arms + eyes; no step names alone.
- [ ] One move-phrase and one camera move per shot; the framing changes at every cut.
- [ ] Full or wide shots for footwork; medium or tighter only for upper body and singing.
- [ ] At most 2 dancers in focus (Premium: at most 4 per take); contrasting outfits, fixed sides, a gap in metres.
- [ ] Every supplied picture used, one picture per person; no "no dancers" negatives on Basic.
- [ ] Basic: only trained camera words (Arc Shot, not orbit). Premium: the anti-breakage line in [Constraints].
- [ ] Move reference: `/api/v1/director/videos/reference`, muted (`video_audio=false`), 2-15 s, "copy only the movement".
- [ ] Basic tests, Premium only after an approved `?check=true` quote; customer's own song; no lyrics, grain or API key in text.
- [ ] After render: frame check for limbs, merges, clones, sliding feet, beat sync; redo weak sections.

Some techniques adapted from an open-source (MIT) community prompt-skill collection.
