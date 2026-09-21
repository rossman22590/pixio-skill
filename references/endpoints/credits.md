# Credits, Ledger, And Subscription

For identity, Maker caps, and the concurrency limit, prefer `GET /me`
(`me.md`). These routes remain supported and are the authoritative balance and
movement history.

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

Query:

- `limit`: 1–200, default 50.
- `generationId`: UUID; only movements linked to this generation.

```bash
curl -fsS "$PIXIO_BASE_URL/credits/ledger?generationId=$CONTENT_ID" \
  -H "Authorization: Bearer $PIXIO_API_KEY"
```

```json
{
  "entries": [
    {
      "id": "entry-id",
      "reason": "generation",
      "deltaRecurring": -300,
      "deltaPermanent": 0,
      "sourceId": "generation-id",
      "generationId": "generation-id",
      "debitedCredits": 300,
      "creditedCredits": 0,
      "createdAt": "..."
    }
  ]
}
```

- `generationId` is the same value as `sourceId`, kept under both names.
  `null` means no link was recorded against the movement; that means
  unlinked, not unbilled.
- `debitedCredits` is the absolute value of a negative delta;
  `creditedCredits` is a positive delta (top-ups, refunds).
- The ledger is authoritative. `GET /generations/{id}` → `billing` summarises
  the same rows with `matchedBy` telling you how confident the link is.

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
  "apiConcurrencyLimit": 1
}
```

`apiConcurrencyLimit` equals `concurrencyLimit` on `/me`.

## Accounting Rules

- `POST /generations/estimate` is a quote, not a reservation.
- Credits debit only when a generation reaches `succeeded`. `creditsCost` on a
  failed run is a quote that was never charged.
- `402` from `/generate` is the authoritative insufficient-credit response.
- Credits and concurrency are shared with every API key on the account.
- Never infer balance by summing a partial ledger window; use `/credits` or
  `/me`.
- Songcraft downloads (`/assets/{id}/download?tier=`) also debit credits and
  appear in the ledger.
