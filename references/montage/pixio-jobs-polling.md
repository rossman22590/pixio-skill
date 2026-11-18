---
name: pixio-jobs-polling
description: The Montage (Pixio's Director API) job lifecycle in depth - the 202 answer, every status, stage / progress / ETA and queue fields, polite polling of GET /api/v1/director/jobs/{id}, listing and paging GET /api/v1/director/jobs, your own line at GET /api/v1/director/queue, why there are no webhooks and no idempotency keys (and how to avoid double jobs anyway), downloads (output.url, the 302 download routes, parts, deliverables, pictures, files, link lifetime), and cancelling with DELETE. Use whenever you start, watch, wait for, find, cancel or download a Director job. Not for error codes and recovery (that is `references/montage/pixio-errors-recovery.md`) or prices (that is `references/montage/pixio-cost-control.md`).
---

# Jobs, polling and downloads on Montage

Everything that renders on Montage (Pixio's Director API) is a **job**. A render takes minutes, not seconds, so
the API never holds the connection open: the POST answers at once with a job id, and you poll the job until it
finishes. There are **no webhooks** on the Director API: polling `GET /api/v1/director/jobs/{id}` is the one way to
follow a job, and reading a job also brings it up to date.

Base URL: `https://beta.pixio.myapps.ai`. Every path below is under `/api/v1/director/`. Auth on every request:
`Authorization: Bearer $PIXIO_API_KEY` (never in a URL). Examples use `$BASE` and `$PIXIO_API_KEY`.

## House rules

- **Test on Basic.** Every test, draft or trial render runs on Montage Basic (`video_model: "montage-basic"`, which
  is also what you get when you leave `video_model` out). Basic is billed in credits too. Premium or Ultra only when
  the user asks for it and has seen the quote.
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.**

## Decision rules (read these first)

1. **Quote before you start.** On the endpoints that have one, a free quote (`?check=true` / `?dry_run=true`)
   costs nothing and starts nothing. The real POST has no idempotency key, so send it **once**.
2. **A 202 is not a video.** Store the `id` the moment you get it; the video exists only when `status` is `done`.
3. **Poll gently.** Pace your polls by `etaSeconds`, never in a tight loop.
4. **Hand the user `output.url`** (or your own copy of the file). Never build a URL with the key in it; the key is
   never accepted in a URL.
5. **Lost track of a job?** Find it with `GET /api/v1/director/jobs` (filter by `endpoint`) or
   `GET /api/v1/director/queue`. Do not start a new one.
6. **Cancel with `DELETE /api/v1/director/jobs/{id}`** when the user changes their mind, so rendering (and billing
   for unfinished parts) stops.

## 1. Starting a job

```bash
curl -X POST "$BASE/api/v1/director/videos/text" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"prompt": "A lighthouse keeper climbs the spiral stairs at dusk, lantern in hand.", "duration": 10, "video_model": "montage-basic"}'
```

Answer: `202` with a `Location` header (the job's URL) and the job object:

```json
{
  "id": "job-uuid",
  "object": "director.job",
  "endpoint": "videos/text",
  "videoModel": "montage-basic",
  "videoModelName": "Montage Basic",
  "status": "queued",
  "stage": "Waiting to start",
  "cancelRequested": false,
  "progress": 0,
  "etaSeconds": 240,
  "queue": { "ahead": 1, "estimatedCompletionAt": "2026-11-18T20:14:00Z" },
  "credits": { "quoted": 120, "charged": 0 },
  "output": null,
  "parts": [],
  "deliverables": [],
  "versionJobIds": [],
  "versionOf": null,
  "qa": [],
  "qaIssues": [],
  "faceFixJobId": null,
  "packageJobId": null,
  "result": null,
  "error": null,
  "details": null,
  "sourceJobId": null,
  "createdAt": "2026-11-18T20:10:00Z",
  "completedAt": null
}
```

(The numbers above are placeholders; the real quote comes from the catalog and your request.)

`credits.quoted` is what was **reserved** when the job started; `credits.charged` fills in when it settles. A `402
insufficient_credits` instead of a 202 means nothing started.

Records are not jobs: `POST /api/v1/director/brands`, `/series` and `/looks` save something and answer at once.
`POST /api/v1/director/prompts/check` is synchronous and free. `music/plan`, `prompts/write` and
`series/{id}/season` are writer calls: they also return a job, which runs in the background for a few minutes
and puts its answer in `result`.

## 2. Statuses

| `status` | Meaning | What you do |
|---|---|---|
| `queued` | waiting in line for the studio | wait; `queue.ahead` shows how many jobs are in front |
| `running` | writing, rendering, assembling, packaging or checking | wait; watch `stage` and `progress` |
| `done` | finished | download |
| `failed` | stopped; `error` says why (writer jobs also carry `details`) | see `references/montage/pixio-errors-recovery.md` |
| `cancelled` | stopped by a DELETE | nothing; start again if needed |

A film made with `storyboard: true` stays `running` with `storyboard.waiting: true` once its stills are drawn. That
is your cue to stop polling and show the human the sheet (`storyboard.sheetUrl`); render it with
`POST /api/v1/director/jobs/{id}/storyboard/approve`, or redraw a still with `.../storyboard/redo`
(see `references/montage/pixio-storyboarding.md`).

Useful fields while it runs:
- `stage`: plain words about what is happening now: `Preparing the shoot`, `Waiting to start`, `3 of 12 parts done`, `Sharpening`, `Finishing the cut`, `Storyboard ready — approve to shoot`, `Cancelling`.
- `progress`: 0 to 1 (never 1 until `done`).
- `etaSeconds`: the studio's estimate of the seconds left.
- `queue` (only while waiting or rendering): `ahead` (jobs in front of yours, 0 once it renders) and
  `estimatedCompletionAt`. Only your own jobs are ever counted or shown.
- `cancelRequested: true` after a DELETE that has not landed yet (a cancel lands between render steps).
- `parts[]`: each clip or section as it lands (`index`, `label`, `url`), so you can review a long video early.
- `qa[]` and `qaIssues[]`: per-part checks and `visual_qa` findings.
- Follow-up jobs: `faceFixJobId` (with `face_fix: "auto"`), `lipCheckJobId` (with `lip_check`), `packageJobId` (a
  single shot sent with `brand_id` or `package`), and `versionJobIds` (with `variants`). Each is its own job id to
  poll the same way. When `faceFixJobId` is set, wait for that job and deliver its video; the same holds for a
  `lipCheckJobId` that makes a fixed copy and for a `packageJobId`. `lipCheckSkipped` / `packageSkipped` say why a
  follow-up did not run.

## 3. Polling cadence

There is no server rule; be a polite client:
- Wait about `min(etaSeconds / 3, 60)` seconds between polls; never under 10 s.
- Single shots (5-15 s): every 10-30 s. Films and music videos: every 30-60 s is plenty.
- Stop at `done`, `failed` or `cancelled`. At `storyboard.waiting: true`, stop and ask the human to approve.
- If a poll times out or answers 502/503, back off and poll the **same id** again; the job keeps running. Never
  resubmit the POST because a poll failed.

```python
import time, requests

def wait(base, key, jid):
    h = {"Authorization": f"Bearer {key}"}
    while True:
        j = requests.get(f"{base}/api/v1/director/jobs/{jid}", headers=h, timeout=60).json()
        if j["status"] in ("done", "failed", "cancelled"):
            return j
        if (j.get("storyboard") or {}).get("waiting"):
            return j
        time.sleep(max(10, min(60, (j.get("etaSeconds") or 60) / 3)))
```

## 4. Finding jobs

`GET /api/v1/director/jobs`: your jobs, newest first.

| Query | Effect |
|---|---|
| `limit` | 1-100, default 20 |
| `before` | page back: send the last job's `createdAt` (the answer gives it as `nextBefore` while `hasMore` is true) |
| `endpoint` | only one kind, for example `videos/music`, `videos/film`, `videos/package` |

```bash
curl -H "Authorization: Bearer $PIXIO_API_KEY" "$BASE/api/v1/director/jobs?endpoint=videos/film&limit=50"
# -> {"object": "list", "data": [ ...jobs... ], "hasMore": true, "nextBefore": "2026-11-18T19:02:11Z"}
```

The list does not refresh live progress; `GET` one job for that.

`GET /api/v1/director/queue`: only your jobs that are still `queued` or `running`, oldest first, each with its
`queue.ahead` and `queue.estimatedCompletionAt`. Use it to see your own line, or to find a job you started and lost.

## 5. No idempotency keys: how not to pay twice

The Director API has no `Idempotency-Key`; every POST that reaches the server starts a new, billed job. So:

- Price first with the free quote where it exists (`?check=true` or `?dry_run=true` on `videos/text`, `image`,
  `reference`, `music`, `film`; `?dry_run=true` on `videos/remake`, `videos/package`, `series/{id}/episodes` and
  `jobs/{id}/edit`). Other endpoints answer `400 preflight_unavailable` to those flags; nothing starts.
- Store the job `id` from the 202 before doing anything else.
- If the POST itself times out with no answer, **do not resend blindly**. Look first:
  `GET /api/v1/director/queue` (and `GET /api/v1/director/jobs?endpoint=<the endpoint>&limit=5`); a job created
  in the last minute with your settings is yours. Only start again when nothing is there.
- At most 8 Director jobs run at once per account: a 9th answers `429 concurrency_limit` with `Retry-After`.
  Nothing started; wait and send it then.

## 6. Downloads

A `done` job carries:

| Field | What it is |
|---|---|
| `output.url` | a signed link to the finished file, valid **6 hours**, no key needed |
| `output.assetPath` | the durable copy in your Pixio assets (it does not expire) |
| `output.generationId` | the matching item in your Pixio library |
| `output.type` | `video`, `image` or `audio` |
| `output.withOriginalSong` | Premium music videos: the same picture over your original song (`url`, `assetPath`), free |
| `parts[].url` | each clip or section: `GET /api/v1/director/jobs/{id}/parts/{n}` (with the key; Range supported, plays in a `<video>`) |
| `deliverables[]` | packaged shapes and cutdowns: `{ index, name, aspect, cutdownSeconds, width, height, durationSeconds, url, assetPath }` |
| `pictures[]` | films and music videos: every picture used (`number`, `tag`, `designed`, `what`, `url`), served at `GET /api/v1/director/jobs/{id}/pictures/{n}` |
| `files[]` | extra downloads some tools make (audio tools, transcripts), each with `url` and `assetPath` |
| `analysis`, `understanding`, `plan`, `transcript`, `result` | the JSON answer of Analyze, Understand, graphics plans, transcribe and writer jobs (no file) |

Download routes (key in the header, each answers `302` to a fresh signed link, `409 conflict` until the job is
done):

- `GET /api/v1/director/jobs/{id}/video` (add `?variant=song` for a Premium music video over your original song)
- `GET /api/v1/director/jobs/{id}/image`
- `GET /api/v1/director/jobs/{id}/audio`

```bash
curl -fsSL -o film.mp4 -H "Authorization: Bearer $PIXIO_API_KEY" "$BASE/api/v1/director/jobs/$JOB/video"
```

- Link lifetime: every `GET /api/v1/director/jobs/{id}` signs fresh links, so an expired `output.url` is fixed by
  reading the job again (or by the 302 routes above).
- Finished files are copied into your Pixio assets, so they stay after the links expire. For a link to send someone,
  use `output.url` (it works for 6 hours) or share it from your assets; the Director API has no separate share
  endpoint.

## 7. Cancelling

`DELETE /api/v1/director/jobs/{id}` cancels a job that is queued or running (including one waiting at its
storyboard). A running render stops at the end of its current step: the job shows `cancelRequested: true` and the
stage `Cancelling` until it lands, then `status: "cancelled"`. Finished parts are still charged; nothing else is.
DELETE on a job that has already finished simply returns it unchanged and never removes finished files.

## Checklist

- [ ] Quoted with `?check=true` / `?dry_run=true` where the endpoint has one; sent the real POST once.
- [ ] Kept the job `id` (and the `Location` header) from the 202.
- [ ] Polling paced by `etaSeconds`; never resubmitted because a poll failed.
- [ ] Stopped at `storyboard.waiting: true` and asked the human.
- [ ] Waited for `faceFixJobId` / `lipCheckJobId` / `packageJobId` / `versionJobIds` when they apply.
- [ ] Delivered `output.url` (or the asset copy), never a link with the key.
- [ ] Expired link -> read the job again for fresh links.
- [ ] Unwanted job -> `DELETE /api/v1/director/jobs/{id}`.
