---
name: montage-basic-prompting
description: How to write prompts for Montage Basic (Pixio's Director API, `video_model: "montage-basic"`, plus Montage's image model) that render right the first time - single clips, image-to-video, reference-to-video and films of 30 s to 7 min. Use whenever you write, review or fix a prompt for /api/v1/director/videos/*, /api/v1/director/images/* or /api/v1/director/videos/film, or plan a multi-clip film.
---

# Prompting Montage Basic right

Montage Basic is the default video model of Montage (Pixio's Director API): when `video_model` is left out, the
shot, film or music video renders on `montage-basic`. Every call is billed in Pixio credits, Basic included; prices
are in `GET /api/v1/director/catalog`, and `?check=true` gives a free quote on `videos/text|image|reference|music|film`.
Prompt limit: `prompt` 8000 characters on Montage Basic (30000 on Premium and Ultra).

## 0. FIRST: use the official formats

**Reference mode (any request with reference pictures, e.g. /api/v1/director/videos/reference and /api/v1/director/videos/film) uses SIX sections, in this order:**
```
subject_definitions:
<Subject 1> is the young courier in <Picture 1> and <Picture 2>, with ... (one line per person / place / prop; describe the main features once)
<Subject 2> is the subway platform in <Picture 3>, with ... (locations are subjects too)
<Audio 1> is the voice-timbre reference for <Subject 1> (S1).   (only if a voice sample is sent)
summary:
[reference generation] One short paragraph: what happens, using only the labels above.
retention_analysis:
<Subject 1> (appears in [Shot 1], [Shot 3]): fully_preserved - face, hair and outfit retained.
<Subject 2> (appears in [Shot 2]): partially_preserved - layout kept; the crowd is new.
detailed_description:
One or two sentences of style first (e.g. "The target video is a 3D CG animated film with ..."), then
[Shot 1] ... [Shot 2] At 00:03.500, the shot cuts to ...   (350-500 words in total)
overall_soundscape: 1-4 plain sentences of ambience and physical sounds (no dialogue).
non_diegetic_music: 1-3 sentences: instruments, tempo, dynamics. No mood words. Or N/A.
```
- **Retention markers:** `fully_preserved` (keep it all), `partially_preserved` (keep the identity; the pose, background or details are new; use this to stop pose copying), `attribute_transfer`, `weak_reference` (style or atmosphere only).
- **Define each subject once.** In the shots, write `<Subject 1>` plus only what is visible right now. Don't paste the full description again in every shot.
- **Use `<Picture N>` on its own** only for a frame anchor ("the shot begins from `<Picture 4>`"). Otherwise pictures belong inside a Subject definition.
- **Speaking:** `<Subject 1> (S1), in a quick, husky young female voice, says: <d>[English] Words.</d>`. Describe the voice once, at its first line.
- **Voiceover:** `says in an off-screen voiceover: <d>...</d> while her lips remain completely closed.`
- **Lip-sync to a real song or line (Audio Lock):** on `/api/v1/director/videos/reference` send the audio in `audios` and set `audio_lock=1`, so the clip is kept 1:1 as the soundtrack and only the picture is generated. In the prompt, write `<Audio 1>: fully_copy - <Audio 1> is reused 1:1 as the target video's complete final audio track.` in `retention_analysis`, and start the summary with `[reference generation + audio reuse]`. With older wording the audio matched at r=0.38-0.69; with these markers ~0.98, and with the lock 0.99.
- **Lines across a cut:** use `<scenetrans>`. A line cut off at the end of the video: `<cutoff>`.
- **Text-to-video / image-to-video** use `integrated_multimodal_description:` + `overall_soundscape:` + `non_diegetic_music:`. Shot 1 starts with the style ("3D CG, ..." / "Live-action, cinematic, ..."). Image-to-video starts with `For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.` and a blank line.
- **Camera: use ONLY the trained vocabulary.** Zoom In/Out, Push In/Pull Out, Pan Left/Right, Truck Left/Right, Tilt Up/Down, Pedestal Up/Down, Arc Shot, Tracking Shot, Static Shot, Shake Slightly/Strongly, POV, Roll Clockwise/Counterclockwise. Add "with small/large amplitude" and "at slow/fast speed". Write it as a sentence: "The camera pushes in with large amplitude at fast speed toward ...". Not crane, dolly, whip pan, crash zoom, snap zoom, orbit or aerial dive.
- **A cut must bring new information** (subject, space, state, viewpoint or time). For a small change of framing, use camera motion instead of a cut.
- **Prefer concrete detail to abstract words** like "cinematic" or "beautiful".

Every rule here comes from renders checked frame by frame and with speech-to-text.
Before you submit, run the checker: `POST /api/v1/director/prompts/check` (free, synchronous), or add `?check=true` to
the render URL for a free quote plus the same report. Official-format prompts with checker errors are refused with
`422 prompt_check_failed` (the report is in `promptCheck`; nothing is charged); `strict_prompt=false` renders anyway.
Callers can also send `fix_prompt: "safe"` (instant rules: off-vocabulary camera words -> trained moves, grain words
and "no crowd" clauses removed) or `"ai"` (the checker's remaining findings are fixed too, nothing else; costs a little
more, see the catalog) on the shot, film and music endpoints.

Faces: a named person stays recognisable only when the face is at least ~13% of the frame height (knees-up or closer). Far or full-body shots of them: from behind, in silhouette or face turned away. Never describe a pictured face in words (shape, eyes, brows, nose, lips, skin, makeup) - the pictures carry it. For films and music videos, `face_fix: "auto"` face-fixes any shot that still drifted (far shot measured 0.37 -> 0.71 likeness). Group shots: `POST /api/v1/director/videos/facefix` with `"people": "all"` (and `job_id`) fixes every named person, one pass each. Lips that drift from the song or words in any finished video (Montage Basic or Premium): `POST /api/v1/director/videos/lipfix` with `job_id` (or an uploaded `video`), `start_s`, `end_s` (any 4-14 s window) makes that window again with one reference render (<Video 1> = the window, <Audio 1> = its vocal, locked) and puts it in place; leave `prompt` out (it is auto-built). To CHANGE something in a finished video (colour, weather, an object, a costume) instead of re-rendering it: `POST /api/v1/director/videos/edit` (Montage Edit) with a short plain instruction ("make it night with rain"; say only what changes, no Montage Basic format, no <Picture N> tags: describe each reference picture's role in words), on the whole video (up to 15 s) or `start_s`/`end_s` (1-15 s, spliced back); `audio` only when the sound should change too. It is priced from a quote of the exact request; see `GET /api/v1/director/catalog` (and `references/montage/montage-edit-prompting.md`).

Visual QA (`visual_qa: "local"` or `"full"` on /api/v1/director/videos/film and /api/v1/director/videos/music) is opt-in per request and priced per 15 s part: findings come back in the job's `qaIssues` (clones, extra faces and unwanted on-screen text; other findings are "check by eye"). It stays optional and off by default.
Fix every ERROR. Read every WARN.

## 1. The format (required)

```
integrated_multimodal_description: [Shot 1] <LOOK LINE>. <where>. <who: full description>. <one action>. <one camera move>.
[Shot 2] At 00:03.500, the camera cuts to <framing>: <who> <one action>. <camera move>.
[Shot 3] At 00:07.000, the camera cuts to ...  She says: (S1) <d>[English] Exact words here.</d> Static camera, holding.
overall_soundscape: <sounds tied to shots: "Shot 1: ... Shot 2: ...">
non_diegetic_music: <score with cues, or N/A>
```
- Shot 1 has no timestamp. Every later shot starts with `At MM:SS.mmm, the camera cuts to`. Timestamps strictly increase.
- **One action and one camera move per shot.** Two actions in one shot are merged or dropped.
- **Shots per clip:** 15 s = 4-5 shots, 10 s = 3, 5 s = 1-2. Each shot is at least 2.5 s, ideally 3 s or more.
- Always write both `overall_soundscape:` and `non_diegetic_music:`; otherwise the model invents sound and music.

## 2. Dialogue (the most common failure)
- Format: `(S1) <d>[English] Words.</d>`. Use one speaker ID per voice, numbered by order of first speech in that clip.
- **Budget about 2.6 words per second, plus 1 s of silence after the line.** "Keep your eyes down. Keep your mouth shut. Never owe anybody." is 11 words, which needs a shot of 5+ s.
- A line crammed into the last second of a clip comes out rushed or garbled. This happened: 7 words in the last 3.5 s sounded like nonsense.
- Dialogue in the last shot: start that shot early (about 10 s into a 15 s clip) and end on a silent hold.
- Faces must be close-up or medium for dialogue. Never put a line on a tiny face in a wide shot.
- Use plain, natural sentences. Clipped slang fragments ("Don't owe nobody") read as nonsense to viewers.
- To keep a voice the same, upload a clean 5-10 s voice sample and tie the speaker to it with the `<Audio N> is the voice-timbre reference for <Subject K> (Sx).` line: on `/api/v1/director/videos/reference` the sample goes in `audios`; on `/api/v1/director/videos/film` in `ref_audios` (say whose each is in `voices`).
- Dialogue: put who speaks and who stays silent BEFORE the line (or at the start of the shot), e.g. 'Nobody else speaks; every other mouth stays closed. (S1) <d>[English] Line.</d>'. After `</d>` write only camera or action - a speech direction there ('says', 'mouth', 'lips', 'silent') is sometimes spoken aloud as part of the line. The prompt check warns about it.
- Voiceover without a recording: packaging `voiceover_text` (a script, up to 1500 characters, read by a studio voice) with `voiceover_voice` (an id from `GET /api/v1/director/voiceover/voices`; `am_michael`, when listed, is clear on brand names); keep it short enough to end before the end card (about 2.5 words a second). When a narrator is used, keep the clip's own dialogue to a minimum.
- Brand ads: never ask the video model for on-screen text, logos or captions. Write the ad clean and add them with packaging (`captions`, `legal`, `packshot`, end card), which draws real pixels. For a 6-15 s ad use `/api/v1/director/prompts/write` with `mode=reference` and `film_type=commercial`, then `/api/v1/director/videos/reference` with `brand_id` / `package`.
- Keep all voice samples together at 15 s or less (the model's limit). With an AI-written film (`idea`), say whose voice each sample is in `voices`. Better, on `/api/v1/director/videos/film` send `cast` (`[{"name": "Mara", "pictures": [1, 2], "audio": 1}, ...]`; positions in `images` and `ref_audios`): the writer gets exact bindings, your own clips get the missing `<Audio N> is the voice-timbre reference for <Subject K> (Sx).` lines (Sx = that person's speaker number in THAT clip), and voice lock and the voice check follow it. To play a real recording word for word in one film clip, use `clip_audio_lock` (e.g. `{"2": 1}`) and write that clip's soundscape as `<Audio 1> plays exactly as uploaded, completely unchanged, as the complete soundtrack of the target video`.

## 3. People and realism
- On films, music videos and remakes, `realism` (0 to 1) sets how photographic the result is. Don't write trigger words for it; the field does the work. Set `realism: 0` for animation (section 4b).
- **Write the skin out** for every person: "natural skin with visible pores, fine lines, faint freckles, a light sheen of sweat, no makeup". Without it, faces look plastic.
- Give each person a fixed description: age, hair, face marks, clothes. Paste it **word for word** in every shot and every clip where they appear.
- Use a camera/light line such as "shot on a cinema camera, 35mm lens, practical light only, clean digital cinema image". Use the same line in every clip of a film. Never name a camera model or brand ("ARRI Alexa 35", "RED", "Sony Venice"): the model paints it as text (one test showed "ALEXA 35" lettering on a window).
- **No grain:** never write film grain, sensor noise, Kodak/Vision3 or other film-stock names. Write "clean digital cinema image". House rule: no grain.
- **Never name famous films, shows or actors.** Doing so pulls in real actors' likeness. Describe the style in your own words.

## 4. Reference images (`<Picture N>`): use as many as help, up to 9
- Montage Basic takes up to 9 `images` per request (Montage Premium and Ultra up to 30). Pictures are numbered in upload order. `<Picture 1>` must be the same file in every clip of a film.
- **Make a reference for everything that comes back:**
  - each character (face close-up, and optionally a full-body shot);
  - each recurring prop (case, monitor, door, panel, weapon);
  - each location (corridor, cell, room).
- Props without a reference change shape between shots. In tests a case became a tablet, and a door became warped double doors.
- Reference photos have a plain grey background, even light, and **no text, logos or numbers**; text comes out garbled.
- **One picture equals one face.** "Two guards dressed like the guard in `<Picture 5>`" gives two identical twins. Give each extra person their own description ("one is a heavyset bald man with a grey moustache, the other a tall young woman with her hair in a bun"), and use the picture only for the uniform.
- Name the reference in the shot: "the nurse from `<Picture 1>`", "the door from `<Picture 4>`".
- In reference mode, high-resolution references leaked the photo's background, so reference mode renders at a modest frame size; the picture's job is identity, not detail.
- **Don't describe a pictured person's face in words.** That covers eye shape or colour, brows, nose, jaw, lips, skin tone and makeup. The model redraws the face from the words and it drifts from the picture. Write "the woman in `<Picture 1>`, with exactly her face, features and skin from `<Picture 1>`", and spend the words on clothes, pose, place and light. Measured on `/api/v1/director/images/reference`, and the same logic applies to video references.
- **Faces need pixels.** In a wide or full-body frame the face is about 330 px tall at 4 MP and loses likeness. A medium shot (about 435 px) held it best. More steps (12 vs 6) didn't help.
- **Image references, best clarity:**
  - send a sharp photo of 1024 px or more on the short side (2048 is best);
  - send 1-2 pictures (3+ drifted faces and broke wings): her face first, then the place;
  - use `megapixels=8` for finals (16 for the most resolution).
- For one character in many places: cast with text, lock the face with 1 picture, build places with text, make hero frames with face + place (`/api/v1/director/images/reference`), then do a face-first lock pass.

## No duplicate people (read before every film or music video)

- **One subject per person.** Every person is ONE `<Subject N>`. Every picture of that person (the main picture, a face close-up, her in a place) goes in that same line: "<Subject 1> is the singer in <Picture 1>, <Picture 3> (her face close-up) and <Picture 4> (her at the window)". A second `<Subject N>` for another picture of her puts two of her in the shot.
- **One picture = one face.** Never reuse a person's picture for someone else ("two guards dressed like the guard in <Picture 5>" gave identical twins). Give every extra person their own picture, or describe them so they can only be someone different.
- **Name exactly who may appear.** Say it in the style sentences: "<Subject 1> is the only person anywhere in the video", or the exact cast "<Subject 1> and <Subject 2>, each appearing once". Without it the model adds extras and copies.
- **No reflections.** Mirrors, windows at night and shiny surfaces show a second her. Write "no reflections of her in glass or mirrors"; at a night window light her from the city side or put a dark wall behind her.
- **No doubling words.** Never "mirrored framing", "split screen", "twin", "double" or "side by side" for one person.
- **Hard cuts only.** "Every transition is a clean hard cut, no dissolves or double exposures": a dissolve shows two of her at once.
- **Crowds as silhouettes.** Crowds only as silhouettes, backs or raised hands, every one a clearly different person; never a row of faces (they come out as clones).
- **Two-shots front-on, nobody in the foreground.** "A two-shot over the counter, both faces visible" put a second Tom (the back of his head) in the foreground: an over-the-shoulder set-up asks for a person seen from behind, and the model copies someone already in the shot. Write "a front-on two-shot from across the counter; exactly two people are in the frame, both facing the camera; nobody in the foreground, no shoulder or back of a head in frame". Never "over the shoulder", "OTS", "reverse shot", "over the counter / table / desk / bar", "back of his head" or "from behind <Subject N>" while that face is shown, unless the foreground person is a different defined subject seen only from behind. One person in a shot: "<Subject 1> is the only person in the frame".
- **Bind several pictures of one person.** After her subject line: "<Picture 1> and <Picture 3> all show the same single person, <Subject 1>; exactly one <Subject 1> appears in every shot <Subject 1> is in". The checker warns without it; `fix_prompt=safe` adds it.
- **Two people in a close shot.** Keep both in frame and name them by build and clothes in that shot; a torso-only close-up of one turns the other into a copy of them.
- **Check every render.** Look at about one frame per second for duplicates, missing or swapped people. The automatic checks don't count every face; redo just that clip or section.

## 4b. Getting exactly what you want: describe it so it can only be one thing
The model fills every gap with the most generic version of a word. These are real failures from one film:
- **Specific objects:** "a sharpened toothbrush" rendered as a normal toothbrush, bristles and all. The fix was to describe how it is built and which end does what: "a white plastic toothbrush; the bristle head is wrapped in black tape as the grip; at the opposite end a razor blade is melted into the tip of the handle". Then make that object a reference image and check the image before rendering video.
- **Where things happen on the body:** "stabs him" landed in the chest. Name the exact spot: "into the lower side of his back, just above the hip; his chest is untouched".
- **Crowds:** "inmates" gave rows of identical clones with garbled text on their backs. The fix:
  - make 1-2 **lineup references** of 7 clearly different adults each (age, race, build and hair named one by one);
  - write "every one a clearly different person like the men in `<Picture N>`";
  - write "plain, unmarked" clothes.
- **Gimmicks:** a contraband drone turned into a silver package on the ground, and a phone subplot read as silly. Small flying or tech props render badly. Keep stories physical and grounded.
- **Key moments:** make an **event keyframe** with Montage's image model in reference mode (`/api/v1/director/images/reference`), built from the character refs (e.g. the stab at the fence). Add it as a reference, and write "exactly as in `<Picture N>`" in that shot.
- **Event keyframes and lineup references freeze action:** "exactly as in `<Picture N>`" made a stabbing a posed tableau, and a crowd lineup reference made the yard crowd stand in a posed row. Use them only for still moments. For action, give only the people, the prop and the place, and write it as violent handheld close-ups ("shaky handheld close-up, bloodshot eyes inches from his face, a brutal headbutt"), one hit per shot.
- **Every word in a character description shows up, in every shot.** "A small cut on his lower lip" in Danny's description gave him a bloody mouth throughout a fight he never got hit in. Put injuries in a description only if they should be visible all the time. Otherwise write "mouth and lips clean and unhurt", and add blood only in the shot where it happens.
- **A close-up on a wound or body part drops the attacker.** "Locked on the slash" filmed only Kane's torso, so the man with the knife vanished. Frame action so both people stay in it: "over Danny's shoulder, the back of his head in the foreground" or "a two-shot with BOTH men clearly in frame".
- **Torso shots clone the biggest person.** With only a white tank top in frame, the attacker became a second copy of the heavy man. Name every person in an action shot by build: "only two men in the shot: heavy tattooed Kane and lean young Danny".
- **Write the contact, or it won't happen.** "Danny punches Kane" was skipped. "Danny's fist swings up into frame and smashes into Kane's jaw, his head snapping sideways" landed. One blow per shot, described as visible contact plus the reaction.
- **Lock the room's layout, not just the room.** A location reference keeps the style, but the layout drifts from shot to shot: the pegboard moves, a window becomes an open garage door. Write the same fixed geography into every shot in that place: "behind him the pegboard wall of tools on the left, the small night window on the right, string lights overhead". Keep the camera on the same side of the room (the 180-degree rule).
- **Every voice you describe gets words.** "A guard shouting count" made the model invent lines ("How's it going, Mike? ... Green lights!"). Give the exact words in `<d>` tags, or write the sound with "no words" ("a wordless shout"). End `overall_soundscape` with "No other voices."
- **Reference poses get copied.** Tío's portrait had his hand on his chin, and his final shot struck the same pose. Make reference portraits in a neutral pose (arms down, facing the camera) unless that pose is wanted.
- **A shared style line can add people.** "Stylized characters with large expressive eyes" in the style line put random cartoon kids into the prop and location pictures. For props and places use a style line without characters, plus "an empty scene with nobody in it".
- **Objects come alive in animation.** A style line like "stylized characters with large expressive eyes" gave a berry prop a face, both in its reference picture and nearly in the video. In the video's style sentence, say which things are characters and that "plants, fruit and objects are ordinary and lifeless with no faces". In the prop's subject definition, add "an ordinary inanimate object with no face, no eyes and no mouth".
- **A prop must look the same in every picture it appears in.** The cliff location picture had a small berry cluster on the bush, while the prop picture had one giant berry, so wide shots showed the cluster and close-ups the giant berry. When a location picture includes a key prop, make it match the prop picture, or leave the prop out of the location picture.
- **Animation:** set `realism: 0` (realism is for real skin), and leave out "pores" and "no makeup".
- **Small hand business near the face fails.** "Lights a cigarette with a match" rendered with no cigarette: a burning match held to his lips. Lighting, smoking, eating and drinking in close-up go wrong easily. Cut them, or show them in a wider shot.
- **Keep fights grounded.** A headbutt reads as silly. A punch and then the weapon reads as real.
- **Render two takes of any action clip** (two seeds) and keep the one with the right people, a visible hit and the wound in the right place. Dialogue scenes usually work first time; fights rarely do.
- **Intensity comes from close-ups:** faces filling the frame with shallow depth of field, sweat and blood on the skin, and impact felt through eyes and breath. A wide fight looks staged.
- **Check references cheaply first:** a reference image takes about 15-25 s and a video clip several minutes. Look at every reference (right object, right end, right person, no text, adults only) and regenerate it with a new seed until it is right. Only then render video.
- **Per-clip references:** each clip may use its own set of up to 9 references (`clip_images`). Keep the main characters in every clip, and add that clip's location, crowd and event keyframe. Name them in the prompt by role ("the nurse from `<Picture 1>`").

## Supplied pictures are always used (house rule)
If a photo is supplied, use it. Never drop or ignore a caller-supplied reference picture: not for fights, speed, quality or anything else (no "render this clip without its pictures to go faster"). When pictures are chosen per clip (`clip_images`, or the AI writer for long films), every supplied picture must appear in every clip that shows its subject or place, and somewhere in the film. The long-film planner keeps up to 9 pictures per clip and adds any supplied picture it left out to the clips that name its subject. After the render, read the job's `pictures` list (`number`, `tag`, `designed`, `what`, `url`) to confirm that each of yours was used; a picture that no clip names, or that your own `clip_images` leaves out, is a mistake to fix with a redo.

## 5. Objects, text and the world
- Spell out unusual objects exactly: "a single narrow white six-panel door, hinged on the left". Don't write just "the door".
- On-screen text, signs and labels come out garbled. Avoid them, or keep them to 1-2 short words in quotes.
- Describe what IS there. There is no negative prompt, and lists like "no X, no Y" hurt.
- **Shadow people in the background come from the prompt.** "She is the only person anywhere in the video; no other people, no crowd, no dancers" draws a crowd: there is no negative prompt, and every word shows up. The same goes for "crowd silhouettes" in atmosphere shots. When only the cast should appear, never name crowds, dancers, silhouettes, figures or "other people" at all; describe each place positively as empty ("the club is empty after hours, every booth and the dance floor empty"; "the street is deserted"). Use silhouettes only when the idea really has a crowd. The checker warns (78 % of stored music prompts had it).
- Gimmicky details distract: a smuggled-phone subplot read as silly. Keep stories grounded and physical.

## 6. Action and violence
- Montage Basic is weak at long fight choreography. Cut fights into **short shots with one blow or move each**, handheld and close: "drives his elbow into Kane's face; Kane's head snaps back, blood from his nose".
- Show impact and aftermath (blood on a shirt, split knuckles, a bruised eye), not lingering gore.

### Fight rules (measured on Montage Basic in a fight lab)
A failed 7-clip brawl showed fists that stopped short and never landed, two attackers posed with their fists meeting in a
mirrored tableau, bodies flying upside down or floating with nothing hitting them, and shots of men already down in
place of the action. A controlled test then varied one thing at a time: the same two fighters, the same place and seed,
two takes each, scored by planned beats that visibly landed.

| How the fight was written | Beats landed (take 1 / take 2) |
|---|---|
| **6 shots of ~2.5 s, each "cuts mid-move", opening mid-action** ("the guard is already lunging, his fist swinging") | **6/6, 6/6: the template; action from 0.5 s, no dead seconds** |
| 6 shots of ~2.5 s, each "cuts mid-move", no end hold (opening on a stance) | 5/5, 5/5 |
| 4 shots of 3.5 s, one move each, ending on a hold | 3/3, 3/3, but 3 s of posing in the stance opening |
| two attackers strictly one at a time, "ONLY two men in frame" | 2/2, 2/2, no cloning; big moves came out soft |
| swords: an overhead cut, a deflection with sparks, a disarm | the hits and the disarm land; the blades sit crossed for 1.5-2 s after the parry |
| swords, opening mid-swing, with a follow-through for the deflected blade | the pauldron hits and the disarm land 2/2; the parry still holds 1-1.5 s |
| one continuous take ("first... then... then...") | **2/4, 3/4 (worst)**: slap-fights, a posed "high-five", 4 s of standing |

- **A fight clip is 6 shots of ~2.5 s**, each "cuts mid-move". Never write a fight as one continuous take.
- **Change the camera on every fight shot.** The model only cuts where the framing changes: four shots all written "close two-shot" rendered as ONE slow 11 s take (1 real cut per clip, in every early test), and that is most of why fights felt slow. Over the hero's shoulder → a low angle from the ground → the reverse over the attacker's shoulder → a tight close-up of the face taking the hit → a chest-high medium → a wide for the fall gave 4-5 real cuts per clip. Never the same framing twice in a row.
- **No slow-motion cues in a fight:** not "slow motion", "lingering", "graceful", "balletic", "dramatic pause", "time slows", "dreamlike", and no camera move "at slow speed" in a fight shot. The model already plays fights slower than real (the failed brawl had such cues in 4 of 7 fight clips). The checker warns.
- **Add speed wording to every fight clip:** in the style line, "fast, explosive, full real-time speed: every punch snaps out and lands in a fraction of a second, bodies react instantly and violently, no slow motion, no lingering", and on each fight shot "the camera whips with large amplitude at fast speed". With the angle change, the punch-and-duck took about 1 s instead of 2. Best measured: angle per shot plus speed words, 5-6 real cuts per clip, 0% still.
- **Make the two fighters look completely different:** a colour, hair and build (a red bomber jacket and a shaved head against a grey hoodie and long blond hair, lean against heavy). The best measured fight (15 s, text-to-video, every rule) had exactly that: 4-5 real cuts, about twice the motion of the lab takes, every beat landing in both takes, no double hands, and nobody confused.
- **The face close-up is the shortest shot (about 1.5 s) and has travel too** ("his head snaps sideways and he staggers out of frame"). A face holding still held for 2 s in every take.
- **Blood follows the tone:** the model adds a bloody nose after a punch on its own; write "no blood" when the story doesn't want it.
- **Every reaction shows its blow in the same shot.** "His head is still snapping round from the elbow" (a reaction cut away from its blow) rendered as a head jiggling with nothing hitting it. Write "the fist swings into frame and cracks into his cheekbone; his head snaps sideways".
- **Reference pictures slow fights down (measured), but films keep them.** The same fight script rendered with about 25 % slow footage with face pictures and about 7 % as text-only. Films keep their reference pictures in EVERY clip, fights included (house rule: never drop a supplied picture). Fight speed in films comes from the writing rules, plus packaging `no_slowmo: true` (plays accidental slow-motion stretches at real speed; the video gets shorter) when asked. A single standalone fight clip may be made with `/api/v1/director/videos/text` (characters described in words) if the caller wants maximum speed and supplied no pictures.
- **No shoves, pushes, grabs or catches.** Watch for double hands and weak pushes: a shove renders as a gentle hand on the chest, and hands on hands, arms or wrists (catching an elbow, grabbing a collar) give extra or melted hands. Every contact is a closed fist, an elbow, a knee, a boot or a weapon hitting a named body part, with the hands apart.
- **Spend each shot on a big reaction with travel, not on held contact:** a jack-knife, a drop to the knees, a fall, a face-down slam. The model's speed and weight are in reactions. Don't write the fist as "already buried" at the first frame: it then holds it pressed on the target for 1.5-2 s.
- **Kicks and stamps in a low, leg-level shot** (boots, knees and the ground in frame): a boot stamping a knee, the guard dropping to both knees, then slamming face-down landed in every take, with no faces or hands to go wrong.
- **No blocks (arm against arm),** just like no shoves, grabs or catches: forearm blocks gave odd hands again.
- **Prompt wording is at its ceiling for strike speed** (measured over 13 variants). Trim each fight shot to its blow and speed fight clips up about 1.2x afterwards.
- **One move per shot: weight → contact on a named body part → a reaction with a destination.** "His fist drives into the guard's ribs; the guard folds sideways, clutching his side." "The shove lands and he sits down hard on the wet flagstones." Reactions with a destination landed every time. "Three clones throw punches and he blocks each one" renders as a pose.
- **Open every fight shot mid-action** ("the guard is already lunging, his fist swinging", "the overhead cut is already swinging down"). A stance opening ("fists up, circling", "swords raised") is 3 s of posing; opening mid-action took the dead time to zero.
- **Short, close strikes read best:** a fist to the ribs, a knee, an elbow, a pommel, a boot. Big moves (a charge, a flying smash) come out slow and soft.
- **Attackers come one at a time, and every contact shot says "ONLY two men in frame".** Others stay out of frame. Never two identical people (clones, twins, the same uniform) in one contact shot: they mirror into a symmetric pose. Builds and heights don't tell identically dressed fighters apart, so give each a visible difference (a colour, a bare head, a scarf).
- **No multi-target moves:** "sweeps all three", "drops three" and "five fly in five directions" render as a group pose or nobody getting hit.
- **Grounded physics only.** No flips, spinning or mid-air kicks, running up walls, people lifted into the air or bodies flying. A body falls only from a hit shown in the same shot: "thrown backward" without the blow becomes a floating ragdoll. Show the action, never only the aftermath.
- **Only the last clip of a fight ends on a hold.** A "stays perfectly still" ending in the middle of a fight adds about 4 s of standing every 15 s.
- **Effects get their own shot:** liquid, magic, shockwaves and transformations never share a shot with a strike (the goo melted into the punch).
- **Give every prop in a fighter's picture a place it stays:** "his crossbow slung on his back" worked in all 10 takes; without it the guard aimed the crossbow for 3 s.
- **Swords: never spend a shot on a parry.** Blade-on-blade contact holds 1-1.5 s whatever the wording, and a negative ("the blades never cross") doesn't prevent it. Keep blade contact to one beat inside a shot that continues into a hit ("slaps the guard's blade aside and in the same motion cuts across his pauldron with sparks"), or skip parries and show hits on armour (sparks on steel land every time).
- **No extreme close-up inserts of hands or weapons in a fight** ("close shot of the guard's sword hand"): both takes gave messy hands and a blade passing through fingers for about 3 s. Keep fight shots at a close two-shot or medium shot.
- **The checker warns about each of these:** several strikes in a shot, multi-target moves, more than two people with a strike, identical people with a strike, result verbs with no hit, superhuman moves, locked blades, effects with a strike, stance openings, one-take fights, repeated framing, shoves, grabs and blocks, hand or weapon inserts, shots spent on a parry, and (across clips) a hold in the middle of a fight. Fight clips may have 6 shots of ~2.5 s. After rendering, the job's `qa` entries count `fightStillShots` per part: shots that should show a blow but stay nearly still for 1.5 s or more (stance openings, blade locks, posed tableaux).
- Shots the checker reads as a fight get the Fight Flow look automatically (`fight_flow`, default on for fights; `false` turns it off, `true` forces it).
- The writer applies these rules automatically to ideas with fighting (`idea` on `/api/v1/director/videos/film`, and `/api/v1/director/prompts/write`). More in `references/montage/pixio-action-fights.md`.

## 7. Films (30 s to 7 min via `POST /api/v1/director/videos/film`)
- 30 s = 2 clips and 2 story beats. 60 s = 4 clips and 4 beats: setup, incident, turn, payoff. Longer films (any multiple of 15 s up to 420 s = 28 clips) need acts across the clips: setup, rising trouble, midpoint turn, crisis, payoff, with every clip moving the story on and no repeated beats. Each clip is a complete mini-scene.
- **The same prop or place in several clips: make it from ONE reference picture** and give that picture to every clip that shows it (the same hoop at day and at sunrise, the same car). Described in words only, it changes shape from clip to clip.
- **One hairstyle per person.** Every picture of a person (face close-up and outfit pictures) must show the same hairstyle; with a bun in one and loose hair in another, the model mixes them, and in close-ups it follows the face picture. Fix a mix with a redo that adds a matching picture (`images` + `clip_images` on `/api/v1/director/videos/film/{id}/redo` or `/api/v1/director/videos/music/{id}/redo`). The checker warns about two hairstyles in one subject.
- **Ball sports: frame from behind or beside the shooter, with the hoop (or goal) straight ahead of him.** Write where the hoop is ("the hoop straight ahead of him, in front of his face; he shoots toward the front of the rim; the ball arcs forward toward the hoop"). With the camera facing him and the hoop behind him, the model often sends the ball the wrong way or behind the backboard.
- **Hard cuts only, and check the cuts by eye.** The model sometimes dissolves between shots inside a clip: a semi-transparent face over the next shot for about a second. The automatic check (`blendedFrames` in the job's `qa`) catches quick blends, but not every slow fade, so look at each cut. If you see one, redo that clip or section with a new seed and "hard cut, no dissolve, no double exposure" in the shot that follows.
- **Join clips only where place or time changes** (station to corridor, night to day), never mid-action or mid-line. A movement cannot continue across a join.
- **End every clip on a quiet held moment** ("Static camera, holding"). The model runs the last shot long, and a couple of frames are trimmed at each join.
- **Music:** the same `non_diegetic_music` line in every clip, or N/A plus the same low drone line. A different score per clip jumps at every join.
- Use the same refs in the same order, the same look line, and the same character descriptions in all clips.
- **Workflow:** story (approved), then shot list, then refs, then prompts, then the checker, then render, then check the result.
- **Shortcut for long films:** `POST /api/v1/director/videos/film` with `idea` instead of `clips` plans the film (one beat per clip), writes it 4 clips at a time, makes missing reference pictures and renders. Approve the story first. To read the written clips before paying for the render, either run `POST /api/v1/director/prompts/write` first (its job `result.clips` are ready-to-shoot clips, with `prompt_check`) and send them as `clips`, or send `storyboard=true` (one still per shot to approve, see `references/montage/pixio-storyboarding.md`). Use redo (with pictures if needed) for the clips that come out wrong.
- **Time:** a 15 s clip takes several minutes to render, so a 60 s film takes roughly 20 minutes and a 7 min film a couple of hours; longer when the studio is busy. Read `etaSeconds` and `queue.estimatedCompletionAt` on the job (`GET /api/v1/director/jobs/{id}`), and `GET /api/v1/director/queue` for your own waiting jobs.
- `speed: "draft"` renders a film cheaper for a first look; `POST /api/v1/director/videos/film/{id}/final` then renders it at full quality with the same clips, pictures and seeds (never re-billing the writing).

## 8. After the render
- Look at frames from every shot, about 1 per second for action: identity (clones, someone missing, someone swapped), props (right shape, right end), wounds (right place), geometry (warped doors and hands), blurry faces, posed crowds. `GET /api/v1/director/jobs/{id}/shots` lists the cuts with thumbnails (free).
- Check speech with speech-to-text, **one 15 s clip at a time** (`GET /api/v1/director/jobs/{id}/parts/{n}` streams one clip). Long audio with fight noise makes transcribers loop ("no, no, no..."). Every planned line should transcribe as written.
- Redo only the bad clip, with a new seed or a fixed prompt, not the whole film.

## 9. Music videos (`POST /api/v1/director/videos/music`)
- One prompt per 15 s of song, in the official six-section format. The section's audio is `<Audio 1>`; the API adds
  `[reference generation + audio reuse]` and the `fully_copy` line when they're missing, and locks the audio.
- **Direction (see `references/montage/pixio-music-video.md`):** not every vocal line is sung on camera. Per 15 s
  section mix performance shots (hooks, choruses: her singing, close, eyes/brows/mouth written out), story shots (her
  doing what the song is about, "her lips stay closed" during the vocal), character/reaction shots (a look, a smirk,
  a turn away; lips closed) and atmosphere shots (places, light, crowd silhouettes). Give the lead 3 adjectives, a
  signature gesture and an arc; match every expression and camera move to the line's attitude; escalate to the
  final chorus. With `lipsync: "sung_words"`, words go only into performance shots.
- Never put lyrics in prompts. Describe the singing ("lip-syncs to the vocal of `<Audio 1>`"), not the words.
- Instrumental stretches: the API finds them and adds "lips stay closed until 00:07.140". Plan the shots so the
  singer isn't on a close-up during a long instrumental intro.
- Every face chest-up or closer; far-away faces smear at the music video's frame size. People far away only from behind or in silhouette.
- Name exactly who may appear ("Nova is the only person anywhere in the video"), or extra people and duplicates
  appear. Avoid "mirrored framing" (it duplicated a character).
- Write "every transition is a clean hard cut, no dissolves or double exposures" and "full-frame image with no
  borders" (ghosting and a phone-screen border appeared without them; the job's `qa` reports `borders` and `blendedFrames` per part).
- Use the customer's own song (`song`) first; `POST /api/v1/director/music/generate` only when there is none.

## 10. Packaging, series and explainers (what to send instead of prompting for it)
Never prompt the video model for on-screen text, captions, logos, a sepia / black-and-white look or a voiceover: packaging adds
them afterwards as real pixels and sound. Send them in `package` (JSON) on the render, or later on
`/api/v1/director/videos/package` with `job_id`:
- Text: `captions` (`auto`, SRT, or a JSON list; `caption_style: "pop"` for word chunks), `title_card` ("NAME\nsubtitle"),
  `tagline` / `cta` on an end card, `legal`.
- Sound: `voiceover_text` (+ `voiceover_voice`, or a `voiceover_sample` file to clone a voice), `music` / `music_bed`
  files, `music_until_s` (a theme under the opening only).
- Look: `filter` (sepia, black_and_white, noir, vintage, faded, warm, cool, vivid, cinematic, dreamy), `filter_strength`,
  `vignette`; or `look_id` from `POST /api/v1/director/looks` (a reference picture or video, free) to copy its exact look. Preview first:
  `GET /api/v1/director/jobs/{id}/filter_preview` (free).
- Shapes: `formats` (9:16, 1:1, 4:5), `cutdowns`.
- Remake an existing video: `POST /api/v1/director/videos/remake` (video + `changes` + optional pictures). The AI watches every
  shot and remakes it at the same cut times; `sound=original` keeps its sound; `motion=medium` also shows each clip its own 15 s of the source. Put who-is-who in `changes` ("the man in the grey coat is <Picture 1>").
- Duet songs: `singers={"male": 1, "female": 2}` (a man and a woman) or `{"first": 1, "second": 2}` (two women or two
  men; first = who sings first). Each line goes to whoever sings it (told apart by voice), and the checker rejects any
  shot where the other singer's mouth moves. To MAKE a duet song: `/api/v1/director/music/generate` with `voices` and lyrics tagged
  `[verse: first]` - each singer sings their own sections and the video knows exactly who sings when.
  Two similar women may be too alike to detect in an uploaded song: send `singer_parts`
  (`{"first": ["0-24.5"], "second": ["24.5-49"]}`) to make it exact.
- Languages: `subtitle_language` (translated captions), `dub_language` (each line re-voiced in its own speaker's voice).
- Re-cut a finished video by its shots: `GET /api/v1/director/jobs/{id}/shots`, then `POST /api/v1/director/jobs/{id}/edit` (keep, drop, reorder,
  trim) - no new render needed for a bad or misplaced shot.
For a narrated explainer use `film_type=explainer`; for a factual-channel style documentary (a narrator, chapters,
short on-camera interviews, chapter and name cards, a score) use `film_type=documentary` with `doc_style` (dramatic /
observational / investigative), and optionally `interviews` (auto/few/none/0-6), `doc_chapters`, `narration_pace`,
`max_speedup`, `fact_check` (default on), `interview_label` (default "dramatized"); every documentary default can be changed or turned off in `package` (`"captions": "off"`,
`"title_card": ""`, `"lower_thirds": []`, `"score": "off"`); for a show with recurring characters use `/api/v1/director/series` (cast, episodes, recaps, `POST .../season` to plan an arc;
episodes 30-420 s; newcomers get pictures by themselves)
instead of writing the continuity into each prompt yourself. To check the shots before paying for a render, send
`storyboard=true` with an `idea` (one still per shot, then approve). Guides: `references/endpoints/director.md` and the
sibling skills in `references/montage/` (packaging, explainers, documentaries, series).

## Checklist before you submit
- [ ] Official format, shots numbered, timestamps increasing, 4-5 shots per 15 s, each at least 3 s
- [ ] Every line: words / 2.6 + 1 s is no more than the shot length; dialogue on close faces; plain sentences
- [ ] Every person described in full, with skin, identically everywhere; one picture per face
- [ ] A reference for every recurring person, prop and place; no text on props
- [ ] Same look line; no grain words; no famous names; no exclusion lists
- [ ] Films: joins on place/time changes; every clip ends on a hold; same music line
- [ ] The checker shows no ERROR; `?check=true` quote seen before a long film or music video
