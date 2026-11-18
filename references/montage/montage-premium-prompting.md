---
name: montage-premium-prompting
description: How to write, check and fix prompts for Montage Premium and Montage Ultra through Montage (Pixio's Director API) - single shots, image-to-video, reference-to-video, multi-clip films, dialogue with lip-sync, music videos and duets (vocal sync), fights, ads and animation. Use whenever you write, review or fix a prompt for a /api/v1/director/videos/* job sent with video_model "montage-premium" or "montage-ultra". Not for Montage Basic prompts (that is references/montage/montage-basic-prompting.md).
---

# Prompting Montage Premium and Ultra

This skill is separate from `references/montage/montage-basic-prompting.md` on purpose. The two tiers read
different prompt formats; **never mix them**. Montage Basic tags (`<Picture N>`, `<Subject N>`, `(S1)`, `<d>`, the
six sections, `At 00:03.500`) mean nothing to Premium and are an ERROR in a Premium prompt; a Premium prompt sent to
Basic fails the same way.

Montage Premium and Montage Ultra read the same format. Ultra uses the highest-quality model on every shot and
costs more; there are **no Ultra-only prompting rules**. Everything below applies to both.

## 0. Is it on, and how do you send it?

- **Offered?** `GET /api/v1/director/catalog` -> `videoModels.premiumAvailable`, and each model's `available` under
  `videoModels.models`. While Premium is not offered, a request for it answers `400 premium_unavailable` before
  anything is held.
- **Choose it per request:** put `"video_model": "montage-premium"` (or `"montage-ultra"`) in the body (JSON field
  or form field) of `videos/text`, `videos/image`, `videos/reference`, `videos/music`, `videos/film`,
  `videos/remake` or `series/{id}/episodes`. Left out, every job renders on Montage Basic.
- **Resolution:** `resolution` `480p` or `720p` (720p is about twice the cost). Leave it out for Pixio's default
  (`videoModels.premiumResolution` in the catalog). For about 1080p add `upscale: true` (priced like
  `videos/upscale`).
- **Format conversion:** a prompt written in Montage Basic format is converted to Premium format by the studio; a
  Premium-format prompt is used as is. With `verbatim: true` nothing is converted (§4d).
- **The writer:** an `idea` on `videos/film` or `videos/music`, and `POST /api/v1/director/prompts/write`, write the
  prompts for you. On a Premium job the studio writes Premium prompts itself (a `premiumPrompts` charge, in the
  quote; `verbatim: true` skips it). `prompts/write` returns Basic-format clips, which a Premium render converts.
- **Price first:** Premium is priced from the studio's quote of the takes, so always send the same request with
  `?check=true` first. It is free, starts nothing, and returns `credits.quoted` plus the prompt report
  (`promptCheck`). Show the quote to the human before the real call.

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/reference?check=true" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-premium -F resolution=480p -F duration=12 \
  -F "images=@mara.png" -F "images=@platform.png" \
  -F "prompt=$(cat mara-platform.txt)"
```

## 1. Limits

- **Shots:** `videos/text`, `videos/image` and `videos/reference` take a `duration` of 5-15 s (billed as at least
  8 s). Films and music videos are built from 15 s clips / sections. `480p` or `720p`; no draft mode on Premium (it
  is already full quality, so there is no `/final`).
- **Prompt length:** `prompt` up to 30,000 characters on Premium and Ultra (8,000 on Basic). The model itself reads
  best at the word counts in §2, far below that limit.
- **Pictures:** Premium and Ultra take up to 30 `images` per job (Basic takes 9). **Recommended: 6-9 pictures per
  clip.** Premium follows pictures closely and more references make better video: a picture per character plus a
  head close-up for each main character, each location (wide and detail), the key props. Very many pictures in one
  take, or audio and video references, can make a take dearer; the `?check=true` quote prices it.
- **Per take:** about 4-5 assets work best and **at most 4 people**. A supplied picture is **never dropped**: spread
  pictures across clips instead (`clip_images`).
- `videos/reference` takes up to 3 `videos` and 3 `audios` besides the pictures.
- Real people: see §5. Commercials: §11b.

## 2. The house layout (one English prompt per clip)

Premium reads, in order: bindings -> subject + action + place -> style -> camera -> timed beats -> sound ->
constraints. The structure: asset bindings, a one-sentence summary, a timed shot list, then the things that stay
constant.

```
[Assets] @Image1 is Mara: take only her face, hair and coat, not the pose or background. @Image2 is the platform: take only the place. Define the woman in the red coat in @Image1 as Mara.
[Summary] One sentence: subject, action, place; style ("live-action, cinematic" or the exact animation style); camera feel.
[Shot list]
Shot 1 (0-4s): [Wide shot, eye-level, fixed shot] one action. <low wind>, <a distant signal bell>.
Hard cut.
Shot 2 (4-9s): [Medium close-up, front-on, fixed shot] Mara says in a quiet, steady voice: {I'm not getting on.} Realistic lip articulation, no exaggerated mouth opening, no head turns while speaking.
Hard cut.
Shot 3 (9-12s): [Close-up, slow push-in] a silent held moment. <a rising train rumble>.
[Continuity] Mara looks exactly like @Image1 in every shot. Look, light and colour. The characters' appearance, clothing, positions and lines are never exchanged.
[Sound] Dialogue clean and prominent, ambience subtle. No BGM.
[Constraints] Keep it subtitle-free. Do not generate any on-screen text, logos or watermarks. No duplicate or twin characters.
```

- `Shot N (a-bs):` with whole-second ranges, continuous from 0 to exactly the clip length. They are a **pacing
  budget, not frame-exact cut points**. Too little in a window -> the model improvises; too much -> extra cuts or
  dropped beats. Point times ("at the 5-second mark") and relative times ("after 3 seconds") also work.
- Shot length: 2-4 s is typical, 1-2 s for a dialogue insert, one dominant beat per 4-5 s clip. About 150-500
  words for a 10-30 s take, 40-120 for a 4-6 s beat, never over 1,000 words (overlong prompts drop clauses).
- One take: write "Single continuous shot, no cuts." and timed beats instead of a shot list.
- Length, frame shape, resolution and sound are API fields (`duration`, `aspect`, `resolution`). **Never
  `--flags`, never `camera_fixed`**; write "fixed shot" / "locked-off camera".

## 3. Core rules

**Tags and characters**
- `@Image1`, `@Audio1`, `@Video1`, numbered in upload order. **Upload characters in the order they first appear
  on screen**; a mismatch swaps the first character.
- Give each reference one narrow job and say what not to copy ("take only her face, hair and coat, not the pose
  or background"). If the reference is accurate, say "refer to it"; don't re-describe it. Never rely on a name
  written inside a picture.
- Define each person once with 2-3 stable features ("Define the woman in the red coat in @Image1 as Mara"), then
  always the same name. Never describe a pictured face in words. Never put names in `<...>` (that is the sound mark).
- Best face lock: a head close-up plus a full-body picture per person. Downscale reference pictures to no more than
  the output size (about 1280 px on the long side for 720p): large AI images can print fingerprint-like textures in
  grass and foliage.

**Shots and camera**
- One action and **one** camera move per shot; a cut must bring new information. "Hard cut." between shots.
- Describe camera and subject motion in separate clauses. Tie camera moves to events ("pans only after the ball
  leaves her hands").

**Dialogue** (lip-sync is the strong point; details in §4)
- Lines in `{braces}`, 5-10 words each, about **1.3-2 words/s (default 1.6)** plus ~1 s of silence after each line.
- **One speaker per shot**, medium close-up or close-up, front-on, fixed shot; say who keeps their mouth closed.
- **No lines in the last third**; the last shot is a silent hold.
- Language other than English or Chinese: "Dialogue language: X." first. No shouting, sobbing or "gonna".

**Sound**
- `{}` dialogue, `<>` sound effects, `()` music, `【】` on-screen text (avoid it; add text in packaging).
- 2-3 sound layers at most, each tied to a visible action ("boots on wet cobblestone").
- No music? Write "No BGM." (or the full audio policy, §4). Silence in the prompt is not a request for silence:
  unspecified sound comes back as an advert-like score.
- Voice consistency: the same `@Audio N` sample *and* the timbre described in words.

**Constraints**
- No negative-prompt field: write "Do not generate..." / "No ..." sentences. Negatives are reliable for subtitles
  and audio; for visuals prefer positive description, with a short exclusions line at the end.
- "Keep it subtitle-free" every time. It helps but cannot fully prevent subtitles.

**Words to avoid**
- **No grain, noise or film-stock words, ever, not even negated.**
- **No famous names**: no actors, directors, studios, films, brands or artists as style shortcuts. Describe the look.
- No extreme emotion words (furious, hysterical, terrified, fanatical): they make eyes glow.
- No water, wave or echo words unless the scene needs them (bubbling or whistling audio artefacts).
- In reference prompts, don't use edit/extend trigger words about a video (replace, remove, add to, extend,
  continue from @Video1): they switch the task type.

## 4. Dialogue and lip-sync in depth

- **Line form:** `Name says in a <age/timbre/pace> voice: {line}`. Delivery goes **before** the line, once.
  Alternative for several lines with different feelings: `Name's line (voice trembling): {line}`, one per row.
  Never repeat a line's words elsewhere or attach notes to single words: both burn in subtitles.
- **Write lines to be spoken:** numbers as words, no symbols or abbreviations, commas for pauses, one sentence
  where possible. Separate two lines by a physical action.
- **Framing:** mouth visible and large: MCU or CU, front-on or slight three-quarter, nothing in front of the mouth,
  no turns, walking or cuts during the line. Profiles and small faces give generic mouth motion.
- **Start promptly:** a line that starts after a long silent setup starts late. Put the line early in its shot.
- **Who speaks:** name the speaker and say the others "keep their mouths naturally closed and respond only with
  their eyes". With voice samples: "Mara from @Image1, voiced by @Audio1".
- **Voice-over:** `Narrator (V.O.) says: {...}` with everyone on screen silent.
- **Exact lines** (use in [Constraints] for dialogue-heavy takes): "Generate the dialogue exactly as written; add
  or drop no lines. No dialogue from the wrong character, no two people speaking at once."
- **Audio policy against music leaks:** when "No BGM." is not enough, open [Sound] with "Audio policy (all shots):
  only the spoken dialogue and faint natural ambience. No music, BGM, score, instrumental, melody, synth, ambient
  pad, drone, crescendo or stinger." and repeat "No music." on reveal shots. Music creeps in at reveals and when
  the camera looks up.
- **Ending noise:** a known issue; the packaging fade (or the film's `fade`) fixes it.
- **Film voices:** films take `ref_audios` (voice samples), `voices` (whose each is), `cast`, `voice_lock`,
  `voice_samples: "used"` and `clip_audios`; see `references/montage/pixio-dialogue-voices.md`.

## 4b. Music videos, duets and dubs: vocal sync

A Premium music video is `POST /api/v1/director/videos/music` with `"video_model": "montage-premium"`, the
customer's `song` (or a `song_job`), the singers' `images` and either an `idea` (the studio writes every section)
or your own `sections`. The studio cuts the song into windows and renders one take per window. For each sung
window it isolates the lead vocal and sends only that window's vocal as `@Audio1`; in a duet (`singers`) each
singer gets their own vocal as their own `@Audio N`, bound to their own `@Image N`.

When you write the sections yourself, write each sung one like this:

1. **Prompt:**
   - "Mara sings ONLY the vocal in @Audio1: exactly its words and melody, no other words, no extra singing;
     mouth closed when it is silent".
   - Each sung line is a slot, `{vocal of @Audio1 from 0 to 5 s}` (clip time), never lyrics. The studio fills the
     slot at render time; lyrics are never written into prompts.
   - One singer per shot.
   - `[Sound]`: "The vocal of @Audio1 only; no other voices. The final mix is added after."
   - No `(music)` over the singing.
2. **Post:** the studio lays the original full mix back over the render (or, with `music_sync: "song"`, keeps your
   exact song throughout, §4c).

The prompt check reports these as ERRORs: a sung clip without "sings ONLY the vocal in"; lyrics written next to
slots. Two singers' vocals in one shot is a WARN. The 1.6 words/s speech budget does not apply to sung slots.
Craft on top of the recipe: the singer in MCU/CU, slow camera (slow arc or push-in) on verses; cut on the beat;
instrumental passages show hands, band, place or a silent singer with the mouth closed.

## 4c. Your exact song: `music_sync: "song"`

By default a Premium music video keeps Premium's own singing, which is in sync but is not your mix (the job also
gets the same picture over your original song, `output.withOriginalSong` or
`GET /api/v1/director/jobs/{id}/video?variant=song`, free). With `music_sync: "song"` in the body, the studio keeps
your exact song:
1. **Phrase takes:** it renders short phrase takes, each starting just before its phrase, with that phrase's
   isolated vocal as `@Audio1`.
2. **Instrumental parts:** they become non-singing takes ("nobody sings; every mouth stays closed").
3. **Re-timing:** each take is re-timed onto the song by its sung words.
4. **The song itself:** it goes under the whole video unchanged.

It costs a little more (the takes are shorter); the `?check=true` quote includes it. Prompts work as in 4b: the slot
`{vocal of @Audio1 from A to B s}`, "sings ONLY the vocal in @Audio1", and "Never alter the song in @Audio1". To
measure how close the lips are afterwards, add `lip_check: "measure"` (or `"relip"`, best on Premium and Ultra) to
the music video, or run Montage Analyze with `checks: ["lipsync"]`; see
`references/montage/pixio-lipsync-fixing.md`.

## 4d. Your prompt, exactly: `verbatim: true`

Send `verbatim: true` in the body of a `videos/*` call (shots, music videos, films and their redos). Your prompt
is rendered as written: nothing converts it, merges it, fills its slots or adds lines to it, and each clip is its
own take. On Premium and Ultra it also skips the prompt-writing charge. Write it complete:
- Premium format only: `@Image1`/`@Audio1`, never `<Picture N>`.
- A music section needs its own sing/never-alter wording, and its words as plain text. `{vocal of ...}` slots are
  not filled in this mode.
- Name only the tags that are sent:
- `@Image1`, `@Image2`...: your pictures in upload order. With `clip_images`, a clip gets its own list, in that
  list's order. On `/api/v1/director/videos/image` the picture is the exact first frame, so there is no `@Image` tag.
- `@Audio1`...: for a music video, the isolated vocal of that section (a duet sends one per singer, in `singers`
  order). For a film, that clip's `clip_audios` in their order; without `clip_audios`, every voice sample
  (`ref_audios`) in upload order. On `/api/v1/director/videos/reference`, your `audios` in upload order.
- `@Video1`: the reference video (in a remake with `motion: "medium"`, that clip's own source).

`verbatim` is refused before anything renders (nothing charged) for Montage Basic tags in a Premium prompt, for a
tag beyond what is sent, and with an `idea`, a remake or a series episode, since the AI writes those prompts.

## 5. Real people and supplied photos

Supplied photos of real people are used as references, and every supplied photo is always used. Never name a real
or famous person in the prompt; a generated face that drifts toward a celebrity can be refused, so keep the
identity bound to the picture.

## 6. Camera language that works

- **Size:** extreme wide, wide, full, medium, medium close-up (MCU), close-up, extreme close-up, insert/macro.
- **Angle:** eye-level, low angle, high/overhead, Dutch angle, over-the-shoulder, POV/first-person, 45-degree side.
- **One move per shot:** fixed/locked-off, slow push-in, pull out, pan, tilt up/down, truck/lateral track, tracking
  follow, handheld (light), arc/orbit (say "slow", give the arc: "a 90-degree arc"), crane up/down, dolly, aerial,
  FPV, speed ramp, dolly zoom, rack focus.
- Niche terms: term + plain meaning ("Rack focus: focus shifts from the cup in front to her face behind").
- Transitions: give time and method ("At the 5-second mark, a whip pan left into the next shot").
- Give moves a start and an end ("pushes in from a medium shot to a close-up on her eyes").
- Keep screen direction; the camera never crosses the action line.
- Use: push-in to make a moment matter, locked-off for dialogue and comedy, orbit for a reveal or a duel, handheld
  for documentary and tension, crane/aerial for scale, low angle for power, over-the-shoulder for conversations.
- Avoid: several moves at once (push + pan + orbit), "dynamic camera", whip pans during a spoken line.

## 7. Action and fights

- Direction, not adjectives: "fast, epic fight" defines nothing. Formula: fighter anchors (look, outfit, side of
  frame) -> place and starting distance -> ordered beats (one initiator, one responder) -> one camera path ->
  contact and reaction -> sound.
- Each beat is a state that the next inherits: start pose -> movement -> contact -> reaction -> recovery. Name the
  limb, direction, speed and force ("her right forearm blocks his punch at shoulder height; he staggers one step
  back"). Cause before effect; the reaction comes after the contact.
- 15 s fight: establish 0-3, exchange 3-7, counter 7-11, resolution 11-15. 30 s: two exchanges with a reset beat.
- General description for most moves, specifics only for one or two key moments; don't repeat actions.
- Camera: open on a readable wide shot; one path (lateral track, slow orbit or backward track); one close-up or
  slow-motion moment for the key impact. Test choreography in a wide fixed shot first.
- Keep fighters separated and their outfits contrasting; no pile-ups; wider, shorter turns. Fights merge faces
  when bodies overlap for long.
- Sound tied to actions: <shoes scuff on the pivot>, <cloth snaps on the kick>, <a dull block>, breathing in the
  hold. Music only as tempo and mood, or "No BGM.".
- Fights and chases as their own clips; dialogue as continuous takes. No dialogue during the fight.
- A fight-move reference video (`@Video1` on `videos/reference`, muted, no subtitles) beats a long description.
- Fight Flow (`fight_flow`) is applied automatically to shots the checker reads as a fight; `false` turns it off.
- Blood and wounds: Premium renders blood, wounds and hits on people. Show them in the shot where they happen;
  never add a no-blood constraint unless the user wants a clean fight.

## 8. Emotion

- Show it through behaviour and physical detail, never abstract or extreme words: lowered head, a breath held,
  hands that stop moving, eyes that glisten, a half smile held on a slow push-in.
- Give emotion a cause and a time: "after the door shuts, her shoulders drop" (without a cause it arrives too early).
- One emotional shift per shot; let it change gradually ("her worry slowly eases into relief").
- Name the delivery once before the line ("in a quiet, tired voice"), not on single words.
- Strong feeling + close-up: add "normal human eyes, no glowing eyes" to [Constraints].
- "Nuanced and realistic, never exaggerated" is a phrase that works for performances.

## 9. Image-to-video (first frame)

- On `videos/image` the picture is the exact first frame and the output follows the picture's shape. First frame
  and reference pictures can't be combined in one shot (use `videos/reference` for reference pictures).
- Open the shot list with "On the first frame:" and describe **only what moves and changes** from there. Never
  re-describe the picture; use no image tags.
- Start from the picture's state: the action it shows is already complete; continue it, don't replay it.
- Keep it to 1-2 motions and one camera move for 5-6 s; dialogue only if the face is already large and front-on.
- Chaining clips: the last frame of clip A as the first frame of clip B, plus "Do not replay or recreate the
  previous clip's action." (`references/montage/pixio-transitions-continuity.md`).
- A vertical picture gives a vertical clip: frame people chest-up and centred.

## 10. Multi-clip films and continuity

- Every clip repeats the same `[Assets]` (same pictures, same order), the same names, and the same `[Continuity]`
  and `[Sound]` lines word for word. No "as in clip 1": each clip is rendered on its own.
- Neighbouring 15 s clips may be rendered together as one longer take and split back. Write each 15 s clip as a
  complete mini-scene; the cut between clips is a normal hard cut. Plan dialogue in the first two-thirds of each
  clip.
- Restate two or three anchors (hair, coat, prop) wherever identity is at risk: re-entry, occlusion, angle change.
- State changes are continuity rules ("her sleeve stays torn from Shot 2 on"). Props stay in the same hand.
- One style line for the whole film; don't splice Basic and Premium renders of the same scene unless you planned a
  tier mix (different looks).
- Voices: the same clean `@Audio N` sample in every clip plus the same timbre words (`voice_lock` does this).

## 11. Genre cookbook

Each recipe: a style line, camera habits, sound, extra constraints. Seeds are [Summary] lines plus a shot pattern.

### 11.1 Cinematic live action (drama, thriller)
Style: "live-action, cinematic, natural light, shallow depth of field, realistic skin detail". Light as a physical
setup (source, direction, colour): "a warm lamp from the left, cool blue window light behind".
Camera: wide to establish, MCU fixed for lines, slow push-in for the turn. Sound: room tone + 1-2 action sounds.
```
[Assets] @Image1 is Elena, a woman in her forties in a grey wool coat: take only her face, hair and coat, not the pose or background. @Image2 is Tomas, a man in his fifties in a dark suit: take only his face, hair and suit. @Image3 is a hospital corridor at night: take only the place. Define the woman in the grey coat in @Image1 as Elena and the man in the dark suit in @Image2 as Tomas.
[Summary] Elena waits outside a hospital room at night and Tomas brings her news she already guessed; live-action, cinematic, still and restrained camera.
[Shot list]
Shot 1 (0-4s): [Wide shot, eye-level, fixed shot] Elena sits alone on a plastic chair in the corridor of @Image3, both hands around a paper cup. Tomas walks in from the far end and stops two steps from her. <footsteps on linoleum>, <a soft hum of lights>.
Hard cut.
Shot 2 (4-9s): [Medium close-up, front-on, fixed shot] Tomas looks down at her. Tomas says in a low, careful voice: {She was asking for you.} Realistic lip articulation, no exaggerated mouth opening, no head turns while speaking. Elena keeps her mouth closed.
Hard cut.
Shot 3 (9-15s): [Close-up on Elena, slow push-in] Elena's grip on the cup tightens, then loosens; she closes her eyes and breathes out slowly. Silent.
[Continuity] Elena looks exactly like @Image1 and Tomas exactly like @Image2 in every shot. Cold corridor light with one warm lamp; realistic skin detail. The characters' appearance, clothing, positions and lines are never exchanged.
[Sound] Dialogue clean and prominent, ambience subtle. No BGM.
[Constraints] Keep it subtitle-free. Do not generate any on-screen text, logos or watermarks. No duplicate or twin characters. Normal human eyes, no glowing eyes.
```
Seeds:
- A courier hesitates at a door, knocks, and is let in without a word; 3 shots: wide, insert on the hand, MCU hold.
- A father teaches his daughter to ride a bicycle in an empty car park at dawn; tracking shot, then a still wide.
- Two strangers share an umbrella at a bus shelter; one line each in separate MCU shots, a silent two-shot to end.
- A night-shift nurse eats alone in a break room; locked-off wide, then a close-up as her phone lights up.
- A detective finds an open suitcase on a platform; rack focus from the latch to her eyes; one footstep off screen.
- An old man tunes a radio in a kitchen; slow push-in, and a voice on the radio (V.O.) says one short line.

### 11.2 Dialogue scenes (two-handers, interviews, presenters)
One speaker per shot, shot/reverse-shot in MCU, both silent for the last shot. Presenter: "looks into the lens and
says in calm English: {...}", fixed MCU, natural blinking, quiet studio room tone, "no second speaker".
Seeds: a job interview (3 lines over 15 s, the last third silent); a phone call (one on-camera speaker, the caller as
V.O.); a confession at a kitchen table (2 lines, a long silent hold); a street interview (presenter MCU, answer MCU);
a teacher's one-line instruction to a class (CU teacher, wide class, silent).

### 11.3 Music video and singing (vocal sync, §4b)
Style per song; singer in MCU/CU, slow arc on verses, hard cuts on the beat on choruses, wide shots with the band or
place on instrumental bars. [Sound] is the fixed vocal-only line. Example (window 0-12 s of the song):
```
[Assets] @Image1 is Ana, a singer in her twenties in a yellow jacket: take only her face, hair and jacket, not the pose or background. @Image2 is a rooftop at dusk: take only the place. @Audio1 is this clip's isolated lead vocal. Define the singer in the yellow jacket in @Image1 as Ana.
[Summary] Ana sings on a rooftop at dusk with the city behind her; live-action music video, warm low sun, slow camera. Ana sings ONLY the vocal in @Audio1: exactly its words and melody, in time with it - no other words, no extra singing, no humming or ad-libs; when @Audio1 is silent, Ana's mouth is closed.
[Shot list]
Shot 1 (0-5s): [Medium close-up, front-on, slow arc left] Ana sings to camera: {vocal of @Audio1 from 0 to 5 s}
Hard cut.
Shot 2 (5-9s): [Close-up, front-on, fixed shot] Ana sings, eyes closed then open: {vocal of @Audio1 from 5 to 9 s}
Hard cut.
Shot 3 (9-12s): [Wide shot from behind, slow crane up] Ana stands silent at the rooftop edge, the city lights coming on; her mouth is closed.
[Continuity] Ana looks exactly like @Image1 in every shot. Warm dusk light, soft rim light on her hair.
[Sound] The vocal of @Audio1 only; no other voices. The final mix is added after.
[Constraints] Keep it subtitle-free. Do not generate any on-screen text, logos or watermarks. No duplicate or twin characters.
```
Seeds: a duet across a diner booth (one singer per shot, the other mouth closed); a band in a garage (singer CU on
vocal windows, hands on strings on instrumental windows); a ballad in an empty theatre (one slow push-in per clip);
a dub on `videos/reference` (`@Audio1` is the new-language line; "says ONLY the line in @Audio1"); a choir soloist
(CU soloist, wide choir silent).

### 11.4 Anime / 2D animation
State the style explicitly or realistic pictures pull it to live action: "2D anime style, clean consistent line art,
flat cel shading, simple shadows, hand-painted backgrounds". Constraints: "Not 3D, not photorealistic; no realistic
skin texture, no volumetric light." Avoid "cinematic lighting", "4k render", studio or artist names (and no 2+ style
labels stacked). Camera: fixed or slow push-in for dialogue; for action, one key impact shot. Seeds: a schoolgirl
runs for a train, the doors close, she laughs (wide, CU, fixed); a swordsman draws in the rain (CU hand, wide, one
strike); two friends on a rooftop at sunset, one line each; a cat spirit lights paper lanterns one by one (one
continuous pan); a mecha powers up (tilt up from feet to eyes, rigid metal, no melting plates); a cooking scene with
steam and sizzle sounds, close inserts.

### 11.5 3D animation (stylized, family)
"Stylized 3D animated film look, soft global light, rounded shapes, expressive eyes, clean materials, smooth motion."
State it even if pictures are 3D. Keep proportions stable ("no change in head-to-body ratio"). Seeds: a toy robot
loses a bolt and searches the workbench; a rabbit and a girl watch fireflies (per-shot Visual/Audio lines); a
snowman learns to wave; a small dragon sneezes out a candle; a bedtime flight over paper clouds (one continuous
shot, slow follow).

### 11.6 Product and ads (short form; full rules in §11b)
@Image1 = the product: "take only its shape, colour and label; not the studio background". Camera: macro inserts,
a slow 90-degree orbit, a locked hero pack shot at the end. Constraints: "No warped or mirrored labels, no extra
buttons, no changing materials." Text and logos in packaging, not in the prompt. Music described concretely ("light
acoustic guitar, steady, no vocals") or No BGM. Seeds: espresso machine pour (contact -> flow -> crema -> settle);
running shoe dolly-in to the laces then orbit to profile; skincare jar lid turns until it clicks (UGC, 9:16,
handheld, one spoken hook in the first third); watch in rain then sunrise match cut; snack bag tear and crunch
(macro, sounds only).

### 11.7 Documentary and nature
"Realistic documentary style, natural light, handheld with slight shake" or "nature documentary, long lens". Sound:
"natural ambience only" (production sound). Timed beats in 3-5 s blocks; no score. Seeds: a panda cub rolls down a
grassy slope (low angle, slight handheld follow); a baker shapes dough at 4 am (inserts + wide); a fisherman mends
nets at dawn (no water words unless needed); a market at opening time (seven short handheld shots); a hawk lands on a
fence post (long lens, rack focus).

### 11.8 Action and fights (see §7)
```
[Assets] @Image1 is Kai, a young man in a white training jacket: take only his face, hair and jacket, not the pose or background. @Image2 is Rin, a woman in a black training jacket: take only her face, hair and jacket. @Image3 is a stone courtyard at dusk: take only the place. Define the man in the white jacket in @Image1 as Kai and the woman in the black jacket in @Image2 as Rin.
[Summary] Kai and Rin spar empty-handed in a stone courtyard at dusk until Rin wins with one sweep; live-action martial arts, one lateral tracking path.
[Shot list]
Shot 1 (0-3s): [Wide shot, eye-level, fixed shot] Kai stands on the left, Rin on the right, three steps apart, both in guard. <wind across stone>.
Hard cut.
Shot 2 (3-7s): [Full shot, slow lateral track] Kai steps in with a right straight punch at shoulder height; Rin's left forearm blocks it and she slides one step back. <a dull block>, <shoes scuff on stone>.
Hard cut.
Shot 3 (7-11s): [Full shot, slow lateral track] Rin turns her hips and sweeps low with her right leg; Kai's feet leave the ground and he lands on his back, arms out to break the fall. <cloth snaps>, <a heavy thud>.
Hard cut.
Shot 4 (11-15s): [Medium shot, low angle, fixed shot] Rin offers her hand; Kai takes it and rises, both breathing hard. Silent.
[Continuity] Kai looks exactly like @Image1 and Rin exactly like @Image2 in every shot; white jacket left, black jacket right; screen direction never flips. Warm low sun from the right.
[Sound] Action sounds and breathing only, ambience subtle. No BGM.
[Constraints] Keep it subtitle-free. Do not generate any on-screen text, logos or watermarks. No duplicate or twin characters. No weapons, no blood, no extra people.
```
Seeds: a chase through a night market (one backward track, staggered obstacles); a sword duel with three measured
exchanges and sparks only on the last; a boxer's training montage as its own clip; a superhero landing (one slow-motion
moment); a bar brawl kept to one initiator per beat; a free-runner vault (approach, palms on the ledge, landing roll).

### 11.9 Horror and suspense
Darkness as a physical setup (one weak source, deep shadows), slow push-ins, long silent holds, one sharp sound cue.
Audio policy against music leaks is essential here. Seeds: a hallway light flickers as a door opens on its own; a
babysitter hears footsteps upstairs (V.O. line, then silence); a figure stands at the end of a field at dusk; a phone
rings in an empty office.

## 11b. Commercials

Premium renders of ads (`film_type: "commercial"`, a `brand_id` or a `package`) apply these rules to their prompts
automatically. Use them too when you write an ad prompt by hand (for example with `verbatim: true`) or review one.
The ad workflow itself (brands, packaging, variants) is in `references/montage/pixio-ads.md`.

- **Product first:** `@Image1` is the product: "take its exact shape, proportions, colours, materials and the printing
  on it, not its background". Several angles: "@Image1-@Image3 are the same bottle from the front, side and back;
  exactly one bottle appears". Name its picture in every shot it is in. Use a sharp, front-on product photo: the label
  reads in the video only as well as it reads in the picture.
- **Logo conflict:** the default `[Constraints]` ban "logos", which strips the product's own logo. In an ad write
  instead: "Do not generate any captions, titles, prices, watermarks or extra logos; the only printing is the printing
  on the product, exactly as in @Image1. The product keeps its exact shape, proportions, colours and printing in every
  shot: no warping, melting, mirrored or extra printing, no extra buttons or parts. No duplicate products."
- **Never spell the label's words**, never invent claims, prices or specs; a product with no printing is "plain".
- **Motion breaks labels:** keep the product still or turning slowly and move the camera around it (slow push-in,
  slow orbit of at most 90 degrees, lateral slide). Describe the real mechanism and what never happens ("the lid does
  not open"). Hands never cover the front. Give its real size once against a hand.
- **Process, not adjectives:** each product shot is start state -> one operation -> visible result ("fills to
  two-thirds; the foam settles"). Show what it makes as it looks finished.
- **Rhythm:** Shot 1 (1-2 s) is the hook; 4-6 shots per 15 s, 7-10 per 30 s, 2-4 s each; no 0.5-1 s micro-shots
  (4-5 beats per generation work best). The last 2-3 s are a locked-off packshot with no new action (the end card
  goes over it). A ~1 s montage rhythm is made in the edit from several takes (`references/montage/pixio-video-editing.md`),
  not in one prompt.
- **Light** as a studio set-up (key direction and softness, rim light, background) plus one grade phrase, the same
  words in every clip. No quality stacks (8K, masterpiece), no glow or sparkle on products, no grain words.
- **Sound:** product sounds tied to actions (`<the cap clicks shut>`) plus one concrete `(music bed, no vocals)`, or
  "No BGM. Nobody speaks." when a voice-over or the customer's song is added afterwards (the usual case). UGC: one
  hook line in the first 3 s, the dialogue rules unchanged.
- **Text** (captions, slogans, prices, end cards, the wordmark) is always added in packaging
  (`POST /api/v1/director/videos/package`) or graphics (`POST /api/v1/director/videos/graphics`).
- **Tier:** Montage Premium for most ad takes; Montage Ultra, or Premium with `upscale: true`, for label-critical
  packshots. Quote both with `?check=true` and let the human pick.

## 12. Failure -> fix

| Failure | Fix |
|---|---|
| Face drift / wrong person | Head close-up + full-body refs, key refs first, same name every time, characters uploaded in order of first appearance |
| Twins / duplicates | One person per picture, bind each, "No duplicate or twin characters", trim repeated description |
| Characters swap looks or lines | Anti-swap line, one speaker per shot, "keeps her mouth closed" for the others |
| Subtitles appear | "Keep it subtitle-free", no repeated line words, no per-word notes, `Name's line (emotion): {...}`, no text in refs, landscape |
| Mushy speech / mouth mismatch | Shorter line, MCU/CU front-on, fixed camera, no turns, numbers as words, line early in its shot |
| Last word clipped | ~1 s of tail, no lines in the last third, silent closing hold |
| Line starts late | Start the line early in its shot; trim lead-in silence from a voice sample |
| Music despite "No BGM" | Audio policy listing music words, repeated at start and end and on reveal shots; or replace the sound in packaging |
| Wrong voice | Same `@Audio N` sample every clip + timbre in words; line tone close to the sample's tone |
| Glowing eyes | Neutral emotion words, "normal human eyes, no glowing eyes" |
| Bubbling / echo audio | Remove water, wave, echo words |
| Fingerprint texture in foliage | Downscale reference pictures to <= output size |
| Style drifts to live action | State the animation style and add "not photorealistic, not 3D" |
| Beats dropped in long takes | Timed shot list; split overloaded windows; one action per window |
| Jittery or fragmented motion | Fewer micro-events, group movements, slower moves, one camera move per shot |
| Strikes don't connect / fighters merge | Start distance, path, contact point and reaction; separation; contrasting outfits |
| Actions replayed at clip start | "Do not replay or recreate the previous clip's action"; describe the start state |
| Garbled on-screen text | Leave text to packaging or graphics |
| Wrong task type (edit/extend) | No edit/extend trigger words in reference prompts |
| Sung lips off your exact song | `music_sync: "song"`, or `lip_check: "relip"`; see `references/montage/pixio-lipsync-fixing.md` |
| One clip or section bad | Redo it (`POST /api/v1/director/videos/film/{id}/redo` with `clip`, or `.../music/{id}/redo` with `section`), never the whole video; a Premium retake costs the part price it was sold at |

## 13. Pre-submit checklist

Send the real request once with `?check=true` (with `video_model` in the body). It is free and returns the prompt
report in `promptCheck` (`issues[]` of `{ level, message, clip }`) and the quote in `credits.quoted`. Fix every
ERROR, read every WARN. A real call with checker errors answers `422 prompt_check_failed` and charges nothing.
(`POST /api/v1/director/prompts/check` takes no `video_model` and checks Montage Basic format; use the `?check=true`
preflight for Premium prompts.)

ERROR (will go wrong):
- [ ] No Montage Basic syntax (`<Picture N>`, `(S1)`, `<d>`, six-section keys, `At 00:03`) and no `--flags`.
- [ ] No grain / noise / film-stock words, not even negated.
- [ ] No "as in clip N" / "same as" shortcuts; under 1,000 words.
- [ ] Shot times in whole seconds, continuous from 0, never past the clip end.
- [ ] Every supplied picture is bound and used; no image number above what is sent; 6-9 images per clip recommended, at most 30 per job, 3 audios on `videos/reference`.
- [ ] Spoken words <= (duration - 1 s) x 1.6.
- [ ] Sung clips: "sings ONLY the vocal in @Audio N", and only `{vocal of @Audio N from A to B s}` slots in braces.

WARN (often goes wrong):
- [ ] Each line <= 10 words; each shot's words fit its own budget.
- [ ] One speaker per shot (and one singer's vocal per shot); no line in the last third.
- [ ] No line repeated elsewhere in the prompt.
- [ ] Sound described (`<...>`, `(...)` or "No BGM."); "subtitle-free" present; no (music) over singing.
- [ ] No extreme emotion words; at least 40 words; a shot list (or "continuous") for clips over 6 s.
- [ ] Shots numbered 1, 2, 3...; `[Sound]` identical in every clip of a film.

INFO: shots over 8 s, more than 5 pictures in one clip, water/wave/echo words, `【】` text, mixed tag spellings.

Before the real call: the human has seen `credits.quoted` from the preflight and said yes. Poll
`GET /api/v1/director/jobs/{id}` every 10-30 s; never resubmit on a timeout.

## 14. Open questions

Each of these is a judgement call where the house rules above are more conservative than what sometimes works.
Test cheaply before relaxing any of them.

1. **Lines in the last third.** Long takes with dialogue all the way to the end sometimes render cleanly. The rule
   (no lines in the last third) comes from clipped last words. Possible relaxation for long takes: allow a line if
   at least 1 s of tail remains.
2. **Audio policy.** The full banned-music-words line at the start *and* end is stronger than "No BGM." alone.
   Consider it whenever a clip must have no music.
3. **Per-line emotion form.** `Name's line (emotion): {...}` vs `Name says in a ... voice: {...}`. Both put delivery
   first; the first form is the better one for several lines with different feelings.
4. **Exact-dialogue constraint.** "Generate audio strictly according to the dialogue; add or remove no lines", plus
   exclusions for wrong-speaker, simultaneous speech and lip-sync errors, is worth adding to dialogue-heavy takes.
5. **Angle brackets.** `@Image N` tags avoid any clash with `<>` sound marks; never put a name in `<>`.
6. **Reference picture size.** Keep references at or below the output resolution (fingerprint textures).
7. **Multi-view sheets** (one picture showing a subject from several angles) work for 1-5 subjects; the head
   close-up + full-body advice stays.
8. **Premium vs Ultra** on lip-sync and prompt adherence: no published comparison; quote both and A/B a single shot
   if it matters.
