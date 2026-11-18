---
name: pixio-camera-language
description: How an AI agent writes shot sizes, angles, lenses and camera moves for Montage (Pixio's Director API) so Montage Basic and Montage Premium / Ultra obey them - one move per shot with size, speed and destination, each model's camera vocabulary, optics in concrete terms, what the camera must not do, shot tags and rhythm across a sequence, what each model ignores or overdoes, and good vs bad lines. Use whenever you choose framing or camera movement for a /api/v1/director/videos/* prompt, a film clip, a music-video section or a storyboard shot, or a render's camera came out wrong. Not for the full prompt format (that is montage-basic-prompting / montage-premium-prompting) or cuts between clips (that is pixio-transitions-continuity).
---

# Pixio camera language

The camera is the cheapest quality lever you have: the same scene reads as cheap or cinematic depending on one
sentence per shot. Both Montage models obey camera words well, but they speak different dialects; write the wrong
one and the move is ignored, merged into the next shot, or turned into jitter.

## House rules

- **Test on Basic.** Every test, draft or trial render runs on Montage Basic (`video_model: "montage-basic"`, or
  leave `video_model` out). Every render is billed in Pixio credits; Basic is the cheapest. Premium or Ultra only
  when the user asks for it and has seen the quote (`?check=true`, `credits.quoted`).
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `videos/finish`; never write grain, noise or film-stock words in a prompt
  or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.

## Decision rules (read first)

1. **Which model renders this shot?** Montage Basic understands only its trained camera words. Montage Premium (and
   Ultra) understands ordinary film vocabulary, crane, dolly and orbit included. Never mix the dialects in one prompt.
2. **One camera move per shot.** Two moves in one shot are merged, dropped or come out jittery on both models.
3. **Every move has a size, a speed and a destination.** Basic: "The camera pushes in with small amplitude at slow
   speed toward the letter in her hands." Premium: "Slow push-in from a medium shot to a close-up on her eyes."
4. **Say what the camera does not do.** "Static camera, no follow, no drift" or "the camera stays at the doorway and
   does not enter". Unstated, both models add motion.
5. **A cut must bring new information** (subject, space, state, viewpoint or time). If only the distance changes, use
   a move instead. **Change the framing at every cut:** Basic renders two same-framed shots in a row as one long take.
6. **Faces need pixels.** On Basic a named face stays recognisable only when it is about 13% of the frame height or
   more (knees-up or closer). Dialogue and singing: medium close-up or close-up, front-on, camera still.
7. **Hold the end.** The last shot of every clip ends still: "Static camera, holding." (Basic) or "The take ends
   held on this frame." with the last 2 s still (Premium).

## Shot sizes

| Size | Use it for | Model notes |
|---|---|---|
| Extreme wide / establishing | a new place, scale, isolation | faces are tiny: people from behind, in silhouette or turned away; 2-4 s, no dialogue |
| Wide / full | geography, a body through space, where a fall lands | Basic loses named faces here; Premium holds better but keep faces away from camera |
| Medium | two people talking, hands working | medium-wide is the widest shot where near crowd faces stay sharp |
| Medium close-up (chest-up) | dialogue, singing, reactions | the default for every spoken or sung line on both models |
| Close-up (face) | the turn of a scene, a decision, a held breath | best likeness; the shortest shot in a fight (~1.5 s) |
| Extreme close-up / insert / macro | eyes, a key, a product texture | Basic: no hand or weapon inserts in fights; Premium: product macros work well |

Write the size as words at the start of the shot ("a medium close-up of `<Subject 1>`..." on Basic, "[Medium
close-up, front-on, fixed shot]" on Premium), never as an abbreviation alone.

## Angles and eyelines

- **Eye level:** neutral, honest; the safe default for dialogue. **Low angle:** power, threat, a kick at leg level.
  **High angle / overhead:** smallness, defeat, a map of the room. **Dutch angle:** unease, once, not as a style.
- **POV:** Basic has `POV` in its trained list; Premium accepts "POV / first-person". Keep the viewer's own hands out
  of a POV close-up.
- **Eyelines just beside the lens:** "she looks at him, just left of camera". Straight into the lens is a choice
  (direct address, a singer's defiance), not the default.
- **Over-the-shoulder: avoid on Basic.** Basic copies someone already in the shot for the person seen from behind,
  and a twin appears in the foreground. Write a front-on two-shot: "exactly two people are in the frame, both facing
  the camera; nobody in the foreground". On Premium OTS is fine, but a spoken line still wants the mouth large and
  front-on.

## Lenses and optics: concrete, not brand names

- Give a focal length and what it does to the frame: "35mm lens, the room visible behind her", "85mm, her face fills
  the frame, the background soft", "a 24mm wide lens close to him, the corridor stretching away". Add "shallow depth
  of field" or "deep focus" when it matters.
- On Basic put one camera-and-light line in the look sentence and copy it into every clip: "shot on a cinema camera,
  35mm lens, practical light only, clean digital cinema image".
- **Never name a camera brand or model:** Basic once painted a camera model's name as lettering on a window.
  **Never name a film stock or grain.**
- A reference picture of a place controls its geometry, materials and light, not the framing: say how this shot
  frames it ("a low angle from the far corner of `<Picture 3>`'s room"), or you get a copy of the plate.
- Premium niche terms need their visible result next to them: "Rack focus: focus shifts from the cup in front to her
  face behind". Formula for any unusual move: the term + the subject + what changes in frame + foreground /
  background + direction and speed. Basic has no rack focus: show the change with a cut or a slow push-in.

## Camera moves: the two dialects

### Montage Basic: trained vocabulary only

| Basic words | What it does | Use it for |
|---|---|---|
| Push In / Pull Out | camera moves forward / back | making a moment matter / revealing context |
| Zoom In / Zoom Out | lens changes, camera stays | sudden attention; feels more "camera" |
| Pan Left / Right | turns on the spot | following a look, revealing a doorway |
| Truck Left / Right | slides sideways | walking alongside, foreground passing |
| Tilt Up / Down | tips on the spot | feet to face, face to sky |
| Pedestal Up / Down | whole camera rises / sinks | the Basic way to say "crane" |
| Arc Shot | moves around the subject | a reveal, power, a duel |
| Tracking Shot | follows a moving subject | walks, runs, chases |
| Static Shot | nothing moves | dialogue, comedy, the held end |
| Shake Slightly / Strongly | handheld energy | tension, fights, documentary |
| POV | the subject's view | searching, threat |
| Roll Clockwise / Counterclockwise | rotation on the lens axis | disorientation, chaos in a music video |

Add `with small amplitude` / `with large amplitude` and `at slow speed` / `at fast speed` when they matter (medium
and normal are the defaults).

**Not Basic words:** crane, dolly, orbit, whip pan, crash zoom, snap zoom, swoop, FPV, aerial dive.
`POST /api/v1/director/prompts/check` warns on them and `fix_prompt: "safe"` (free) on a Basic job rewrites them
(dolly in -> push in, crane up -> pedestal up, orbit -> arc, whip pan -> fast pan). Better: write the trained word
yourself.

### Montage Premium / Ultra: ordinary film language

Fixed / locked-off, slow push-in, pull out, pan, tilt, truck / lateral track, tracking follow, light handheld, arc /
orbit (say how far: "a slow 90-degree arc"), crane up / down, dolly, aerial, FPV, speed ramp, dolly zoom, rack focus.
- One move per shot, in its own clause, separate from what the subject does; with a start and an end.
- Tie the move to an event ("pans only after the ball leaves her hands").
- Write "fixed shot" or "locked-off camera"; never `camera_fixed` or `--flags`.
- Don't run `fix_prompt` camera rewriting on Premium prompts: those words are fine there.

## Directing the shot, not just the lens

- **States, not wind-ups.** Both models nail states ("mid-spin, arms out") and fumble reversing processes ("reaches
  in, pulls out, winds up"). Open a shot already in the action. To fill a shot with simple motion, chain two or three
  moves in the same direction; otherwise the model fills leftover time by reversing.
- **Frame one is occupied:** everyone in place at the first frame, no empty establishing beat in a dialogue shot.
- **The reaction shot is its own beat:** after every big event, a close-up of whoever saw it.
- **Distance as drama** (Premium especially): give the distance between two people in metres and let a change of
  distance mark the beat.
- **Ensembles:** reactions travel across a group a beat apart; people out of focus in the background still move a
  little. For punctuation: background bustle, then everyone stops at the key moment.
- **Camera follows the energy:** an orbit that tightens as the moment builds; one camera change (a sudden overhead, a
  locked-off frame after handheld) marks the climax.

| Feeling | Move |
|---|---|
| intimacy, realisation | slow push-in, long lens, shallow focus |
| power, confrontation | low angle, slow arc |
| chaos, release | fast tracking, fast zoom, strong shake, a roll (atmosphere shots, never on a singing face) |
| isolation, loss | wide, high, pull out |
| comedy, deadpan | static, centred, the action happens in frame |
| dread | slow push-in toward a doorway, a long silent hold |

Escalate across a film or song: restrained early, bigger at the turn, the boldest move at the climax. Faces that
talk or sing get a still or slowly moving camera.

## Shot tags and rhythm across a sequence

Before prompting a film or music video, tag each shot: **scale** (wide, medium, MCU, CU), **angle**, **movement**,
**function** (establishing, action, reaction, reverse, insert), **length** (short / medium / long) and **how it cuts
to the next** ("hard cut to a close-up of her hand"). The tags expose a sequence of six identical mediums before it
costs a render.
- **Vary shot lengths on purpose.** Equal lengths flatten rhythm: a 1.5 s reaction after a 4 s build hits harder.
- **Cross-cutting** between two places bound by one tension, and **cause-to-effect cuts** (a shot inside, the window
  shatters outside) are legal continuity tools (references/montage/pixio-transitions-continuity.md).

## What each model ignores or overdoes

**Montage Basic**
- Off-vocabulary moves are ignored or become random drift. Same framing on consecutive shots = one long take.
- Runs the last shot long: end on a hold (the last 2 frames of each clip are trimmed).
- Plays fights slower than real: never "slow motion", "lingering" or "at slow speed" in a fight; "the camera whips
  with large amplitude at fast speed" and a new angle every shot.
- Sometimes dissolves instead of cutting (two faces at once): write "every transition is a clean hard cut, no
  dissolves or double exposures" in the look sentence.
- Wide shots lose named faces; reflections and mirrors add a second copy of a person; a close-up locked on a wound
  drops the other person from the shot.

**Montage Premium / Ultra**
- Several moves at once, or "dynamic camera", gives jitter. "Dynamic" defines nothing.
- Prefers slow continuous moves; violent rolls and big jumps break limbs and physics.
- Timed shot windows are a pacing budget, not frame-exact cuts; an underfilled window gets improvised.
- A whip pan during a spoken line wrecks lip-sync: keep the camera fixed while anyone talks.
- Music creeps in on reveals and tilts to the sky: add "No music." to that shot when the clip should have none.

## Good vs bad lines

| Bad | Why | Good (Basic) | Good (Premium) |
|---|---|---|---|
| "Dynamic cinematic camera." | defines nothing | "The camera trucks right with small amplitude at slow speed past the shelves." | "[Medium shot, slow lateral track right] past the shelves" |
| "Dolly in and orbit around her as she turns." | two moves; not Basic words | "The camera pushes in with small amplitude at slow speed toward her face." | "[Medium close-up, slow push-in to a close-up] she turns her head" |
| "Crane shot over the city." | not Basic vocabulary | "The camera pedestals up with large amplitude at slow speed over the rooftops." | "[Extreme wide, slow crane up] over the rooftops at dusk" |
| "Whip pan as he says the line." | breaks lip-sync | the line on a static MCU; the fast pan in the next silent shot | "[MCU, front-on, fixed shot]" for the line; whip pan at the cut |
| "Over the shoulder of Tom, both faces visible." | twin Tom on Basic | "a front-on two-shot; exactly two people in the frame, both facing the camera" | front-on two-shot, or MCU singles |
| "Shot on <camera brand>, anamorphic." | brand painted in frame | "35mm lens, the bar visible behind him, shallow depth of field" | "[Medium shot, 35mm, shallow depth of field]" |

## Worked example: one 15 s beat on both models

Montage Basic, inside `detailed_description`:

```
[Shot 1] Live-action, cinematic, shot on a cinema camera, 35mm lens, practical light only, clean digital cinema image; every transition is a clean hard cut, no dissolves or double exposures. A wide shot of the empty night platform; <Subject 1> stands near the edge, seen from behind. The camera holds a static shot.
[Shot 2] At 00:03.500, the camera cuts to a medium close-up of <Subject 1>, front-on; she looks down the tunnel, just left of the lens. The camera pushes in with small amplitude at slow speed toward her face.
[Shot 3] At 00:08.000, the camera cuts to a low angle at track level: the train's headlight grows in the tunnel. The camera zooms in with small amplitude at slow speed.
[Shot 4] At 00:11.000, the camera cuts to a close-up of <Subject 1>; she steps back from the edge and breathes out. Static camera, holding.
```

Montage Premium, the shot list:

```
Shot 1 (0-3s): [Extreme wide, eye level, fixed shot] Mara stands near the platform edge, seen from behind. <low wind>.
Hard cut.
Shot 2 (3-8s): [Medium close-up, front-on, slow push-in to a close-up] Mara looks down the tunnel.
Hard cut.
Shot 3 (8-11s): [Low angle at track level, long lens, fixed shot] the train's headlight grows in the tunnel. <a rising rumble>.
Hard cut.
Shot 4 (11-15s): [Close-up, fixed shot] Mara steps back from the edge and breathes out. The take ends held on this frame.
```

## Requests

Check the camera words before rendering (free, synchronous):

```bash
curl -fsS -X POST "$BASE/api/v1/director/prompts/check" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"prompt": "<your clip prompt>", "duration": 15, "refs": 1}'
```

A cheap camera test on Basic (quote it first with `?check=true`, then send it without the flag):

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/text?check=true" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"prompt": "<prompt>", "duration": 10, "speed": "draft", "video_model": "montage-basic", "fix_prompt": "safe"}'
```

Single shots are billed as at least 8 seconds, so a 5 s test costs the same as an 8 s one.

For a film, `storyboard: true` on `POST /api/v1/director/videos/film` (with `idea`) gives one still per shot before
any video renders; redraw one with `POST /api/v1/director/jobs/{id}/storyboard/redo` (`clip`, `shot` and a `note`
such as `"a low angle at track level"`). Stills and redraws are billed (`setPicture` each, plus `storyboardNote`
with a note). After the render, `GET /api/v1/director/jobs/{id}/shots` (free) lists the real cuts: fewer than you
wrote means Basic merged same-framed shots; give each its own size or angle and redo that clip with
`POST /api/v1/director/videos/film/{id}/redo`.

## Checklist

- [ ] Right dialect: Basic trained words on Montage Basic; plain film language on Premium / Ultra.
- [ ] One move per shot, with amplitude and speed (Basic) or start and end (Premium); what the camera does not do.
- [ ] Optics as focal length and field of view; no brand, stock or grain words.
- [ ] Framing changes at every cut; shot lengths varied; reaction shots after big events.
- [ ] Dialogue and singing in MCU or CU, front-on, camera still; eyelines just beside the lens.
- [ ] Named faces knees-up or closer on Basic; no OTS, reflections or mirrors there; hard cuts in the look sentence.
- [ ] Last shot of every clip held still.
- [ ] `POST /api/v1/director/prompts/check` clean; camera tests on Montage Basic.
