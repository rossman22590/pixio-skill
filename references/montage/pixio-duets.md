---
name: pixio-duets
description: How to make a two-singer (duet) music video on Montage (Pixio's Director API) - singers ({"male","female"} or {"first","second"}), singer_parts when the voices are alike, one reference picture per singer, shot planning so each line is sung by the right mouth and the other listens, lip-sync on both tiers (Montage Basic on the real song, Montage Premium one stem per singer), redo and lip fixes, and duet songs made with /api/v1/director/music/generate voices. Use whenever a song has two lead singers, or the user asks for a duet, a call-and-response or a "him and her" music video. Not for single-singer music videos (that is `references/montage/pixio-music-video.md`) or generating a song from nothing (that is `references/montage/pixio-song-generation.md`).
---

# Duets: two singers, one music video

A duet is a normal `POST /api/v1/director/videos/music` job plus one field, `singers`, that says which picture is which singer.
The server finds who sings each line, hands each line's performance shots to that singer, and keeps the other
singer's lips closed. Everything else (sections, tiers, draft -> final, redo, lip checks) works as in
`references/montage/pixio-music-video.md`; this skill covers only what is different with two voices.

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

Generate a duet song only when the customer has none (section 7). **Lyrics are private:** never put lyrics in
`idea`, `references`, prompts or logs. Who sings when is given in **seconds** (`singer_parts`), never by quoting
lines.

## Decision rules

| the song | send |
|---|---|
| a man and a woman | `singers={"male": M, "female": F}` (picture numbers in `images`) |
| two women or two men | `singers={"first": A, "second": B}`: `first` = the person who sings the song's **first** line |
| two similar voices, or you must be certain | add `singer_parts` with exact song seconds per singer |
| a duet song made by `/api/v1/director/music/generate` with `voices` | `song_job=<id>` and `singers` with the **same keys** as the song's `voices`: who sings when comes from the song itself, no guessing |
| more than two lead singers, a band, a choir | not a duet: one lead in `singers`-free mode, others as non-singing band members (closed lips) |
| nobody sings on screen | `lipsync=none` (story video); `singers` is refused with `lipsync=none` |

`singers` needs `idea` (the AI writer assigns lines to singers; with your own `sections` it is refused). The two
picture numbers must differ and exist in `images`.

## 1. Pictures: one per singer, built to be told apart

- One clean reference picture per singer: plain grey background, even light, chest-up or waist-up, no text, adults.
  Make missing ones with `/api/v1/director/images/text` or from the customer's photo (see `references/montage/pixio-characters.md`).
- **Contrast them on purpose.** Different hair length and colour, different wardrobe colour (him in a black coat,
  her in a red dress), different silhouette. Two people who look alike swap faces mid-video.
- Describe each one in `references` by role, in upload order:
  `["Leo, the male singer: man, 30, short black hair, black wool coat", "Ana, the female singer: woman, 28, long auburn hair, red dress", "the snowy train platform at night"]`.
- Use `clip_images` to give each section both singers plus that section's place; never drop a singer's picture
  from a section where they sing.
- Fixed sides help: say in `idea` that Leo stays frame left and Ana frame right in two-shots.

## 2. Who sings when

**Detection (default).** The vocal is separated and every sung phrase gets a voice fingerprint over the whole
song; two voices are used only if same-voice phrases are clearly more alike than across voices. For
`male`/`female`, pitch then says which voice is the man. Measured on 100 test songs: about 70-78 % fully right and
5-6 % with a wrong singer somewhere. The job does not report the map it used, so check it on the draft: watch
every hand-over and each singer's first line. Send `singer_parts` when:

- the two voices are similar (two women, two men, or close ranges), or you must be certain;
- the draft gives a line to the wrong singer anywhere;
- every line went to one singer although there really are two (the voices could not be told apart).

**`singer_parts` (exact).** Same keys as `singers`, each a list of `"start-end"` ranges in song seconds:

```
singer_parts={"first": ["0-24.5", "40-49", "71-88"], "second": ["24.5-40", "49-71"]}
```

How to get the seconds without quoting lyrics: run `POST /api/v1/director/music/plan` on the song (the song analysis
alone, `songAnalysis` credits; poll it and read `result`), read the vocal map per section, listen, and write the
hand-over times. Shared lines (both singing together) go to the singer who should own
the close-up; the other is shown in a two-shot.

Wrong map = wrong mouths: fix the map (with `singer_parts`) before you fix anything else.

## 3. Shot planning for two singers

The writer is told: a performance shot belongs only to the singer of that line; the other listens with closed lips
(reaction or story shots); two-shots on the hand-overs; each singer gets the close-ups on their own lines. The prompt
checker refuses (ERROR) any shot where the wrong singer sings or opens their lips during a line, so a broken plan
never renders. Your `idea` should support that:

Good `idea`:

> Leo and Ana, ex-lovers, sing to each other across a snowy train platform at night. Verses: each sings alone in
> close-up while the other watches from across the tracks, lips closed. Hand-overs are front-on two-shots, Leo frame
> left, Ana frame right. The final chorus brings them face to face under the station clock. Leo and Ana are the only
> people anywhere in the video.

Bad `idea`:

> A romantic duet, they both sing the whole time, lots of over-the-shoulder shots and reflections in the train window.

(Both singing everywhere breaks the one-mouth rule; OTS and reflections make duplicate people.)

Shot rules:

- **One open mouth per shot.** If both are in frame during a line, write the listener's lips closed explicitly.
- **Close-ups for lines, two-shots for hand-overs.** A hand-over is where the camera should show both.
- **Front-on two-shots.** "Exactly two people are in the frame, both facing the camera; nobody in the foreground."
  Never over-the-shoulder, never a back of a head, no mirrors or window reflections.
- **Balance.** Over the video, each singer should get roughly the close-ups their share of the song earns; the
  person who sings 70 % of the song should not be on screen 30 %.
- **Reactions carry the story.** The listener's face (a look away, a held stare, a small smile) is what makes it a
  duet and not two solo videos cut together.
- **Same wardrobe words** for each singer in every section.

## 4. Lip-sync on each tier

**Montage Basic (the lowest price, recommended for duet close-ups).** Basic keeps each section's slice of the
original song as the soundtrack, and each shot's mouth follows the vocal of its own singer as the writer assigned it. With
`lipsync=sung_words` each shot's sung words go to that shot's singer (slower, 12 steps).

**Montage Premium / Ultra.** Each singer gets their own vocal stem, masked to their words, as their own `@Audio N`, bound
to their own picture; a shot carries one singer's stem. Premium re-sings on its own clock, so against the
customer's song the lips can run a little early; the `?variant=song` download (`output.withOriginalSong`) has the
original song. Use
`music_sync=song` or relip if lips must match the real song (see `references/montage/pixio-music-video.md`). Write Premium duet prompts with
`references/montage/montage-premium-prompting.md`: "sings ONLY the vocal in @Audio1", one singer per shot.

**Tier mix.** `tier_mix=auto` puts sung close-ups on Basic and wide, dance and cutaway sections on Premium. That suits
duets: close-ups (where the wrong mouth shows most) stay on Basic.

## 5. A full request

```bash
curl -X POST "$BASE/api/v1/director/videos/music?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "song=@duet.mp3" -F "images=@leo.png" -F "images=@ana.png" -F "images=@platform.png" \
  -F 'references=["Leo, the male singer: man, 30, short black hair, black wool coat", "Ana, the female singer: woman, 28, long auburn hair, red dress", "the snowy train platform at night"]' \
  -F 'singers={"male": 1, "female": 2}' \
  -F "idea=Leo and Ana, ex-lovers, sing to each other across a snowy train platform at night. Each sings alone in close-up while the other watches with lips closed; hand-overs are front-on two-shots, Leo frame left, Ana frame right." \
  -F "video_model=montage-basic" -F "speed=draft" -F "aspect=16:9"
```

`check=true` is a free quote (`credits.quoted`, `promptCheck`); nothing starts. To read the written sections before
spending on video, send the same `song`, `idea`, `references` and `aspect` to `POST /api/v1/director/music/plan` (a
writer job; its `result` holds the sections and treatment) and check that each performance shot is the right
singer for that time. Then drop `check=true` to render the draft, once.

Two similar women, exact parts:

```bash
  -F 'singers={"first": 1, "second": 2}' \
  -F 'singer_parts={"first": ["0-24.5", "40-49"], "second": ["24.5-40", "49-63"]}'
```

## 6. Fixing a duet

1. **Wrong singer on a line** across the video: the map is wrong. Resubmit with `singer_parts` (exact).
2. **One section wrong** (a swapped face, the listener singing): `POST /api/v1/director/videos/music/{id}/redo` with
   `{"section": 3, "seed": 777}` and optionally a corrected `"prompt"`. The redo keeps each shot going to the singer
   of its words.
3. **Lips off on one stretch:** `POST /api/v1/director/understand/video` with `measure_only: true` (or Analyze with
   `checks: ["lipsync"]`, about 16 credits a minute) finds early / late stretches; then
   `POST /api/v1/director/videos/lipfix` (one 4-14 s window) or `lipfix/auto`; Premium close-ups: `relip` (priced
   from a quote; check the catalog first). These tools take no singer field, so keep windows inside one singer's
   line where you can, and check afterwards that the listener's mouth is still closed.
4. **Faces swapped between the two:** stronger contrast in pictures and wardrobe, fixed sides, and fewer two-shots in
   that section.

After every render: frames at about 1 per second through each hand-over (the wrong-mouth and twin risks live there),
and the job's `qa[]` / `qaIssues[]`.

## 7. When there is no song: duet songs

Only when the customer has no song. `POST /api/v1/director/music/generate` with `voices` and singer-tagged lyrics writes a duet
that knows exactly who sings when; pass it on with `song_job` and `singers` using the same keys, and no detection
is needed. Details (tags like `[verse: first]`, `male`/`female` vs `first`/`second`) are in `references/montage/pixio-song-generation.md`.

```bash
curl -X POST "$BASE/api/v1/director/videos/music?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F "song_job=SONG_JOB_ID" -F "images=@mia.png" -F "images=@zoe.png" \
  -F 'references=["Mia, the first singer", "Zoe, the second singer"]' \
  -F 'singers={"first": 1, "second": 2}' -F "idea=Two friends on a rooftop at dusk trade verses" -F "video_model=montage-basic"
```

If the song's keys and `singers` keys differ, the song's parts are not used and detection decides.

## Checklist

- [ ] Customer's own song (or a duet song only because none was given); no lyrics anywhere but private fields.
- [ ] One picture per singer, strongly contrasted; every supplied picture in `images` and `references`.
- [ ] `singers` keys right (`male`/`female` vs `first`/`second`, first = first line); `idea` sent.
- [ ] `singer_parts` for alike voices, or after a draft gave a line to the wrong singer.
- [ ] `idea` asks for one open mouth per shot, front-on two-shots on hand-overs, fixed sides, no OTS or reflections.
- [ ] Written sections read (via `music/plan`); hand-overs right on the draft.
- [ ] Basic for tests and drafts; Premium quoted with `?check=true` and approved by the human.
- [ ] Hand-overs checked frame by frame; bad sections redone, lips measured and fixed.
