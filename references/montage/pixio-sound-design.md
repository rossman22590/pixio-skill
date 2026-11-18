---
name: pixio-sound-design
description: How an AI agent designs the sound of a Montage (Pixio's Director API) video - the native audio Montage Basic and Montage Premium / Ultra make with the picture (overall_soundscape / non_diegetic_music, <sound effects>, (music), "No BGM." and the audio policy), effects tied to visible actions, music beds and scores (package music, score, music_db, duck_under_dialogue, music_until_s, laugh_track), loudness, and the after-render sound tools (POST /api/v1/director/audio/sfx, /api/v1/director/audio/foley, /api/v1/director/audio/master). Use whenever you write the sound part of a prompt, add music or effects to a video, or fix how a video sounds. Not for spoken lines (that is `references/montage/pixio-dialogue-voices.md`), not for every audio tool field (that is `references/montage/pixio-audio-tools.md`), not for music videos on a customer's song (that is `references/montage/pixio-music-video.md`).
---

# Montage sound design

Sound is half of what makes a clip feel real, and both models make it with the picture. Write it as precisely as
the picture, decide the music once per film, and add the rest after the render. Every job POST answers 202 with a job id you poll
(`references/montage/pixio-jobs-polling.md`); send each one once.

## House rules

- **Test on Basic.** Every test, draft or trial render runs on Montage Basic (`video_model: "montage-basic"`, also
  what you get when `video_model` is left out). Basic is billed in credits too, just least. Premium or Ultra only
  when the user asks for it and has seen the quote (`?check=true`).
- **The customer's own song first.** A music video uses the song the user gave you (`song`). `POST /api/v1/director/music/generate`
  is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE`
  (`https://beta.pixio.myapps.ai`) and `$PIXIO_API_KEY`.

The `/api/v1/director/audio/*` tools and packaging are billed in credits by the seconds they make (prices in
`GET /api/v1/director/catalog`). Never echo a customer's lyrics into prompts, logs or public places.

## 1. Decision rules (read first)

| want | do this |
|---|---|
| Sound that matches the picture (steps, doors, rain) | write it in the prompt: the video model makes it with the picture |
| No score at all | Basic: `non_diegetic_music: N/A`; Premium: "No BGM." (or the audio policy) |
| One steady score across a film | the **same** `non_diegetic_music` line in every clip, or N/A + a packaged bed / `score` |
| Your own music track under a video | packaging `music` file (a film: `music_bed`) with `music_db`, `duck_under_dialogue` |
| Music written for this video | packaging `score: "auto"` or your own description (an instrumental made for it) |
| A single effect file (whoosh, glass, door) | `POST /api/v1/director/audio/sfx` |
| Effects synced to an existing clip (up to 30 s) | `POST /api/v1/director/audio/foley` |
| Your own multi-track mix | `POST /api/v1/director/audio/master` (up to 16 tracks, ducking, fades, loudness) |
| A sitcom laugh track | packaging `laugh_track: "light"` or `"full"` (series take it too) |

## 2. Native audio on Montage Basic

Basic renders sound with every clip. It follows two required sections; leave either out and it invents sound and music.

```
overall_soundscape: <sounds tied to shots: "Shot 1: ... Shot 2: ...">
non_diegetic_music: <score with cues, or N/A>
```

- **Tie every sound to something visible** and to its shot: "the soft scratch of the pen in Shot 2, and a gentle
  two-tone electronic chime when the panel light activates in Shot 3".
- **Name continuous beds once:** "A low hum of the fluorescent ceiling tube and a faint ticking wall clock run
  continuously".
- End with "No other voices." when only scripted speech should be heard, and leave about a second of quiet after
  each line: an unfilled gap invites invented sound, a written pause does not.
- **Music across a film:** the same `non_diegetic_music` line in every clip, or N/A plus the same low drone line. A
  different score per clip jumps at every join.
- Describe what is there. Basic has no negative prompt; lists of "no X, no Y" hurt.
- No water, wave or echo words unless the scene needs them.

Bad:
```
overall_soundscape: epic cinematic sound design, intense atmosphere
non_diegetic_music: dramatic
```

Good:
```
overall_soundscape: Shot 1: wind across the empty car park and a distant highway hiss. Shot 2: her heels on wet concrete, a car door thudding shut. Shot 3: the engine turning over twice and catching. No other voices.
non_diegetic_music: A barely audible, very low, steady sub-bass drone throughout.
```

## 3. Native audio on Montage Premium / Ultra

Premium also makes sound with the picture. Its marks (the official symbol table, which the studio's writer uses):

| mark | meaning |
|---|---|
| `{...}` | dialogue |
| `<...>` | a sound effect: `<boots on wet cobblestone>` |
| `(...)` | music: `(warm electric piano, slow, no vocals)` |
| `【...】` | on-screen text: avoid; add text in packaging |

- **2-3 sound layers per shot at most**, each tied to a visible action, written inline after the shot's action.
- A `[Sound]` line states the mix: "Dialogue clean and prominent, ambience subtle. No BGM." is the house default.
- **Silence in the prompt is not a request for silence:** unspecified sound comes back as an advert-like score. The
  checker warns when a prompt says nothing about what we hear.
- **Music leaks** (at reveals, when the camera looks up): open `[Sound]` with the official audio policy:
  "Audio policy (all shots): only the spoken dialogue and faint natural ambience. No music, BGM, score, instrumental,
  melody, synth, ambient pad, drone, crescendo or stinger." and repeat "No music." on reveal shots.
- Music, when wanted, is concrete tempo and instruments in `(...)`, not a mood word.
- **Ending noise** at the very end of a take is a known Premium issue; the packaging fade fixes it.
- Write "No BGM." when a voiceover or the customer's music will be added afterwards, so the two don't fight.

```
Shot 2 (4-8s): [Medium shot, slow lateral track] Ren slides the tray across the counter. <a ceramic cup scraping on steel>, <rain against the window>.
...
[Sound] Effects close and dry, rain steady underneath. No BGM.
```

Premium music videos: the vocal is sent as the isolated stem; by default Premium's own sung audio is kept (the same
picture over the customer's song comes free as `output.withOriginalSong`), and `music_sync: "song"` keeps the
customer's exact song under the whole video. Details: `references/montage/pixio-music-video.md` and `references/montage/montage-premium-prompting.md`.

## 4. Effects writing: what renders well

- **One effect per contact or event**, named by material: "a dull wooden knock", "a ringing steel clash", "a heavy
  thud on packed dirt".
- **Sound follows the cut:** put the effect in the shot where its cause is visible.
- **Breathing and cloth** sell action and quiet scenes: "heavy breathing", "cloth snaps on the kick".
- **Room tone** makes a place real: a fridge hum, distant traffic, a ticking clock.
- **Fewer, specific sounds beat many vague ones.** "Ambient city sounds, people, cars, birds, music from a cafe"
  becomes mush.
- Fights: "No other voices." (Basic) or "Nobody speaks." first in the constraints (Premium), or the fighters start
  shouting lines. See `references/montage/pixio-action-fights.md`.

## 5. Music beds and scores in packaging

Packaging runs after the render (`package` on a film or clip, or `POST /api/v1/director/videos/package` on a finished
job), priced by the seconds of video it writes; `GET /api/v1/director/catalog` lists its fields and rates:

| field | default | what it does |
|---|---|---|
| `music` (file; on a film: `music_bed`) | none | looped or trimmed to the video, faded in and out |
| `music_db` | -8 | bed level against the mix target |
| `keep_original_audio`, `original_db` | true, 0 | keep the video's own sound under the bed |
| `duck_under_dialogue`, `dialogue_duck_db` | false, -12 | dip the bed wherever characters speak (the speech is found automatically) |
| `voiceover` file / `voiceover_text`, `duck_db` | none, -10 | music and the video's sound dip under the voiceover |
| `music_until_s` | whole video | bed only for the first N s (a theme), fading over the last 2 s |
| `score` | none | `"auto"` (the AI writes the brief from the video) or your words; an instrumental of the video's length, dipping under speech; `score` credits per started 5 minutes |
| `laugh_track`, `laugh_db` | off, -4 | `light` (clear jokes, at most one laugh every ~6 s) or `full`; real recorded laughs (`laughTrack` credits) |
| `lufs` | -14 | loudness target when music or a voiceover is mixed (-23 for broadcast); peaks stay under -1 dBFS |

- An uploaded music bed wins over `score`.
- Documentaries get a score by default (`"score": "off"` removes it); explainers are packaged with their narration.
- `POST /api/v1/director/videos/music` keeps the song as the soundtrack, so it takes no music bed.

```bash
curl -X POST "$BASE/api/v1/director/videos/package" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F job_id=JOB_ID -F music=@bed.mp3 -F music_db=-10 -F duck_under_dialogue=true -F lufs=-14
```

```json
{"job_id": "JOB_ID", "score": "slow felt piano and a low cello, sparse, rising gently in the last ten seconds",
 "duck_under_dialogue": true}
```

## 6. After-render sound tools

**`POST /api/v1/director/audio/sfx`** - an effect made by a sound model from a `description` (up to 500 characters),
or `engine: "library"` to pick from the sound library instead. `count` takes (default 3), `duration_s`, `seed`,
`steps`, `cfg`, `negative_prompt`, `fade_in_s`, `fade_out_s`, `lufs` (default -18), `format`. Short lengths come
out shaped like single events (a shatter then silence); longer ones tend to continuous sound. Model effects are
priced per second made (count x duration), at least 16 credits; a library pick is 16. Every take is in the done
job's `files`.

```bash
curl -X POST "$BASE/api/v1/director/audio/sfx" -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json"  \
  -d '{"description": "heavy wooden door creaks open slowly", "duration_s": 4, "count": 3}'
```

**`POST /api/v1/director/audio/foley`** - sound for a video in sync with what happens: a finished `job_id` or a `video`
upload up to 30 s; optional `prompt` ("footsteps on gravel, distant traffic"), `negative_prompt` ("music, speech").
`output=video` (default) returns the video with the new sound; `keep_original=true` (default) mixes it under the
video's own sound at `mix_db`, `false` replaces it. `output=audio` returns the foley alone. Priced like
`videos/finish` on the length made, at least 16 credits.

**`POST /api/v1/director/audio/master`** - 1-16 tracks (job ids or uploads), each with `offset_s`, `volume_db`, `duck_under`,
`duck_db`, fades and trims, to `lufs` (default -14) and `true_peak_db` (default -1); `video_from` puts the mix on a
video track. Use it to lay several effects into a clip:

```json
{"tracks": [
  {"job_id": "VIDEO_JOB", "source": "video"},
  {"job_id": "SFX_JOB", "offset_s": 6.5, "volume_db": -3},
  {"job_id": "BED_JOB", "volume_db": -12, "duck_under": 1, "fade_out_s": 2}],
 "video_from": 1, "lufs": -14}
```

Field-by-field detail for every audio tool: `references/montage/pixio-audio-tools.md`.

## 7. Loudness targets

- Streaming and social: -14 LUFS (packaging and master default), true peak -1 dBTP.
- Broadcast: -23 LUFS.
- Voiceover reads come out at -16 LUFS; effects at -18 LUFS; mixed down by packaging or master afterwards.
- A film's `finish` also takes `lufs` (as `/api/v1/director/videos/finish`).

## 8. Fixing how a video sounds

| problem | fix |
|---|---|
| A score you didn't ask for (Basic) | `non_diegetic_music: N/A`; redo the clip |
| A score you didn't ask for (Premium) | "No BGM." / the audio policy; redo the take |
| Music jumps at every join | same music line in every clip, or N/A + one packaged bed or `score` |
| Effects missing or weak | name each on its shot and material; or `/api/v1/director/audio/foley` on the clip |
| Bed drowns the dialogue | `duck_under_dialogue=true`, lower `music_db` |
| Noise or hum in an uploaded voice | `POST /api/v1/director/audio/clean` before mixing |
| Noise at the end of a Premium take | packaging fade (or film `fade`) |

## Checklist

- [ ] Basic prompts have both `overall_soundscape:` and `non_diegetic_music:` (N/A when there is no score).
- [ ] Premium prompts say what we hear: inline `<effects>`, `(music)` or "No BGM.", and a `[Sound]` line.
- [ ] Every sound tied to a visible action in its own shot; 2-3 layers per shot at most.
- [ ] One music decision for the whole film: the same line every clip, or a packaged bed / `score`.
- [ ] Customer's song used when one was given; nothing generated in its place.
- [ ] Bed ducked under speech; loudness -14 LUFS (or -23 broadcast), true peak -1.
- [ ] No grain or noise words; test renders on Montage Basic; the `?check=true` quote shown before Premium.
