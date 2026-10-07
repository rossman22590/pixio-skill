# Errors, Retries, Idempotency, Concurrency, And Recovery

## Error Classification

| Status | Typical cause | Retry? | Action |
|---:|---|---:|---|
| 400 | Invalid body, query, params, media URL, cursor, idempotency key, operation | No | Correct the request using the live schema and `details`. |
| 401 | Missing, malformed, invalid, or revoked key | No | Replace the key; verify the server secret. |
| 402 | Insufficient credits (generate, agent floor, Songcraft download) | No | Surface `availableCredits`, `requiredCredits`, `shortfall`. |
| 404 | Unknown or unavailable model, asset, generation, project, character, prompt, training job | No | Re-discover and correct the ID. |
| 409 | `PROJECT_CONFLICT`, `UNSUPPORTED_PROJECT_TYPE`, folder sibling-name clash | Conditional | Reload and reapply; use the right typed route; rename. |
| 413 | `PROJECT_TOO_LARGE` (5 MB) | No | Shrink content; store media as keys, not data URIs. |
| 422 | `content_policy`, `invalid_workflow_definition`, `price_unavailable`, rename of generated asset, `CANVAS_*` | No | Change the input or operation. Never resubmit unchanged. |
| 429 | `concurrency_limit` | Later | Poll `generationId`; honour `Retry-After`; retry when a job finishes. |
| 500 | Pixio server failure | Maybe | Back off; preserve IDs and request; reconcile before paid retry. |
| 502 | Provider, upload, optimizer, or orchestration failure | Maybe | Reconcile state before paid retry. |
| 503 | API-key storage unavailable | Later | Back off; do not rotate a valid key. |

Always parse the JSON body, and branch on `code`: every error body is
`{ error, code, ... }` (see `../overview.md`, "Error envelope", for the full
code list and the project-family exceptions). Preserve `error`, `code`,
`message`, `details`, `generationId`, `runId`, `status`, `concurrencyLimit`,
`retryAfter`, `availableCredits`, `requiredCredits`, `shortfall`, `inputHint`,
`inputsSubmitted`, `limitChars`, and `receivedChars` when present.

Status-specific codes worth handling explicitly:

| Status | Codes |
|---:|---|
| 400 | `invalid_json`, `invalid_request`, `invalid_idempotency_key`, `invalid_media_url`, `invalid_workflow_override`; on `/generate` also `provider_error`, `model_unavailable`, `plan_restricted`, `maker_in_flight`, `generation_failed`, `server_error`; on video-agent generate `model_not_available` |
| 401 | `missing_api_key`, `invalid_api_key` |
| 402 | `insufficient_credits` |
| 404 | `not_found`, `model_not_found` |
| 413 | `request_too_large` (`/agent` history over 1,000,000 characters) |
| 422 | `content_policy`, `invalid_workflow_definition`, `price_unavailable` (`/generate`) |
| 429 | `concurrency_limit` |
| 500 | `internal_error` |
| 502 | `provider_error` (`/media`, `/images`, `/prompts/optimize`), `workflow_dispatch_failed`, `optimizer_error` |
| 503 | `service_unavailable` |

Every failure from the `/generate` pipeline is a `400`; tell them apart by
`code`. `invalid_request` is a validation sentence (fix the input).
`provider_error` means the model provider rejected the request (the message
is sanitized and never names the provider); change the input before
retrying. `model_unavailable` and `plan_restricted` will not succeed
unchanged: pick another model. `maker_in_flight` clears on its own: wait for
the running Maker generation to finish, then retry (there is no
`Retry-After`). `generation_failed` is the generic fallback: reconcile with
the same `Idempotency-Key` before a paid retry. `server_error` ("Pixio Server Error. Please try again later.")
means the failure was on Pixio's side, not in the request: wait and retry later.

A `400 invalid_json` means the body never parsed: fix serialization, do not
retry. A `502 provider_error` from `/images` or `/media` means the upload
service or the remote fetch failed on a well-formed request; before
2026-10-01 a malformed JSON body, an unparseable multipart upload, or too many
items also surfaced as `502` there (and malformed JSON as `500` on
`/generate`), so treat any legacy retry-on-502 logic for those routes with
that in mind.

## Idempotency Keys

`POST /generate` accepts `Idempotency-Key` (at most 255 chars). A repeat with
the same key within 24 hours returns `200 { contentId, status,
idempotentReplay: true, createdAt, providerId?, modelId? }` for the original
job (`providerId`/`modelId` while the model can still be resolved).

Rules:

- Generate the key before the first attempt and store it with the intent.
- Reuse it on every retry of that intent, including after a gateway timeout,
  a dropped connection, or a process restart.
- Never reuse it for a different intent; identical bodies without a key are
  distinct jobs on purpose (one prompt, several results).
- An empty or oversized key is `400 invalid_idempotency_key`; fix, do not drop
  the header silently.

Workflow runs, video-agent generate, and the agent stream have no idempotency
key. Reconcile those through their history routes.

## Per-Account Concurrency

`GET /me` → `concurrencyLimit` is the number of API generations that may run at
once across the account: every key, shared by `/generate` and workflow runs,
which both reject with `429 concurrency_limit` at the limit. Video-agent
segment dispatch does not return that `429` itself, so size its batches to the
limit. 1 on most plans, 10 on Maker.

On `429 concurrency_limit`:

1. Persist `generationId` (or `runId` for a workflow run) and `status` from the
   body when present.
2. Wait at least `retryAfter` seconds (also in the `Retry-After` header).
3. Poll the blocking generation to a terminal state.
4. Retry the local task once capacity exists.

Use a central queue or semaphore when several instances share one account. Do
not size each worker to the full limit.

This is not a Maker daily-cap rejection. A cap running out shows up as
`makerCaps[].remainingToday == 0` on `/me` and as a higher `expectedDebit`
(`creditsAfterPool`), not as a `429`.

## Content Policy 422

```json
{ "error": "...", "code": "content_policy", "message": "...", "inputHint": "image_url", "inputsSubmitted": ["prompt", "image_url"] }
```

`error` repeats `message`, so the 422 has an `error` key like every other body.
`inputHint` is `null` when the check did not identify an input.

The request will not succeed unchanged. The matched content is never returned.
Tell the user which input (`inputHint`) or which inputs (`inputsSubmitted`) to
change. Do not rotate models to evade the check.

## Project Conflicts 409

Send `expectedUpdatedAt` on `PATCH`, `DELETE`, and operations. On
`PROJECT_CONFLICT`: `GET` the project, re-derive the change against the new
`content`, and reapply with the new `updatedAt`. Bound the retry count.

## Retry Schedule

For retryable reads use exponential backoff with jitter (1s, 2s, 4s, 8s,
capped at 15–30s). Bound attempts and honour cancellation.

Safe automatic retries:

- `GET` discovery, detail, history, balance, pricing, and polling calls;
- `POST /generations/estimate`, `POST /media/resolve`;
- `POST /prompts/optimize` when duplicate text is harmless;
- `POST /generate` with the same `Idempotency-Key`;
- `POST .../operations` with the same `expectedUpdatedAt` (a repeat either
  applies once or returns `409`).

Do not automatically retry:

- `POST /generate` without an idempotency key after the request may have
  reached Pixio;
- `POST /workflows/{id}/runs`, `POST /video-agent/projects/{id}/generate`,
  or `POST /agent` after an uncertain response;
- uploads that may create duplicate managed assets;
- `PATCH`/`DELETE` unless the desired state is confirmed;
- Songcraft `official` downloads (each tier is charged once per song, but
  confirm the charge in the ledger before repeating).

## Ambiguous Paid Submission

An HTTP client timeout is not proof that no generation started.

With an idempotency key: resend the identical request; read `idempotentReplay`.

Without one:

1. store the intended model, params fingerprint, and local submission time;
2. `GET /generations?status=pending` and `?status=processing`, newest first;
3. match by model, params, and time;
4. resume polling if found;
5. ask or apply explicit caller policy before submitting again if not found.

For workflow runs inspect `GET /workflows/{id}/runs`; for video-agent
segments read the project's `contentId`s; for the agent stream check recent
generations.

## Polling Timeouts

A caller timeout returns a resumable record, not a failure:

```json
{ "status": "processing", "contentId": "generation-id", "resume": true }
```

Only Pixio's terminal `failed` state is a generation failure, and a failed run
is never billed (`billedAt: null`).
