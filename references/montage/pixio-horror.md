---
name: pixio-horror
description: How to make horror and suspense videos with Montage (Pixio's Director API) - dread, slow reveals, darkness that still reads on screen, jump-scare timing, silence and sound cues, monsters, and blood and gore on Montage Premium (allowed) - with a worked example film and clip prompts. Use whenever someone asks for a horror, creepy, haunted, monster, slasher or suspense video, or you plan, write, check or fix a /api/v1/director/videos/film, /api/v1/director/videos/text or /api/v1/director/videos/reference job in that genre. Not for the prompt format itself (that is references/montage/montage-basic-prompting.md for Basic and montage-premium-prompting.md for Premium) and not for fight choreography (that is references/montage/pixio-action-fights.md).
---

# Horror on Montage

Horror works on AI video when it is built from three things the models do well: a still, lit face; a slow camera
move; and a sound that breaks a silence. It fails when it asks for pitch-black frames, fast chaos, crowds of
monsters or long gore close-ups on Basic. Prompt FORMAT lives in `references/montage/montage-basic-prompting.md`
(Montage Basic) and `references/montage/montage-premium-prompting.md` (Montage Premium and Ultra); this skill is the
genre craft on top of them.

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
- Quote every film, music video and Premium shot with `?check=true` (or `?dry_run=true`) first, show the human
  `credits.quoted`, wait for a yes.
- "Found-footage grain" and "VHS noise" are grain words too. The `horror_80s` look is soft and low-fi on its own.
- Every supplied picture goes in every clip that shows that person, place or creature.
- **Never name famous horror films, directors or actors** as a style shortcut; describe the look in your own words.

## Decision rules (read first)

| the scene needs | use |
|---|---|
| a test, a draft, any trial | `video_model: "montage-basic"`. Never Premium for a test |
| whispers, a spoken line in close-up, a voice sample | Basic (better at spoken close-ups, and its lips follow the real audio) |
| visible blood, wounds, gore, a kill, a creature attack | Premium (`video_model: "montage-premium"`) or Ultra: blood and violence allowed |
| a film that mixes both | `tier_mix: "auto"` (spoken close-ups to Basic, action and wide to Premium) or `tier_mix: "manual"` + `basic_clips` |
| the look of an 80s horror film on a single clip | `look: "horror_80s"` or `styles: [{"style": "eighties_horror", "strength": 0.8}]` on `/api/v1/director/videos/text` or `/api/v1/director/videos/image` (looks and styles are text and image only; the reference and film paths take none; see `references/montage/pixio-looks-styles.md`) |
| a colour treatment on a finished film | `package.filter` (`noir`, `cool`, `black_and_white`, `faded`...) + `package.vignette`, never colour words for it in the prompt |

## 1. Dread: the slow build

- **Hook in the first shot.** Something is already wrong: a call light for a room emptied this morning, a door
  open that was locked, a child's raincoat on a step in a storm. No slow establishing drift before the wrongness.
- **One person, alone, one goal.** The viewer fears for someone. Give them a plain task (check the room, lock up,
  find the dog) and let the place get in the way.
- **Long holds, slow moves.** On Basic write one move per shot from the trained vocabulary: "The camera pushes in
  with small amplitude at slow speed toward the half-open door." "Static Shot, holding." Never "dolly", "crane" or
  "creep forward" on Basic; on Premium "slow push-in" and "locked-off camera" are the words.
- **Shots of 3-5 s** for dread. A 15 s Basic clip: 3-4 shots, not 5. The pause IS the scare's fuel.
- **Show the empty space.** Frame the person off-centre with darkness or a doorway in the other half of the frame.
  The viewer watches the empty half.
- **Small wrong details** read well: a bed made that was stripped, a dent in a pillow, a chair facing the wall, wet
  footprints that stop. They are physical and still, so Basic renders them cleanly.

## 2. Darkness that still reads

Dark scenes fail in two ways: a frame so black that nothing reads after compression, and a face so dark it loses
the person. Light the darkness from inside the scene.

- **One motivated source per shot,** named and placed: a torch beam, a single flickering ceiling tube at the far end,
  a desk lamp, cold moonlight through a half-open window, a fridge door. Say what it falls on.
- **The face is always lit** when it matters: "the torch light catches her cheek and eyes". A named person needs a
  face of at least ~13 % of the frame height (knees-up or closer) to stay recognisable; far figures go in
  silhouette or from behind, which also scares better.
- **A look line that has worked well:** "a live-action,
  documentary-realist night drama with available light only, natural ungraded colour and deep clean shadows, a
  clean digital cinema image." Use the same line in every clip.
- **Grade afterwards, not in words.** Ask Basic for a readable scene, then darken the mood in packaging:
  `"vignette": 0.3` (subtle) to `0.6` (strong), `"filter": "cool"` or `"noir"` with `filter_strength` 0.5-1.
  Preview free with `GET /api/v1/director/jobs/{id}/filter_preview?filter=noir&vignette=0.4` before packaging the
  whole film.
- The `film_teal` and `golden_hour` looks and styles render darker than `default`; on a horror close-up they can
  sink the face. Text and image endpoints only. Prefer a filter after the render.
- **Premium:** "Darkness as a physical setup (one weak source, deep shadows)" is the Premium recipe; same idea.

## 3. Reveals

- **Reveal by light, framing or a door, not by a morph.** The torch swings and finds him; the camera pans to the
  corner; the door swings in. One reveal per shot, and the reveal is the shot's only action.
- **The thing revealed is its own subject with its own reference picture** (a creature, the pale old man, the
  doll). Make it with `POST /api/v1/director/images/text` on a plain grey background, neutral pose, no text; check
  it, then bind it as `<Subject N>` (Basic) or `@ImageN ... take only its design` (Premium).
- **Reflections are a known risk.** Basic tends to put a second copy of the lead in glass and mirrors. A reflection
  reveal (her face in a black window, a figure behind her shoulder) can work only when the figure is a different
  defined subject; check every frame for a twin of the lead, and keep a no-reflection version ready.
- **Name exactly who may appear.** "Exactly two people are in this shot: `<Subject 1>` in the doorway and
  `<Subject 2>` by the bed." Otherwise Basic adds a shadowy extra or copies the lead.
- Never "a figure", "shadow people" or "silhouettes in the background" unless you want them: every word shows.

## 4. Jump-scare timing

- **Quiet, then one hit.** Two or three shots of near-silence, then a hard cut to the scare with one loud sound.
  The cut does the work; the scare shot itself is short (about 2.5 s on Basic, the minimum shot length).
- **Never in the last second of a clip.** Put the scare around 9-12 s into a 15 s clip and end on a hold
  ("Static Shot, holding" or "The image then cuts to black"). Basic runs the last shot long and the joins trim a
  couple of frames per clip; a scare there gets cut or blurred.
- **A join between clips is a hard cut,** so the first shot of the next clip can be the scare: clip 2 ends on
  silence and a slow push-in, clip 3 opens on the face in the doorway.
- **A whispered line lands harder than a scream.** `<Subject 2> (S1), in a frail, breathy voice, whispers: <d>[English] You left the window open.</d>`
  Short, plain words, close-up, then hold. Budget 2.6 words per second plus 1 s on Basic; 1.3-2 words per second
  on Premium, and no lines in the last third of a Premium take.
- **Sting it in the mix if the render's own hit is weak:** make a sound with `POST /api/v1/director/audio/sfx`
  (`{"description": "a sharp metallic slam with a short reverb tail", "duration_s": 2, "count": 3}`), take the one
  you like from the job's `files`, and lay it at the exact second with `POST /api/v1/director/audio/master` (`tracks`
  with offsets) or as an `audio_tracks` entry on `POST /api/v1/director/videos/assemble`.
- **Fades:** the film's `fade` (0-3 s, default 0.5) fades in from and out to black at the start and end. Inside a
  film, `POST /api/v1/director/videos/assemble` joins parts with a dip-to-black transition for a chapter break.

## 5. Sound

- **Always write both sound lines on Basic,** or it invents a score: `overall_soundscape:` with 1-4 plain sentences
  (the hum of a fluorescent tube, rain on a window, a floorboard creak in Shot 3) and `non_diegetic_music:` with
  `N/A` or one low drone described by instruments ("a single low cello note, sustained, very quiet").
- **The same music line in every clip,** or the score jumps at every join.
- **End the soundscape with "No other voices."** Every voice you describe gets words; a "distant scream" becomes
  invented dialogue unless you write "a wordless scream".
- **Premium:** `[Sound]` with 2-3 layers tied to actions and "No BGM." when there is no score; Premium adds an
  advert-like score unless the prompt forbids it. One sharp sound cue per take.
- Whole-film sound after render: `POST /api/v1/director/audio/foley` (sound in sync with the picture,
  `keep_original: true`) or `package.score` with your words ("slow, low strings and a heartbeat pulse, very sparse").

## 6. Blood, gore and wounds

- **Premium and Ultra allow it.** Blood, wounds, gore and kills render there; write them plainly in the shot where
  they happen. Never add "no blood" there unless the human asked for a clean version.
- **Basic shows impact and aftermath,** not lingering gore: the hit, then blood on a shirt, a smeared handprint on
  the door, a trail on the linoleum. Put the gore shots on Premium with `tier_mix: "manual"`.
- **Every word in a character line shows in every shot.** Never put a wound in a subject definition unless it is
  there from the first frame. Add it in the shot it happens, then carry it into every later clip ("the gash on
  her left forearm, from clip 2"). Damage only accumulates.
- **Name the exact spot** and what is not hit: "the blade opens a cut across the back of his right hand; his face
  is untouched."
- **Physical horror beats render better than effects:** a hand closing on an ankle, a door slammed on fingers,
  a face in the gap of a door. Transformations and gushing liquids are hard; give an effect its own shot and never
  share it with a strike.

## 7. Worked example: "The Night Round" (60 s, 4 clips)

**One line:** a night nurse answers a call light from a room emptied this morning, and finds its old resident
waiting for her. Beats: (1) the call light blinks for room 6; (2) the bed in room 6 is made, with a dent in the
pillow; (3) the man is in the room behind her, seen only in the black window, and he whispers; (4) she runs, the
corridor tube dies, and at the station the call light for room 6 blinks again.

References (each `POST /api/v1/director/images/text`, plain grey background, no text, adults only): the nurse
(waist-up, navy scrubs, grey cardigan), the old man (pale hospital gown, neutral pose), the call panel, the door to
room 6, the corridor. **Approve the story and the pictures with the human before any render.**

Clip 3, Basic, in the official six-section format (shortened here; a real clip has 350-500 words of
`detailed_description`):

```text
subject_definitions:
<Subject 1> is the night nurse in <Picture 1>, a woman in her late forties in navy scrubs under a long grey knitted cardigan, natural skin with visible pores and fine lines, holding a small torch.
<Subject 2> is the old man in <Picture 2>, a very thin man in a pale blue hospital gown, standing perfectly still.
<Subject 3> is room six in <Picture 5>, a small dark bedroom with a narrow made bed on the right, a thin curtain and a tall black window on the left.
summary:
[reference generation] In dark room six, <Subject 1> turns to the black window and sees <Subject 2> standing behind her; he whispers one line.
retention_analysis:
<Subject 1> (appears in [Shot 1], [Shot 2], [Shot 4]): fully_preserved - face, hair, scrubs and cardigan retained.
<Subject 2> (appears in [Shot 3], [Shot 4]): fully_preserved - face, gown and frame retained.
<Subject 3> (appears in [Shot 1], [Shot 2], [Shot 3]): partially_preserved - layout kept; the light is new.
detailed_description:
The target video is a live-action, documentary-realist night drama with available light only, natural ungraded colour and deep clean shadows, a clean digital cinema image. Exactly two people appear in this clip: <Subject 1> and <Subject 2>, each appearing once.
[Shot 1] A medium static shot inside <Subject 3>: <Subject 1> stands by the made bed, her torch beam resting on a fresh dent in the pillow; cold moonlight from the window on the left lights her cheek and eyes. Static Shot, holding.
[Shot 2] At 00:04.000, the camera cuts to a close-up of <Subject 1>'s face, lit by the torch from below; her breath stops and her eyes lift toward the window. The camera pushes in with small amplitude at slow speed.
[Shot 3] At 00:08.000, the camera cuts to the tall black window: in the dark glass, behind where she stands, <Subject 2> waits perfectly still, his thin face lit grey by the moon. The camera pushes in with small amplitude at slow speed toward him.
[Shot 4] At 00:11.000, the camera cuts to an extreme close-up of <Subject 2>'s cracked lips beside her ear in the darkness. <Subject 2> (S1), in a frail, thin, breathy elderly male voice, whispers: <d>[English] You left the window open.</d> The image then cuts to black. Static Shot, holding.
overall_soundscape: The low electric hum of the building; her shallow breathing in Shot 2; total stillness in Shot 3; the whisper close in Shot 4, then silence. No other voices.
non_diegetic_music: A single low cello note, sustained and very quiet, the same in every clip.
```

Clip 4's attack beat on Premium (Premium layout; write the full prompt with `montage-premium-prompting.md`):

```text
[Assets] @Image1 is Ruth, a nurse in navy scrubs and a grey cardigan: take only her face, hair and clothes, not the pose or background. @Image2 is the old man in a pale blue gown: take only his face and gown. @Image3 is the care-home corridor at night: take only the place. Define the nurse in @Image1 as Ruth.
[Summary] Ruth runs down the dark corridor; the old man's hand grips her ankle from a doorway and she falls; live-action, cinematic night horror, handheld.
[Shot list]
Shot 1 (0-4s): [Medium shot, handheld follow] Ruth runs toward camera, torch swinging; the far ceiling tube flickers and dies. <rubber soles slapping linoleum>.
Hard cut.
Shot 2 (4-7s): [Low angle, locked-off at floor level] a thin grey hand shoots from a dark doorway and closes on her ankle; she slams face-first to the floor. <a heavy thud>.
Hard cut.
Shot 3 (7-11s): [Close-up, fixed shot] Ruth's face on the linoleum, blood running from a split eyebrow, eyes wide, torch rolling away. <the torch rattles to a stop>.
[Continuity] Ruth looks exactly like @Image1 in every shot; navy scrubs, grey cardigan.
[Sound] Footsteps, the thud and her breathing close. No BGM.
[Constraints] Keep it subtitle-free. Do not generate any on-screen text, logos or watermarks. No duplicate or twin characters. Normal human eyes, no glowing eyes.
```

## 8. Requests

Plan from an idea, Basic, stop at a storyboard so the human can check every shot (no video renders until you
approve):

```bash
curl -X POST "$BASE/api/v1/director/videos/film?dry_run=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-basic -F duration=60 -F storyboard=true -F speed=draft \
  --form-string "idea=A night nurse answers a call light from a room emptied this morning; its old resident is waiting for her." \
  --form-string "style=live-action night drama, available light only, deep clean shadows, slow camera, long silent holds" \
  -F images=@nurse.png -F images=@old_man.png -F images=@call_panel.png -F images=@door6.png -F images=@room6.png \
  -F 'references=["Ruth, the night nurse","the old man, former resident of room 6","the call panel","the door to room 6","room 6"]' \
  -F 'package={"vignette": 0.35, "filter": "cool", "filter_strength": 0.5}'
```

Drop `?dry_run=true` after the yes and poll `GET /api/v1/director/jobs/{id}` until `storyboard.waiting` is true.
Then `GET /api/v1/director/jobs/{id}/storyboard/sheet.jpg`, redo weak shots with
`POST /api/v1/director/jobs/{id}/storyboard/redo` `{"clip": 3, "shot": 3, "note": "his face lit grey by the moon, nobody else in the glass"}`,
and `POST /api/v1/director/jobs/{id}/storyboard/approve`. The writing and stills are charged even if you never
approve.

Your own clips with the gore beat on Premium (quote first: Basic clips keep the Basic price, the Premium clip is
priced from its quote):

```bash
curl -X POST "$BASE/api/v1/director/videos/film?dry_run=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-premium -F duration=60 -F "clips=<clips.json" \
  -F images=@nurse.png -F images=@old_man.png -F images=@corridor.png \
  -F tier_mix=manual -F basic_clips='[1, 2, 3]' -F voice_samples=used -F ref_audios=@old_man_whisper.wav
```

A single atmospheric shot with the 80s look (text-to-video, 5-15 s):

```json
{"prompt": "integrated_multimodal_description: [Shot 1] ...", "duration": 10, "look": "horror_80s", "video_model": "montage-basic"}
```

## 9. After the render

- Look at about one frame per second: a twin of the lead in glass, an extra figure nobody wrote, the creature
  changing shape, a wound on the wrong side or too early, frames too dark to read on a phone.
- Listen to every line; run speech-to-text one 15 s clip at a time (`POST /api/v1/director/audio/transcribe`). A
  whisper that comes out as a normal voice: redo that clip with a new seed
  (`POST /api/v1/director/videos/film/{id}/redo` `{"clip": 3, "seed": 777}`).
- Too dark after all: re-package with less vignette, not a new render. Wrong object in one window: Montage Edit
  (`POST /api/v1/director/videos/edit`, see `references/montage/montage-edit-prompting.md`) changes only that
  window. Lips off: `POST /api/v1/director/videos/lipfix`.

## Checklist

- [ ] Story and pictures approved; hook in the first shot; one person in danger with one plain goal
- [ ] Every shot has a named light source; the faces that matter are lit and knees-up or closer
- [ ] Exact cast named per shot; the reveal figure has its own reference picture; reflections checked
- [ ] Scare on a hard cut, never in the last second; clip ends on a hold or a cut to black
- [ ] `overall_soundscape` and `non_diegetic_music` in every clip, same music line, "No other voices."
- [ ] Gore only on Premium clips, only from the shot it happens in, carried forward after
- [ ] No grain, noise or film-stock words; no famous names; colour treatment in `package`, not the prompt
- [ ] Tests on `video_model: "montage-basic"`; `?check=true` quote shown and a clear yes before any bigger render
- [ ] `promptCheck` has no ERROR; every warning read
