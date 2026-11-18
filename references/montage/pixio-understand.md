---
name: pixio-understand
description: How to get a deep, structured read of any video or sound on Montage (Pixio's Director API) with POST /api/v1/director/understand/video and POST /api/v1/director/understand/audio - the measurements (measure_only - shots, cuts per minute, tempo and beat length, loudness and drops, where voices sing or speak, measured lip-sync stretches) and the full AI read (summary, scenes with times, visual style, people described, objects, on-screen text kind, audio structure and voices, story hook and beats, quality, style sentences to recreate it), question and focus, windows, costs and limits, and how to use the result to plan remakes, music videos, ads, QA and captions. Use whenever you need to know what is in a video or a song before planning, copying a style, cutting to the beat, or checking a result. Not for fixing what it finds (that is pixio-video-qa) and not for a shot-for-shot remake render (that is pixio-remake).
---

# Understand: know what is in a video or a sound

Two routes, one answer shape. Both make a job; the result is the `understanding` object on
`GET /api/v1/director/jobs/{id}` once the job is `done`. There is no file to download.

- `POST /api/v1/director/understand/video`: a video and its sound.
- `POST /api/v1/director/understand/audio`: a sound only (a song, a voiceover, a soundtrack, or the sound of a
  video file).

Each runs in two layers:
1. **Measured (always):** numbers you can trust and compute with.
2. **Watched or heard by Montage Understand (skipped with `measure_only: true`):** descriptions, scenes, style,
   structure.

## House rules

- **Test on Basic.** Every test, draft or trial render runs on Montage Basic (`video_model: "montage-basic"`, or
  leave `video_model` out). Every call is billed in Pixio credits. Premium or Ultra only when the user asks for it
  and has seen the quote.
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `videos/finish`; never write grain, noise or film-stock words in a prompt
  or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.

## Decision rules (read first)

| You need | Send | Cost |
|---|---|---|
| Shot cuts, cuts per minute, tempo, beat length, loudness drops, where voices are, lip-sync offsets | `measure_only: true` | the minimum price (16 credits) |
| What happens, the look, the camera, the lighting, the scenes, the story beats | the default (full read) | priced from the studio's quote of the exact request, at least 16 credits; grows with length, `fps` and `resolution` |
| One specific answer ("does the man in the grey coat appear in every scene?") | `question` | same as the default |
| A cheaper watch of a long video | `resolution: "low"`, lower `fps`, or a window (`start_s` / `end_s`) | less |

- Start with `measure_only: true` when numbers are enough (beat grid, shot list, lip-sync). It is the cheapest and
  quickest.
- Understand has no free quote: `?check=true` / `?dry_run=true` answer `400 preflight_unavailable`. Before a long
  full read, tell the human the rough price from the table (or the rates in `GET /api/v1/director/catalog`) and get
  their OK.
- Lip-sync is MEASURED, not judged by eye. An AI watch once called a 0.5 s audio shift "tightly in sync", so the
  lip-sync is measured frame by frame and the read is told to use the numbers.
- Words are never returned: no lyrics, no quotes, no transcript, no on-screen text content (only its kind and
  place). People are described ("Person 1"), never named or identified. So Understand can't check what was said
  (for that, `POST /api/v1/director/audio/transcribe`; see references/montage/pixio-video-qa.md).
- Never echo a customer's private lyrics into a `question`, `focus`, log or public place. `question` and `focus`
  are not kept after the job, but keep them free of private text anyway.

## Request fields

JSON with `job_id`, or multipart with the file (`video` for /video; `audio` for /audio, which takes mp3, wav, m4a
or a video's sound). One or the other, not both. Files can also be a URL or a path from your own Pixio assets.

| field | values | default | notes |
|---|---|---|---|
| `job_id` | a finished Director job from this API; for /audio also a song job | | image and analysis jobs are refused |
| `source` | `video`, `song`, `auto` | `video` | Montage Premium music videos: `song` = the original-song version; `auto` = that version when there is one |
| `start_s` + `end_s` | a window of at least 1 s | whole file | send both or neither; answer times stay in the full file's seconds |
| `measure_only` | true / false | false | measurements only, no deep read; the minimum price |
| `question` | up to 2,000 chars | none | answered in `understanding.answer` |
| `focus` | up to 1,000 chars | none | what to pay attention to: "the camera moves", "the drop at 0:45" |
| `fps` | 0.5-5 | 2 | video: frames per second it watches; more costs more |
| `resolution` | `low`, `high` | `high` | video: frame detail; `low` is much cheaper |
| `vocals` | true / false | true | find where voices sing or speak (slower the first time a file is read) |
| `lipsync` | true / false | true | video: measure mouth vs isolated voice per stretch, at no extra cost |
| `max_scenes` | 1-200 | 40 | video: cap on scenes returned |

Limits: a video too long to watch at the chosen detail is refused with a `400 invalid_request` naming the fix
(lower `fps`, `resolution: "low"`, or a window). A video with no sound is still read (picture only).

Time: roughly 20 s + 0.8 s per second of input for a full read, 20 s + 0.15 s per second with `measure_only` (more
the first time vocals are separated). Poll the job every 10-30 s.

```bash
# measurements only: shots, beat grid, voices, lip-sync of a finished job
curl -fsS -X POST "$BASE/api/v1/director/understand/video" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"job_id": "JOB_ID", "measure_only": true}'

# a full read of an uploaded reference ad (after the human's OK on the price)
curl -fsS -X POST "$BASE/api/v1/director/understand/video" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "video=@reference_ad.mp4" --form-string "focus=the camera moves, the lighting and how the cuts land on the music"

# a song's structure and voices
curl -fsS -X POST "$BASE/api/v1/director/understand/audio" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "audio=@customer_song.mp3"
```

## What comes back (`understanding`)

`understanding.measured` (always):
- Video: `width`, `height`, `fps`, `duration_s`, `shots` (a list of `[start_s, end_s]`), `shot_count`,
  `mean_shot_s`, `cuts_per_min`.
- `lipsync` (video, when a voice is heard): `stretches` (each `start_s`, `end_s`, `verdict` in_sync / early / late /
  unclear, `offset_ms`, `confidence`, `ok`), a `summary`, and a note (negative `offset_ms` = mouth early; in sync
  within 150 ms by default). How to read these and what to fix: references/montage/pixio-video-qa.md and
  references/montage/pixio-lipsync-fixing.md.
- `sound`: `has_sound`, `duration_s`, `tempo_bpm`, `beat_s` (one beat in seconds), `loudness_db_per_s`, `mean_db`,
  `silent_s`, `changes` (each `t_s`, `db`: the big loudness jumps such as drops and breaks), `voice_stretches`
  (`[start_s, end_s]` where a voice is heard) and `voice_s` (total voice seconds).

From the full read (not with `measure_only`), video:
- `summary`, `genre`, `purpose`, `mood` (3-6 words).
- `visual_style`: `look`, `camera`, `lighting`, `colour_palette`, `pacing`, `composition`.
- `scenes`: `start_s`, `end_s`, `setting`, `description`, `shot_size`, `camera_movement`, `lighting`, `people`
  (a count), `action`, `mood`, `on_beat` (the cut or key action lands on a beat).
- `people`: `label` (Person 1...), `look`, `role`, `on_screen` stretches.
- `objects`: `name`, `importance` (hero / supporting / background), `first_seen_s`.
- `on_screen_text`: `start_s`, `end_s`, `kind` (title, caption, subtitle, logo, price, call_to_action, sign,
  other), `position`. Never what it says.
- `audio` (same shape as the audio route, below), `sync` (how picture and sound fit).
- `story`: `hook`, `beats` (`t_s`, `beat`), `ending`.
- `quality` (sharpness, artifacts, stability, audio quality).
- `recreate`: `style_sentences` (2-5 sentences a video prompt could use for this style) and `tips`.
- `answer` when you sent a `question`.

From the full read, audio: `kind` (music, speech, music_and_speech, sound_effects, ambience, silence, mixed),
`summary`, `genre`, `mood`, `instruments`, `tempo_feel`, `energy_arc`, `structure` (each `start_s`, `end_s`, `part`
such as intro / verse / chorus / bridge / drop / outro, `energy` 1-10), `voices` (each `label`, `kind` singing /
rap / speech / narration / backing_vocals / crowd, `description`, `stretches`), `sound_effects` (`t_s`, `sound`),
`mix`, `fits` (what it would suit).

Trust the measured numbers over the read's when they disagree (the read is given them and told to trust them).

## Using it

### Plan a music video from the customer's song
Always the customer's own song; generate one only when none was given
(references/montage/pixio-song-generation.md).
1. `/api/v1/director/understand/audio` on the song (full read) or with `measure_only: true` (cheapest).
2. `structure` gives the parts and their energy; `tempo_bpm` / `beat_s` the beat grid; `voice_stretches` where the
   singer is heard (those sections need a visible singer and good lip-sync); `changes` the drops (big visual
   moments go there).
3. Plan the sections (references/montage/pixio-music-video.md): calm performance in low-energy verses, wide or fast
   shots on the chorus and drop, story-only shots where no voice is heard. `POST /api/v1/director/music/plan` does
   the section planning for you as a writer job (its result is in the job's `result`).

### Copy a style, not the content (ads, trailers, remakes)
1. `/api/v1/director/understand/video` on the reference with a `focus` ("camera, lighting, colour and pacing").
2. Put `recreate.style_sentences` and the `visual_style` fields into your prompts (format:
   references/montage/montage-basic-prompting.md or references/montage/montage-premium-prompting.md). Use
   `cuts_per_min` and `mean_shot_s` to match the pace, and `story.hook` / `beats` for the structure.
3. Never copy the people, faces, logos or on-screen text of someone else's video. Films can do this study for you:
   1-3 `inspiration` videos on `POST /api/v1/director/videos/film` (with an `idea`) are each read like
   `understand/video` and priced the same, at least 16 credits each (references/montage/pixio-film.md).
4. For a shot-for-shot remake, `POST /api/v1/director/videos/remake` does its own analysis
   (references/montage/pixio-remake.md); Understand is the cheaper first look to decide whether a remake is worth
   it.

### QA a finished job
- `measure_only: true` gives lip-sync stretches and the shot list at the minimum price. Early / late stretches go to
  lip fix. `GET /api/v1/director/jobs/{id}/shots` lists the cuts of a finished Director video for free.
- A full read with a `question` checks one thing across the whole video ("is there burned-in text?", "how many
  different people appear in 20-35 s?"). Treat it as a hint and confirm by eye. For a scored report with ready
  fixes use Montage Analyze (`POST /api/v1/director/videos/edit/analyze`); full QA steps are in
  references/montage/pixio-video-qa.md.

### Captions and edits
- `voice_stretches` and `voices[].stretches` tell you where speech or singing is, so captions and lower thirds can
  avoid or follow it. The words themselves come from the package captions (`captions: "auto"` transcribes); see
  references/montage/pixio-lyric-captions.md and references/montage/pixio-graphics-titles.md.
- `measured.shots` works on any upload, so you can plan a re-cut of a customer's own video before sending it to
  `POST /api/v1/director/videos/assemble` (references/montage/pixio-video-editing.md). `changes` and `beat_s` give
  cut points that land on the music.

## Checklist

- [ ] `measure_only: true` first when numbers are enough; the full read only when you need descriptions.
- [ ] Full read: price told, human said yes; long videos windowed or `resolution: "low"`.
- [ ] `focus` or `question` set so the answer serves the plan.
- [ ] Measured lip-sync used, never the read's eye; words checked another way.
- [ ] No private lyrics or API key in `question`, `focus`, logs or links.
- [ ] Style taken, never people, faces, logos or text from someone else's video.
- [ ] Customer's own song used for music videos; every supplied picture still used in the plan.
