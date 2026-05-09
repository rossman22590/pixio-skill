# Errors And Concurrency

Pixio API uses normal HTTP status codes plus JSON error bodies.

## Common Status Codes

- `400`: invalid params, invalid media URL, unsupported media, malformed body.
- `401`: missing, invalid, or revoked API key.
- `402`: insufficient credits.
- `404`: unknown, hidden, or unavailable model/generation.
- `429`: API concurrency limit reached.
- `500`: server-side failure.

## Insufficient Credits

```json
{
  "error": "Insufficient credits",
  "availableCredits": 154,
  "requiredCredits": 175,
  "shortfall": 21
}
```

Tell the user how many credits are available and how many more are needed.

## Concurrency

API concurrency is account-wide across all API keys.

Default accounts:

```text
1 in-flight API generation
```

Maker accounts:

```text
3 in-flight API generations
```

Concurrency error:

```json
{
  "error": "This account has reached its API concurrency limit of 3. Wait for a generation to finish before starting another.",
  "generationId": "00000000-0000-0000-0000-000000000000",
  "status": "processing",
  "concurrencyLimit": 3
}
```

If this happens, poll the returned `generationId` if present, then retry after a job finishes.

## Retry Guidance

- Retry `429` only after waiting or after a tracked job completes.
- Retry transient `500` errors with backoff.
- Do not retry `401` without a new key.
- Do not retry `402` until the user adds credits or chooses a cheaper model.
- Do not blindly retry invalid media URL errors.
