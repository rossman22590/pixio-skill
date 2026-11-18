---
name: pixio-comedy
description: How to make comedy that is actually funny with Montage (Pixio's Director API) - sketches and sitcom scenes, setups and payoffs, reaction shots, deadpan, grounded physical comedy, dialogue timing per 15 s clip, laugh tracks, and what reads as funny versus silly in AI video. Use whenever someone asks for a comedy sketch, a funny short, a sitcom episode, a parody-style scene or a humorous ad, or you write, check or fix comedy clips for /api/v1/director/videos/film, /api/v1/director/videos/reference or /api/v1/director/series. Not for the prompt format itself (that is references/montage/montage-basic-prompting.md for Basic and montage-premium-prompting.md for Premium) and not for whole TV-series planning (that is references/montage/pixio-series-showrunner.md).
---

# Comedy on Montage

AI video is funny when the joke lives in a **face reacting to something plain**, a **line landing on a held
beat**, or **a small physical thing going wrong in a believable way**. It is silly (not funny) when the joke needs
impossible physics, gadgets, fast slapstick or a crowded frame: those render as floaty, mushy or random, and the
viewer laughs at the video, not the joke. Prompt FORMAT lives in `references/montage/montage-basic-prompting.md`
(Montage Basic) and `references/montage/montage-premium-prompting.md` (Montage Premium and Ultra); this skill is the
timing and staging on top.

## House rules

- **Test cheaply on Basic.** Every test, draft or trial render sends `video_model: "montage-basic"` (it is also what
  renders when `video_model` is left out). Basic is billed in Pixio credits like everything else, just less.
  Premium or Ultra only when the user asks for it and has seen the `?check=true` quote (`credits.quoted`).
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE`
  (`https://beta.pixio.myapps.ai`) and `$PIXIO_API_KEY`.
- **Never name famous comedians, shows or films** as a shortcut; describe the style instead.

## Decision rules (read first)

- **Write the joke in one sentence before anything else:** setup, turn, payoff. If you can't, there is no sketch.
  Show it to the human and get a yes before any render.
- **Basic (`video_model: "montage-basic"`) for tests and for most comedy.** Comedy is dialogue and faces, which
  Basic does well with voice samples and close-ups. Premium only when the human asks, or for one big physical
  beat; mix with `tier_mix` and show the `?check=true` quote first.
- **Length:** a sketch is 30 s (2 clips: setup, payoff) or 60 s (4 clips: setup, escalation, turn, payoff). Longer
  comedy needs a running story; use `/api/v1/director/series` for recurring characters.
- **Several versions, then pick.** `variants` 2 to 4 with an `idea` gives each version a different opening hook
  (each extra version is its own job in `versionJobIds`, billed like the first and held up front). Comedy is hit
  and miss; pick the funniest. Basic keeps that affordable.
- **A laugh track is packaging,** never something the render should perform: `package.laugh_track` `light` or
  `full`.

## 1. Funny vs silly in AI video

| reads as funny | reads as silly (avoid) |
|---|---|
| a deadpan face holding still while something absurd sits in plain view | rubber faces, mugging, "extremely exaggerated expression" |
| one person sitting down hard on a wet bench, chair or floor ("sits down hard" lands every time on Basic) | flips, pratfalls through the air, bodies flying, people lifted, cartoon physics in live action |
| a prop that is plainly wrong (a tiny umbrella, a cake with the wrong name, a dog in a tie) and made from a reference picture | phones, laptops, texts, drones, small gadgets (they render badly, and a story that hangs on a screen reads as lazy) |
| a line in plain full sentences, said flatly, then a 2 s hold on the listener | slang fragments, puns that need on-screen text, jokes in the last second of a clip |
| two people front-on in a two-shot, both faces visible | shoves, grabs, slaps, pies to the face (hands melt, contact never lands) |
| a pause that is too long | fast montage gags, five things happening in one shot |
| one silly thing per shot in an otherwise normal world | a world where everything is wacky (nothing to contrast with) |

Two more traps: **eating, drinking and spit-takes** in close-up go wrong (small hand business near the face and
splashing liquid are both hard); and **headbutts and stunts** read as dumb, not funny.

## 2. Timing per 15 s clip

- **Dialogue budget on Basic:** about 2.6 words per second plus 1 s of hold after each line. A 15 s clip fits two
  or three short lines, or one line plus a long reaction. Premium: lines of 5-10 words at about 1.6 words per
  second, one speaker per shot, and no lines in the last third of a take.
- **The punchline is never in the last second.** A line crammed into the end comes out rushed or garbled. Put
  the last line about 9-11 s into the clip and let the reaction or a silent hold finish it.
- **A beat after the punchline.** Write the next shot as the reaction (or "Static Shot, holding" on the speaker)
  for at least 2.5 s (Basic's minimum shot length). That beat is where the laugh lives; with a laugh track the
  laugh is mixed in there.
- **Shots:** 3-4 per 15 s clip for dialogue comedy (each at least 3 s); 4-5 when it is visual.
- **Rule of three across shots:** normal, normal, wrong. Each beat gets its own shot with a new framing (Basic only
  cuts where the framing changes).
- **End every clip on a hold.** Joins between clips go where the place or time changes ("Later." works as a cut).

## 3. Setups and payoffs

- **Plant early, pay late.** The thing that pays off in clip 4 must be seen in clip 1: the wobbly chair, the
  "do not press" button (as a big plain red button, no text), the dog that hates hats.
- **The planted prop gets a reference picture** (`POST /api/v1/director/images/text`, plain grey background, no
  text) used in every clip that shows it; described in words only, it changes shape between clips and the payoff
  loses its link.
- **Escalate one variable.** Each clip makes the same problem bigger (one cat, then three, then the whole sofa is
  cats), not a new problem.
- **The payoff is visible and physical:** the chair gives way and he sits down hard; the cake is carried in and it
  is the wrong cake. Then a reaction. Never explain the joke in dialogue afterwards.
- **Callback in the last shot:** repeat the opening shot's framing with one thing changed.

## 4. Reaction shots and deadpan

- **The reaction is a separate shot,** a close-up or medium close-up of the listener, front-on, static camera.
  Describe one physical change only: "her eyes slowly close", "he looks straight into the lens", "she sets the
  cup down without a word". Keep the cast exact: "`<Subject 2>` is the only person in the frame".
- **Deadpan = stillness plus a held frame.** "Static Shot, holding." on Basic; "locked-off camera" / "fixed shot"
  on Premium (the Premium camera notes list locked-off for dialogue and comedy). No push-in on a deadpan beat: a
  move tells the viewer it is dramatic.
- **Looking at the lens** (a mockumentary glance) works as a reaction: one shot, medium close-up, no line.
- **Who stays silent goes before the line:** "Nobody else speaks; every other mouth stays closed." then
  `(S1) <d>[English] ...</d>`. After `</d>` write only camera or action.
- **Avoid over-the-shoulder reverse shots** for the back-and-forth; they make a second copy of a person. Use a
  front-on two-shot ("exactly two people are in the frame, both facing the camera; nobody in the foreground")
  or alternate single close-ups.
- Emotion through behaviour, never extreme words (furious, hysterical): on Premium those even make eyes glow.

## 5. Physical comedy that renders

- **One move per shot, with a destination:** "he leans back, the plastic chair bends, and he sits down hard on
  the patio stones." Reactions with a destination land; a fall with no cause shown becomes a floating ragdoll.
- **Cause and effect in the same shot.** The banana peel and the slip together; never "he is already on the floor".
- **Slow and small is funnier on AI video than fast and big.** A door that slowly swings shut on him, a sprinkler
  that turns to face her, a deckchair folding.
- **No hand-on-hand contact** (shoves, grabs, handshakes that go wrong): extra or melted hands. Let objects do the
  slapstick, not hands.
- **Animals:** a dog or cat doing one plain thing (staring, sitting in the wrong place) is reliable comedy. Side
  profile and medium framing; no small animals in macro.
- **Animation** is where bigger physical comedy is allowed: set `realism: 0`, state the style in every clip, and
  say which things are characters ("plants and objects are ordinary and lifeless with no faces") unless an object
  is meant to come alive. See `references/montage/pixio-3d-animation.md` and `pixio-anime-styles.md`.

## 6. Voices and cast

- **Contrast the pair:** a tall, tidy, anxious man and a small, calm, chaotic woman. Different colours, builds and
  hair so the model never blends them. One picture per person; never "two clerks dressed like `<Picture 3>`"
  (twins).
- **Voices:** `ref_audios` (clean 5-10 s of one person) with `cast` binding each picture and audio, or
  `voice_lock: true` to keep the voices from clip 1. Describe each voice once at its first line ("in a flat, slow,
  dry male voice"). Deadpan is in the voice description and the hold, not in capitals or exclamation marks.
- `no_speech` (`[2]`) for a silent visual-gag clip so nobody mumbles.

## 7. Laugh track and sitcom shape

- `package.laugh_track`: `light` (the clear jokes only, at most about one every 6 s) or `full` (every joke, the best
  get big laughs or applause); `laugh_db` sets the level. The AI reads the speech and picks the punchlines. Priced
  as `laughTrack` in `GET /api/v1/director/catalog`.
- On a series, `laugh_track` at `POST /api/v1/director/series` gives every episode the track, and the writer leaves
  a beat after each punchline and keeps laughter out of the render's own sound. For your own clips, end
  `overall_soundscape` with "No other voices." and don't describe an audience.
- A laugh track makes weak jokes worse. Use `light` for dry or awkward comedy, `full` only for broad sitcom.

## 8. Worked example: "The Quiet Carriage" (30 s, 2 clips)

**One line:** a man in the quiet carriage of a train shushes everyone, then his own enormous sneeze echoes through
the carriage. Plant: the "quiet" sign is not needed; his finger to his lips in clip 1 is the setup. Payoff: the
sneeze, and the whole carriage turning slowly to look.

Clip 1 (setup), Basic, official format, cut down:

```text
subject_definitions:
<Subject 1> is the commuter in <Picture 1>, a tall thin man in his fifties in a buttoned beige raincoat and round glasses, natural skin with visible pores, sitting very upright.
<Subject 2> is the young woman in <Picture 2>, in her twenties, in a bright red puffer jacket, holding a paper cup.
<Subject 3> is the train carriage in <Picture 3>, a calm modern carriage with blue seats and grey morning light.
summary:
[reference generation] In the quiet carriage, <Subject 1> silently shushes <Subject 2>, who has done nothing.
retention_analysis:
<Subject 1> (appears in [Shot 1], [Shot 2], [Shot 3]): fully_preserved - face, glasses and raincoat retained.
<Subject 2> (appears in [Shot 2], [Shot 4]): fully_preserved - face, hair and red jacket retained.
<Subject 3> (appears in [Shot 1], [Shot 2]): partially_preserved - layout kept.
detailed_description:
The target video is a live-action, naturalistic comedy with soft grey daylight through the windows and a clean digital cinema image. Exactly two people appear in this clip: <Subject 1> and <Subject 2>; every other seat is empty.
[Shot 1] A medium static shot of <Subject 1> sitting very upright by the window, hands folded on his knees, staring straight ahead. Static Shot, holding.
[Shot 2] At 00:03.500, the camera cuts to a front-on two-shot across the aisle: exactly two people are in the frame, both facing the camera; nobody in the foreground. <Subject 2> lifts her paper cup without a sound. Static Shot.
[Shot 3] At 00:07.000, the camera cuts to a close-up of <Subject 1>: he slowly turns his head toward her and raises one finger to his lips. Nobody else speaks; every other mouth stays closed. <Subject 1> (S1), in a slow, flat, dry male voice, whispers: <d>[English] This is the quiet carriage.</d> Static Shot, holding.
[Shot 4] At 00:11.500, the camera cuts to a close-up of <Subject 2>, frozen with the cup halfway to her mouth, her eyes sliding sideways toward him. Static Shot, holding.
overall_soundscape: The soft rumble of the train on the rails; the faint creak of a seat in Shot 2; the whisper in Shot 3; near silence in Shot 4. No other voices.
non_diegetic_music: N/A
```

Clip 2 (payoff): he settles back, his nose twitches (close-up, 3 s), an enormous sneeze that shakes his whole
body (medium, he jolts forward and back, glasses askew), a slow cut to her face (hold 3 s), last shot the same
framing as Shot 1 with him staring ahead as if nothing happened. The sneeze is one action with a destination; no
spray, no liquid.

## 9. Requests

Sketch from an idea, Basic draft, three different versions, laugh track light (quote first; drop `?dry_run=true`
after the yes):

```bash
curl -X POST "$BASE/api/v1/director/videos/film?dry_run=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-basic -F duration=30 -F speed=draft -F variants=3 \
  --form-string "idea=A man in the quiet carriage silently shushes a woman who has done nothing, then lets out an enormous sneeze. He stares ahead as if nothing happened." \
  --form-string "style=naturalistic live-action comedy, soft grey daylight, static camera, long held reactions" \
  -F images=@commuter.png -F images=@woman_red_jacket.png -F images=@carriage.png \
  -F 'references=["the commuter in the beige raincoat","the young woman in the red puffer jacket","the train carriage"]' \
  -F 'package={"laugh_track": "light"}'
```

A sitcom show with a laugh track on every episode (see `references/montage/pixio-series-showrunner.md` for seasons
and continuity); saving a series is free:

```bash
curl -X POST "$BASE/api/v1/director/series" -H "Authorization: Bearer $PIXIO_API_KEY" \
  --form-string "name=Flat 4B" --form-string "premise=Two mismatched flatmates share a tiny London flat with a landlord who never leaves." \
  --form-string "style=bright naturalistic sitcom, warm interior light, static camera" -F aspect=16:9 \
  -F laugh_track=light -F pictures=@tidy.png -F pictures=@chaotic.png \
  -F 'references=["Owen, the tidy anxious flatmate","Bea, the calm chaotic flatmate"]'
```

Then `POST /api/v1/director/series/{id}/episodes` with `idea`, `duration` (30-420, multiple of 15) and
`video_model: "montage-basic"` (`?dry_run=true` quotes it free). A laugh track on any finished video:
`POST /api/v1/director/videos/package` `{"job_id": "JOB_ID", "laugh_track": "light"}`.

## 10. After the render

- Watch it at full speed as a viewer first: did you laugh? Then frame by frame: twins, a third person who wasn't
  written, a prop that changed shape between setup and payoff, a line cut short.
- Speech-to-text one 15 s clip at a time (`POST /api/v1/director/audio/transcribe`); every line must transcribe as
  written. A garbled punchline: redo that clip (`POST /api/v1/director/videos/film/{id}/redo`
  `{"clip": 2, "seed": 912}`) with the line moved earlier.
- A reaction that runs too long or a gag in the wrong order: re-cut without rendering,
  `GET /api/v1/director/jobs/{id}/shots` (free) then `POST /api/v1/director/jobs/{id}/edit` with the shots kept,
  reordered or trimmed (priced like packaging on the edited length; `?dry_run=true` quotes it).

## Checklist

- [ ] The joke in one sentence, approved; setup visible before the payoff; one variable escalates
- [ ] Every punchline at least 2.5 s before the clip's end, followed by a reaction or a held beat
- [ ] Words fit (2.6 words/s + 1 s on Basic; 5-10 words, ~1.6 words/s, none in the last third on Premium)
- [ ] Reactions are their own close-up, static camera, exact cast; no over-the-shoulder reverses
- [ ] Physical gags grounded: cause and effect in one shot, a destination, no grabs, no liquid, no gadgets
- [ ] Planted props and every person have their own reference picture; contrasting looks
- [ ] Laugh track only in `package` or on the series; no audience in the render's sound
- [ ] No grain words, no famous names; tests on `video_model: "montage-basic"`; quote shown and a yes before bigger work
