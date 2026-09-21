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
| 422 | `content_policy`, `invalid_workflow_definition`, rename of generated asset, `CANVAS_*` | No | Change the input or operation. Never resubmit unchanged. |
| 429 | `concurrency_limit` | Later | Poll `generationId`; honour `Retry-After`; retry when a job finishes. |
| 500 | Pixio server failure | Maybe | Back off; preserve IDs and request; reconcile before paid retry. |
| 502 | Provider, upload, optimizer, or orchestration failure | Maybe | Reconcile state before paid retry. |
| 503 | API-key storage unavailable | Later | Back off; do not rotate a valid key. |

Always parse the JSON body. Preserve `error`, `code`, `message`, `details`,
`generationId`, `status`, `concurrencyLimit`, `retryAfter`,
`availableCredits`, `requiredCredits`, `shortfall`, `inputHint`, and
`inputsSubmitted` when present.

## Idempotency Keys

`POST /generate` accepts `Idempotency-Key` (at most 255 chars). A repeat with
the same key within 24 hours returns `200 { contentId, status,
idempotentReplay: true, createdAt }` for the original job.

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
once across the account: every key, every generate route (`/generate`,
workflow runs, video-agent generate, agent-driven generations). 1 on most
plans, 10 on Maker.

On `429 concurrency_limit`:

1. Persist `generationId` and `status` from the body when present.
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
{ "code": "content_policy", "message": "...", "inputHint": "image_url", "inputsSubmitted": ["prompt", "image_url"] }
```

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
