---
name: pixio-photoreal-shorts
description: The method for believable photoreal live-action short films (one to twenty minutes) with Montage (Pixio's Director API) on Montage Basic and Montage Premium / Ultra - the plain-language shot header, the 20-block shot prompt mapped onto the pixio-prompt-director skeleton, reusable look / light / lens / materials templates, prop locks, voice locks, the anti-AI-tell rules (what makes footage read as generated and how to prevent it), scene-type adaptations and short negative sets, dialogue in an invented language the models can speak, the director's statement as a tone lock, and how a short longer than 7 minutes is built from several films joined with POST /api/v1/director/videos/assemble. Use whenever you plan or write a photoreal drama short or a scene of one, want footage that does not read as AI, need a prop or voice lock across shots, or write lines in a constructed language. Not for the block skeleton itself (references/montage/pixio-prompt-director.md), the acting paragraph (references/montage/pixio-acting.md) or the tag formats (references/montage/montage-basic-prompting.md, references/montage/montage-premium-prompting.md).
---

# Photoreal live-action shorts with Montage

Photorealism is solved by the models. What is not solved is **believability**, and a viewer believes behaviour, not
skin: how a person holds a knife, how they make a fire, what hangs from their belt and why. Everything here serves
that second half. It is a method for any photoreal short; it carries no story of its own.

Base URL `$BASE` (`https://beta.pixio.myapps.ai`), key `$PIXIO_API_KEY` in the `Authorization: Bearer $PIXIO_API_KEY`
header only. Every path is under `/api/v1/director/`.

## House rules

- **Test cheaply on Basic.** Every test, draft or trial render sends `video_model: "montage-basic"` (it is also what
  renders when `video_model` is left out). Basic is billed in Pixio credits like everything else, just less. Premium
  or Ultra only when the user asks for it and has seen the `?check=true` quote (`credits.quoted`).
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.

Restraint with blood and violence below is a craft choice. No famous names in prompts: describe the look.

## 1. Order of work on a shot

1. **The event and each character's tactic** (`references/montage/pixio-acting.md`): what happens and what each
   person is doing to whom.
2. **The plain-language header**, for you and the user, never sent to a model. Four lines: what happens, what is
   said (with its meaning), how long each beat runs, how the shot ends. If the shot cannot be written here, it is
   not designed yet.
3. **Geometry:** positions in metres, screen sides, camera height and distance; for hard staging draw a blocking map
   (a top-down sketch: who stands where, facing which way, the camera's spot and lens) and copy its numbers into
   `[Blocking]`.
4. **The prompt** in the 20 blocks (section 2), in English; a line in an invented language stays in its own script
   (section 7).
5. **Check** against the anti-AI-tell rules (section 4), add only the scene's negatives (section 5), then
   `POST /api/v1/director/prompts/check` (free).
6. **Render a Basic draft**, watch it, **fix the one block that failed** (pixio-prompt-director section 17), and only
   then a Premium `?check=true` quote and, after a yes, the render.

**Every prompt is an island.** The model has no memory: light, optics, wardrobe, props, voice and geometry are
written again, in full, in every shot ("same as the previous shot" means nothing to it). This is the sealed-clip
rule of pixio-prompt-director section 15.

## 2. The 20-block shot prompt on the Director skeleton

The method's 20 blocks are not a second format. Each one lands in a block of the pixio-prompt-director skeleton
(Premium / Ultra) and, through its section 18, in the Montage Basic official format
(`references/montage/montage-basic-prompting.md`). Use this table to check that nothing a believable shot needs is
missing.

| # | Block | Premium / Ultra (skeleton) | Basic (official format) | Montage change |
|---|---|---|---|---|
| 1 | Cast and assets | `[Assets]` | `subject_definitions:` + `retention_analysis:` | pictures by `@ImageN` / `<Picture N>`; names defined once |
| 2 | Style prefix (live-action, one take or cuts) | `[Summary]` | `summary:` + first style sentence | **no runtime or shape in the prompt**: `duration`, `aspect` are fields |
| 3 | Style (the look) | `[Summary]` style line | style sentence | template 3.1; no grain or film-stock words |
| 4 | No subtitles, no text | `[Constraints]` "Keep it subtitle-free..." | not needed (Basic adds text only when asked) | text goes in packaging |
| 5 | Composition | `[Location map]` + `[Blocking]` | `[Shot 1]` sentences | metres, screen sides, depth layers |
| 6 | The shot (what happens) | `[Shot list]` | `[Shot N]` lines | one action per shot |
| 7 | Spoken line | in the shot, `{line}` + voice line | `(S1) <d>[Language] ...</d>` | voice lock (section 3.7) |
| 8 | Camera | `[Shot list]` brackets | trained moves only | "travels" vs "stays put" stated |
| 9 | Living face / eyes (or living moment) | acting lines in the shots | acting clause per shot | an eye task, not a catchlight (pixio-acting) |
| 10 | Anti-AI-tell directive | `[Constraints]` + `[Continuity]` | positive style sentences | section 4 |
| 11 | Light | `[Lighting]` | style sentences | template 3.2 |
| 12 | No lens flares | `[Lighting]`, positive form | style sentence, positive form | never name flares, even to ban them |
| 13 | Lens look | `[Optics]` | "long lens" / "wide lens" + outcomes | template 3.3; FOV lines are Premium / Ultra only |
| 14 | Hyper-real capture (materials) | `[Physics]` or `[Continuity]` | style sentence | template 3.4 |
| 15 | Physics | `[Physics]` | in the shot sentences | weight, resistance, wind, cloth |
| 16 | Character acting | `[Shot list]` | `[Shot N]` | pixio-acting, folded into the shots |
| 17 | Audio | `[Sound]` | `overall_soundscape:` + `non_diegetic_music:` | "No BGM." / `N/A` when there is no score |
| 18 | Total runtime, shot and cut count | `[Summary]` ("Single continuous shot, no cuts.") | shot count | seconds only as the `duration` field |
| 19 | Geometry anchor | `[Blocking]` | `[Shot 1]` | metres and angles; optional blocking map |
| 20 | Negative | `[Constraints]`, short, positive first | none: Basic has no negative prompt | section 5 |

Optional blocks: **the situation** (one line of what just happened: `[Summary]`), **frame match** (repeat a good shot
one to one by its exact angle, light and composition: `[Optics]` + `[Blocking]`), **who is who** (`[Assets]`
definitions + "The characters' appearance, clothing, positions and lines are never exchanged." in `[Continuity]`),
**living moment** instead of living face for an animal or a physical process (a flame, a dying animal fighting while
it still can).

## 3. Reusable templates and locks

Write each template once per project and paste it **word for word** into every shot: identical words are what keep
the look identical (`references/montage/pixio-lighting-color.md`). Change only the bracketed parts.

### 3.1 Look line (`[Summary]` style line; Basic: first style sentence)

```text
Live-action photoreal film frame: a real photographed moment from a modern arthouse feature, real people in real places, natural imperfections, real skin and worn real materials, absolute live-action naturalism, clean digital cinema image.
```

The source wording stacked NOT-clauses ("not a render, not 3D, not CGI"). On Montage keep the look positive: a
NOT-stack plants the words it bans (on Basic there is no negative prompt at all). A short exclusion line belongs at
the end of Premium `[Constraints]` only.

### 3.2 Light (`[Lighting]`)

```text
[Lighting] Natural light only: [the one real source: a campfire / a small oil lamp / a window / dusk sky] is the only light, from [direction], [camera side relative to it]. Low-key and underexposed, deep shadow, real falloff that dies within [distance], strong chiaroscuro, rich true blacks. Each light source stays small and contained inside itself. Exposure is set for [the flame / the window], not for the faces.
```

Add on Premium only when a render came out flat: "No frontal key, no fill, no flat even light." Daylight words only
when the scene is daytime.

### 3.3 Lens look (`[Optics]`)

```text
[Optics] [29°] anamorphic-style look: a wide cinemascope feel, oval out-of-focus highlights, shallow focus that breathes, gentle softness toward the frame edges, natural detail that is never over-sharpened.
```

Degree lines and outcome stacks: pixio-prompt-director section 7 and its lens bank. Leave out grain, halation, gate
weave and chromatic aberration (the prompt check flags halation as a grain word, and the house rule is no grain).

### 3.4 Materials ("hyper-real capture", `[Physics]` or `[Continuity]`)

```text
Every surface reads real and used: [the specific materials of THIS shot: frost in the stubble, the greasy soot rim of a lamp, coarse hide, wind-cracked lips, wet breath fog]. Nothing looks clean, smooth or plastic.
```

Name this shot's materials, never a generic list. On Basic close-ups add "natural skin with visible pores". Basic
also takes `realism` (0-1, natural matte skin) on `videos/reference`, films and music videos, and `sharp_faces: true`
(sharper faces that smear less on head turns, same price).

### 3.5 Naming and state

- **One element, one name**, identical in your asset list, the picture's file name and the prompt (Premium: the
  defined name, "Define the man in the grey parka in `@Image1` as Aron"; Basic: `<Subject N>`; films: `cast`).
- **A change of state is a new picture and a new name, never an overwrite:** `aron_wet.png`, `aron_frostbite.png`,
  made from the same base picture with `POST /api/v1/director/images/edit`, one change per pass
  (`references/montage/pixio-image-prompter.md`, template 3). Send a state picture only to the clips where that state
  is true (`clip_images`).
- **The base portrait never runs through a model again.** Every state is edited around it, so face and skin texture
  survive every version.

### 3.6 Prop lock

A prop list per project, one line per prop, each written so it can only be one thing: what it is made of, how each
part is built, its wear, and **its function in the story**. Objects have a function, not a presence.

```text
Prop: [name] - [material and build, part by part]; [wear and age]; [where it lives on the body or in the place]; [what it is for in the story].
Fallback: [a simpler object that does the same job], for when the main prop renders badly.
```

Example: "a short darkened steel blade with a pale polished bone handle, in a worn leather sheath on her right hip;
the tool she uses for everything." Make a prop picture for every prop that comes back (pixio-image-prompter template
6) and keep it identical in every place picture that shows it. A process prop (a fire kit, a trap) is listed with
every part, so the process can be filmed for real (section 6).

### 3.7 Voice lock

One voice lock per speaking character, written once, pasted **unchanged** wherever they speak; the manner of this
scene (whisper, shout, delirium) is layered **on top**, never rewritten into it. It extends the pixio-acting voice
line (section 10 there) with registers:

```text
Voice lock - [NAME]: [age, sex, timbre and register]; [pace and where the breath sits]; [register 1, e.g. COMMAND: flat, certain, brief]; [register 2, e.g. BROKEN: barely voiced, lips barely moving, words dissolving into breath]; [how crying, screaming or failing speech sounds for this person: "the break happens in the breath and a swallow, never a sob"; "a scream is hoarse and shapeless, never a clean wail"].
```

Premium: the voice line goes before the line ("Aron says in a low, worn, cracked older man's voice, on the tail of
an exhale: {...}"). Basic: described once at the character's first line in the clip. For the same sound across a
film add a voice sample (`audios` on a shot, film `cast` with one face and one voice per person, or
`voice_lock: true` on a film; `references/montage/pixio-dialogue-voices.md`).

## 4. Anti-AI-tell rules

**Realism is what you subtract, not what you add.**

**Frame and camera**
1. Shorter prompt, fewer subjects in frame: less slop.
2. Asymmetry, off-centre framing, chiaroscuro and a background falling into darkness read as cinema, not render. A
   tilted horizon only where control is lost (madness, fear, panic), never in quiet scenes.
3. State whether the camera **travels** or **stays put**. A handheld that stays put "breathes": small human tremor, a
   few degrees off level, a drift that arrives a beat late; focus hunts once. On a spoken line keep it to a breath
   (lip-sync wants a near-fixed frame).
4. A pull-back is a real operator walking backwards, shaking the whole way. Low angle: "camera on the ground, the
   figure towering over it".
5. Background people: pushed into darkness and out of focus, six at most, about a metre apart, not clustered, not
   looking at the lens. A flat crowd of sharp faces is the fastest AI tell.
6. Distance, darkness and scale are repeated **in every block at once** (composition, camera, light, constraints).
   One mention loses.

**Eyes and faces**
7. **Glassy eyes are a frozen pupil, not a highlight.** A reflection of a flame is fine. The fix is movement with a
   purpose: pupils that search, settle and drift, uneven blinking, brows, cheeks and mouth working independently,
   slight asymmetry, and an eye task aimed at the partner (pixio-acting).
8. Believable acting is pauses plus micro-expression. Mad or frightened eyes are **active**: darting, or wide with
   visible white and a tremor; never a fixed doll stare. States that read on camera: dilated pupils, broken breath,
   indistinct muttering, sweat, shifting micro-expression.
9. Where the glassy-stare risk is high, hide the eyes honestly: goggles, a mask, a hood's shadow, a turned head; then
   play the mouth, jaw and breath.
10. A hidden face needs "face not shown, hands only" (or "action below frame") **in every block**, plus "the camera
    never tilts down to reveal".
11. Two people's hands in one close-up never look alike: give each pair its own size, age and wear.

**Bodies, matter and violence**
12. Real resistance: material resists before it gives; a death is gradual if intended; blood moves with gravity over
    time. Blood is dark, near-black, viscous, and it **wells**; never bright red spray. For a killing kept clean: "one
    short press, no blood".
13. Blood on the lens: "a real dark droplet on the lens". Tears swell, run and freeze; if both people cry, write it
    for both.
14. Gradual and partial states: write START / DURING / END separately, with the wrong direction refused at each end.
15. Action off frame: the hand enters, the movement begins, then the shot ends or holds the face while the hand
    leaves past the bottom edge.
16. Two similar people fighting is a weak spot: make them look completely different, define who is who, open on an
    explicit pose, or split into two clips and cut (`references/montage/pixio-action-fights.md`).
17. Whispering and failing speech are mouth physics ("lips barely moving, weak dying breath"), never the word
    "whisper" alone.

**Objects and words**
18. A noun with a cartoon prototype pulls toward the cartoon ("bone" gives a chew bone). Do not name it: describe the
    geometry ("a single long smooth shaft sweeping up out of the snow in a shallow arc, thickest at the snow, tapering
    to a narrow point, no knob or joint at either end") and anchor the scale against a person.
19. Movement is mechanics, never a verb of summary: not "she walks" but "she hauls the loaded sled, torso folded
    forward, the strap cutting into her shoulder, runners catching on the crust".

**Getting the shot you want**
20. **A new angle:** do not reuse the previous frame as a start frame; render it from the people and place pictures on
    `POST /api/v1/director/videos/reference` (every supplied picture still sent). **A wide from a close reference:**
    build the wide still first (`POST /api/v1/director/images/reference`), check it, then animate it with
    `POST /api/v1/director/videos/image`.
21. **Match a good shot one to one:** write its exact angle, lens, light and composition again (frame match).
22. **The engine speaks the line itself.** A smeared line: regenerate the same shot with the same line and a different
    description of the delivery (Basic: a new `seed`; Premium has no seed, so judge over two takes). Artifacts
    (ghosting, smears, compression trails): "stable picture, no ghosting, no flicker" and a shorter, simpler shot.

## 5. Scene types and short negative sets

Adapt the composition, the shot, the anti-AI-tell lines and the constraints; leave every other block as it is.

| Type | What changes | Refuse (Premium `[Constraints]`) |
|---|---|---|
| A. Quiet, warm | a small source, close, slow, long pauses, level horizon | hysteria, fast motion, tilted horizon |
| B. Violence off frame | the hand enters, the move begins, the frame ends or holds the face | visible contact, wound, camera tilting down |
| C. Madness | active eyes, tilted horizon, the camera shakes and jumps but stays put | orbiting camera, doll stare, calm lucid face |
| D. Crowd | background dark and soft, six at most, a metre apart | flat crowd, sharp background faces, faces to camera |
| E. Hidden action | "face not shown" / "action below frame" in every block | the camera reframing to reveal |
| F. Extreme wide with a focus rack | distance and scale in every block | subject too close, medium shot, aerial |

Short negative sets, picked a few at a time, only for what this shot risks or what already failed:

- **Face close-up:** doll eyes, frozen pupils, glassy stare, symmetrical face, beauty retouching, smooth skin, glamour
  light, styled hair.
- **Night and fire:** daylight, flat even light, warm light filling the frame, glow, light beams, milky blacks.
- **Violence:** bright red blood, spurting, pooling, splatter, visible contact (when kept off frame).
- **Crowd:** sharp background faces, people looking at the camera, clustered or identical figures, modern clothes.
- **Animals:** glowing, spirit-like or cartoon animals, plastic fur, an animal looking into the lens, a tame animal.
- **Ice and water:** glowing turquoise ice, gem-like ice, splashing, stormy waves (on Premium, water, wave and echo
  words can cause audio artefacts; use them only where the scene needs them).
- **Camera:** tripod-smooth, gimbal float, drone, crane, orbit, zoom, slow motion, looping motion.

**Basic has no negative prompt:** an exclusion list on Basic adds what it names. Turn each item into a positive
statement in the style sentences ("the background falls into darkness beyond two metres; the street is empty").

## 6. Daily life: the believability layer

- **Processes are filmed for real**, with the full kit and the full process: making fire, mending, skinning, loading.
  List every part of the kit as a prop (3.6) and break the process into shots of one physical step each.
- **What hangs off the belt, and why:** each character carries only objects with a job, and uses them.
- **The body remembers a craft** even when the mind is gone: good knots, a weather call, a correct warning. Behaviour
  carries the character (pixio-acting).
- **Sound is diegetic:** wind, breath, runners creaking, fire, voices, one instrument that exists in the world.
  Silence is an instrument: the heaviest moments get more silence, not more sound. Premium: "No BGM." (or the full
  audio policy in `references/montage/montage-premium-prompting.md`); Basic: `non_diegetic_music: N/A`.

## 7. Dialogue in an invented language

Characters can speak their own lines on camera in a constructed language: no dub, no voice-over, voices matching the
faces. Both tiers generate the speech themselves, so the line must be something the model can pronounce.

**Building the language**
- Choose a sound profile and keep it: throaty stops, nasals, hard vowels, consonant clusters, or the opposite.
- **Coin each word once and use it everywhere, with no synonyms.** A small grammar of a few affixes (direction,
  imperative, diminutive, completed state) is enough; word order can be free.
- Let a few lines carry the film: one phrase that states the terms, one promise repeated word for word, one word that
  returns with a new meaning in each act.
- Keep the translation in your notes, never in the prompt.

**Writing lines the model can speak**
- Short lines: Premium 5-10 words at about 1.6 words per second plus 1 s; Basic about 2.6 words per second plus 1 s.
  Invented words are often long: read the line aloud at a calm pace, add one second, and fit that to the shot.
- Simple syllables for the lines that matter. The engine smears rare letters and dense clusters: for a critical
  line, simplify the spelling toward what the model can produce while keeping the meaning and the sound.
- A smeared line: same line, a different description of the delivery, another take (rule 22).

**The script trick, and what is verified.** The method's finding (on the Premium model): a line in Latin letters is
read as English words with English phonetics; written in a non-Latin script (Cyrillic, for a northern sound), the
model articulates it differently and it sounds authentic. In general: **the script selects the phonetics.** Write the
line in the alphabet of a real language whose sound you want and name that language:
- **Basic:** the official format names the language in the line: `(S1) <d>[Russian] ...</d>`. The prompt check only
  adds an INFO tip for a tag other than `[English]`; it does not block.
- **Premium / Ultra:** open with "Dialogue language: Russian." (needed for any language other than English or
  Chinese).
- **Not yet measured on Montage** for invented words on either tier: the model may "correct" a word toward a real one
  or burn subtitles. Draft on Basic with two seeds, listen, and check the lips
  (`POST /api/v1/director/videos/edit/analyze` with `"checks": ["lipsync"]`). Stay inside the base language's
  standard alphabet; rare extra letters smear.
- **Never romanise a line partly**, and never put the translation next to the line (Premium burns repeated line
  words as subtitles). Keep it subtitle-free in the prompt.
- Subtitles, if wanted, come from packaging with **your own** SRT or JSON list in `captions` (never `auto`: speech-to-
  text cannot read an invented language). `dub_language` and `subtitle_language` do not apply.
- **Wordless song or humming:** write it as a sound, "a wordless low hum, lips closed" (Basic invents words for any
  voice you describe without them).

## 8. The director's statement as a tone lock

Write a one-page statement before the first prompt. It is never pasted into a prompt; it is the yardstick every prompt
is checked against, and the source of the fixed lines (look, light, lens, sound) and of the film's `style`.

1. **The idea** in one sentence, plus a pitch anchor of under 15 words.
2. **What it is not:** the shortcuts the film refuses (trading on violence, explaining the theme).
3. **Visual language, functional not stylistic:** each choice tied to the story's meaning (natural light because
   nothing in this world could make more; a wide frame because people are small in it; a live handheld because
   someone is walking with them).
4. **Camera rules:** when low angle, when a tilted horizon (only lost control), what the camera never does.
5. **Editing:** e.g. a broken documentary jump cut as the main grammar, with composed, authored sequences only at the
   key points. On Montage this suits the models: a shot is at most 15 s (a film is built from 15 s clips), and a jump
   cut hides the limit on long continuous action. For one unbroken 20-60 s take on Basic, use `long_form`
   (`references/montage/pixio-long-form.md`). Trim and reorder shots afterwards with
   `GET /api/v1/director/jobs/{id}/shots` and `POST /api/v1/director/jobs/{id}/edit`.
6. **Light and colour:** the permanent state, the rare exception, the one colour allowed once.
7. **Sound:** score or none; what silence is for.
8. **Daily life:** how processes and objects are shown (section 6).
9. **The motif:** one physical image and one gesture that rhyme across the film without words.

Use it: derive templates 3.1-3.4 and the sound policy from it; send its look in one line as `style` when the writer
drafts (`POST /api/v1/director/prompts/write`, a background job whose clips you read from the finished job's
`result`, or `style` on `POST /api/v1/director/videos/film` with an `idea`); reread it before each render and cut
whatever in the prompt contradicts it.

## 9. Production on Montage

- **Assets are pairs:** a text line and a picture for every person, place, prop and state; both checked before video.
- **Length: one film is 30 s to 7 min.** `POST /api/v1/director/videos/film` takes a `duration` of at most 420 s,
  in 15 s clips. A short longer than 7 minutes (up to the 20 minutes this method covers) is **several films**, one
  per act or scene, joined afterwards with `POST /api/v1/director/videos/assemble`:
  - `clips` lists the pieces in play order: each a finished job of yours (`job_id`) or an uploaded file from `videos`
    (up to 20 uploads), with optional `start_s` / `end_s` trims, `speed`, and a `transition_in` (`cut`, `crossfade`,
    `dip_to_black`, `dip_to_white`, `wipe_left`, `wipe_right`) with `transition_s`.
  - `audio_tracks` lays a score or room tone across the joins; `loudness_lufs` evens the level; `aspect_ratio` with
    `fit` (`crop`, `letterbox`, `blur_fill`) sets the output frame.
  - It is priced like finishing, per second of the finished video (rates in `GET /api/v1/director/catalog`), and has
    no free quote: `?dry_run=true` answers 400 `preflight_unavailable`. Check the assemble entry in the catalog for
    its current limits before planning a very long join.
  - To swap one bad shot of a finished film without re-joining everything, use `replace` (`job_id`, `shot` from
    `GET /api/v1/director/jobs/{id}/shots`).
  - Keep each act its own film so a redo (`POST /api/v1/director/videos/film/{id}/redo`) or a draft-to-final
    (`POST /api/v1/director/videos/film/{id}/final`) touches only that act. Use the same `cast`, `style`, look line
    and voice locks in every act, so the joins do not show.
  - The process scenes and the key scenes are never compressed; road and transit scenes become short inserts.
- **A wide 21:9 frame:** video renders in 16:9 (or 9:16, 1:1). Compose for a wide central band (heads and key action
  away from the top and bottom), then letterbox with `finish` `{"scope": true}` (2.39:1 bars) or crop with
  `POST /api/v1/director/videos/edit/crop` and `"aspect_ratio": "2.39:1"`. Keep `grain` at 0.
- **Geometry:** for staging that has to be exact, draw the blocking map first (section 1, step 3; the full method is
  in `references/montage/pixio-blocking-map.md`) and copy its
  numbers into `[Blocking]`.
- **Basic first:** stage, time and voice every scene on Basic drafts (`speed: "draft"`); Premium or Ultra only for
  what they do better (movement, action, many pictures), after a `?check=true` quote and a yes. Long Premium / Ultra
  films can mix tiers per clip with `tier_mix` (`references/montage/pixio-tier-choice.md`).

## 10. Worked example (invented scene)

Header (not sent): "A feverish old ferryman mistakes his grown son for his dead brother. He says the brother's name
and asks if he came back; the son, after one held beat, answers as the brother. About 12 s, three shots. Ends on the
son's late blink."

Premium (`@Image1` the old man, `@Image2` the son, `@Image3` the hut; `duration` 12 as a field):

```text
[Assets] @Image1 is Aron: take only his face, hair and grey wool sweater, not the pose or background. @Image2 is Dag: take only his face, hair and oilskin jacket. @Image3 is a plank hut at night: take only the place. Define the old man in @Image1 as Aron and the young man in @Image2 as Dag.
[Summary] In a lamplit hut at night, feverish Aron mistakes his son Dag for his dead brother; Dag answers as the brother. Live-action photoreal film frame: a real photographed moment from a modern arthouse feature, real people in real places, natural imperfections, real skin and worn real materials, absolute live-action naturalism, clean digital cinema image. Three shots, hard cuts.
[Location map] The camera is low at the end of the bunk. Foreground: the rough blanket edge. Midground: Aron on the bunk, screen-left; Dag kneeling, screen-right. Background: plank wall falling into darkness beyond two metres.
[Blocking] The first visible frame already contains both men. Aron lies propped on one elbow, torso turned screen-right toward Dag, eyes on Dag's face. Dag kneels 40 centimetres away, a small oil lamp in his right hand at chest height.
[Optics] 29° anamorphic-style look: a wide cinemascope feel, oval out-of-focus highlights, shallow focus that breathes, gentle softness toward the frame edges, natural detail that is never over-sharpened.
[Shot list] Shot 1 (0-5s): [Close two-shot, low, handheld that stays put: small tremor, a few degrees off level] Aron's heavy hand already rests on Dag's cheek, trembling; his pupils search Dag's face, settle, drift, settle again. Aron says in a low, worn, cracked older man's voice, barely voiced, on the tail of an exhale: {Ben. You came back.} Dag keeps his mouth closed and responds only with his eyes. <rasping breath>.
Hard cut.
Shot 2 (5-9s): [Medium close-up on Dag, front-on, a handheld that only breathes] Dag goes still under the hand, one held breath. Dag says in a quiet, low young man's voice, steady on top with the break underneath: {I came back, brother.} Aron keeps his mouth closed. <the small flutter of the flame>.
Hard cut.
Shot 3 (9-12s): [Close-up on Dag, handheld that stays put, focus hunts once] Dag's eyes stay on Aron's; a late blink; the lamp flame bends and recovers. Silent. <wind on the planks>.
[Physics] Aron's hand is heavy and slow, the fingers stiff; Dag's head gives slightly under its weight. Wool and oilskin settle after they move.
[Lighting] Natural light only: the small oil lamp in Dag's hand is the only light, from below and screen-right, the camera on its far side. Low-key and underexposed, deep shadow, real falloff that dies within a metre, strong chiaroscuro, rich true blacks. Each light source stays small and contained inside itself. Exposure is set for the flame, not for the faces.
[Continuity] Aron looks exactly like @Image1 and Dag exactly like @Image2. The characters' appearance, clothing, positions and lines are never exchanged. Every surface reads real and used: sweat in Aron's grey stubble, cracked knuckles, the soot rim of the lamp glass, coarse wet wool.
[Sound] Dialogue clean and prominent, ambience subtle: wind on the planks, the lamp, breath. No BGM.
[Constraints] Keep it subtitle-free. Do not generate any on-screen text, logos or watermarks. Exactly two people: Aron and Dag; no duplicate or twin characters. Normal human eyes, no glowing eyes. No doll eyes, no frozen pupils, no glassy stare, no smooth waxy skin.
```

Write the Basic draft from the same blocking (pixio-prompt-director section 18), render it, then quote Premium for
free before asking the user:

```bash
# Basic draft (billed in Pixio credits)
curl -X POST "$BASE/api/v1/director/videos/reference" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-basic -F speed=draft -F duration=12 -F aspect=16:9 -F seed=21 -F realism=0.6 \
  -F images=@aron.png -F images=@dag.png -F images=@hut.png -F "prompt=<s3_basic.txt"

# Premium quote: free, starts nothing, returns credits.quoted and the prompt report
curl -X POST "$BASE/api/v1/director/videos/reference?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-premium -F duration=12 -F aspect=16:9 \
  -F images=@aron.png -F images=@dag.png -F images=@hut.png -F "prompt=<s3_premium.txt"
```

Each start call returns a job `id`; poll `GET /api/v1/director/jobs/{id}` every 10-30 s until `done`
(`references/montage/pixio-jobs-polling.md`).

## Related guides

`references/montage/pixio-prompt-director.md`, `references/montage/pixio-acting.md`,
`references/montage/pixio-emotion-acting.md`, `references/montage/pixio-image-prompter.md`,
`references/montage/pixio-dialogue-voices.md`, `references/montage/pixio-lighting-color.md`,
`references/montage/pixio-camera-language.md`, `references/montage/pixio-action-fights.md`,
`references/montage/pixio-film.md`, `references/montage/pixio-long-form.md`,
`references/montage/pixio-video-qa.md`, `references/montage/montage-basic-prompting.md`,
`references/montage/montage-premium-prompting.md`.

## Checklist

- [ ] Plain-language header written; event and tactics clear; geometry in metres.
- [ ] All 20 blocks covered through the skeleton; no runtime, shape or seed in the prompt.
- [ ] Look, light, lens and materials lines pasted word for word; no grain, halation or film-stock words.
- [ ] Every prop and state has a picture and a fixed line; voice locks pasted unchanged.
- [ ] Anti-AI-tell pass done; only this shot's negatives, positive first; none on Basic.
- [ ] Invented-language lines in one script, language named, timed aloud, no translation in the prompt.
- [ ] The prompt agrees with the director's statement.
- [ ] Longer than 7 minutes: planned as several films (one per act or scene), joined with `videos/assemble`.
- [ ] Basic draft watched; Premium or Ultra only after a `?check=true` quote and a yes; every supplied picture used.
