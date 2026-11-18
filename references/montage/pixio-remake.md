---
name: pixio-remake
description: How to remake an existing video shot for shot with Montage (Pixio's Director API) - POST /api/v1/director/videos/remake in depth (video, changes, images and references, motion loose or medium, sound original or new, aspect, storyboard, package and the other film fields), its limits (2 s to 7 min, 0-9 pictures, length rounded up to 15 s), what transfers from the source and what does not, style-transfer uses (live action to animation, a new city, a new cast, an animatic to a finished film), checking and fixing the result, and the rights caution. Use whenever someone wants to remake, re-shoot, restyle, recast or "redo this video but..." from a video file. Not for changing one thing in a finished video while keeping the rest pixel for pixel (that is montage-edit-prompting, POST /api/v1/director/videos/edit) and not for fixing lips (pixio-lipsync-fixing).
---

# Remake a video shot for shot

`POST /api/v1/director/videos/remake` takes a video and plain-words `changes` and makes it again as a film, **with
the same shots at the same cut times.** It:

1. finds every hard cut and splits the source into 15 s windows (one per film clip);
2. transcribes the speech;
3. has the AI watch every window (each shot's start, middle and end frame) and write down every shot: framing,
   camera move, who is in it, the action, setting, light, sound and who says what, with steady labels for people
   across the whole video (Person A, Person B...);
4. has the AI writer rewrite it in Montage's clip format, clip k = window k, plus your `changes`; without pictures
   it designs a reference picture for each recurring person;
5. renders it like any film (storyboard, draft then final, package, upscale, retakes all work).

## House rules

- **Test on Basic.** Every test, draft or trial render runs on Montage Basic (`video_model: "montage-basic"`, or
  leave `video_model` out). Every render is billed in Pixio credits; Basic is the cheapest. Premium or Ultra only
  when the user asks for it and has seen the quote.
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `videos/finish`; never write grain, noise or film-stock words in a prompt
  or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.
- Show the `?dry_run=true` quote and wait for a yes. Bind every supplied picture to a person or thing in `changes`
  or `references`.

## Remake, edit or new film? (decide first)

| the human wants | use |
|---|---|
| the same shots and timing with a different look, place, cast or style | **remake** (this skill) |
| one thing changed (colour, weather, an object, a costume) and everything else kept exactly | Montage Edit, `POST /api/v1/director/videos/edit` (references/montage/montage-edit-prompting.md) |
| the source only as inspiration for camera, light and pacing, but a new story | `POST /api/v1/director/videos/film` with `idea` and 1-3 `inspiration` videos (borrows style only, never people or exact shots) |
| a sharper or bigger version of the same video | `POST /api/v1/director/videos/upscale`; a remake with empty `changes` re-creates it rather than restoring it |

## Rights caution (say it before you start)

- **Only remake what the human has the right to use:** their own footage, footage they licensed, or footage whose
  owner agreed. Ask when it is unclear, and say so plainly when it looks like a film, a TV show, an ad or a
  music video they don't own.
- **`sound: "original"` keeps the source's sound exactly:** the original voices, the original music, every effect.
  For anything the human doesn't own, use `sound: "new"` and change people and place enough that it is a new work.
- **Real faces:** pictures of real people in `changes` (`<Picture 1>` is the man in the grey coat) only with that
  person's consent. Never put a celebrity or a stranger into a remake. Never name a famous person in `changes`.
- **Never copy logos, brand names or on-screen text** from the source on purpose; the models garble text anyway.
  Add real text afterwards with packaging or `POST /api/v1/director/videos/graphics`.
- A song in the source that the human doesn't own does not become theirs by being remade.

## 1. The fields

| field | default | what it does |
|---|---|---|
| `video` | required | the video to remake: 2 s to 7 min (mp4, mov, webm...); a multipart file, a URL, or a path from your Pixio assets |
| `changes` | none | plain words, up to 4000 characters: who is who (`<Picture n>`), a new place, time, style... Empty = remake it as it is |
| `images` | none | 0-9 reference pictures for `changes` (`<Picture 1>`...) |
| `references` | `changes` decide | JSON list saying what each picture shows, one non-empty string per picture, in upload order |
| `motion` | `loose` | `loose`: from the AI's shot list (same shots, framing, camera moves, cut times). `medium`: each clip also sees its own 15 s of the source as `<Video 1>` and copies framing, blocking and timing more closely, but also more of the source's LOOK; about 1.5x the render time |
| `sound` | `original` | `original`: the source's sound is kept exactly, so speech stays in sync. `new`: Montage makes new sound and speech |
| `aspect` | `auto` | the source's shape, matched to `16:9`, `9:16` or `1:1`; or set one |
| `realism` | 0.7 | how photographic the result is (0-1); `0` for any animated or painted style |
| `speed` | `quality` | `draft` = a smaller frame, a cheaper first look; then `POST /api/v1/director/videos/film/{id}/final` |
| `storyboard` | false | stop after writing with one still per shot to check, redo and approve |
| `seed` | random | base seed; clip k gets seed + k |
| `upscale`, `visual_qa`, `package` | as films | |
| `video_model`, `resolution` | `montage-basic` | `montage-basic`, `montage-premium` or `montage-ultra`; `resolution` 480p / 720p is Premium and Ultra only |

- **Length:** the source's length rounded up to 15 s, at least 30 s (2 clips), at most 420 s (28 clips). A clip
  past the source's end carries the last scene on.
- **`verbatim` is refused** on a remake (the AI writes every clip from your video).
- More than 9 pictures, `references` that don't match the picture count, an unreadable file or a length outside
  2 s - 7 min: `400 invalid_request` (or `invalid_media_url` for a file that could not be fetched) before anything
  is held.
- **Cost:** priced like a film written from an idea (the clips, the writing, and up to `filmDesignedPictures`
  designed pictures held, only the ones made charged) plus `remakeWatchPerClip` per 15 s for watching the source;
  `GET /api/v1/director/catalog` has the rates. On Premium or Ultra every clip is priced from the studio's quote,
  and `motion: "medium"` sends the source window as a reference video, which costs more. Always run
  `?dry_run=true` first (free; nothing starts) and show the human `credits.quoted`.

## 2. What transfers, and what doesn't

| transfers (from the AI's shot list) | does not transfer |
|---|---|
| the number of shots and their cut times, per 15 s window | exact poses and body positions (pose-for-pose copying is not in yet) |
| framing (wide, medium, close-up) and camera moves | the original people's faces (with `loose` the writer designs new people, or uses your pictures) |
| who is in each shot, as steady labels (Person A, B) | readable text, logos, signs, screens (garbled; add them in packaging) |
| the action, setting, light and mood | fast or complex choreography detail (fights get rewritten one move per shot) |
| who says what (transcribed) | the exact voices, unless `sound: "original"` keeps the whole track |
| the sound, exactly, with `sound: "original"` | small props and gadgets the models render badly (phones, drones) |

`motion: "medium"` moves the line: the clip sees the real window, so framing, blocking and timing follow more
closely, and more of the source's look leaks in (a Tokyo remake kept parts of the original European arcade in
testing). Use `loose` for big changes (new place, style, people); `medium` to re-shoot the same scene more
faithfully.

## 3. Writing `changes`

- **Who is who, by the source's description, then the picture:** "The man in the grey coat is `<Picture 1>`. The
  woman at the counter is `<Picture 2>`." One picture per person. Describe the source person well enough that the
  AI can find them (coat, position, what they do).
- **The place and time in one sentence each:** "Set it in Tokyo at night, neon in the puddles." "Move it to a
  snowy mountain village in the morning."
- **A style change** as a look sentence: "Make it a stylized 3D animated film with soft light and rounded shapes"
  (and send `realism: 0`). "A painted watercolour look with paper texture" (no grain or noise words, ever).
- **What must stay:** "Keep every line of dialogue exactly as spoken." "Keep the dog."
- **What must go:** say it positively: "The street is deserted", not a list of things to remove.
- Never put famous names, brand names or an API key in `changes`.

Good: `The barista in the green apron is <Picture 1>; the customer in the yellow raincoat is <Picture 2>. Set it in a small seaside cafe on a grey morning, rain on the windows. Keep every line of dialogue.`

Bad: `Make it like the famous coffee ad but better, with my face, more cinematic, 8K, film grain.`
(a brand reference, no who-is-who, a vague wish, quality stacks, a grain word.)

## 4. Style-transfer use cases

| use | how |
|---|---|
| the human's own short (adults), remade as an animated film | `changes` "Make it a stylized 3D animated film...", `realism: 0`, `sound: "original"` keeps their performance. A source with children: turn every child into an invented animal or cartoon character in `changes` |
| the human's own sketch or animatic, made into a finished live-action film | `changes` describes the real place and cast; pictures for each person; `motion: "medium"` to keep the blocking |
| the same ad in a new city or season | `changes` with the place and time; `sound: "original"` if the voiceover stays, otherwise `new` and re-voice in packaging |
| recasting the human's own short with new actors | one picture per role, `references` naming each role |
| live action to anime, or anime-styled to live action | a look sentence in `changes`, `realism` 0 for drawn styles; check every face on the storyboard |
| a vertical version of a horizontal source | `aspect: "9:16"`; framing is rewritten for the new shape |

## 5. Requests

Price it and check the plan first (Basic; nothing starts, nothing is charged):

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/remake?dry_run=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-basic -F video=@source.mp4 -F images=@barista.png -F images=@customer.png \
  --form-string 'references=["the barista: woman, 30s, short dark hair, green apron","the customer: man, 50s, grey beard, yellow raincoat"]' \
  --form-string "changes=The barista in the green apron is <Picture 1>; the customer in the yellow raincoat is <Picture 2>. Set it in a small seaside cafe on a grey morning, rain on the windows. Keep every line of dialogue." \
  -F storyboard=true -F speed=draft
```

After the human's yes, send it without `dry_run` and store the returned job `id`. Then check the storyboard (the
job stays `running` with `storyboard.waiting: true`): `GET /api/v1/director/jobs/{id}/storyboard`,
`GET /api/v1/director/jobs/{id}/storyboard/sheet.jpg`, fix a shot with
`POST /api/v1/director/jobs/{id}/storyboard/redo`
`{"clip": 1, "shot": 2, "note": "a close-up of the barista's face, rain behind her"}`, then
`POST /api/v1/director/jobs/{id}/storyboard/approve`. Stills and redraws are billed (`setPicture` each, plus
`storyboardNote` with a note), and a storyboard that is never approved still pays for its writing and stills.

An animated restyle with new sound and packaging:

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/remake?dry_run=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-basic -F video=@my_short.mp4 -F realism=0 -F sound=new -F aspect=9:16 \
  --form-string "changes=Make it a stylized 3D animated film with soft bright light, rounded shapes and big friendly eyes. The two people become a fox and a badger in raincoats." \
  --form-string 'package={"captions": "auto", "caption_style": "subtitle"}'
```

## 6. Reading the job

- The job is a film: poll `GET /api/v1/director/jobs/{id}` every 10-30 s. `stage` and `progress` say how far it
  is; `queue` shows your place in line while it waits.
- `parts` holds every clip as it lands (`GET /api/v1/director/jobs/{id}/parts/{n}` streams one); review them early
  and re-shoot a bad one instead of waiting for the whole film.
- When done, `output.url` (a signed URL valid 6 hours) and `output.assetPath` (the durable copy in your assets).
  `pictures` lists the pictures the remake used, including the ones the studio designed, each at
  `GET /api/v1/director/jobs/{id}/pictures/{n}`.
- With `storyboard: true`, the storyboard is the place to read the AI's shot list before anything renders: if the
  AI misread a shot, the remake will follow the misreading, so redo that still with a `note`.

## 7. Fixing the result

- **One clip wrong:** `POST /api/v1/director/videos/film/{id}/redo` `{"clip": 2, "seed": 777}`, optionally with a
  corrected `prompt` or new pictures. Only that clip renders again (a new job, billed).
- **A draft that works:** `POST /api/v1/director/videos/film/{id}/final` renders the same clips at full quality.
- **A shot in the wrong place or too long:** `GET /api/v1/director/jobs/{id}/shots`, then
  `POST /api/v1/director/jobs/{id}/edit` (keep, drop, reorder, trim; no new render; `?dry_run=true` quotes it).
- **One object or colour wrong in a window:** Montage Edit on a 1-15 s window
  (references/montage/montage-edit-prompting.md).
- **Lips off on `sound: "original"`:** `POST /api/v1/director/videos/lipfix` on that window
  (references/montage/pixio-lipsync-fixing.md).
- **Too much of the source's look leaked in** with `medium`: remake again with `motion: "loose"`.

## Checklist

- [ ] The human has the rights to the source; `sound` chosen with that in mind
- [ ] Remake (not Montage Edit, not inspiration) is the right tool
- [ ] Source 2 s - 7 min; final length (rounded up to 15 s, 30 s minimum) told to the human
- [ ] `changes` says who is who by the source's description, the place, time and style; no famous names
- [ ] One picture per person; `references` count equals the picture count; consent for real faces; no real children
- [ ] `motion` loose for big changes, medium for faithful re-shoots; `realism: 0` for drawn styles
- [ ] `?dry_run=true` quote shown, a clear yes; storyboard checked before approving
- [ ] Bad clips redone, not the whole remake
