---
name: pixio-transitions-continuity
description: How an AI agent handles cuts and continuity with Montage (Pixio's Director API) - cuts inside a clip vs joins between clips, match cuts, cross-cutting, screen direction, keeping people, wardrobe, props, wounds, time and weather identical across clips on Montage Basic and Montage Premium / Ultra, chaining clips (no end-frame field; first-frame image-to-video), fixing a continuity error, and joining finished videos with POST /api/v1/director/videos/assemble. Use whenever you plan where clips join, write the opening or closing shot of a clip, chain clips, fix a continuity error or assemble clips into one video. Not for camera moves inside a shot (that is references/montage/pixio-camera-language.md).
---

# Pixio transitions and continuity

Every clip is rendered on its own. No tier remembers the clip before it: continuity exists only in the words, the
pictures and the seeds you send. Plan the joins, then make each clip re-state everything that must match.

## House rules

- **Test on Basic.** Tests, drafts and trial renders run on Montage Basic (leave `video_model` out). Montage Premium
  or Ultra only when the user asks for it and has seen the `?check=true` quote.
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.

## Decision rules (read first)

1. **Inside a clip: hard cuts only.** Montage Basic: `At 00:03.500, the camera cuts to ...`. Montage Premium /
   Ultra: `Hard cut.` between shots. Write "every transition is a clean hard cut, no dissolves or double exposures"
   in the Basic look sentence: a dissolve inside a clip shows two copies of a face for about a second.
2. **Between clips: join only where place or time changes** (platform -> corridor, night -> morning). Never join
   mid-action or mid-line. A movement cannot continue across a join.
3. **Every clip is a complete mini-scene that ends on a held frame.** Basic: "Static camera, holding." Premium:
   "The take ends held on this frame." with the last 2 s still. A couple of frames are trimmed from each Basic clip
   at the join; the hold absorbs it.
4. **Every clip re-states the constants word for word:** same reference pictures in the same order, same subject
   definitions, same wardrobe words, same look line, same music line. No "as in clip 1" on any tier.
5. **Dissolves, dips and wipes are an edit, not a prompt.** Make them in `POST /api/v1/director/videos/assemble`
   (`transition_in`), and only between finished clips.
6. **Give every shot a stable id** (scene number + letter, "12B") and keep it on the shot list, the prompt notes and
   your version log, so a redo or a swap always hits the right shot.

## Cuts inside a clip

- A cut must bring new information: subject, space, state, viewpoint or time. A small framing change is a camera
  move, not a cut.
- Change the framing at every cut, or Montage Basic merges the shots into one take.
- **Action cuts land on movement** ("cuts mid-move"), never on a still pose. **Dialogue cuts come after a line
  ends**, never mid-line.
- A line that has to run across a cut inside a Basic clip: use `<scenetrans>`
  (`references/montage/montage-basic-prompting.md`). On Premium keep each line inside one shot.
- Shot lengths: Basic 15 s = 4-5 shots of 3 s or more (fights: 6 shots of ~2.5 s). Premium: 2-4 s typical; shot
  windows are a pacing budget, not exact cut points (`references/montage/montage-premium-prompting.md`).

## Joins between clips

| Join | When | How |
|---|---|---|
| Hard cut (default) | almost always | clip A ends on a hold, clip B opens on new information |
| Establishing cut | the story moves to a new place | clip B's Shot 1 is a 2-4 s wide of the new place; in the same place, open on the characters |
| Time cut | hours or days pass | change the light (dusk -> morning) and something physical (a bandage, wet clothes now dry) |
| Match cut | link two places or times by shape or motion | see below |
| Crossfade / dip | a dream, a memory, a long time jump, a montage | `assemble` with `transition_in`; never inside a clip |

**Premium takes.** On Montage Premium and Ultra the studio may render two neighbouring 15 s clips together as one
take and split them back. Either way each clip needs its own complete beat, and the first shot of each clip
restates the state the previous clip ended in (where each person stands, what they hold, the light), as a state,
not as the action that led there, and adds: "Do not replay or recreate the previous clip's action."

## Match cuts

The two clips are rendered separately, so the match must be written into both, by composition:

- **Shape match:** clip A ends "a round wall clock centred in the frame, filling the middle third"; clip B opens
  "the full moon centred in the frame, filling the middle third".
- **Motion match:** clip A ends with her hand swinging a door shut left to right; clip B opens on a train door
  sliding shut left to right. Same direction, same side of frame.
- **Action match across angles:** split one action at the cut only inside a clip (wide: she lifts the glass; cut to
  close-up: the glass reaches her lips). Across a clip join it will not line up.
- **Cross-cutting:** alternate two places bound by one tension (the bomb, the drive there); each clip is complete in
  its own place, and the tension carries the join.
- **Cause and effect:** end clip A on the cause in one place (a shot fired inside), open clip B on the effect in
  another (the window shatters outside).
- **Sound bridge:** carry sound over a join instead of picture. In `assemble`, an `audio_tracks` entry (music bed or
  voiceover) that spans both clips, or `voiceover_text` in packaging, ties the cut together.

## Screen direction and geography

- Keep the camera on one side of the action (the 180-degree rule). Write positions in every clip that shows both
  people: "Kai on the left, Rin on the right; screen direction never flips."
- A journey keeps its direction: "she walks from left to right" in every clip of the walk.
- Lock the room, not just the room picture: "behind him the pegboard wall on the left, the small window on the right,
  string lights overhead" in every shot in that place. Without it the layout drifts shot to shot.
- Props stay in the same hand: "the knife in his right hand" every time it is seen.

## Continuity across clips (films, series, music videos)

| Thing | Rule |
|---|---|
| People | one reference picture per person; the same subject definition (Basic) or anchor (Premium: name + 2-3 stable features) copied word for word |
| Wardrobe | identical words every clip; never swap a colour or garment word for a synonym; one hairstyle across all pictures of a person |
| Props and places | one reference picture each, sent to every clip that shows them (`clip_images`) |
| Wounds and damage | only from the shot where they happen; then carried forward; damage only accumulates ("her sleeve stays torn from Shot 2 on") |
| States of a person | one reference picture per state (clean, wet, hurt), each made by editing only what changed on the previous picture (`/api/v1/director/images/edit`), never a fresh person |
| Props that change hands | their own reference picture, never drawn into a person's picture |
| Time of day | stated in every clip; changes only at a join with a story reason |
| Weather | stated in every shot of the scene (rain, wet hair, puddles), and still wet in the next clip if no time passed |
| Sound | the same `non_diegetic_music` line (Basic) or `[Sound]` line (Premium) in every clip, or N/A plus the same low drone; a new score per clip jumps at every join |
| Voices | the same voice sample per person (`ref_audios` + `cast`), or `voice_lock: true` to reuse clip 1's voice |
| Look | one look line, one `finish`, one `filter` for the whole film |

**Music videos:** one prompt per 15 s section. Keep each outfit to a scene and say which scene a section belongs to;
cut on downbeats or phrase starts, not every beat; escalate across the song. A section-to-section join is a hard
cut. The song plays unbroken under every join, so joins never click; never change the song to hide a join. Always
use the customer's own song.

## Chaining clips: what the API offers

- **There is no end-frame or last-frame field** on any `/api/v1/director/videos/*` endpoint, and no endpoint that
  returns a video's last frame.
- `POST /api/v1/director/videos/image` uses its `image` as the **first frame** only. To continue a shot exactly,
  take the last frame of the finished mp4 yourself (download it from `output.url`, e.g. with ffmpeg) and send it
  as `image`. Prompt only what moves next ("Continuing from the first frame: she turns from the window...");
  never re-describe the picture. On Premium also write "Do not replay or recreate the previous clip's action."
- `GET /api/v1/director/jobs/{id}/shots/{n}` is a small thumbnail from the **middle** of a shot: fine for review,
  not a last frame.
- In reference mode, Montage Basic accepts a frame anchor: "the shot begins from `<Picture 4>`" (a still you
  uploaded).
- **Films don't need chaining:** `POST /api/v1/director/videos/film` keeps the same pictures, cast, voices and seeds
  per clip, and with an `idea` the writer writes each clip knowing how the previous one ended.

## Fixing a continuity error

| Problem | Fix |
|---|---|
| One clip wrong (wrong coat, a twin, a wound in the wrong place) | `POST /api/v1/director/videos/film/{id}/redo` `{"clip": 3, "seed": 777}`, optionally a corrected `prompt`, `clip_images`, new `images` (e.g. a matching hairstyle picture). Music videos: `/api/v1/director/videos/music/{id}/redo` with `section` |
| One shot wrong or misplaced | `GET /api/v1/director/jobs/{id}/shots` (free), then `POST /api/v1/director/jobs/{id}/edit` `{"shots": [1, 2, 4, 3]}` to drop, reorder or trim (priced like packaging; `?dry_run=true` quotes it free) |
| One shot to swap for a new clip | `assemble` with `replace` `{"job_id": ..., "shot": 5}` and the new clip in `clips`; the soundtrack plays on (`sound: "original"`) |
| A colour, costume or object wrong in a few seconds | `POST /api/v1/director/videos/edit` (Montage Edit) on a `start_s`/`end_s` window: "Make his jacket dark green." Priced from the studio's quote, no free preview: tell the human the likely price, wait for a yes |
| Not sure what drifted | `visual_qa: "local"` on a film / music video (clones, extra faces, on-screen text; `full` adds an AI judge that also flags wardrobe; each priced per 15 s part), or Montage Analyze (`POST /api/v1/director/videos/edit/analyze`, `checks` such as `faces`, `prompt_match`, `continuity` for frozen frames and mid-word cuts; about 16 credits a minute of video, ask first) |

Redo the bad clip, never the whole film. A redo costs one clip; a full re-render costs them all.

## Assemble: joining finished videos

`POST /api/v1/director/videos/assemble` takes clips from your finished jobs (`job_id`) or uploads (`upload` = the
Nth `videos` file, up to 20). Per clip: `start_s` / `end_s` trim, `speed` (0.25-4) or `ramp`, `transition_in`
(`cut` default, `crossfade`, `dip_to_black`, `dip_to_white`, `wipe_left`, `wipe_right`), `transition_s` (default
0.5), `audio` (`keep`, `mute`, `duck`). `audio_tracks` lay music or voiceover across the timeline (`offset_s`,
fades, `duck_under_clips_db`). Mixed sizes are conformed (`fit`: `crop`, `letterbox`, `blur_fill`). It is priced
like finishing on the length it makes (`GET /api/v1/director/catalog`), and has no free quote.

```bash
curl -fsS -X POST "$BASE/api/v1/director/videos/assemble" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"clips": [
        {"job_id": "FILM_PART_1"},
        {"job_id": "FILM_PART_2", "transition_in": "cut"},
        {"job_id": "MEMORY_CLIP", "transition_in": "dip_to_white", "transition_s": 0.8, "audio": "duck"},
        {"job_id": "FILM_PART_3", "transition_in": "crossfade", "transition_s": 0.6}],
      "audio_tracks": [{"job_id": "SCORE_JOB", "volume_db": -8, "duck_under_clips_db": -12, "fade_out_s": 2}],
      "loudness_lufs": -14}'
```

- Films you plan to splice: render them with `fade: 0` (default 0.5 s fades in from and out to black), or every
  join dips.
- A crossfade between two shots of the same person in the same place looks like a glitch (two faces); use it for
  time passing or a change of place.
- Apply `finish` and packaging (`filter`, captions) to the assembled job once, so the look is the same throughout.
- Poll the job id from the `202`; never resubmit on a timeout.

## Related skills

All in `references/montage/`: `pixio-camera-language.md`, `pixio-lighting-color.md`, `pixio-film.md`,
`pixio-music-video.md`, `pixio-video-editing.md`, `pixio-storyboarding.md`, `pixio-series-showrunner.md`,
`pixio-video-qa.md`, `montage-edit-prompting.md`.

## Checklist

- [ ] Inside clips: hard cuts only, framing changes at every cut, no dissolve words.
- [ ] Joins only at a change of place or time; never mid-action or mid-line.
- [ ] Every clip ends on a held still frame; every new clip opens on new information.
- [ ] Same pictures in the same order, same subject/anchor words, same wardrobe, look and music line in every clip.
- [ ] Screen positions and walking direction written into every clip that needs them; props in the same hand.
- [ ] Wounds, wet clothes and damage carried forward, never shown before they happen.
- [ ] Premium: each clip's Shot 1 restates the previous end state and says "Do not replay or recreate the previous clip's action."
- [ ] Chaining by hand: last frame extracted yourself and sent as `image` (first frame); no invented end-frame field.
- [ ] Dissolves and dips only in `assemble`; spliced films rendered with `fade: 0`.
- [ ] Bad clip or shot redone or replaced alone; paid fixes (Montage Edit / Analyze, Premium) only after the human
      has seen the price and said yes.
