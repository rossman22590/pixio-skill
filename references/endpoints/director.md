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
| POST | `/director/videos/upscale` | ~1080p upscale of `job_id` or an uploaded clip (≤15 s) |
| POST | `/director/videos/finish` | Grade, grain, loudness, deflicker |
| POST | `/director/videos/facefix` | Re-render small faces in a finished music video or film |
| POST | `/director/videos/package` | End card, logo, packshot, fine print, captions, music bed, voiceover (file or script), other frame shapes, cutdowns |
| GET / POST | `/director/brands` | List / save brands (free) |
| GET / POST / DELETE | `/director/brands/{id}` | Read / change (send only what changes) / delete a brand |
| GET | `/director/brands/{id}/logo` | The brand's logo image |
| POST | `/director/images/text` · `/images/edit` · `/images/reference` | Images |
| POST | `/director/music/generate` | A song from a description and lyrics |
| POST | `/director/music/plan` | Writer: sections, vocals and (with `idea`) a treatment |
| POST | `/director/prompts/write` | Writer: ready-to-shoot clip prompts from a `story` (films, commercials, single shots) |
| POST | `/director/prompts/check` | Check prompts against the house rules (free, synchronous) |
| GET | `/director/jobs` | Your jobs, newest first; `?limit=&before=&endpoint=` |
| GET | `/director/queue` | Your waiting/rendering jobs, oldest first, each with its place in line |
| GET / DELETE | `/director/jobs/{id}` | Get (syncs on read) / cancel |
| GET | `/director/jobs/{id}/parts/{n}` | Stream one clip or section; Range supported |
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
   `voiceover` wins) and a `packshot` image (the product on the end card).
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
   `job_id`.
6. For ads, save the brand once and pass `brand_id`; quote `variants` as
   versions × the single price before starting.
