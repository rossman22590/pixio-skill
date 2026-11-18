---
name: pixio-song-generation
description: How to make a song with POST /api/v1/director/music/generate (Montage's music model on Montage, Pixio's Director API) when the user has NO song of their own - the three-part music description, tagged lyrics, instrumentals, genre recipes, why songs come back short and how to get the length you need (more sections, fill=loop), duet songs with voices, and passing the finished song_job into /api/v1/director/music/plan and /api/v1/director/videos/music. Use whenever someone wants a music video, jingle or theme but has no audio, or asks for an original song. Not for music videos from the customer's own song (that is pixio-music-video), score/music beds under films (package score, pixio-sound-design) or duet video planning (pixio-duets).
---

# Song generation (only when there is no song)

`POST /api/v1/director/music/generate` writes a complete song (vocals and full arrangement, up to 5 minutes) with
Montage's music model. When the job is done, `output.url` is the audio; `song_job=<id>` feeds it straight into a
music video.

## First decision: should you generate at all?

**About 99 % of music videos come with the customer's own song. Use it.** Generate only when:

- the user says they have no song, or asks for an original song / jingle / theme, or
- you need a short instrumental and nothing was supplied (and the request is not a film or ad that can use
  `package.score`, which makes a matched instrumental on its own).

Never generate a song "to test" when the customer sent one. Never replace their song because it is long or hard.

## House rules

- **Test on Basic.** Every test, draft or trial render runs on Montage Basic (`video_model: "montage-basic"`, or
  leave `video_model` out). Every call is billed in Pixio credits, songs included. Premium or Ultra only when the
  user asks for it and has seen the quote.
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **No film grain.** Keep `grain` at 0 in `videos/finish`; never write grain, noise or film-stock words in a prompt
  or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.

Ask before generating if it is unclear whether the customer has a song.
- No real artist or song names in the description: "in the style of <Artist>", "sounds like", "cover of" + a name
  is refused by the licence safeguards. Describe the sound instead.
- Lyrics must be the user's own or written by you for them. Don't paste lyrics of an existing song.
- Lyrics you send here are kept with the job because the model must sing them. A customer's private lyrics for a
  different song never go here; and never copy any lyrics into prompts, logs or public places.
- Content published in public must say it is machine-made.

## 1. Fields

| field | values | default |
|---|---|---|
| `prompt` | the music description, up to 4000 chars | required |
| `lyrics` | your lyrics with section tags on their own lines, up to 6000 chars | required unless `instrumental` |
| `instrumental` | `true` = no vocals (send no lyrics) | `false` |
| `duration` | the **longest** the song may be, 10-300 s | 120 |
| `fill` | `none` or `loop` (loop to exactly `duration` with 1 s crossfades and a 3 s fade out) | `none` |
| `steps` | 10-60 (above the default 30 costs proportionally more) | 30 |
| `cfg_scale` | 1-4 (how closely it follows prompt and lyrics) | 1.7 |
| `format` | `mp3`, `flac`, `wav` | `mp3` |
| `seed` | same seed + same request = same song | random |
| `voices` | duet: `{"first": "...", "second": "..."}` or `{"male": "...", "female": "..."}` | none |

JSON body. Answers 202 with a `director.job`. Poll `GET /api/v1/director/jobs/{id}` every 10-30 s; when `done`,
`output.url` (a signed URL valid 6 hours, plays in a browser), `output.assetPath` (the durable copy in your assets)
or `GET /api/v1/director/jobs/{id}/audio` (a 302 to the file). A song is billed at the `song` price in
`GET /api/v1/director/catalog`.

## 2. The music description (`prompt`)

Write it in three labelled parts. Be concrete: genre, tempo, key, mood, the voice, the instruments and how each part
builds.

```
Global Metadata: modern synth-pop, 118 BPM, A minor, bittersweet and driving, night-drive feeling.
Vocal Details: one warm female alto, close-miked, breathy verses, full belted chorus, light double-tracked harmonies on the hook.
Arrangement: intro of pulsing synth arpeggio; verses with tight kick, muted bass and soft pads; pre-chorus adds claps and a rising filter; chorus opens with wide supersaw chords and four-on-the-floor drums; bridge drops to piano and voice; final chorus adds a key-up lift and stacked vocals; short outro on the arpeggio alone.
```

Bad: `a song like <famous artist>, catchy, good vibes` (refused for the name, and vague anyway).

Genre starters (edit, don't paste blindly):

| genre | Global Metadata | voice | arrangement keys |
|---|---|---|---|
| pop ballad | 72 BPM, E-flat major, tender, hopeful | soft male tenor, falsetto in chorus | piano, strings swelling into the last chorus |
| hip-hop | 90 BPM, C minor, confident, late night | male rapper, rhythmic, clear diction; sung hook | boom-bap drums, deep 808, clean piano keys |
| EDM / dance | 126 BPM, F minor, euphoric | female topline, airy | build with risers, drop with sidechained synth bass |
| country | 96 BPM, G major, warm, nostalgic | male baritone, slight twang | acoustic guitar, pedal steel, brushed drums, fiddle |
| rock anthem | 140 BPM, E major, defiant | gritty male lead, gang vocals on chorus | distorted guitars, driving drums, big final chorus |
| lo-fi / chill | 80 BPM, D major, calm | soft female, low in the mix | Rhodes, mellow bass, soft drums |
| cinematic | 70 BPM, D minor, epic | choir pads or no vocals | strings, low brass, taiko builds |
| kids / jingle | 110 BPM, C major, cheerful | bright friendly voice | ukulele, claps, glockenspiel |

Avoid the words "grain", "noise", "lo-fi crackle" or "vinyl" in descriptions (house rule: no grain or noise).

## 3. Lyrics

Section tags on their own lines: `[intro]` `[verse]` `[pre-chorus]` `[chorus]` `[bridge]` `[instrumental]`
`[outro]`. Without tags the structure is weaker.

```
[intro]

[verse]
Streetlights blinking out one by one
I keep driving till the night is done

[pre-chorus]
And every mile pulls me back to you

[chorus]
Hold on, hold on, the road is long
Hold on, we're nearly home

[instrumental]

[verse]
...
[chorus]
...
[outro]
```

Writing rules:

- Short singable lines (4-9 words). One idea per line.
- A chorus that repeats word for word each time; a hook the listener can catch on first hearing.
- Plain words that render cleanly when sung; avoid tongue-twisters and long names.
- For a music video, write images the video can show (a road, a window, rain, a red dress), not abstractions only.
- Write every repeat out (the model sings what is written).

## 4. Length: why songs come back short, and the fix

`duration` is a **cap**, not a target. The model ends the song when its sections are sung. Measured: a few lyric
lines give 15-40 s; an instrumental (sent as `[intro] [instrumental] [outro]`) usually runs 25-60 s whatever the
cap. A song shorter than asked shows `durationShort` on the job (`requestedSeconds`, `actualSeconds`).

| need | do |
|---|---|
| a 2-3 min song | write enough sections: about 4-5 s per sung line, so ~150 s is roughly 30-36 lines with intro, instrumental break and outro |
| an exact length (a 30 s ad, a 60 s video) | `fill: "loop"` with `duration` set to it: loops with 1 s crossfades, fades the last 3 s (lyrics repeat when looped) |
| a long instrumental | `fill: "loop"`; or lyrics made only of section tags with `instrumental: false` (not measured yet) |

The model cannot continue a finished song. Generate again with more sections rather than stitching.

Music videos accept songs up to 6 minutes; a music video is exactly the song's length and is cut into 15 s
sections, so a 60 s song = 4 sections (`balance_sections` evens out a last section under 6 s).

## 5. Requests

`music/generate` has no free quote (`?check=true` / `?dry_run=true` answer `400 preflight_unavailable`). Read the
`song` price in `GET /api/v1/director/catalog` (2 x `song` for a two-women or two-men duet; `song` per tagged
section for a man-and-woman duet), tell the human, then render:

```bash
curl -fsS -X POST "$BASE/api/v1/director/music/generate" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" -d @song.json
```

Store the returned `id` at once; on a timeout poll it, never resend.

`song.json`:

```json
{"prompt": "Global Metadata: modern synth-pop, 118 BPM, A minor, bittersweet. Vocal Details: warm female alto, belted chorus. Arrangement: arpeggio intro, big wide chorus, piano bridge, key-up last chorus.",
 "lyrics": "[intro]\n\n[verse]\nStreetlights blinking out one by one\n...",
 "duration": 150, "format": "mp3", "seed": 4242}
```

Instrumental, exactly 30 s:

```json
{"prompt": "Global Metadata: cinematic, 70 BPM, D minor, tense. Arrangement: low strings, taiko pulses building to a hit.",
 "instrumental": true, "duration": 30, "fill": "loop"}
```

A song takes roughly as long to make as it plays, plus a short start-up. Keep `steps` at 30 unless a test shows a
difference.

## 6. Duet songs (`voices`)

Two described singers, every lyric section tagged with its singer:

```json
{"prompt": "Global Metadata: soul ballad, 80 BPM, A minor. Arrangement: Rhodes piano, brushed drums, warm bass.",
 "voices": {"first": "a soft, breathy indie-folk woman", "second": "a powerful R&B woman with runs"},
 "lyrics": "[verse: first]\n...\n[verse: second]\n...\n[chorus: first]\n..."}
```

- Keys: `first`/`second` (two women or two men) or `male`/`female`. Each voice description 3-400 chars.
- Every section starts with `[tag: singer]`; an untagged section or a singer not in `voices` is refused
  (`400 invalid_request`). Up to 12 sections. `voices` with `instrumental` is refused.
- `first`/`second`: one song in the first voice, then the second singer's sections are re-voiced (melody and timing
  kept), 2 x `song` credits. `male`/`female`: one take per tagged section in each voice, joined with crossfades
  (the music can shift a little at a join), `song` credits each.
- A music video made from it (`song_job` plus `singers` with the same keys) knows exactly who sings when (see
  references/montage/pixio-duets.md).

## 7. From song to music video

1. Listen to the whole song (structure, length, any garbled words). Regenerate with a new `seed` if the hook is weak.
   `POST /api/v1/director/understand/audio` gives its parts, tempo and voice stretches as JSON
   (references/montage/pixio-understand.md).
2. Optional: `POST /api/v1/director/music/plan` with `song_job=<id>`: a writer job (a few minutes) that returns the
   sections, vocal map, loud parts and drops in its `result`, and with an `idea` a treatment. Billed
   (`songAnalysis` alone, a writer round with an `idea`); poll it like any job.
3. `POST /api/v1/director/videos/music` with `song_job=<id>` instead of a `song` file, plus pictures, `references`,
   `idea`, on Montage Basic for the first render. Quote it first:

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/music?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "song_job=SONG_JOB_ID" -F "images=@singer.png" \
  --form-string 'references=["Nova, the singer: woman, 27, black bob, silver slip dress"]' \
  --form-string "idea=Nova drives through the empty city at night and sings the chorus to the road" \
  -F "video_model=montage-basic"
```

The song job must be `done` (`409 conflict` otherwise) and belong to your account (`404 not_found` otherwise).
For lyric captions on the finished video use references/montage/pixio-lyric-captions.md (the `lyrics` you wrote can
go in its private `lyrics` field).

## Checklist

- [ ] Confirmed the user has no song of their own.
- [ ] Description in three parts; no artist or song names; no grain/noise words.
- [ ] Lyrics original, tagged, repeats written out; enough lines for the length (or `fill: "loop"`).
- [ ] `song` price from the catalog told to the human; the job id stored and polled, never resent.
- [ ] Listened to the result; any `durationShort` read.
- [ ] Duet: `voices` keys match the later `singers` keys.
- [ ] Music video from `song_job`, quoted with `?check=true`, first render on Montage Basic.
