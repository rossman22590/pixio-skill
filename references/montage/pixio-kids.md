---
name: pixio-kids
description: How to make videos for young children with Montage (Pixio's Director API) - safe, bright, simple stories; characters kids love (animals, friendly creatures, toys and vehicles); slow, repetitive pacing; gentle narration; sung kids' videos on the customer's own song (or a generated one) through POST /api/v1/director/videos/music with lipsync none; and the safety rules (nothing scary, no harm, adults only in reference pictures of real people). Use whenever someone asks for a children's story, a nursery-rhyme or sing-along video, a bedtime story, a kids' learning video or a cartoon for little ones. Not for the clip prompt format (that is montage-basic-prompting) and not for grown-up animation styles (that is pixio-3d-animation or pixio-anime-styles).
---

# Kids' videos on Montage

Young children want **one friendly character doing one clear thing at a time, in bright light, slowly, with
repetition.** That also happens to be what the models render best. Keep it simple, keep it safe, keep the camera
calm. Prompt FORMAT lives in references/montage/montage-basic-prompting.md; narration routes in
references/montage/pixio-explainers.md.

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

## Safety rules (non-negotiable)

- **Nothing frightening:** no darkness, monsters that menace, chases that end badly, loud sudden sounds, falls
  with injury, crying that is not comforted within the same clip, blood or any hitting. Montage Basic adds a bloody
  nose after a punch on its own, so there is no contact violence at all, not even cartoon slapstick on people.
- **No dangerous imitation:** no climbing on furniture, matches, knives, open water without an adult, running into
  roads, medicine or cleaning products, strangers offering things.
- **Real people in reference pictures are adults only.** A parent, teacher or presenter can appear from their own
  photo (with their consent). Never upload, generate or request a photorealistic picture of a real child.
  If the human supplies a photo of a child, do not silently drop it (the supplied-picture rule still holds)
  and do not render it: stop and tell them we can't use photos of real children; offer an animated character or
  an animal hero instead, and ask how to proceed.
- **Child characters, if the story needs them,** are clearly stylised, invented animated characters (a 3D or
  painted cartoon look, `realism: 0`), never photoreal.
- **No brands, logos or famous characters.** Never name a famous cartoon, studio or toy line as a style shortcut;
  describe the look in your own words.
- **Premium follows the prompt closely; you restrict it.** For kids on Premium, end `[Constraints]` with "No
  violence, no blood, no scary imagery." Kids' content almost never needs Premium anyway.

## 1. Pick the route

| the human wants | route |
|---|---|
| a song kids sing along to (they have the song) | the customer's own audio file -> `POST /api/v1/director/videos/music` with `lipsync: "none"` + `idea` (section 5) |
| a song, but they have none | `POST /api/v1/director/music/generate` (your own original lyrics) -> the same music call with `song_job` |
| a bedtime or picture-book story with a narrator | a film (your own `clips`, or an `idea`) with `no_speech` and narration laid on, or `film_type: "explainer"` with a light, bright voice (references/montage/pixio-explainers.md) |
| a little learning video (colours, counting, animals) | `film_type: "explainer"`, slow pace, one thing per sentence |
| characters who talk on screen | a film from an `idea` with short lines, voices from `ref_audios` or `voice_lock: true` |
| a series with the same friends every week | `/api/v1/director/series` (references/montage/pixio-series-showrunner.md) |

Background music alone is not a song: only use the music-video route when a song is wanted. For a quiet bed under a
story, packaging `score` (`"auto"` or a description) makes an instrumental of the video's length.

## 2. Characters kids love

- **Animals first:** a small round bear, a duck in rain boots, a sleepy owl, a hedgehog with a red scarf. One
  defining prop or colour each; describe them in the same words in every clip.
- **Friendly vehicles and toys:** a little yellow tractor, a wind-up robot, a teddy. If an object is a character,
  say so ("the little yellow tractor is a friendly character with big round headlight eyes"). Everything else must
  stay an object: "plants, fruit and objects are ordinary and lifeless with no faces" (animation styles give props
  faces otherwise).
- **A reference picture per character** (`POST /api/v1/director/images/text`): plain pale background, full body,
  front view, neutral standing pose, bright even light, no text, "an empty scene with nobody else in it". Make each
  one, check it, regenerate with a new seed until it is right. Use it in every clip.
- **Exactly who is in each shot:** "Pip the duck is the only character in this shot." Without it Montage Basic adds
  extras or copies the hero. One picture per character; never "three ducks like `<Picture 1>`" (identical clones).
- **Different shapes and colours** for each friend (a tall green frog, a small orange fox), so they never blend.
- **Style line, the same in every clip:** "Stylized 3D animated film look, soft bright daylight, rounded shapes,
  big friendly eyes, clean simple backgrounds, gentle saturated colours." On Premium add "no change in head-to-body
  ratio". Set `realism: 0` on every animated job (high realism is for real skin), and leave out "pores" and
  "no makeup".

## 3. Story and pacing

- **One goal, one small problem, one kind solution.** "Pip wants to jump in the big puddle; it is too deep; Frog
  shows him the little puddles; they jump in every one." Under 60 s: two or three beats; never a villain.
- **Repetition is the joy.** The same action three times with one change (small puddle, middle puddle, big
  puddle). Repeat the opening shot's framing at the end.
- **Slow and calm:** 3-4 shots per 15 s clip, each 3.5-5 s. Camera Static or a slow move from the trained
  vocabulary ("The camera pushes in with small amplitude at slow speed"). No fast cuts, no shaky camera, no
  whip moves.
- **One action per shot, big and clear,** framed medium or close so faces and gestures read on a small screen.
- **Bright, warm light** in every shot: morning sun, soft daylight, a cosy lamp at bedtime (a bedtime story is
  cosy and lit, never dark).
- **End every clip on a happy hold:** a smile, a wave, a hug between two characters standing side by side (no
  hand-in-hand close-ups: hands melt).
- **Every clip ends where it can stop.** Joins go where the place or time changes.

## 4. Narration and voices

- **Narration pace 1.8-2.0 words per second,** shorter sentences than for adults. A 60 s story is about 110-120
  words. Leave pauses.
- **Voice:** pick from `GET /api/v1/director/voiceover/voices` (free; 54 voices in 8 languages, each with its
  language); a light, bright voice suits kids. Never invent an id. A parent's or teacher's own voice: a clean
  5-15 s sample with their consent (`voiceover_sample` on films and packaging, `voice_sample` on
  `audio/voiceover`).
- **Narration on its own:** `POST /api/v1/director/audio/voiceover` (`text` up to 5000 characters, `voice`, `speed`,
  `pause_s`) and lay it on with packaging (a `voiceover` file) or `POST /api/v1/director/videos/assemble`
  (`audio_tracks`). Clips under narration go in `no_speech` (`[1, 2, 3, 4]`) so nobody on screen mumbles.
- **Characters who talk:** lines of 3-6 simple words, plain full sentences, about 2.6 words per second plus 1 s
  of hold on Basic, never in the last second of a clip. Describe the voice once ("in a small, cheerful, high
  voice").
- **Captions** help early readers: `package.captions` `"auto"` with `caption_style` `subtitle` or `pop`.

## 5. Sung kids' videos: `/api/v1/director/videos/music` with `lipsync: "none"`

`lipsync: "none"` makes a **story music video**: nobody on screen sings or lip-syncs, the song stays the soundtrack
unchanged, and the writer tells a story cut to the song's sections and energy (action on the loud parts and
choruses, quiet looks in the soft parts). No vocal separation is needed, so it is a little faster. It is the right
choice for animal and cartoon characters, which lip-sync poorly; use `performance` (the default) only for a real
adult singer on camera (see references/montage/pixio-music-video.md).

- **The customer's own song comes first** (almost every music video). `song`: mp3, m4a, wav, flac..., up to 6 min.
  Generate one only when they have none.
- **Never echo private lyrics** into logs, notes, prompts or public places. Lyrics are never put into video prompts;
  the song carries them.
- `images`: 1-9 pictures (the characters and the places), with `references` saying what each one shows, in order.
  `make_references` (default true) lets the writer design a few place or prop pictures (billed per picture made).
- `idea`: the story in a few sentences, plus "bright, gentle, nothing scary, for children aged 2-5".
- `style`, `aspect` (`16:9`, `9:16`, `1:1`), `realism: 0` for animation, `speed: "draft"` for a cheaper first look
  (then `POST /api/v1/director/videos/music/{id}/final` renders it at full quality with the same song, sections,
  pictures and seeds).
- **Sing-along words on screen:** see references/montage/pixio-lyric-captions.md (only with the customer's
  permission to show them).

**No song yet:** write short, original, simple lyrics yourself (or use the customer's), with section tags on their
own lines, then:

```bash
curl -fsS -X POST "$BASE/api/v1/director/music/generate" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"prompt": "a bright, bouncy song for small children, ukulele, glockenspiel and hand claps, cheerful female voice, 110 BPM, simple and singable", "lyrics": "[verse]\nLittle Pip in yellow boots\n...\n[chorus]\nSplash, splash, splash!\n...", "duration": 60}'
```

(`prompt` up to 4000 characters, `lyrics` up to 6000; `instrumental: true` for no vocals; `seed` for the same song
again. The song ends when its structure is complete and can come back shorter than `duration`: the job then shows
`durationShort`; add sections, or `fill: "loop"`.) Poll `GET /api/v1/director/jobs/{id}` until `done`, then quote
the video:

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/music?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-basic -F song_job=SONG_JOB_ID -F lipsync=none -F realism=0 -F aspect=16:9 \
  --form-string "idea=Pip the duck wants to jump in the biggest puddle in the park. Frog shows him the little puddles first; they splash in every one and end in the big one together, laughing. Bright, gentle, nothing scary, for children aged 2-5." \
  --form-string "style=stylized 3D animated film look, soft bright daylight, rounded shapes, big friendly eyes, simple clean park" \
  -F images=@pip_duck.png -F images=@frog.png -F images=@park.png \
  --form-string 'references=["Pip, a small yellow duckling in red rain boots","Frog, a tall friendly green frog with a blue cap","the sunny park with puddles"]'
```

Show the human `credits.quoted`, then send the same request without `?check=true`. With the customer's own file use
`-F song=@their_song.mp3` instead of `song_job`.

## 6. A worked story clip (Basic, official format, shortened)

```text
subject_definitions:
<Subject 1> is Pip in <Picture 1>, a small round yellow duckling in bright red rain boots, a friendly animated character.
<Subject 2> is Frog in <Picture 2>, a tall friendly green frog in a small blue cap, a friendly animated character.
<Subject 3> is the park in <Picture 3>, a sunny green park with a winding path and three round puddles, small, middle and big.
summary:
[reference generation] <Subject 1> and <Subject 2> jump into the small puddle together in the sunny park.
retention_analysis:
<Subject 1> (appears in [Shot 1], [Shot 2], [Shot 3]): fully_preserved - shape, colours and boots retained.
<Subject 2> (appears in [Shot 2], [Shot 3]): fully_preserved - shape, colours and cap retained.
<Subject 3> (appears in [Shot 1], [Shot 2], [Shot 3]): partially_preserved - layout kept.
detailed_description:
The target video is a stylized 3D animated film with soft bright morning daylight, rounded shapes, big friendly eyes and gentle saturated colours. <Subject 1> and <Subject 2> are the only characters anywhere in the video; trees, flowers and puddles are ordinary and lifeless with no faces.
[Shot 1] A medium static shot of <Subject 1> standing at the edge of the small puddle, looking down at his red boots, wiggling with excitement. Static Shot, holding.
[Shot 2] At 00:04.500, the camera cuts to a wide shot: <Subject 2> hops in beside <Subject 1>; both bend their knees together. The camera pulls out with small amplitude at slow speed.
[Shot 3] At 00:09.000, the camera cuts to a medium shot: both jump and land in the small puddle with a gentle splash of droplets, then smile at each other side by side. Static Shot, holding.
overall_soundscape: Birdsong in the park; a soft squeak of rubber boots in Shot 1; a gentle splash in Shot 3. No other voices.
non_diegetic_music: A light ukulele and glockenspiel melody, slow and bouncy, the same in every clip.
```

Film request for this story (narrated, nobody speaking on screen), quoted first:

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/film?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-basic -F duration=60 -F realism=0 -F "clips=<clips.json" -F 'no_speech=[1,2,3,4]' \
  -F images=@pip_duck.png -F images=@frog.png -F images=@park.png \
  --form-string 'package={"voiceover_text": "Pip loves puddles. ...", "voiceover_voice": "<voice id from the list>", "captions": "auto"}'
```

(`voiceover_text` in packaging takes up to 1500 characters; longer narration goes through
`/api/v1/director/audio/voiceover`. A typed voiceover and captions do not change the packaging price.)

## 7. After the render

- Watch it as a parent would: is anything scary, sad without comfort, unsafe to copy, or confusing?
  `GET /api/v1/director/jobs/{id}/shots` (free) gives a thumbnail of every shot for a quick scan.
- Check identity in every shot: the hero changed colour or shape, a second Pip, a prop or tree that grew a face.
- Speech and narration: every word clear; nothing cut off at a clip's end.
- One bad section: `POST /api/v1/director/videos/music/{id}/redo` `{"section": 3, "seed": 777}`; one bad film clip:
  `POST /api/v1/director/videos/film/{id}/redo` `{"clip": 2}`. Each returns a new job and is billed.

## Checklist

- [ ] Nothing scary, violent or unsafe to imitate; no blood; bright light in every shot
- [ ] No real child in any picture; real people only adults with consent; a supplied child photo raised with the human
- [ ] One friendly hero, one goal, one gentle problem, repetition; 3-4 slow shots per 15 s
- [ ] Every character has its own checked picture; exact cast per shot; objects stay lifeless unless they are characters
- [ ] `realism: 0` for animation; the same style line in every clip; no famous names; no grain words
- [ ] Song: the customer's own first; lyrics never echoed into logs or prompts; `lipsync: "none"` + `idea` + pictures
- [ ] Narration 1.8-2.0 words/s with a voice id from the live list
- [ ] Tests on Montage Basic; `?check=true` quote shown and a yes before anything is started
