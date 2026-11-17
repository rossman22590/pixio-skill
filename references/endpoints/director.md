# Director Over The API

`/api/v1/director/*` is Pixio's own video studio: lip-synced music videos cut
to a song, films from 30 s to 7 min, single shots, images, songs, upscale and
finishing. Every call is billed in Pixio credits and returns Pixio ids and
Pixio URLs.

New to it? `GET /montage` (public, no key) explains Montage, the product
behind the Director API: what it makes, how a production runs, a quickstart
for agents, limits and prices.

Start with `GET /director/catalog`: it lists every endpoint with its accepted
fields, the looks and styles, and the credit prices.

Text limits (characters): `prompt` 8000 on shots, images and redos; `idea`
4000 and `style` 500 on music videos, films and `music/plan`; `story` 4000 on
`prompts/write`; `prompt` 4000 and `lyrics` 6000 on `music/generate`;
packaging `tagline` 120, `cta` 60, `legal` 300 and `voiceover_text` 1500 (also
inside a `package` object). Longer text gets `400 invalid_request` naming the
field (`details.field`, `maxLength`, `length`) before anything is held. The
catalog lists them per endpoint as `maxLength`.

## Endpoints

| Method | Path | Does |
| --- | --- | --- |
| GET | `/montage` | What Montage is, for agents: makes, quickstart, limits, prices (public) |
| GET | `/director/catalog` | Endpoints, fields, looks, styles, prices |
| GET | `/director/voiceover/voices` | Voices for a packaging `voiceover_text` (free) |
| POST | `/director/videos/text` | One 5–15 s shot from a prompt |
| POST | `/director/videos/image` | Animate one picture (`image`) |
| POST | `/director/videos/reference` | Shot from up to 9 `images`, 3 `videos`, 3 `audios` |
| POST | `/director/videos/music` | Music video from `song` (or `song_job`), 15 s per section |
| POST | `/director/videos/music/{id}/redo` | Re-shoot one `section` of a finished music video |
| POST | `/director/videos/film` | Film from `clips` prompts or an `idea` |
| POST | `/director/videos/film/{id}/redo` | Re-shoot one `clip` of a finished film |
| POST | `/director/videos/film/{id}/final` | Render a finished draft at full quality (same clips, pictures, seeds) |
| POST | `/director/videos/music/{id}/final` | Render a finished draft music video at full quality |
| GET | `/director/jobs/{id}/pictures/{n}` | One reference picture a film or music video used |
| POST | `/director/videos/upscale` | ~1080p upscale of `job_id` or an uploaded clip (≤15 s) |
| POST | `/director/videos/finish` | Grade, grain, loudness, deflicker |
| POST | `/director/videos/facefix` | Re-render small faces in a finished music video or film (`people: "all"` for group shots) |
| POST | `/director/videos/package` | End card, logo, packshot, fine print, captions, music bed, voiceover (file or script), other frame shapes, cutdowns |
| GET / POST | `/director/brands` | List / save brands (free) |
| GET / POST / DELETE | `/director/brands/{id}` | Read / change (send only what changes) / delete a brand |
| GET | `/director/brands/{id}/logo` | The brand's logo image |
| GET | `/director/filters` | Colour filters for packaging (free) |
| POST | `/director/looks` | Measure a reference's look (`picture`, `video` or `job_id`); use the id as `look_id` (free) |
| GET | `/director/looks/{id}` | One of your looks |
| GET | `/director/jobs/{id}/filter_preview` | One frame with a filter or look, JPEG (free) |
| GET / POST | `/director/series` | List / save TV series (free) |
| GET / POST / DELETE | `/director/series/{id}` | Read / change / delete a series |
| POST | `/director/series/{id}/cast` | Add or change one cast member (picture, voice) |
| DELETE | `/director/series/{id}/cast/{name}` | Remove a member, or `?part=picture` / `voice` |
| GET | `/director/series/{id}/cast/{name}/{part}` | A member's `picture` or `voice` |
| GET | `/director/series/{id}/picture?n=` | One of the series' pictures |
| POST | `/director/series/{id}/episodes` | Make an episode (a film job) |
| GET | `/director/series/{id}/episodes` | Episodes with recaps, threads, changes, `jobId` |
| POST | `/director/series/{id}/season` | Plan a season's arc (writer job) |
| POST | `/director/images/text` · `/images/edit` · `/images/reference` | Images |
| POST | `/director/music/generate` | A song from a description and lyrics |
| POST | `/director/music/plan` | Writer: sections, vocals and (with `idea`) a treatment |
| POST | `/director/prompts/write` | Writer: ready-to-shoot clip prompts from a `story` (films, commercials, single shots) |
| POST | `/director/prompts/check` | Check prompts against the house rules (free, synchronous) |
| GET | `/director/jobs` | Your jobs, newest first; `?limit=&before=&endpoint=` |
| GET | `/director/queue` | Your waiting/rendering jobs, oldest first, each with its place in line |
| GET / DELETE | `/director/jobs/{id}` | Get (syncs on read) / cancel |
| GET | `/director/jobs/{id}/parts/{n}` | Stream one clip or section; Range supported |
| GET | `/director/jobs/{id}/shots` | A finished video's shots with thumbnails (free) |
| GET | `/director/jobs/{id}/shots/{n}` | One shot's thumbnail, JPEG, 1-based (free) |
| POST | `/director/jobs/{id}/edit` | Cut a finished video by its shots into a new job |
| POST | `/director/videos/remake` | Remake a video (2 s–7 min) shot for shot as a new film, with your changes |
| GET | `/director/jobs/{id}/video` · `/image` · `/audio` | 302 to the finished file |

## Inputs

- Bodies are JSON or `multipart/form-data`; endpoints that take files accept
  multipart.
- A media field takes a multipart file, a URL string, or a path from your own
  Pixio assets. Lists also accept `<field>_urls` (for example `images_urls`).
- `song_job` and `job_id` take a **finished Director job id** from this API.
- `brand_id` takes a brand id from `POST /director/brands`. Only your own
  brands work.
- Fields not listed for the endpoint in `/director/catalog` are ignored, so
  check spelling against the catalog. `styles` takes
  `[{ "style": "<key>", "strength": 0.7 }]` on `videos/text` and `videos/image`.

## Prompt checking

Prompts written in the studio's official format (`integrated_multimodal_description:`,
`[Shot N]` blocks, `<Picture N>` tags) are checked before rendering.

- Checker **errors** refuse the request: `422 prompt_check_failed` with the
  full report in `promptCheck` (`issues[]` of `{ level, message, clip }` and
  `counts`). Nothing is reserved or charged. Examples: a missing
  `<Picture N>`, shot times out of order, a missing section.
- Warnings and tips never block. Plain prompts ("a lighthouse at dusk")
  always render.
- `strict_prompt=false` renders anyway (the old behaviour).
- Applies to `videos/text|image|reference`, and to `videos/music|film` when
  you send your own prompts. Redos, face fix, and music videos or films made
  from an `idea` are not checked.
- Free preflight: add `?check=true` (or `?dry_run=true`) to any of those five
  URLs (`videos/package` takes `?dry_run=true`). You get `200 { object: "director.preflight", credits.quoted,
  promptCheck, … }` plus a note when the real request would be refused.
  Nothing starts.

Agents should run `?check=true` first for official-format prompts, fix every
`ERROR`, then start the job.

## Fights, prompt repair and section balance

- Shots the checker reads as a fight get the studio's Fight Flow look
  automatically (each blow sets up the next, fewer frozen poses).
  `fight_flow=false` turns it off; `true` forces it. Text, image, reference,
  film and music video.
- `fix_prompt`: `off` (default), `safe` or `ai`. Repairs your own prompts
  before rendering: camera words outside the trained vocabulary become the
  nearest trained move, grain words and "no crowd" lines go. `safe` is
  instant; `ai` also fixes what the checker still flags. Same price.
- `balance_sections` on `videos/music` and `music/plan`: a last section
  under 6 s shares time with the one before it (33 s: 15 + 9 + 9). On by
  default when the AI writes the sections; send the same value to both.

## Commercials: brands and packaging

1. Save a brand once (free): `POST /director/brands` with `name` (required),
   `tagline`, `cta`, `product_name`, `description`, `audience`, `voice`,
   `look`, `banned_words`, end-card and sound defaults (`end_card_s`,
   `end_card_style`, `logo_corner`, `logo_scale`, `text_color`,
   `accent_color`, `background_color`, `music_db`, `voiceover_db`, `duck_db`,
   `lufs`), and the files `logo` (PNG with transparency) and `font`
   (.ttf/.otf). At most 50 brands per account.
2. Package a finished video: `POST /director/videos/package` with `job_id` (or
   an uploaded `video` up to 7 min) and any of `brand_id`, `tagline`, `cta`,
   `logo`, `music`, `voiceover`, `font`, `formats` (`["9:16","1:1","4:5"]`),
   `reframe` (`crop` follows faces, `fit` blurs the sides) and `cutdowns` (up
   to 3 lengths, 5–120 s). The main video keeps its exact length; the other
   shapes and cutdowns come back in `deliverables`. `?dry_run=true` is free.
   Also: `legal` (fine print on the end card, or the whole video with
   `legal_always`), `captions` (`"auto"` from the voiceover or the video's
   speech, SRT/WebVTT text, or a list of `{text, start, end}`), a typed
   `voiceover_text` (up to 1500 characters) read by a studio voice
   (`voiceover_voice`, from `GET /director/voiceover/voices`; an uploaded
   `voiceover` wins), a `packshot` image (the product on the end card), an
   opening `title_card` (up to 160 characters, 3 lines, the first big;
   `title_card_s` 1–10, default 4) and `music_until_s` (the music bed plays
   only under the opening, then fades).
3. Or ask for it at render time: `videos/film` and `videos/music` take
   `brand_id`, a `package` object (the same fields) and `logo`; films also
   take `music_bed`, `voiceover`, `film_type: "commercial"` (an ad structure
   for the writer: a 2 s hook, the product as the answer, hero product shots,
   a calm last shot under the end card), `product_pictures` (which of your
   `images` show the product, e.g. `[1]`) and `variants` (2–4 versions in
   all). On films, `package.packshot_picture` puts one of your `images` (its
   number) on the end card.
4. Have the writer plan it: `POST /director/prompts/write` takes
   `film_type: "commercial"`, `brand_id`, `product_pictures` (1-based, in
   `references`), `voiceover: true` (leave room for one) and `end_card_s`.
   With `mode: "reference"` and a 6–15 s `duration` it writes a one-shot ad.
   When the AI writes the commercial (`film_type: "commercial"` with an
   `idea` on `videos/film`, or on `prompts/write`), the studio adds a
   self-review pass against the ad rules (about 20–40 s more). It costs
   `adReview` credits once per write; the catalog has the price.
   `ad_style` picks the format: `problem_solution`, `product_hero`,
   `slice_of_life`, `demo`, `cinematic_story`, `comedy`, `sensory`,
   `montage`, `before_after`, `aspirational`, `reveal`, or `auto` (default:
   the writer picks, so ads differ; each of `variants` gets its own).
6. Caption looks (packaging, same price): `caption_style` (`subtitle` or
   `pop` word chunks), `caption_words`, `caption_position`, `caption_font`,
   `caption_size`, `caption_color`, `caption_stroke_color`,
   `caption_stroke_width`, `caption_shadow`, `caption_highlight_color`
   (karaoke highlight), `caption_uppercase`, `caption_animation`.
5. Package a single shot: `videos/text`, `videos/image` and
   `videos/reference` take `brand_id` and a `package` object (image and
   reference also `logo` and `packshot` files). When the clip is done the
   studio packages it as its own job: the shot's `packageJobId` is a
   `videos/package` job to poll for the packaged video and `deliverables`.
   Its credits are held with the shot's at the start (a `402` means nothing
   started) and given back if the clip stops or the packaging never starts
   (`packageSkipped` says why). `?check=true` quotes `credits.clip` and
   `credits.packaging`.

Packaging is priced like finishing, by the seconds of video it writes (the
main video and each extra shape, plus each cutdown in every shape), with a
minimum; `GET /director/catalog` has the current rates. Captions, fine print,
the packshot and a typed voiceover do not change the price.

With `variants`, each extra version is its own job, listed in
`versionJobIds` and billed like the first. Every version's credits are held
when you start, so a `402` means nothing started.

## Face fixes, short songs, dialogue and end cards

- Face fixes report `faceFixReport`: per re-rendered section, likeness before
  and after and whether the change is `visible` (under 0.05 is not). By
  default (`people: "largest"`) face fix handles the largest face in each
  section. `people: "all"` (needs `job_id`) is for group shots: one pass for
  every person the section names, each matched to their own picture. Its
  hold is `faceFix` per section times the passes, from the studio's own
  estimate, rounded up to a tenth (a section with two people is about 2x);
  each section is charged once if anyone in it visibly changed.
- A song from `music/generate` ends when its structure is complete and can
  come back shorter than `duration`; the job then has `durationShort`
  (`requestedSeconds`, `actualSeconds`). Add sections or tags to the lyrics.
- Dialogue: put who-speaks and silence directions before the line or at the
  start of the shot, and only camera or action after `</d>`; the prompt check
  warns about speech words right after a line.
- End cards: `tagline_size` (3–20, default 6.8) and `cta_size` (2–12, default
  4.5), as a % of the frame's short side.
- Explainers: `film_type: "explainer"` with an `idea` makes a narrated
  vertical-video explainer (AI narration read by a studio voice or your
  `voiceover_sample`, one shot per sentence, word-by-word captions, no end
  card). Priced like a film plus the narration writing (`adReview`) and
  packaging.
- Voices: films take `voice_lock: true` (each character keeps the voice heard
  in clip 1 for the whole film, no samples needed; about one clip longer).
  Typed narration has 54 voices in 8 languages (`GET /director/voiceover/voices`
  lists them with their language), or send a `voiceover_sample` (5–15 s of the
  narrator) to have the script read in that voice; `voice_clone` picks how:
  `natural` (default, best match), `fast` or `classic`. Same price.
- Music bed under dialogue: packaging `duck_under_dialogue: true` dips the bed
  wherever the characters speak (`dialogue_duck_db`, default -12). Same price.
- Films with `visual_qa` and `<d>` lines get a speech check: `qaIssues` can
  report `speech_extra_words`, `speech_missing`, `speech_cut_off` and
  `speech_unscripted`. `face_fix: "auto"` skips sections whose drifted shots all
  show two or more people, so they are not billed.

## Storyboards

`storyboard: true` on `/director/videos/film` with an `idea`: after writing,
one still per shot; the job stays `running` with `storyboard.waiting: true`.
`GET /director/jobs/{id}/storyboard` (shots, stills, `sheetUrl`),
`GET …/storyboard/sheet.jpg`, `GET …/storyboard/{clip}/{shot}` (PNG),
`POST …/storyboard/redo` (`clip`, `shot`, optional `note` that rewrites the
shot) and `POST …/storyboard/approve` to render. Stills cost `setPicture`
each (up to 4 a clip held, real count charged); a redo `setPicture`, plus
`storyboardNote` with a note. Never approved: the writing and stills are
still charged. Not with `variants`.

## Documentaries

`film_type: "documentary"` with an `idea` on `/director/videos/film`: a
script in chapters with short on-camera interviews, a deep narrator, one
shot per line, title card, chapter and name cards, subtitles and a score
made for it. `doc_style`: `dramatic` (default), `observational` or
`investigative`; `interviews`: `auto`, `few` or `none`. Priced like an
explainer plus its score. Tuning: `doc_chapters` (1–8), `narration_pace`
(1.5–2.6 words/s), `max_speedup` (1.0–1.3) and an exact `interviews` count
(0–6); `captions: "off"` in `package` drops the subtitles. `fact_check`
(default true) has a second writer pass fix wrong or overstated claims
before the narration is read; `interview_label` (default `dramatized`, up to
40 characters, `""` for none) follows an interviewee's role on their name
card, since interviewees are invented. The fact-check is `factCheck`
credits (send `false` to skip it); the label is free. Upscale takes
`detail` (0–1, default 0.6). Any packaging takes `lower_thirds`: name cards
`{t, text, sub}` or chapter cards `{kind: "chapter", label, text, t, d}`.

## Edit by shots

`GET /director/jobs/{id}/shots` (free) lists the hard cuts of a finished
video: `{ object: "list", jobId, fps, data: [{ shot, startSeconds,
endSeconds, seconds, thumbnailUrl }] }`; each thumbnail is at
`GET …/shots/{n}` (JPEG, 1-based). `409 conflict` until the job is done.

`POST /director/jobs/{id}/edit` with `shots` (required, in play order:
`[1, 2, {"shot": 4, "trim_start": 0.3, "trim_end": 0.5}, 3]`) keeps, drops,
reorders, repeats and trims them; add any packaging field (captions,
filter, look, score, end card, formats, cutdowns…). The sound is crossfaded
at each join and the source is never changed. The result is a new job,
priced like packaging on the edited length. `?dry_run=true` is a free quote.

### Premium

Shots, music videos, films, remakes and episodes take `video_model`
(`basic` or `premium`; left out, the account default, Basic unless Pixio
changes it) and, on Premium, `resolution` (`480p` or `720p`, about twice the
cost). Premium is sharper and more lifelike and is offered when Pixio turns it
on; otherwise `400 premium_unavailable`. Its renders are priced from the
studio's own quote of the takes plus 30%, plus `premiumPrompts` credits for
writing its prompts, in place of the Basic clip price, so always quote with
`?check=true` first. One version at a time, no draft/final (it is already full
quality), and retakes cost the part price it was sold at. The job shows
`videoModel`. Any trouble with Premium falls back to Basic: if it can't be
quoted the job starts on Basic (`videoModel: "basic"`, Basic price), and
whatever the studio renders on Basic instead is charged at the Basic price.

### Duets

A music video with an `idea` takes `singers` (`{"male": 1, "female": 2}`,
or `{"first": 1, "second": 2}` for two women or two men, first = who sings
first; 1-based picture numbers): singers are told apart by their voice, and
each line's performance shots and lip-sync go to its singer, the other
listening with lips closed. Free. When two voices are too alike to tell
apart, `singer_parts` says exactly who sings when, in song seconds, with the
same keys: `{"first": ["0-24.5", "40-49"], "second": ["24.5-40"]}`.

Duet songs: `music/generate` with `voices` (`{"male": "a deep baritone",
"female": "a powerful R&B voice"}`, or `{"first": "...", "second": "..."}`
for two women or two men) and every lyric section tagged with its singer
(`[verse: first]`, `[chorus: second]`). Man and woman: one take per tagged
section, joined, `song` credits each. Two women or two men: one song in the
first voice with the second singer's sections re-voiced (no joins),
2 x `song` credits. A music video made from it (`song_job` plus `singers`
with the same keys) knows exactly who sings when.

### Remake a video

`POST /director/videos/remake` with a `video` (2 s to 7 min; file, URL or
asset path) remakes it shot for shot: the speech is transcribed, the AI
watches every shot and writes it again as a film at the same cut times
(clip k = the source's 15 s window k), with your `changes` ("the man is
<Picture 1>", "set it at night", "make it 3D animation") and up to 9
`images`. `sound`: `original` (default, kept in sync) or `new`; `motion`:
`loose` (default) or `medium`. The film is the source rounded up to 15 s
(30 s at least). It works like a film afterwards: `storyboard`, `speed`,
`upscale`, `visual_qa`, `package`, retakes and draft → final. Priced like a
film written from an idea (clips, writing, up to `filmDesignedPictures`
designed pictures held) plus `remakeWatchPerClip` per 15 s for watching the
source; a 1-minute remake holds 900 credits. `?dry_run=true` is free.

## Looks, filters, score and laughs

Packaging (and any `package` object) also takes:

- `filter` (sepia, black_and_white, noir, vintage, faded, warm, cool, vivid,
  cinematic, dreamy — `GET /director/filters`), `filter_strength` (0–1) and
  `vignette` (0–1). Logo, captions and end card keep their colours.
- `look_id` from `POST /director/looks` (a `picture`, `video` or `job_id`;
  free) to copy a reference's colours, or `look_from_job` with one of your
  finished jobs. Preview first: `GET /director/jobs/{id}/filter_preview?filter=all`.
- `score`: `"auto"` or a description; the music model makes an instrumental
  of the video's length, ducked under speech. Charged per started 5 minutes
  (`score` in the catalog). An uploaded music bed wins.
- `laugh_track`: `light` or `full` (with `laugh_db`) adds studio-audience
  laughs after the punchlines (`laughTrack`).

Series take `laugh_track` for every episode, and `theme_auto=true` or a
`theme_brief` to have the theme made once (charged `score` when saved).

## TV series

1. Save the show once (free): `POST /director/series` with `name`,
   `premise` (its world and tone), `style` (the look of every episode),
   `aspect` (16:9, 9:16 or 1:1), a `theme` file (plays under the opening for
   `theme_s`, default 10 s) and `title_card` (on by default: "NAME / Episode
   N: Title"). Cast: `cast` = a JSON list of `{name, what, kind}` (person,
   place or thing), then each member's `picture` and `voice` (5–15 s) with
   `POST /director/series/{id}/cast`; or the simple way, `pictures` (1–9) +
   `references` (what each shows; the name is the text before the first
   comma) and `voice_samples` (0–3) + `voices`. Without pictures or voices,
   episode 1's become the show's. Limits: cast `name` 60, `what` 400,
   `voice_what` 200; 50 series per account.
2. Make episodes: `POST /director/series/{id}/episodes` with `idea` (10–4000;
   name the cast members in it; leave it out for an episode planned in a
   season), `duration` (30–420, multiple of 15, default
   60), `speed`, `number`, `previously` (your own recap, ≤3000), `voice_lock`
   (`auto` default: on only when someone has no voice yet), `face_fix:
   "auto"`, `visual_qa`, an extra `package`. It is a normal film job; poll
   `GET /director/jobs/{id}`. When it is done, its recap (what happened, open
   threads, lasting changes) is saved for the next episode and the show
   learns new faces and voices from it: `GET /director/series/{id}/episodes`.
3. Plan a season (optional): `POST /director/series/{id}/season` with an
   `idea` (10–3000: the big story and where it ends), `episodes` (2–20,
   default 6) and optional `first` (the first planned episode's number,
   1–999; default the next one). It plans an arc: one line per episode,
   threads across them and the new characters it brings in, saved on the
   show (a new plan replaces the old one). A writer job, `writerRound`
   credits, charged when done and given back if it fails; the plan is in
   the job's `result` and on the series. A planned episode needs no `idea`
   on `POST …/episodes`.
4. Price: an AI-written film plus the recap (`episodeRecap`) and packaging
   (title card and theme). `?dry_run=true` is free. Episode redo and final
   work like a film's.

## Draft, then final

A film with `speed: "draft"` costs less per clip.
`POST /director/videos/film/{id}/final` renders that finished film again at
full quality as a new job, with the same written clips, the same pictures
(yours and the ones the studio designed) and the same seeds; packaging and
finishing carry over. It costs a final render of every clip (plus packaging
and visual QA when the draft had them), never the writing. Optional:
`upscale`.

Music videos have a draft too: `speed: "draft"` renders every section at a
smaller frame for less (`musicSectionDraft` in the catalog).
`POST /director/videos/music/{id}/final` renders that finished music video
again at full quality with the same song, sections, pictures and seeds,
priced as a full render of every section (plus packaging and visual QA when
the draft had them), never the writing or the sets.

Extra work you ask for is priced in proportion: `steps` above the default
(shots and music videos 8, sung-word music videos 12, images 6, songs 30),
`vsa: false` on a shot (about 1.8x), `finish` on a film or music video and
`visual_qa: "local"` (`visualQaLocal` per part). `?check=true` shows the total. `music/plan`
without an `idea` (the song analysis alone) costs `songAnalysis`.

Single shots are billed as at least 8 seconds. A face fix is charged only
for the sections it visibly changed (`faceFixReport`); with `people: "all"`
each such section is charged once for all its passes.

Films and music videos list the pictures they used in `pictures` (`number`,
`tag`, `designed`, `what`, `url`); each is served at
`GET /director/jobs/{id}/pictures/{n}`.

## Example: song → music video

```bash
# 1. Make the song (or skip and upload your own as `song`)
curl -fsS -X POST "$PIXIO_BASE_URL/director/music/generate" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"prompt":"warm indie pop, female vocal","lyrics":"[verse]\n...","duration":60}'

# 2. Poll until done
curl -fsS "$PIXIO_BASE_URL/director/jobs/$SONG_JOB" -H "Authorization: Bearer $PIXIO_API_KEY"

# 3. Shoot the video from that song
curl -fsS -X POST "$PIXIO_BASE_URL/director/videos/music" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F song_job=$SONG_JOB \
  -F idea="a singer walking home through neon rain" \
  -F aspect=16:9
```

## The job object

Every start call returns `202` with a `Location` header and:

```json
{
  "id": "job-uuid",
  "object": "director.job",
  "endpoint": "videos/music",
  "status": "running",
  "stage": "3 of 12 parts done",
  "progress": 0.25,
  "etaSeconds": 840,
  "queue": { "ahead": 0, "estimatedCompletionAt": "2026-11-13T20:14:00Z" },
  "credits": { "quoted": 1644, "charged": 0 },
  "output": null,
  "parts": [{ "index": 1, "label": "Section 1", "url": "https://..." }],
  "qa": [{ "part": 1, "ok": true, "lipSync": 0.912, "borders": 0, "blendedFrames": 0 }],
  "result": null,
  "error": null,
  "deliverables": [],
  "versionJobIds": [],
  "versionOf": null,
  "sourceJobId": null,
  "createdAt": "2026-11-13T20:00:00Z",
  "completedAt": null
}
```

- `status`: `queued` → `running` → `done` | `failed` | `cancelled`.
- `queue` is set only while waiting or rendering: `ahead` is how many jobs
  wait in front of yours (0 once it renders), `estimatedCompletionAt` when it
  should finish. Only your own jobs are ever shown.
- When done, `output` is `{ type, url, assetPath, generationId }`. `url` is a
  signed URL valid 6 hours; `assetPath` is the durable copy in your assets.
- `music/plan` and `prompts/write` run in the background for a few minutes;
  their output is in `result`.
- With packaging, `deliverables[]` lists the other shapes and cutdowns:
  `{ index, name, aspect, cutdownSeconds, width, height, durationSeconds,
  url, assetPath }`, each copied into your assets.

## Billing

- The quote is **reserved** when the job starts; `402 insufficient_credits`
  (with the required amount) if short.
- It settles once: the quote when `done`. A music video or film that stops
  early is charged only for finished sections/clips plus any writing; a job
  that fails before rendering anything costs nothing.
- Cancelling (`DELETE`) still charges finished parts.
- Designed pictures: when the studio writes from an `idea` (films,
  commercials, explainers, documentaries, episodes, and music videos with
  `make_references`) it designs pictures of places, props and faces at
  `setPicture` credits each. The hold covers the most it makes
  (`filmDesignedPictures` for a film or episode, `designedSets` for a music
  video); only the pictures made are charged, also when a job stops.

## Errors

Every body carries `error` and `code`.

| Status | Code | Meaning |
| --- | --- | --- |
| 400 | `invalid_request` / `invalid_json` | Bad body; see `details` |
| 400 | `invalid_media_url` | A media URL or path could not be used, or belongs to another account |
| 402 | `insufficient_credits` | Not enough credits for the quote |
| 404 | `not_found` | Job, referenced job or brand not found |
| 422 | `prompt_check_failed` | Official-format prompt has checker errors; report in `promptCheck`; nothing charged |
| 409 | `conflict` | Referenced job has not finished, the file is not ready, or 50 brands already saved |
| 429 | `concurrency_limit` | 8 Director jobs already running; honour `Retry-After` |
| 502 | `studio_error` | The studio rejected the job; nothing was charged |
| 503 | `service_unavailable` | The studio is busy; nothing was charged, retry later |

The Director limit (8 at once) is separate from the `/generate` concurrency
limit.

## Agent Protocol

1. `GET /director/catalog` for fields and prices; confirm the quote with the
   user before long music videos or films.
2. Start the job; store the returned `id`.
3. Poll `GET /director/jobs/{id}` every 10–30 s. On a timeout, keep polling
   the same id — never resubmit.
4. Use `parts[]` to review sections as they land; re-shoot one with
   `.../{id}/redo` instead of re-running the whole video.
5. Chain post-processing (`upscale`, `finish`, `facefix`, `package`) with
   `job_id`; to cut a finished video, read `…/shots` and `POST …/edit`.
6. For ads, save the brand once and pass `brand_id`; quote `variants` as
   versions × the single price before starting.
