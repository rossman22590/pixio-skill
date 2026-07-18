# Errors, Retries, Concurrency, And Recovery

## Error Classification

| Status | Typical cause | Retry? | Action |
|---:|---|---:|---|
| 400 | Invalid body/query/model params/media | No | Correct request using live schema. |
| 401 | Missing, malformed, invalid, or revoked key | No | Replace key; verify server secret. |
| 402 | Insufficient credits | No | Surface available/required/shortfall. |
| 404 | Unknown or unavailable resource/model | No | Re-discover and correct ID. |
| 422 | Unsupported rename or invalid saved workflow | No | Change operation or repair workflow in app. |
| 429 | Account-wide API concurrency full | Later | Wait for a tracked job to finish. |
| 500 | Pixio server failure | Maybe | Back off; preserve IDs and request. |
| 502 | Provider/upload/orchestration failure | Maybe | Reconcile state before paid retry. |
| 503 | API-key storage unavailable | Later | Back off; do not rotate a valid key. |

Always parse the JSON body. Preserve `error`, `message`, `details`,
`generationId`, `status`, `concurrencyLimit`, `availableCredits`,
`requiredCredits`, and `shortfall` when present.

## Account-Wide Concurrency

Use `GET /subscription` for the live `apiConcurrencyLimit`. The limit applies
across every key owned by the account and covers public API generation/workflow
work. Do not size each worker independently to the full account limit.

On `429`:

1. persist the returned `generationId` when present;
2. poll it until terminal;
3. re-read current in-flight generations if needed;
4. retry the queued local task once capacity exists.

Use a central queue/semaphore when multiple application instances share a Pixio
account.

## Retry Schedule

For retryable reads use exponential backoff with jitter, for example 1s, 2s,
4s, 8s, capped at 15–30s. Bound attempts and honor cancellation.

Safe automatic retries:

- `GET` discovery, detail, history, balance, and polling calls;
- `POST /generations/estimate`;
- `POST /prompts/optimize` if duplicate optimized text is harmless.

Do not automatically retry:

- `POST /generate` after the request may have reached Pixio;
- `POST /workflows/{id}/runs` after an uncertain response;
- uploads that may create duplicate managed assets without reconciliation;
- `PATCH`/`DELETE` operations unless the desired state is confirmed.

## Ambiguous Paid Submission

An HTTP client timeout is not proof that no generation started. Since the API
has no idempotency-key contract:

1. store the intended model, params fingerprint, and local submission time;
2. query `/generations` newest first;
3. find a matching recent generation;
4. resume polling if found;
5. ask or apply explicit caller policy before submitting again if not found.

For workflow runs, inspect `GET /workflows/{id}/runs` before resubmitting.

## Polling Timeouts

A caller timeout should return a resumable record, not mark the Pixio job failed:

```json
{
  "status": "processing",
  "contentId": "generation-id",
  "resume": true
}
```

Only Pixio's terminal `failed` state is a generation failure.
