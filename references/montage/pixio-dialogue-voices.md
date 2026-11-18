---
name: pixio-dialogue-voices
description: How an AI agent makes spoken lines sound right in Montage (Pixio's Director API) - word budgets and holds per model (Montage Basic about 2.6 words/s + 1 s, Montage Premium / Ultra about 1.6 words/s + 1 s), the line format on Basic and on Premium / Ultra, voices written as locked descriptions, giving each character a voice (ref_audios, cast, voices, voice_samples, clip_audios, voice_lock, clip_audio_lock, no_speech), narrators and cloned voiceovers, keeping subtitles from burning in, and checking every line after the render. Use whenever a video has talking, narration or a voiceover. Not for the acting around a line (that is pixio-emotion-acting), translation or dubbing (that is pixio-localization), or lips on a finished video (that is pixio-lipsync-fixing).
---

# Pixio dialogue and voices

A line works when it fits its shot, is said by one clearly named person whose voice never changes, and nothing else
in the prompt can be mistaken for speech. Every render is a billed job: the POST answers 202 with an id; poll
`GET /api/v1/director/jobs/{id}` every 10-30 s and fetch `output.url` when `done`. On a timeout keep polling the same id;
never resubmit. Base URL `$BASE` (`https://beta.pixio.myapps.ai`), key in `Authorization: Bearer $PIXIO_API_KEY`.

## House rules

- **Test on Basic.** Every test, draft or trial render uses `video_model: "montage-basic"` (also the default when
  `video_model` is left out). Every render is billed in Pixio credits; Premium or Ultra only when the user asks for it
  and has seen the quote (`?check=true`, `credits.quoted`).
- **The customer's own song first.** A music video uses the song the user gave you (`song`). `POST /api/v1/director/music/generate`
  is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.

Also: use every voice sample the user supplied, and keep their recordings and transcripts private.

## 1. Decision rules (read first)

| Situation | Do this |
|---|---|
| A character speaks, Basic | `(S1) <d>[English] Line.</d>` with the voice described before it; ~2.6 words/s + 1 s hold |
| A character speaks, Premium | `Name says in a <age, timbre, pace> voice: {Line.}`; ~1.6 words/s + 1 s; 10 words a line at most |
| The same voice in every clip of a film | `ref_audios` (clean 5-10 s each) + `cast`; with no samples, `voice_lock=true` |
| Several speakers in a film | `voice_samples=used` (or `clip_audios`) so a clip gets only the voices it names |
| Narration, nobody on screen talks | packaging `voiceover_text` (or a `voiceover` file) and those clips in `no_speech` |
| Narration in a particular person's voice | `voiceover_sample` (5-15 s, clean), or `POST /api/v1/director/audio/voiceover` with a sample |
| A recorded line must play word for word | `clip_audio_lock` on that film clip (advanced) |
| Words on screen | never from the video model; packaging `captions` |

## 2. Write each voice once, then never change a word

- A voice is a written condition: **age and register, timbre, tempo, accent with one or two concrete markers,
  manner**: "a man in his sixties, low and gravelly, slow, a soft Glasgow accent that rolls the r, dry and unhurried".
- One character, one accent, one voice line, pasted **word for word** into every clip they speak in. Swapping
  "warm" for "rich" in clip 4 moves the generated voice. (A character's *behaviour* is rewritten per scene; the voice
  text is not.)
- With a sample, the sample leads and the words only support it: keep them consistent with the recording.
- Write lines to be spoken: plain full sentences, numbers as words, no symbols or abbreviations, commas for pauses.
  "Keep your eyes down. Keep your mouth shut. Never owe anybody." works; clipped slang ("Don't owe nobody") reads as
  nonsense.

## 3. Pacing: the word budget

Lines too long for their shot come out rushed, garbled or cut off. Count words before you submit.

- **Basic: about 2.6 words per second, plus 1 s of silence after the line.** An 11-word line needs 5 s or more.
  A 15 s clip holds two or three short lines at most.
- **Premium / Ultra: about 1.6 words per second plus about 1 s after each line; 10 words a line at most.** One
  speaker per shot. No line in the last third of a take; the last shot is a silent hold.
- **The safest clip:** one speaker, one short line, about a second of silence after it, so the edit has a clean seam
  and the model invents no extra sound.
- **Never cram a line into the last seconds.** Measured: 7 words in the last 3.5 s sounded like nonsense. A last shot
  with dialogue starts about 10 s into a 15 s clip and ends on a silent hold.
- **Narration:** packaging `voiceover_text` is sped up to 1.3x at most to end before the end card; write about 2.5
  words per second. Documentaries take `narration_pace` 1.5-2.6 words per second (default 1.85) and `max_speedup`
  1.0-1.3 (default 1.15).

| Shot length | Basic words | Premium words |
|---|---|---|
| 3 s | 5 | 3 |
| 4 s | 7-8 | 4-5 |
| 5 s | 10 | 6 |
| 6 s | 13 | 8 |

## 4. Line formats per model

### Montage Basic, the official format

- `(S1) <d>[English] Words.</d>`. Speaker ids follow the order of first speech **inside that clip**. The brackets
  name the spoken language (`<d>[Spanish] ...</d>`).
- Voice and silence go **before** the line: "Nobody else speaks; every other mouth stays closed. `<Subject 1>` (S1),
  in a tired, low, slightly hoarse female voice, says quietly, `<d>[English] Six? He went home this morning.</d>`"
- After `</d>` write only camera or action. "says", "mouth", "lips" or "silent" there is sometimes spoken aloud.
- Faces in medium or close-up for every line; never a line on a tiny face in a wide shot.
- Write both `overall_soundscape:` and `non_diegetic_music:`; end the soundscape with "No other voices." when only the
  scripted lines should be heard (`references/montage/pixio-sound-design.md`).
- With a sample, bind it in `subject_definitions`: `<Audio 1> is the voice-timbre reference for <Subject 1> (S1).`,
  and in the shot: "...says, using the voice timbre referenced from `<Audio 1>`, ...".
- A line that runs across a cut: `<scenetrans>` (`references/montage/montage-basic-prompting.md`).

Bad:
```
[Shot 4] At 00:13.500, the camera cuts to a wide shot of the street. Mara says <d>[English] I told you we'd never make it out of here alive, didn't I?</d> She smiles.
```
16 words in the last 1.5 s, on a small face, with no voice, and "She smiles" after the line.

Good:
```
[Shot 3] At 00:07.000, the camera cuts to a close-up of <Subject 1>'s face. Nobody else speaks. <Subject 1> (S1), in a low, steady female voice, says, <d>[English] I told you. We never get out.</d> The camera holds a static shot.
[Shot 4] At 00:11.000, the camera cuts to a medium shot of the empty street. Static camera, holding.
```

### Montage Premium / Ultra

- `Name says in a <age / timbre / pace> voice: {line}`. Delivery once, before the line; lines in `{braces}`.
- Name the speaker; the others "keep their mouths naturally closed". With a sample: "Mara from @Image1, voiced by
  @Audio1".
- Mouth visible and large: medium close-up or close-up, front-on, fixed shot, no turns or walking during the line.
- Put the line early in its shot; a line after a long silent setup starts late.
- Separate two lines by a physical action. Never repeat a line's words anywhere else in the prompt.
- Language other than English or Chinese: open with "Dialogue language: X."
- No shouting, sobbing or "gonna". For dialogue-heavy takes add: "Generate the dialogue exactly as written; add or
  drop no lines. No dialogue from the wrong character, no two people speaking at once."
- Narrator: `Narrator (V.O.) says: {...}` with everyone on screen silent.
- A take with an `@Audio` reference costs more: check the quote with `?check=true` first.

Full layouts: `references/montage/montage-basic-prompting.md` and `references/montage/montage-premium-prompting.md`.

## 5. Character voices in films and series

`POST /api/v1/director/videos/film` (multipart) fields:

| Field | What it does |
|---|---|
| `ref_audios` | 0-3 voice samples, `<Audio 1>`... in upload order. Clean 5-10 s of one person, dry, no music; Basic takes about 15 s in all per clip |
| `cast` | JSON list binding people to pictures and voices: `[{"name": "Mara", "picture": 1, "audio": 1}]` (`pictures` for several of one person, optional `description`). Clips get the missing voice-timbre lines; voice lock and the voice check follow it |
| `voices` | with `idea`: whose voice each sample is, `["Mara, the courier", "the old fisherman"]` |
| `voice_samples` | `all` (default) or `used`: each clip gets only the samples its prompt names. **Use `used` for dialogue films** (measured: an unused woman's sample landed on a man's line) |
| `clip_audios` | per-clip samples, like `clip_images`: `[[1,2],[2],[],[1,3]]` |
| `voice_lock` | `true` with no samples: each character keeps the voice heard in clip 1 for the whole film (about one clip longer) |
| `no_speech` | clips where nobody on screen speaks (narration, montage), e.g. `[1, 11]`: no samples, closed-mouth wording |
| `clip_audio_lock` | advanced tuning, `{"2": 1}`: clip 2 plays `<Audio 1>` exactly as recorded, lip-synced; leave unset unless you need it |

Series: `POST /api/v1/director/series` takes the voices (`voice_samples` + `voices`), or set one member's 5-15 s `voice`
with `POST /api/v1/director/series/{id}/cast`; episodes reuse and learn voices across episodes
(`references/montage/pixio-series-showrunner.md`).

No sample yet? Make one with `POST /api/v1/director/audio/voiceover` (a preset voice), check it by ear, then upload it as
`ref_audios`; or clone from 5-15 s of a finished job with `voice_sample_job` (`references/montage/pixio-audio-tools.md`).

```bash
curl -X POST "$BASE/api/v1/director/videos/film" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-basic -F duration=30 -F 'clips=<clips.json' \
  -F images=@mara.png -F images=@tom.png \
  -F ref_audios=@mara_voice.wav -F ref_audios=@tom_voice.wav -F voice_samples=used \
  -F 'cast=[{"name":"Mara","picture":1,"audio":1},{"name":"Tom","picture":2,"audio":2}]' \
  -F visual_qa=local
```

## 6. Narrators and voiceovers

Packaging (`package` on a film or clip, or `POST /api/v1/director/videos/package` on a finished job):

| Field | Default | Notes |
|---|---|---|
| `voiceover_text` | none | up to 1500 characters, read by text-to-speech |
| `voiceover_voice` | `af_heart` | a preset; `GET /api/v1/director/voiceover/voices` (free) lists 54 voices in 8 languages with a description. `am_michael` is clear on brand names. Write the script in the voice's language |
| `voiceover_sample` (file) | none | 5-15 s of the narrator, clean: the script is read in that voice instead |
| `voice_clone` | `natural` | how the sample is cloned: `natural` (best match), `fast` or `classic`; same price |
| `voiceover` (file) | none | your own recording; wins over `voiceover_text` |
| `voiceover_start_s`, `voiceover_db`, `duck_db` | 0.5, 0, -10 | start, level, how far music and the video's sound dip under it |

A stand-alone read: `POST /api/v1/director/audio/voiceover` (text up to 5000 characters; `voice`, or `voice_sample` /
`voice_sample_job` to clone; `speed`; `pause_s`; `lufs`). Priced by the length it makes (catalog).

```json
{"job_id": "JOB_ID", "voiceover_text": "Every morning starts the same. Then one didn't.",
 "voiceover_voice": "am_michael", "captions": "auto"}
```

With a narrator, keep the characters' own lines to a minimum and list narration-only clips in `no_speech`.

## 7. Keep subtitles out of the picture

- **Basic:** never ask for captions, subtitles, speech bubbles or on-screen words; `<d>...</d>` is speech, not text.
- **Premium:** end every prompt's constraints with "Keep it subtitle-free. Do not generate any on-screen text, logos
  or watermarks." Repeating a line's words elsewhere, or attaching notes to single words, burns subtitles in.
- **Real subtitles** come from packaging: `captions: "auto"` (from the voiceover, else the video's speech), SRT /
  WebVTT text, or a list of `{"text", "start", "end"}`. `caption_style: "pop"` for word chunks.
- `visual_qa: "local"` reads every clip and flags words the prompt did not ask for (in `qaIssues`).

## 8. Check the speech after the render

1. **Listen to every line:** wrong voice, rushed words, a missing line, mouths moving on a no-speech clip.
2. **Speech-to-text one 15 s clip at a time** (`POST /api/v1/director/audio/transcribe`, `content: "speech"`, `vocabulary` for
   names; 16 credits a job). Long stretches with fight noise make the transcriber loop.
3. **Built-in check:** `visual_qa=local` (or `full`) on a film with `<d>` lines checks missing, extra or unscripted
   words and, with voice samples, each line's voice: issues such as `speech_missing`, `speech_extra_words`, `speech_cut_off`, `speech_unscripted`
   and a line in the wrong voice come back in the job's `qaIssues` (`type`, `severity`, `evidence`).
4. **Fix only the bad clip:** `POST /api/v1/director/videos/film/{id}/redo` `{"clip": 3, "seed": 777}`, with a corrected `prompt`
   if the line was too long. Lips drifting on a good take: `references/montage/pixio-lipsync-fixing.md`.

```bash
curl -X POST "$BASE/api/v1/director/audio/transcribe" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"job_id": "JOB_ID", "start_s": 15, "end_s": 30, "content": "speech", "vocabulary": "Mara, Tobias"}'
```

## 9. Common failures

| You hear | Cause | Fix |
|---|---|---|
| Line rushed or garbled | over budget, or in the last seconds | cut words, move it earlier, lengthen the shot |
| A man's line in a woman's voice | every clip got every sample | `voice_samples=used` or `clip_audios`; `cast` |
| Voice drifts between clips | no sample, or the voice text changed | `ref_audios` + `cast`, or `voice_lock=true`; one voice line pasted verbatim |
| Mumbling on a narration clip | the model invented speech | list the clip in `no_speech` |
| A stage direction spoken aloud | "says" / "silent" after `</d>` | only camera or action after the line |
| Two people talking at once | two speakers in one shot | one speaker per shot; the others' mouths closed |
| Invented shouts or crowd lines | a voice described with no words | exact lines, or "a wordless shout" |
| Music over the dialogue (Premium) | sound left unspecified | "No BGM." or the audio policy (`references/montage/pixio-sound-design.md`) |
| Subtitles burned in (Premium) | line words repeated, no constraint | "Keep it subtitle-free"; never repeat line words |

## Checklist

- [ ] Every line counted: Basic 2.6 w/s + 1 s, Premium 1.6 w/s + 1 s and 10 words max; nothing in the last seconds.
- [ ] Each character's voice written once (age, timbre, tempo, one accent with markers) and pasted verbatim.
- [ ] Voice described before each line; nothing but camera or action after `</d>`.
- [ ] Speaker in medium or close-up, one speaker per shot, the others' mouths closed.
- [ ] Every supplied voice sample used and bound (`cast`); `voice_samples=used` for dialogue films.
- [ ] Narration-only clips in `no_speech`; narrator via packaging.
- [ ] No on-screen text asked of the model; real captions via packaging.
- [ ] Tests on `video_model: "montage-basic"`; the `?check=true` quote shown before any Premium or Ultra render.
- [ ] After the render: every line heard and transcribed per 15 s clip; bad clip redone alone.
