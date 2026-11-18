---
name: pixio-errors-recovery
description: How an AI agent reads and recovers from every Montage (Pixio's Director API) error - the error body (`error`, `code`, `details`), each v1 code and what to do, 400 invalid_request and preflight_unavailable, 402 insufficient_credits, 422 prompt_check_failed and strict_prompt, premium_unavailable, the 429 concurrency limit, 502 studio_error and 503 service_unavailable, retrying without starting a second paid job, and jobs that end in status failed (redo or a fresh job). Use whenever a Director request or job fails, returns a non-2xx, or a job ends in failed. Not for prices (that is references/montage/pixio-cost-control.md) or normal polling (that is references/montage/pixio-jobs-polling.md).
---

# Errors and recovery on Montage

Every Montage error is JSON with at least two keys: `error` (the human text) and `code` (machine-readable). Many
also carry `details` (which field, what limit) or an extra key such as `requiredCredits` or `promptCheck`. Read
`code` to decide what to do and `details` to know what to change.

```json
{"error": "prompt is longer than 8000 characters.",
 "code": "invalid_request",
 "details": {"field": "prompt", "maxLength": 8000, "length": 9120}}
```

`429 concurrency_limit` carries a `Retry-After` header. Errors that say "nothing was charged" mean exactly that:
no credits were held or spent.

## House rules

- **Test on Basic.** Every test, draft or trial render runs on Montage Basic (`video_model: "montage-basic"`, or
  leave `video_model` out: v1 always renders on Basic when it is missing). Montage Premium or Ultra only when the
  user asks for it and has seen the quote (`?check=true`).
- **The customer's own song first.** A music video uses the song the user gave you (`song`).
  `POST /api/v1/director/music/generate` is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `videos/finish`; never write grain, noise or film-stock words in a prompt
  or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.

Recovery adds two: never debug on Premium or Ultra, and never paste a customer's lyrics or the key into an error
report.

## Decision rules (read these first)

1. **Retry unchanged only `429`, `502`, `503`** (and one retry of a `500`). Wait for `Retry-After` (or 30-60 s when
   there is none), then send the same request. All of these mean nothing started and nothing was charged.
2. **Never retry any other 4xx unchanged.** Change the request as `error` / `details` say, then send it.
3. **Before blaming the server, check the request against the catalog:** `GET /api/v1/director/catalog` lists every
   endpoint's accepted fields, `maxLength` per text field, the looks and styles, and the prices.
4. **A job that ends in `status: "failed"` is not an HTTP error.** Read the job's `error` (and `details` on writer
   jobs), fix the cause, then redo or start a new job.
5. **Paid re-runs:** before re-running a failed job, tell the human what failed and what the re-run will cost (a
   free quote with `?check=true` / `?dry_run=true` where the endpoint has one). A job that failed before
   rendering anything cost nothing, but a re-run is billed.
6. **Stop and ask** when the fix needs something only the human has (more credits, a file, approval to spend).

## Every code and what to do

| `code` | HTTP | What it means | What to do |
|---|---|---|---|
| `missing_api_key` | 401 | no key sent | send `Authorization: Bearer $PIXIO_API_KEY`; never in the URL |
| `invalid_api_key` | 401 | the key is wrong or revoked | ask the human for a working key; do not retry |
| `invalid_request` | 400 | a wrong value, a text field over its limit, a bad combination, or the studio refused the request | fix the field named in `details` (`field`, `maxLength`, `length`); check `GET /api/v1/director/catalog` |
| `invalid_json` | 400 | the body is not valid JSON (or not a JSON object where one is required, e.g. `prompts/check`) | fix the body; send `Content-Type: application/json` |
| `invalid_media_url` | 400 | a media URL or asset path could not be fetched or used, or belongs to another account | send the file as multipart, a public URL, or a path from your own Pixio assets |
| `preflight_unavailable` | 400 | `?check=true` / `?dry_run=true` sent to an endpoint with no free quote; `details.preflightEndpoints` lists the ones that have one | drop the flag to start it for real (it is billed), or quote another way (catalog prices). Nothing started |
| `premium_unavailable` | 400 | `video_model` asked for Montage Premium or Ultra while it is not offered (`videoModels.premiumAvailable` is false in the catalog) | leave `video_model` out (Montage Basic) only if the human agrees: it is a different look |
| `premium_unavailable` | 503 | a retake (redo) of a Premium / Ultra video could not be quoted; it never switches to Basic | wait and retry later; nothing was charged |
| `insufficient_credits` | 402 | not enough credits for the quote; `requiredCredits` says how many | tell the human the amount; do not split the job to fit the balance |
| `not_found` | 404 | wrong job id, referenced job (`job_id`, `song_job`), brand, series or path | `GET /api/v1/director/jobs` (newest first, `?endpoint=`) to find the job |
| `conflict` | 409 | the referenced job has not finished, the file is not ready, or 50 brands already saved | `GET /api/v1/director/jobs/{id}` and wait for `done`; then send again |
| `prompt_check_failed` | 422 | an official-format prompt has checker errors; the report is in `promptCheck`; nothing charged | fix every ERROR (see below); or send an `idea` and let the writer write the prompt |
| `concurrency_limit` | 429 | 8 Director jobs already running on your account | wait `Retry-After`, send the same request |
| `studio_error` | 502 | the studio could not start the job; nothing was charged | retry once after a short wait; if it fails again, report the endpoint and the message |
| `service_unavailable` | 503 | the studio is busy right now; nothing was charged | wait 30-60 s, then retry with the same request |

## 400 in detail

Montage ignores fields it does not list for an endpoint, so a typo does **not** give an error: the field is silently
dropped and the default is used. Check spelling against `GET /api/v1/director/catalog` (each endpoint's accepted
fields) whenever a result ignores something you sent.

Common causes and fixes:
- **Too long:** `prompt` 8,000 characters on Montage Basic (30,000 with `video_model` `montage-premium` or
  `montage-ultra`); `idea` 4,000 and `style` 500 on music videos, films and `music/plan`; `story` 4,000 on
  `prompts/write`; `prompt` 4,000 and `lyrics` 6,000 on `music/generate`; packaging `tagline` 120, `cta` 60,
  `legal` 300, `voiceover_text` 1,500. The 400 names the field before anything is held. Shorten it; do not split
  one shot's prompt across two requests.
- **Out of range:** single shots `duration` 5-15; films `duration` a multiple of 15 from 30 to 420; film `variants`
  2-4 in all; episode `idea` 10-4,000. The catalog gives every range.
- **Wrong tier value:** `video_model` must be `montage-basic`, `montage-premium` or `montage-ultra`. On Premium or
  Ultra, `resolution` must be `480p` or `720p` (use `upscale` on a film or music video, or `videos/upscale`, for
  ~1080p).
- **verbatim:** `verbatim: true` cannot be combined with an `idea`, remakes or episodes.
- **Leaving `video_model` out** is not an error: it always renders on Montage Basic.

### prompt_check_failed (strict_prompt)

A prompt written in the studio's official format (`integrated_multimodal_description:`, `[Shot N]` blocks,
`<Picture N>` tags) with checker ERRORs is not rendered: `422 prompt_check_failed` with the report in `promptCheck`
(`issues[]` of `{level, message, clip}` and `counts`). Nothing is reserved or charged. Fix loop:

```bash
curl -fsS -X POST "$BASE/api/v1/director/prompts/check" \
  -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"prompt": "<Picture 2> walks into the bar ...", "refs": 1, "duration": 15}'
# -> {"ok": false, "issues": [{"level": "ERROR", ...}], "counts": {"ERROR": 1, ...}}
```

`prompts/check` is free and synchronous; it takes a shot `prompt`, or a film's `clips` with `refs`, `clip_refs` and
`duration`. Fix every ERROR (here: `<Picture 2>` with only one picture sent), check again, then render. WARNs are
advice. `strict_prompt=false` renders anyway, but only do that when you understand the ERROR and the human accepts
the risk. `?check=true` on the render endpoint (`videos/text|image|reference|music|film`) runs the same check with
the full request, returns `credits.quoted`, and renders nothing.

`fix_prompt: "safe"` (free) or `"ai"` (adds 16 credits) repairs your own prompt before rendering: untrained camera
words, grain words and "no crowd" lines.

Bad recovery: deleting the `<Picture 2>` reference and dropping the user's second picture to make the error go
away. The rule is to use every picture supplied: send both pictures instead.

## Waiting and retrying

v1 has no idempotency key, so a resend is always a new job. The safe pattern:

```python
import time, requests

def post_job(url, headers, **kw):
    for attempt in range(6):
        r = requests.post(url, headers=headers, timeout=120, **kw)
        if r.status_code in (200, 202):
            return r.json()                                   # store r.json()["id"] at once
        if r.status_code in (429, 502, 503) or (r.status_code >= 500 and attempt == 0):
            time.sleep(int(r.headers.get("Retry-After", 60)))  # nothing started on these
            continue
        raise RuntimeError(r.text)                            # other 4xx: fix the request first
    raise RuntimeError("still unavailable; tell the human")
```

- **If a POST timed out on your side** and you do not know whether it arrived, do **not** resend blindly: list
  `GET /api/v1/director/jobs?endpoint=<endpoint>&limit=5` and look for a job created at that moment. If it is
  there, poll it; only resend when it is not.
- **Once you have a job id, never resubmit to "unstick" it.** Poll `GET /api/v1/director/jobs/{id}` every 10-30 s;
  a timeout while polling means poll again.

## A long wait

- Each job shows `queue` while it waits or renders: `ahead` (jobs in front of yours, 0 once it renders) and
  `estimatedCompletionAt`. `GET /api/v1/director/queue` lists all your own active jobs, oldest first.
- A long line is a reason to tell the human the ETA, not to cancel and resubmit (a cancel still charges finished
  parts, and a new job goes to the back).
- Look before you add a batch: at most 8 Director jobs run at once per account (`429 concurrency_limit`). This is
  separate from the `/generate` limit.

## Jobs that end in failed

`status: "failed"` with `error` (the reason). Writer jobs (`music/plan`, `prompts/write`, `series/{id}/season`) also
carry `details`. Typical causes and moves:

| Cause in `error` | Move |
|---|---|
| a bad input file (unreadable picture, gone upload, expired URL) | send the file again in a new job |
| the studio failed while rendering | a music video or film that stopped early is charged only for finished parts (plus any writing); a job that failed before rendering anything cost nothing; ask before a paid re-run |
| a Premium / Ultra take could not be made | trouble with Premium falls back to Basic where it can, charged at the Basic price; read `videoModel` on the job to see what was used |
| cancelled by you | nothing to fix |

Re-running:
- **A finished film or music video with one bad clip / section:** `POST /api/v1/director/videos/film/{id}/redo`
  (`{"clip": n}`, optional `seed`, `prompt`) or `POST /api/v1/director/videos/music/{id}/redo` (`{"section": n}`).
  Redo only works on a `done` job (else `409 conflict`). It returns a new job.
- **A job that failed outright:** start a new job with the corrected request. Quote it first with `?check=true` /
  `?dry_run=true` where that endpoint has a free quote.
- **Bad lips in a finished video:** `POST /api/v1/director/videos/lipfix/auto` (or `videos/lipfix` for one 4-14 s
  window) instead of a re-render. See references/montage/pixio-lipsync-fixing.md.
- **Wrong content (people, props, wounds in the wrong place):** fix the prompt
  (references/montage/montage-basic-prompting.md or references/montage/montage-premium-prompting.md), check it, then
  redo that clip. For QA of finished videos see references/montage/pixio-video-qa.md, or run
  `POST /api/v1/director/videos/edit/analyze` and send one of its `suggestedFixes`.

## Checklist

- [ ] Read `code` and `details`, not just the HTTP status.
- [ ] Retried only 429 / 502 / 503 (and one 500), after `Retry-After`, with the same request.
- [ ] After a client-side timeout, checked `GET /api/v1/director/jobs` before resending.
- [ ] Fixed 4xx requests against `GET /api/v1/director/catalog` before resending; checked field spelling.
- [ ] `prompt_check_failed`: every ERROR fixed via `/api/v1/director/prompts/check`; no picture dropped.
- [ ] `preflight_unavailable`: dropped the flag only with the human's OK to spend.
- [ ] Failed job: read `error`; redo for a finished film's bad clip, a new job otherwise.
- [ ] Asked the human before any paid re-run.
