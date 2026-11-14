# Director Over The API

`/api/v1/director/*` is Pixio's own video studio: lip-synced music videos cut
to a song, films from 30 s to 7 min, single shots, images, songs, upscale and
finishing. Every call is billed in Pixio credits and returns Pixio ids and
Pixio URLs.

Start with `GET /director/catalog`: it lists every endpoint with its accepted
fields, the looks and styles, and the credit prices.

## Endpoints

| Method | Path | Does |
| --- | --- | --- |
| GET | `/director/catalog` | Endpoints, fields, looks, styles, prices |
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
| POST | `/director/images/text` · `/images/edit` · `/images/reference` | Images |
| POST | `/director/music/generate` | A song from a description and lyrics |
| POST | `/director/music/plan` | Writer: sections, vocals and (with `idea`) a treatment |
| POST | `/director/prompts/write` | Writer: ready-to-shoot clip prompts from a `story` |
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
  URLs. You get `200 { object: "director.preflight", credits.quoted,
  promptCheck, … }` plus a note when the real request would be refused.
  Nothing starts.

Agents should run `?check=true` first for official-format prompts, fix every
`ERROR`, then start the job.

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
| 404 | `not_found` | Job (or referenced job) not found |
| 422 | `prompt_check_failed` | Official-format prompt has checker errors; report in `promptCheck`; nothing charged |
| 409 | `conflict` | Referenced job has not finished, or the file is not ready |
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
5. Chain post-processing (`upscale`, `finish`, `facefix`) with `job_id`.
