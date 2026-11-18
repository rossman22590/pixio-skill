---
name: pixio-series-showrunner
description: How to run a TV series on Montage (Pixio's Director API) as a showrunner - POST /api/v1/director/series (name, premise, style, cast with pictures and voices, theme music, title card, laugh track, film_type=short_drama for vertical micro-dramas), cast changes, season planning (/season), episodes (/episodes with idea, duration, voice_lock, previously), the automatic story bible (recaps, open threads, lasting changes), continuity across episodes, cliffhangers and episode structure. Use whenever a user wants recurring characters across several videos, a web series, a sitcom, a serial or "episode 2" of something. Not for a single film (that is references/montage/pixio-film.md) or making the reference pictures themselves (that is references/montage/pixio-characters.md).
---

# Series showrunner

A series is a saved show (cast, premise, look, theme) plus episodes. Each episode is a normal film job written from
the show, your episode idea and a recap of earlier episodes, so injuries, deaths and open threads carry over and the
same faces and voices come back. Your job as showrunner: build a strong cast and premise once, plan the season, then
make episodes **one at a time, in order**, checking each before the next.

## House rules

- **Test cheaply on Basic.** Every test, draft or trial render sends `video_model: "montage-basic"` (it is also what
  renders when `video_model` is left out). Basic is billed in Pixio credits like everything else, just less.
  Premium or Ultra only when the user asks for it and has seen the `?dry_run=true` quote (`credits.quoted`).
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE`
  (`https://beta.pixio.myapps.ai`) and `$PIXIO_API_KEY`.
- **Approve the story first.** Show the user the season plan (or the episode idea) before anything renders.
- Every supplied picture goes into the cast as its own member.

## Decision rules

| need | do |
|---|---|
| a new show | `POST /api/v1/director/series` (multipart) once; free |
| a story across several episodes | `POST /api/v1/director/series/{id}/season`, then episodes need no `idea` |
| one episode | `POST /api/v1/director/series/{id}/episodes` with `idea` naming the cast in it |
| a new or changed character | `POST /api/v1/director/series/{id}/cast` (one member) |
| change the show's premise, look, theme | `POST /api/v1/director/series/{id}` with only what changes |
| next episode | only after the previous one is `done` (its recap and learned voices feed the next) |
| fix the recap the writer will see | `previously` on the episode (your own text replaces the automatic recap) |
| a sitcom | `laugh_track=light` or `full` on the series |
| a vertical micro-drama | `film_type=short_drama` on the series (9:16, every episode ends on a cliffhanger; see references/montage/pixio-short-drama.md) |

## 1. Create the show

`POST /api/v1/director/series` (multipart, 201, free). At most 50 series per account. Fields:

| field | notes |
|---|---|
| `name` | required |
| `premise` | world, tone, regular characters, what a typical episode is |
| `style` | one look sentence used by every episode |
| `aspect` | `16:9` (default), `9:16`, `1:1` |
| `cast` | JSON list of `{"name", "what", "kind": "person"/"place"/"thing"}` (`name` up to 60, `what` up to 400 chars); then give each member a `picture` and a `voice` (5-15 s of them speaking, clean) with `POST /api/v1/director/series/{id}/cast` |
| or `pictures` + `references`, `voice_samples` + `voices` | the simple way: 1-9 pictures with descriptions ("Mara, 45, the guard": the name is the text before the first comma), 0-3 voices named by whose they are |
| `theme` (file) + `theme_s` | theme music under the opening (`theme_s` default 10) |
| `theme_auto=true` or `theme_brief` | have an instrumental theme made once instead of uploading one; charged `score` credits when the show is saved; episodes use it once it is done |
| `title_card` | default true: "NAME / Episode N: Title" over the opening |
| `laugh_track` | `off`, `light`, `full` |
| `film_type` | `story` (default) or `short_drama`: 9:16 unless `aspect` is sent, a hook in the first seconds, a cliffhanger at the end |
| `drama_trope` | short_drama: `auto`, `revenge`, `hidden_identity`, `rich_poor`, `betrayal`, `second_chance`, `contract_marriage`, `fated_mate`, `secret_baby` |

```bash
curl -X POST "$BASE/api/v1/director/series" -H "Authorization: Bearer $PIXIO_API_KEY" \
  --form-string "name=Night Shift" \
  --form-string "premise=A small-town hospital at night. Ruth, a tired but sharp night nurse, keeps the ward alive while strange things happen after midnight. Grounded, eerie, a little warm. Each episode is one night." \
  --form-string "style=cold blue hospital light, warm practical lamps, slow push-ins, realistic, clean image" \
  -F 'cast=[{"name":"Ruth","what":"Ruth, 48, the night nurse, grey-streaked bun, navy scrubs","kind":"person"},
           {"name":"Walter","what":"Walter, 80, the patient in room 12, thin, white stubble","kind":"person"},
           {"name":"Ward 3","what":"the night ward corridor, long, half-lit","kind":"place"}]' \
  -F "theme_auto=true"

# then one call per member for their files
curl -X POST "$BASE/api/v1/director/series/$SID/cast" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "name=Ruth" -F "picture=@ruth.png" -F "voice=@ruth_voice.wav"
curl -X POST "$BASE/api/v1/director/series/$SID/cast" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "name=Walter" -F "picture=@walter.png"
curl -X POST "$BASE/api/v1/director/series/$SID/cast" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "name=Ward 3" -F "picture=@corridor.png"
```

A show can start with no cast: the first episode's writer designs people and places and they join the cast after it.
Better: give every regular a picture now (see references/montage/pixio-characters.md for good reference pictures).

Careful on later changes (`POST /api/v1/director/series/{id}`): the simple-way `pictures` field **replaces every
picture the show had**. To add or change one person, use the cast endpoint below. `remove_theme=true` drops the
theme.

Read it back: `GET /api/v1/director/series/{id}` (the cast with `pictureUrl` and `voiceUrl`),
`GET /api/v1/director/series` (all shows), `DELETE /api/v1/director/series/{id}`.

## 2. Cast management

- Add or change one member: `POST /api/v1/director/series/{id}/cast` with `name` (matched without case) and any of
  `what` (up to 400), `kind`, `picture` (file), `voice` (file, 5-15 s), `voice_what` (up to 200). Only what you send
  changes.
- Remove: `DELETE /api/v1/director/series/{id}/cast/{name}`; `?part=picture` or `?part=voice` removes only that.
- Files: `GET /api/v1/director/series/{id}/cast/{name}/picture` and `.../voice`.
- A show can hold a big cast, but **each clip takes at most 9 pictures and 3 voices**. Per episode the members the
  idea names go first, then the regulars with the most episodes. Name everyone who matters in the idea.
- **Places and things count against the 9.** A recurring set (the ward, the diner) is worth a picture; one-off places
  are not.
- New faces the writer designs (a few per episode, each charged as a designed picture) join the cast after that
  episode, with their picture.
- **Voices:** with `voice_lock=auto` (default), if someone in the episode has no voice yet, clip 1 renders first and
  their voice is cut from it and saved to the show; otherwise all clips start at once. `true`/`false` forces it.
  Clean, real voice samples beat learned ones: upload them when you have them.

## 3. Plan the season (the story bible)

```bash
curl -X POST "$BASE/api/v1/director/series/$SID/season" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"idea": "Over one winter, Ruth realises the patients who die on her ward come back for one night to finish something. The season ends with her own mother arriving as a patient.", "episodes": 6}'
```

`idea` 10-3000 chars, `episodes` 2-20 (default 6), optional `first` (starting number, 1-999). It is a writer job:
it returns a job id; poll `GET /api/v1/director/jobs/{id}`. It costs `writerRound` credits, charged when done and
given back if it fails. The plan is in the job's `result` and saved on the series: a title, the arc, one line per
episode, the threads across them and the new characters it brings in (with their first episode). A new plan replaces
the old one. Show it to the user and get approval before any episode renders.

Season craft:

- **One engine.** A repeatable situation that makes episodes (one night shift, one case, one delivery). The premise
  states it.
- **An arc with a destination.** The season idea says where it ends. Each episode moves one step toward it.
- **A-plot and a thread.** Each episode resolves its own story (setup, trouble, turn, payoff) and advances one season
  thread.
- **Plant early.** Characters arriving in episode 5 should be mentioned or glimpsed by episode 3.
- **Escalate.** Stakes rise every episode; the finale is the biggest night.

## 4. Make an episode

`POST /api/v1/director/series/{id}/episodes` (multipart, 202): a film job (poll `GET /api/v1/director/jobs/{id}`).
Priced like an AI-written film plus the recap (`episodeRecap`) and packaging (title card and theme).

| field | notes |
|---|---|
| `idea` | 10-4000 chars; name the cast members. Optional for a planned season episode (send one to override) |
| `duration` | 30-420, multiple of 15 (default 60) |
| `number` | default: the next one |
| `previously` | up to 3000 chars, your recap instead of the automatic one |
| `voice_lock` | `auto` / `true` / `false` |
| `speed` | `draft` for a cheaper first look; leave unset for full quality |
| `video_model` | `montage-basic` for tests; `montage-premium` / `montage-ultra` (with `resolution`) when the user pays for it |
| `film_type`, `drama_trope`, `cliffhanger` | this episode only; `cliffhanger=false` for a short-drama finale that resolves |
| `seed`, `package`, `fight_flow`, `fight_motion`, `visual_qa`, `face_fix` | as on films |
| `?dry_run=true` | a free quote; nothing starts |

```bash
curl -X POST "$BASE/api/v1/director/series/$SID/episodes?dry_run=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  --form-string "idea=Ruth answers the call light from room 12, emptied this morning. Walter is sitting on the bed, alive, asking for his daughter. Ruth plays along until she finds his name on the morgue list." \
  -F "duration=60" -F "video_model=montage-basic" -F "speed=draft"
# after the yes, the same call without ?dry_run=true starts it
```

`verbatim` is not available on episodes: the writer always writes them from the show. There is no storyboard on
episodes; check the draft instead.

## 5. Continuity: how the bible works and how to steer it

After each episode is done, the writer saves a recap (a few sentences), the open threads and the lasting changes
(injuries, deaths, allies, enemies, items, places): `GET /api/v1/director/series/{id}/episodes` lists them per
episode with its `jobId`. The next episode's writer gets the premise, the season arc and its own line, the recent
recaps, the latest open threads and the recent lasting changes.

- **Wait for `done`** before submitting the next episode, or it starts without the recap and voices.
- **Read every recap.** If it missed something (a bandaged hand, a lost key), submit the next episode with
  `previously` written by you, or name it in the idea: "Ruth's left hand is still bandaged from last night."
- **Physical continuity is yours.** Wounds and wardrobe changes live in words; if they matter, repeat them in each
  idea until they heal. Damage only accumulates; don't put a wound in a cast `what` (it would show in every shot).
- **One picture per state.** A lasting change (a scar, a shaved head, a new uniform) is a new picture: edit only that
  detail on the existing picture with `POST /api/v1/director/images/edit` (never regenerate the whole person), upload
  it with `POST .../cast`, and say why in the next idea.
- **Same cast words.** Keep `what` descriptions stable; edit them only for real story changes.

## 6. Writing episodes people watch

- **Cold open hook.** The first shot shows something wrong or at stake; no slow establishing drift.
- **Recap by action, not narration.** Don't spend seconds re-explaining; one line or one visual callback.
- **One A-story per 60 s.** 60 s = setup, incident, turn, payoff (4 clips). Longer episodes add rising trouble and a
  midpoint turn.
- **End on a hook.** The writer may end on a cliffhanger; make it physical and visible: a door opening, a name on a
  list, a figure in the corridor. Then the next idea starts from exactly that moment.
- **Faces carry a series.** The writer frames mostly close-ups and front-on two-shots, at most 3 people per frame,
  never over-the-shoulder. Keep your ideas compatible: few people per scene, no crowds talking.
- **Dialogue short and plain.** Two or three short lines per 15 s clip at most.
- **Sitcoms:** with a laugh track the writer leaves a beat after each punchline; `light` = clear jokes only (at most
  one laugh every ~6 s), `full` = every joke. Write ideas with setups and punchlines, not just situations.
- **No phones, screens or texts** as story devices; they render badly. Use letters, knocks, keys, objects.

## 7. Per-episode QA

1. Draft first (`speed=draft`), then `POST /api/v1/director/videos/film/{id}/final` for the approved episode (same
   clips, pictures and seeds at full quality; the writing is not charged again).
2. Look at about 1 frame per second: right faces, no twins, wardrobe the same as last episode, wounds where the story
   left them.
3. Listen to every line: right voice per person (voice lock may have learned the wrong one; replace it with
   `POST .../cast` and a clean `voice`).
4. Bad clip: `POST /api/v1/director/videos/film/{id}/redo` `{"clip": 3, "seed": 777}`; don't rerender the whole
   episode.
5. Read the saved recap before the next episode.

## Checklist

- [ ] Premise states the engine and tone; `style` has no grain words.
- [ ] Every regular person and recurring place has a good picture; every supplied picture is in the cast.
- [ ] Clean voices uploaded where available; `voice_lock` left on `auto` otherwise.
- [ ] Season plan approved by the user; arc ends somewhere.
- [ ] Each idea names its cast (at most 9 pictures and 3 voices per clip) and ends on a visible hook.
- [ ] Episodes made in order, each after the previous is `done`; recap read and corrected with `previously` if needed.
- [ ] `video_model: "montage-basic"` + `speed=draft` first; Premium only after a `?dry_run=true` quote and a yes.
- [ ] Frames, voices and continuity checked; bad clips redone.
