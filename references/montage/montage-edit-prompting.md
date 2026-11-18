---
name: montage-edit-prompting
description: How to write instructions for Montage Edit (POST /api/v1/director/videos/edit on Montage, Pixio's Director API) so only the thing you ask for changes and everything else stays the same - colour, weather, lighting, style, add / remove / replace an object, a costume, on a whole clip (up to 15 s) or any 1-15 s window of a finished video - and prompts for Montage Create (POST /api/v1/director/videos/edit/create), a new video from 1-6 reference pictures. Use whenever you write, review or fix a /api/v1/director/videos/edit or /api/v1/director/videos/edit/create request. Not for Montage Basic prompts (montage-basic-prompting) or Montage Premium prompts (montage-premium-prompting), and not for lips (POST /api/v1/director/videos/lipfix).
---

# Montage Edit prompting

Montage Edit changes an existing video from a short instruction. Its edits are only as narrow as the instruction.
Everything below comes from how the edit model responds to prompts and from how Montage wraps the call.

## The one rule: say only what changes, in one short sentence

Simple prompts work best. Long, descriptive prompts make the model change things you did not mention. Name the
change, not the scene.

| Avoid | Write |
|---|---|
| In the video of the man sitting on the sofa, please add a small black cat that runs from the right side of the screen, jumps onto his lap, and then he starts to stroke its head while looking down. | Add a cat that jumps onto his lap; he begins to pet it. |
| Please remove the cell phone the person is holding and fill in the background so their hand looks empty. | Make the phone invisible. |
| The red vintage car driving on the coastal road at sunset should be painted a bright blue colour instead. | Make the car bright blue. |

Good edit prompts: "Make this video anime." "Put a fashionable hat on this person." "Change the lighting to be more
dramatic." "Make it night with heavy rain." "Change the text on the sign to say \"OPEN\"."

Montage adds **"Keep everything else the same."** to every instruction (`keep_rest: true`, the default). Don't
repeat it, and don't turn it off for a targeted edit. Turn it off only for a whole-look change ("make this video
anime") if the look comes out too timid.

`prompt` is at most 2000 characters (and `negatives` 500), but an edit instruction should be a fraction of that:
about 15 words or fewer is ideal, and over 40 words starts to drift.

## Protect what must not change

1. **Edit a window, not the whole film.** Send `start_s`/`end_s` (1-15 s) for just the moment that needs the
   change. By default the model gets a longer stretch around the window for context (`stretch_s`), and only the
   window is spliced back. Everything outside it is the original picture, untouched, and the seams are crossfaded
   (`blend_s`, about 0.25 s). Keep the window tight around the change: every second sent is a second the model can
   drift, and the price follows the seconds sent.
2. **Keep the sound.** `audio: "original"` (the default) keeps the video's own sound: dialogue, song, effects.
   Use `audio: "model"` only when the sound must change too ("add thunder"), and then describe the sound you want.
   The edit model does not edit voices and takes no audio input.
3. **No new cuts.** The model likes to make several shots. For a single-shot window, send `single_shot: true`
   (adds "Single continuous shot, no scene cuts."). Leave it off when the window already has a cut.
4. **Plain negatives.** Put short negatives in `negatives`, e.g. `"No new people, no text on screen"`, or end the
   prompt with "Do not ...". Keep them few and short: a long list is just another long prompt.
5. **Same seed to compare.** When you try two wordings, send the same `seed`.

## Reference pictures (`images`, up to 6)

Use them for the new thing: the hat, the costume, the product, the logo. Say each picture's role **in words**,
e.g. "Put the hat from the first picture on the woman." Never write `<Picture 1>`, `<IMAGE_REF_0>` or other
tags: Montage Edit does not read them. `job_pictures: true` also sends the source job's own reference pictures,
which helps keep a character's face when the edit is near them. Uploaded `images` count first; the total is capped
at 6.

## Timing inside the window

Use natural language or timecodes. They count from the start of the stretch sent (the window minus `pad_s`), not
from the start of the film. "After 2 seconds, the lamp turns off." Prefer a tight window over timecodes.

## What it can't do (use something else)

- Lips, dialogue or voices: use `POST /api/v1/director/videos/lipfix` (references/montage/pixio-lipsync-fixing.md).
- Longer than 15 s in one call: edit several windows, or re-render the section
  (`POST /api/v1/director/videos/music/{id}/redo` or `.../film/{id}/redo`).
- Faces of certain recognisable people are refused. Edits of uploaded videos can be refused from the EEA,
  Switzerland and the UK.
- Every result carries an invisible AI-content watermark.
- No film grain, as everywhere on Montage: never ask for grain or noise.

## Request shape

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/edit" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"job_id": "JOB_ID", "prompt": "Make it night with heavy rain", "start_s": 10, "end_s": 16, "single_shot": true}'

curl -fsS -X POST "$BASE/api/v1/director/videos/edit" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "video=@clip.mp4" -F "prompt=Put the hat from the first picture on the woman" -F "images=@hat.png"
```

`job_id` takes a finished Director job from this API; `video` takes a multipart file, a URL or a path from your own
Pixio assets.

Price: Montage Edit is priced from the studio's own quote of the exact request (the seconds sent and the
`resolution`), at least 16 credits; the hold is taken when the job starts (`402 insufficient_credits` if short).
It has no free quote: `?check=true` / `?dry_run=true` answer `400 preflight_unavailable`. So check the request by
hand before sending: the instruction is one short sentence, the window is tight, the pictures are named by role.

Knobs (all optional): `resolution` (`auto` matches the video, up to `4k`; higher costs more), `audio`,
`single_shot`, `negatives`, `keep_rest`, `seed`, `job_pictures`, `blend_s`, `pad_s` (about 0.5 s of context each
side), `stretch_s`, `variant` (`full` = the whole video with the window spliced back, or `window` = just the edited
stretch), `source` (`auto` / `video` / `song`; `song` edits a Montage Premium music video's original-song version).

The job JSON is the usual `director.job`: poll `GET /api/v1/director/jobs/{id}`; when `done`, the video is
`output.url` (signed, 6 hours) and `output.assetPath` (the durable copy in your assets).

## Montage Create: a new video from pictures (`POST /api/v1/director/videos/edit/create`)

Reference mode only. You send 1-6 pictures and no video; with a video, use `/api/v1/director/videos/edit`. Here the
prompt describes a whole new scene, so it can be longer than an edit instruction (up to 2000 characters). The rules:

- **Say who is who in words, in picture order.** For example: "The woman in the first picture sits down in the cafe
  in the second picture and orders a coffee." No `<Picture 1>` tags. Up to 3 pictures per character, and at most 2
  characters.
- **One action, plainly.** Describe what happens, then the sound: "Soft cafe chatter, no music." Montage Create
  writes the soundtrack, so describe any music you want, or say "no music" / "no dialogue".
- **`single_shot: true`** gives one continuous shot. Without it, the model often cuts between several shots.
- **Timing:** "After 2 seconds, she looks up" or `[0-4s] ... [4-8s] ...`.
- **Text on screen:** give the exact words in quotes, or say "no text on screen".
- **Length and shape:** `duration_s` is 3-15 (default 10). `aspect_ratio` `16:9` or `9:16` for vertical video.
  `resolution` defaults to 720p. Priced from the studio's quote, at least 16 credits.
- **Faces:** a face the pictures show stays close (first test: kept). Certain recognisable people are refused.

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/edit/create" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "images=@woman.png" \
  --form-string "prompt=The woman in the picture slowly turns toward the camera and smiles. Soft city ambience, no dialogue." \
  -F "duration_s=6" -F "single_shot=true"
```

## Before fixing: Montage Analyze (`POST /api/v1/director/videos/edit/analyze`)

To find what needs fixing, send `{"job_id": "..."}` (or a `video`). Montage Analyze watches the video with its
sound and makes no video; the done job's `analysis` has:
- `overallScore`;
- `lipsync` verdicts per stretch (`verdict`, `offset_ms`);
- visual `issues` with times and severity;
- `sections` scores;
- `suggestedFixes`: ready Pixio requests (`endpoint`, `body`) for `/api/v1/director/videos/lipfix`,
  `/api/v1/director/videos/edit` (the prompts follow this skill: one short sentence),
  `/api/v1/director/videos/facefix` or a section redo on your job.

Nothing is fixed until you send one. Check the suggested Montage Edit prompts before sending them, and keep the
window tight. Analyze costs about 16 credits a minute of video (`checks: ["lipsync"]` alone is the 16-credit
minimum); no words are stored.

## Checklist before sending

- [ ] One short sentence naming only the change (about 15 words or fewer is ideal; over 40 words drifts).
- [ ] Window as tight as the change allows; `audio: "original"` unless the sound must change.
- [ ] Pictures described by role in words, no tags.
- [ ] `single_shot: true` for a one-shot window; negatives few and short.
- [ ] No `?dry_run` (it has no free quote): the instruction, the seconds sent and the price checked by hand, and the
      human told it is billed.
