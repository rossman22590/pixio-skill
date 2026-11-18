---
name: pixio-audio-tools
description: Every stand-alone sound tool in Montage (Pixio's Director API) in depth - POST /api/v1/director/audio/transcribe, /stems, /clean, /master, /voiceover, /dub, /sfx and /foley (plus GET /api/v1/director/voiceover/voices) - their fields, defaults and limits, what each returns, what each costs, when to use which, and how to chain them with video jobs (a job's sound in, a mix back onto its video). Use whenever you transcribe, separate, clean, mix, read aloud, dub, or make effects for audio or video, or need a field of one of these tools. Not for writing sound into prompts (that is pixio-sound-design) or the packaging-level dub and subtitles (that is pixio-localization).
---

# Pixio audio tools (`/api/v1/director/audio/*`)

Base URL `$BASE` (`https://beta.pixio.myapps.ai`), header `Authorization: Bearer $PIXIO_API_KEY`. Each tool is a normal
Director job: `202` with an id, then poll `GET /api/v1/director/jobs/{id}` every 10-30 s until `done` (on a timeout
keep polling the same id; never resubmit). Every tool is billed in Pixio credits; none has a free quote
(`?check` / `?dry_run` answer `400 preflight_unavailable`), so read the rates in `GET /api/v1/director/catalog`:

| tool | price |
|---|---|
| `transcribe` | 16 credits a job |
| `stems`, `clean`, `master`, `dub`, `foley` | like `videos/finish`: about 1.46 credits a second of sound (or video), at least 16 |
| `voiceover` | like `videos/finish` on the seconds read (about 15 characters a second), at least 16 |
| `sfx` | `engine: "library"` 16; made by the sound model 0.2 credits a second made (`count` x `duration_s`), at least 16 |

The start response's `credits.quoted` is what is held; a `402` means nothing started.

## House rules

- **Test on Basic.** Every video test, draft or trial render uses `video_model: "montage-basic"` (also the default
  when `video_model` is left out). Premium or Ultra only when the user asks for it and has seen the quote
  (`?check=true`, `credits.quoted`).
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.

For sound specifically:
- **Lyrics are private.** Mostly-sung audio returns timings only from transcribe and is refused by dub. Never paste a
  customer's lyrics or transcript into logs, prompts or public places.
- **Voices need consent.** Clone a real person's voice only with their permission.

## 1. Which tool

| you need | tool |
|---|---|
| Words with times, SRT / VTT | `transcribe` |
| Vocals apart from the music (a voice sample, a karaoke bed, a remix) | `stems` |
| A noisy, echoey or humming voice recording fixed | `clean` |
| Several sounds mixed to one loudness, maybe onto a video | `master` |
| Text read aloud, a preset or a cloned voice | `voiceover` |
| A video's speech in another language, each speaker's own voice | `dub` |
| An effect from a description | `sfx` |
| Sound for a silent or thin video, in sync with its picture | `foley` |

## 2. Inputs common to the source tools

`transcribe`, `stems`, `clean` and `dub` take one sound:

- `job_id`: any finished Director job's sound (video, music video, song or another audio job), **or**
- multipart file `audio`: mp3 / wav / m4a / flac, or any video (its sound is used). A media field also takes a URL
  string or a path from your own Pixio assets.
- `source`: `auto` (a Montage Premium music video's original-song version when there is one, else the job's own file),
  `video` (the delivered video's sound), `song` (the original-song version only).
- `start_s` / `end_s`: use only that window.
- JSON or multipart both work. Fields a tool does not list in `GET /api/v1/director/catalog` are ignored, so check
  spelling there.

Results: `output.url` is the main file (a signed URL valid 6 hours; `output.assetPath` is the durable copy in your
assets, and `GET /api/v1/director/jobs/{id}/audio` redirects to a fresh copy). Every extra output is in the job's
`files`: a list of `{name, type, url, assetPath}`.

## 3. `POST /api/v1/director/audio/transcribe`

Speech to text with word times. The done job's `transcript` has segments and words with times and the language, and
`files` holds the SRT, VTT and text versions.

| field | default | notes |
|---|---|---|
| `content` | `auto` | `auto`: words for speech, timings only when the voice is mostly singing; `speech`: words even over music; `singing`: timings only |
| `language` | detected | ISO-639-1 code (`en`, `es`, `de`) |
| `vocabulary` | none | names and words to spell right, up to 1000 characters; not stored |
| `isolate_voice` | `auto` | transcribe the separated vocal: `auto` when a music bed was found, `on`, `off` |
| `cue_max_words`, `cue_max_s` | 7, 5.0 | SRT / VTT cue size |
| `chunk_s` | 600 | long sound is sent in pieces this long |
| `no_speech_max` | 0.6 | drop segments this likely not speech |

Use it to check that every scripted line was spoken: one 15 s clip at a time (fight noise makes long audio loop).

```bash
curl -X POST "$BASE/api/v1/director/audio/transcribe" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"job_id": "FILM_JOB", "start_s": 30, "end_s": 45, "content": "speech"}'
```

## 4. `POST /api/v1/director/audio/stems`

`stems=4` (default): `vocals`, `drums`, `bass`, `other` plus `accompaniment` (all but vocals); `stems=2`: `vocals`
and `accompaniment`. The main output is the first stem; every stem is in `files`. `shifts` (default 1; more is
cleaner and slower), `overlap` (default 0.25), `bit_depth` `16` / `24` / `32`.

Uses: cut a clean voice sample from a finished job's `vocals`; get a bed without vocals for a remix or a karaoke
version of the customer's song (keep it private).

## 5. `POST /api/v1/director/audio/clean`

Voice clean-up.

| field | default | notes |
|---|---|---|
| `strength` | 0.6 | noise reduction 0-1 |
| `dereverb` | 0.3 | echo / room reduction 0-1 (`reverb_time_s` 0.5) |
| `dehum` | `auto` | `off`, `50`, `60` (Hz mains hum; `hum_harmonics` 6) |
| `highpass_hz` | 70 | rumble cut (0 = off) |
| `keep_breaths` | true | false turns breaths down by `breath_reduction_db` (12) |
| `max_reduction_db` | 18 | most a sound is turned down at strength 1 (never to silence) |
| `lufs` | keep level | optional loudness target |
| `output` | `auto` | the cleaned sound, plus the video with it when the source is a video (in `files`); `audio`; `video` |

Clean every home-made voice sample before using it as `ref_audios` or `voice_sample`.

## 6. `POST /api/v1/director/audio/master`

Mix 1-16 tracks to a loudness with a true-peak ceiling. Each track: `job_id` (a finished job of yours) **or** `file`
(the n-th uploaded `audio`, 1 = first), plus `source`, `start_s`, `end_s`, `offset_s` (where it starts in the mix),
`volume_db`, `duck_under` (dip wherever track N has sound), `duck_db` (-12), `fade_in_s`, `fade_out_s`.

Whole mix: `lufs` (-14), `true_peak_db` (-1), `length_s` (default: until the last track ends), `format` `wav` /
`flac` / `m4a`, `video_from` (also put the mix on track N's video; that track must be a video). Multipart: send
`tracks` as JSON text and repeat the `audio` field.

```json
{"tracks": [
  {"job_id": "VIDEO_JOB", "source": "video", "volume_db": -4},
  {"job_id": "VOICEOVER_JOB", "offset_s": 1.0},
  {"job_id": "STEMS_JOB_OR_BED", "volume_db": -10, "duck_under": 2, "fade_out_s": 3}],
 "video_from": 1, "lufs": -14, "format": "wav"}
```

## 7. `POST /api/v1/director/audio/voiceover`

Text to speech, a preset voice or a clone.

| field | default | notes |
|---|---|---|
| `text` | required | up to 5000 characters; write it in the voice's language |
| `voice` | `af_heart` | a preset; `GET /api/v1/director/voiceover/voices` (free) lists 54 voices in 8 languages with a description |
| `voice_sample` (file) or `voice_sample_job` | none | clone: 5-15 s of clean speech works best. `voice_sample_start_s` / `_end_s` pick the part of a job's sound |
| `speed` | 1.0 | slower or faster reading |
| `pause_s`, `chunk_chars` | | silence between sentences; characters per read |
| `lufs`, `true_peak_db`, `pad_s`, `format` | -16, -1, 0.1, `wav` | |

```bash
curl -X POST "$BASE/api/v1/director/audio/voiceover" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "text=The harbour was quiet the night the lights went out." \
  -F voice_sample=@narrator_clean.wav
```

## 8. `POST /api/v1/director/audio/dub`

A video's or a sound's speech in another language, each line in its own speaker's cloned voice: the voices are
separated, transcribed, translated and read again, each line fitted to its time, over the original music and
ambience. **Lips do not match** (`references/montage/pixio-lipsync-fixing.md` or
`references/montage/pixio-localization.md`).

| field | default | notes |
|---|---|---|
| `language` | required | English, Chinese, Japanese, Korean, German, French, Russian, Portuguese, Spanish, Italian |
| `content` | `auto` | mostly-singing audio is refused; `speech` = you say it is speech |
| `voice_db`, `background_db` | 0, 0 | dubbed voices' level; music and ambience under them (-60 = voices only) |
| `output` | `auto` | the dubbed sound, plus the video with the dub when the source is a video (in `files`); `audio` |

For a whole delivered film use packaging `dub_language` instead (see `references/montage/pixio-localization.md`),
which also re-captions.

## 9. `POST /api/v1/director/audio/sfx`

Effects from a `description` (up to 500 characters).

| field | default | notes |
|---|---|---|
| `engine` | `auto` | `auto`: a sound model makes it (up to 30 s); `model`: always the model; `library`: the best matches from the sound library (up to 60 s; a recording is trimmed or looped) |
| `duration_s` | 5 | length of each take |
| `count` | 3 | takes (seed, seed+1 ...) or library matches; the main output is the first, every one is in `files` |
| `steps`, `cfg` | the model's own | fewer steps = faster, rougher; `cfg` = how closely it follows the description |
| `negative_prompt` | none | what to keep out |
| `fade_in_s`, `fade_out_s`, `lufs`, `seed`, `format` | 0.005, 0.05, -18, 0, `wav` | |

The library holds the everyday editing sounds (whoosh, riser, impact, click, chime, coin, wind, rain, heartbeat,
studio laughs, applause...); ask `engine: "library"` for those. The model is best at single events (a shatter, then
silence) and also does continuous sound and longer effects.

Good descriptions are one event and its material: "glass shatter", "heavy wooden door creaks open slowly", "rain on a
tin roof". Bad: "epic cinematic boom with tension".

## 10. `POST /api/v1/director/audio/foley`

Sound made for a video, in sync with what happens: a finished video `job_id` or a `video` upload up to 30 s.
`prompt` (optional, up to 500 characters; the picture leads), `negative_prompt` ("music, speech"), `output` `video`
(default) or `audio`, `keep_original` (true: mixed under the video's own sound; false: foley alone), `mix_db`,
`foley_lufs`, `true_peak_db`, `steps`, `cfg`, `seed` (another take).

## 11. Chaining with video jobs

- **Into a tool:** any finished job id is a source (`job_id`, `voice_sample_job`, `tracks[].job_id`).
- **Back onto a video:** `master` with `video_from`; `clean` / `dub` with `output=video`; `foley` returns the video.
- **Into packaging:** send the tool's file (its URL or asset path) as `music` or `voiceover` to
  `POST /api/v1/director/videos/package`.
- **Into a film:** a voiceover or stem file as `ref_audios` (a voice sample) on `/api/v1/director/videos/film`.

Typical chains:
1. Narrator from a rough phone recording: `clean` -> `voiceover` with `voice_sample_job` = the clean job -> package
   `voiceover` onto the film.
2. A character's voice from clip 1 of a film: `stems` (`job_id`, `start_s`, `end_s` around the line) -> `vocals` ->
   `clean` -> `ref_audios` for the next film.
3. Sound for a silent montage clip: `foley` (`keep_original=false`) -> `sfx` for the one hero hit -> `master` with
   `video_from: 1`.
4. Check speech: `transcribe` each 15 s clip with `content: "speech"`; compare with the script.

## Checklist

- [ ] Right tool for the job (table in section 1); one source: `job_id` or an upload, not both.
- [ ] Price read from the catalog and agreed for long sound (no free quote on these tools).
- [ ] Voice samples 5-15 s, clean (`clean` first), one speaker, with consent.
- [ ] Sung audio left private: no lyrics requested, logged or pasted; dub only for speech.
- [ ] Effects described as one event and its material; `count` takes compared by ear.
- [ ] Mix at -14 LUFS (or -23 broadcast), true peak -1; beds ducked under voices.
- [ ] Outputs fetched from `output.url` or `files[].url`; no key in any URL you share.
