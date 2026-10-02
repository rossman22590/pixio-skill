# GET /api/v1/me

Identify the API key's account. The standard first call of any integration: it
verifies the key and returns everything needed to size a worker pool and plan
spend.

```bash
curl -fsS "$PIXIO_BASE_URL/me" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

## Response

```json
{
  "id": "account-id",
  "name": "Ross",
  "email": "user@example.com",
  "pictureUrl": null,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "plan": "maker",
  "credits": {
    "recurring": 3000,
    "recurringQuota": 15000,
    "permanent": 407,
    "total": 3407
  },
  "concurrencyLimit": 10,
  "makerCaps": [
    {
      "slug": "maker-avatars",
      "label": "Avatars",
      "dailyLimit": 5,
      "usedToday": 3,
      "remainingToday": 2,
      "rollingWindowSeconds": 86400,
      "nextAllowanceAt": "2026-09-21T08:12:00.000Z"
    }
  ]
}
```

- `plan` is the product ID or `free`.
- `concurrencyLimit` is the per-account ceiling on API generations running at
  once. It produces `429 concurrency_limit` on every generate route. 1 on most
  plans, 10 on Maker. It is shared by every key on the account.
- `makerCaps` is empty on non-Maker plans. Each entry is one daily free-use
  pool. Join `slug` to `makerCap.slug` on `/models` or `/pricing` to know which
  pool covers a model. `nextAllowanceAt` is when the next free use frees up in
  the rolling window, or `null` when nothing is waiting to free up.

## Two Different Rejections

| Signal | Source | Meaning |
|---|---|---|
| `429 concurrency_limit` | `concurrencyLimit` | Too many API jobs at once right now. Poll the blocking job and retry in seconds. |
| Maker cap exhausted | `makerCaps[].remainingToday == 0` | Out of free daily uses; the model now costs `creditsAfterPool`. Wait for `nextAllowanceAt` or pay. |

They are unrelated and easy to confuse. Read both before choosing a wait.

## Agent Rules

- Call `/me` at startup and cache it for minutes, not hours.
- Size a shared semaphore to `concurrencyLimit` across all instances using the
  same account.
- Before dispatching a Maker-covered model, check `remainingToday` so the user
  is not surprised by `creditsAfterPool`.
- `/subscription` returns a subset of this (`plan`, `credits`,
  `apiConcurrencyLimit`) and remains supported for older clients.
