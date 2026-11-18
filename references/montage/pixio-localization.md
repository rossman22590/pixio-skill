---
name: pixio-localization
description: How an AI agent makes a Montage (Pixio's Director API) video work in other languages - burned-in subtitles (package captions), translated subtitles (subtitle_language), dubbing in each speaker's own cloned voice (dub_language in package, or POST /api/v1/director/audio/dub), narration in another language (voiceover_text with a studio voice of that language, or a cloned narrator), native re-renders with lines written in the target language, lip-sync after a dub (POST /api/v1/director/videos/relip, /api/v1/director/videos/lipfix), and shipping several language versions of one film, ad or explainer. Use whenever a video needs captions, a translation, a dub or a version per market. Not for writing original dialogue (that is references/montage/pixio-dialogue-voices.md) or every audio tool field (that is references/montage/pixio-audio-tools.md).
---

# Pixio localization: subtitles, translations, dubs

Render once, approve once, then make every language from that master: subtitles to read, a dub to listen to, a
translated narration, and lips fixed only where a face talks in close-up. Every start call answers `202` with a
job id; poll `GET /api/v1/director/jobs/{id}` and never resubmit on a timeout
(`references/montage/pixio-jobs-polling.md`).

## House rules

- **Test on Basic.** Video tests, drafts and trial renders run on Montage Basic (leave `video_model` out). Montage
  Premium or Ultra only when the user asks for it and has seen the `?check=true` quote.
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.

For localization:
- **Lyrics are private.** Songs and music videos are not dubbed (mostly-sung audio is refused); never paste lyrics
  into prompts, logs or public places.
- **Price before spending.** Everything here is billed in credits. Packaging (captions, translated subtitles, dubs,
  typed voiceovers) is priced by the seconds it writes and has a free quote (`?dry_run=true` on
  `/api/v1/director/videos/package` and `/api/v1/director/jobs/{id}/edit`). Relip and lip fix are priced from the
  studio's quote of the request, with no free preview; a Premium re-render quotes with `?check=true`. Tell the human
  the number and wait for a yes on the dearer steps.

## 1. Decision rules (read first)

| want | do this | price | lips |
|---|---|---|---|
| Captions in the spoken language | package `captions: "auto"` | no extra over packaging | n/a |
| Captions in another language | package `subtitle_language: "Spanish"` (any language name) | packaging + a small fixed add-on (16) | n/a |
| Speech replaced in another language, same voices | package `dub_language` (10 languages) | packaging + priced like `videos/finish` on the video's seconds | do not match |
| Dub plus matching lips | dub, then `POST /api/v1/director/videos/relip` on the dubbed job | + the relip quote | match |
| A narrated explainer or ad in another language | package `voiceover_text` in that language + a voice that speaks it | no extra over packaging | n/a (no one on screen talks) |
| The best lips on a short scene | re-render the clips with the lines written in the target language | a clip redo per clip; Premium quoted | native |
| A sound-only dub (podcast, voice track) | `POST /api/v1/director/audio/dub` | like finishing on the length made | n/a |

Exact rates: `GET /api/v1/director/catalog` -> `prices` (`packagePerSecond`, `packageMinimum`, `finishPerSecond`).

## 2. Subtitles (real pixels, never from the video model)

Never ask a video model for subtitles: it garbles text, and on Premium every prompt should say "Keep it
subtitle-free." Real subtitles are drawn by packaging after the render.

`captions` (in `package` on a film or shot, on `POST /api/v1/director/videos/package`, or on
`POST /api/v1/director/jobs/{id}/edit`):
- `"auto"`: transcribed from the voiceover, else from the video's own speech;
- SRT or WebVTT text;
- a JSON list of `{"text", "start", "end"}` in seconds (your exact lines and times);
- `"off"` to drop them (documentaries add subtitles by default).

Style: `caption_style` (`subtitle` default, or `pop` for word chunks timed word by word with `"auto"`),
`caption_words` (1-8, pop), `caption_position` (`bottom`, `center`, `lower_third`, or 0-1), `caption_font`
(`brand` or a listed bold font), `caption_size`, `caption_color`, `caption_stroke_color`, `caption_stroke_width`,
`caption_shadow`, `caption_highlight_color`, `caption_uppercase`, `caption_animation` (`none`, `pop`, `fade`).
On 9:16 the captions sit above the phone UI. Cutdowns keep the lines of the parts they keep.

Exact text from a script beats `"auto"` when names or brand words matter: send your own list, or run
`POST /api/v1/director/audio/transcribe` (with `vocabulary`, up to 1000 characters) and correct the SRT before
sending it.

## 3. Translated subtitles: `subtitle_language`

`subtitle_language` in packaging takes any language name ("Spanish", "Japanese", "Brazilian Portuguese", up to 40
characters). The captions (`auto` if you send none) are translated line by line, keeping their times. If the
translation fails, the subtitles stay in the original language, so watch the result.

```json
{"job_id": "FILM_JOB", "captions": "auto", "subtitle_language": "Japanese", "caption_position": "bottom"}
```

Tips:
- Short cues read better translated: keep `caption_style: "subtitle"`; pop chunks of 3 words can split a translated
  phrase awkwardly.
- Languages that run longer (German, Spanish) need room: a smaller `caption_size` or `lower_third` position.

## 4. Dubbing: `dub_language`

`dub_language` in packaging: English, Chinese, Japanese, Korean, German, French, Russian, Portuguese, Spanish or
Italian (the languages the cloned voices speak; others are refused). What happens:

1. The speech is separated from the music and ambience.
2. Each line is transcribed and translated.
3. Each line is read again **in its own speaker's voice**, cloned from that very line, fitted to the line's time.
4. The new voices are laid over the original music and ambience.

- `captions: "auto"` then shows the dub's own lines; `subtitle_language` can still pick another language for them.
- **Lips do not match the new language.** Fix with section 6 when faces talk in close-up.
- No speech found means nothing is dubbed; a failed dub packages in the original language. Listen to every version.

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/package?dry_run=true" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"job_id": "FILM_JOB", "dub_language": "Spanish", "captions": "auto"}'
```

Read `credits.quoted`, then send the same body without `?dry_run=true`.

Sound only, or with your own levels: `POST /api/v1/director/audio/dub` (`job_id` or an `audio` upload, `language`,
`content`, `start_s` / `end_s`, `voice_db`, `background_db` (-60 for voices only), `output` `auto` / `audio`,
`true_peak_db`). Details in `references/montage/pixio-audio-tools.md`.

## 5. Narration in another language

Explainers, documentaries and ads narrated over the picture don't need a dub: read a translated script.

- `voiceover_text` (up to 1500 characters) written in the target language, with a `voiceover_voice` that speaks it.
  `GET /api/v1/director/voiceover/voices` (free) lists the studio voices with their language (54 voices in 8
  languages: American and British English, Spanish, French, Hindi, Italian, Japanese, Brazilian Portuguese,
  Mandarin). Write the script in that voice's language.
- The same narrator in every language: send a `voiceover_sample` (5-15 s of the narrator, clean) to have the script
  read in that voice; `voice_clone` picks how (`natural` default, best match; `fast`; `classic`). Same price. Or make
  the read first with `POST /api/v1/director/audio/voiceover` (`text`, `voice`, or `voice_sample` /
  `voice_sample_job` with `voice_sample_start_s` / `voice_sample_end_s`) and send the file as `voiceover`.
- Translations run longer: keep the script to about 2.5 words a second of video; packaging speeds it up a little at
  most, so a script that is still too long gets cut short. Trim it rather than hope.
- `captions: "auto"` subtitles the voiceover in its own language.

```json
{"job_id": "EXPLAINER_JOB", "voiceover_text": "Los gatos giran en el aire en menos de un segundo.",
 "voiceover_voice": "VOICE_ID_FROM_GET_VOICES", "captions": "auto", "caption_style": "pop"}
```

## 6. Lip-sync after a dub

Packaging a dub creates a new job. Use that job's id as the source.

**`POST /api/v1/director/videos/relip`** - re-does the mouth to the video's sound and pastes only the mouth and jaw
into the original frames (same size, fps and frame count). Fields: `job_id` (or a `video` upload, optional
`audio`), `source` (`video` default), `only_sung` (change the mouth only where the voice is heard), `isolate_vocal`
(drive the lips with the separated voice), `soundtrack` (keep the dub), `mask_grow`, `feather`, `sharpen`,
`color_match`, `offset_s`. Priced from the studio's quote of the video's length; there is no free preview, so
estimate it with the human before the call. See `references/montage/pixio-lipsync-fixing.md`.

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/relip" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"job_id": "PACKAGE_JOB_ES"}'
```

**`POST /api/v1/director/videos/lipfix`** - one Montage Basic render per window of 4-14 s: `job_id`, `start_s`,
`end_s`, `audio_from: "video"` so the window follows the dubbed sound. Good for one close-up line; every shot and cut
outside the window stays in place. Priced from the studio's quote of the window, at least 16 credits.

Only fix shots where a face talks in close-up or medium; wide shots and back-of-head shots don't need it.

## 7. Native re-render (best lips)

For a short ad or a key scene, render the clips again with the lines in the target language:
- Montage Basic: the official format names the language in the line, `(S1) <d>[Spanish] ...</d>`; re-count the
  words (about 2.6 per second plus 1 s) because translations run longer. Keep each character's voice description
  word for word, and give the accent of the new language its own one or two markers
  (`references/montage/pixio-dialogue-voices.md`).
- Montage Premium / Ultra: open with "Dialogue language: Spanish." and keep each line to 10 words (about 1.6 per
  second) (`references/montage/montage-premium-prompting.md`).
- Use the same pictures, voice samples and seeds; `POST /api/v1/director/videos/film/{id}/redo` with a corrected
  `prompt` does one clip at a time.

## 8. Several language versions of one video

1. Render the master video once **without** packaging (an English film or ad).
2. Approve it in its own language first.
3. Make one `POST /api/v1/director/videos/package` per language from the same master `job_id`, each with the full
   package fields (`brand_id`, end card, music, `formats`, `cutdowns`) plus that language's `dub_language` /
   `subtitle_language` / `voiceover_text`. Quote each with `?dry_run=true`; the total is the sum. Always package
   from the master, never from another language's package job.
4. Lip-sync only the versions and shots that need it.
5. Check every version (section 9).

A film packaged in its own render already carries its end card and captions, so plan language versions before you
add `package` to the film request.

Edit by shots per market: `GET /api/v1/director/jobs/{id}/shots` (free) lists the cuts;
`POST /api/v1/director/jobs/{id}/edit` with `{"shots": [1, 2, {"shot": 4, "trim_start": 0.3}, 3]}` keeps those
shots in that order, and takes packaging fields (captions, dub, music) in the same call.

## 9. Check every version

- Watch it with the sound on: every line dubbed, no original-language words left, voices match their speakers.
- `POST /api/v1/director/audio/transcribe` on the dubbed job with `language` set and `content: "speech"`, one 15 s
  window at a time (`start_s` / `end_s`), to confirm each line (a small fixed price per call).
- Subtitles readable at phone size, no line over two rows, nothing hidden under the end card.
- A dub or translation that failed leaves the original language: listen and read, don't assume.
- Lips: watch the close-ups; Montage Analyze (`POST /api/v1/director/videos/edit/analyze`, `checks: ["lipsync"]`)
  measures them if you need numbers.

## Checklist

- [ ] No subtitles asked of the video model; Premium prompts say "Keep it subtitle-free".
- [ ] Captions from packaging; exact script lines when names matter.
- [ ] `subtitle_language` for reading, `dub_language` (one of the 10) for listening.
- [ ] Narration re-voiced with `voiceover_text` in the target language and a voice that speaks it.
- [ ] Songs and music videos never dubbed; lyrics stay private.
- [ ] Each language packaged from the master job, with the same package fields.
- [ ] Every package quoted with `?dry_run=true`; relip / lip fix / Premium steps priced and approved.
- [ ] Every version watched and transcribed per 15 s window.
