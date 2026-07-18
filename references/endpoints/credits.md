# Credits, Ledger, And Subscription

## GET /api/v1/credits

```bash
curl -fsS "$PIXIO_BASE_URL/credits" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

```json
{
  "accountId": "account-id",
  "total": 3407,
  "recurring": {
    "current": 3000,
    "quota": 15000,
    "lastTopOffAt": "..."
  },
  "permanent": 407
}
```

## GET /api/v1/credits/ledger

`limit` defaults to 50 and accepts 1–200.

```bash
curl -fsS "$PIXIO_BASE_URL/credits/ledger?limit=100" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

```json
{
  "entries": [
    {
      "id": "entry-id",
      "reason": "generation",
      "deltaRecurring": -10,
      "deltaPermanent": 0,
      "sourceId": "generation-id",
      "createdAt": "..."
    }
  ]
}
```

Use `sourceId` to correlate a debit/refund with a generation when populated.

## GET /api/v1/subscription

```bash
curl -fsS "$PIXIO_BASE_URL/subscription" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

```json
{
  "plan": "free-or-product-id",
  "credits": {
    "recurringCurrent": 3000,
    "recurringQuota": 15000,
    "permanent": 407,
    "total": 3407
  },
  "apiConcurrencyLimit": 3
}
```

Use this route for a startup health check and to size a worker pool. The returned
concurrency limit is authoritative; do not hardcode free/Maker assumptions.

## Accounting Rules

- `POST /generations/estimate` is a preview, not a reservation.
- Actual pricing can differ because estimates do not model every allowance.
- `402` from `/generate` is the authoritative insufficient-credit response.
- Account credits and concurrency are shared with every API key for that account.
- Never infer balance by summing a partial ledger window; use `/credits`.
