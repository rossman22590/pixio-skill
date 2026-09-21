# Pricing And Billing Guide

Three numbers exist for every generation, and agents confuse them constantly.

| Number | Where | Meaning |
|---|---|---|
| `credits` / `listCredits` | `/models`, `/pricing` | Catalog list price at the pricing rule's defaults. |
| `yourCredits` | `/pricing` | What this account pays at the defaults after plan discounts, plan-free models, and today's free pools. |
| `quote.expectedDebit` | `/generations/estimate` | What this exact request will debit if it succeeds now. |

And two numbers exist after the fact:

| Number | Where | Meaning |
|---|---|---|
| `creditsCost` | `/generations`, `/generations/{id}` | The quote recorded at dispatch. |
| `billing.settledCost` + `billedAt` | `/generations/{id}` | The actual debit. `billedAt: null` means never charged. |

## How Prices Are Built

`pricing` (on `/models`, `/pricing`, and quotes) says how:

- Flat: no `rate`; the credit figure is the price.
- Rate-based: `rate` credits per `rateQuantity` of `rateUnit` (`second`,
  `step`, `unit`, `word`). Quantity is rounded with `rounding` (usually
  `ceil`) before multiplying; `minCredits`/`minimumCredits` floors the total;
  `maxUnits`/`maximumUnits` caps the quantity.
- Measured (`measured: true`): the quantity comes from a file the caller
  supplies and the server measures it. Any duration the caller sends is
  ignored. A 24.14-second clip at 12 credits/second bills 25 seconds, 300
  credits.
- Options-driven: `fromCredits` is the cheapest combination; only a quote with
  the real params gives the price.
- `pricedFromParams: true`: the price comes entirely from what you send; a `0`
  is an empty request, not a free model.

## Quote Discipline

1. Quote with the exact params and the real media.
2. `quote.status: measured` is a price. `provisional` is arithmetic from a
   default or a `durationSeconds` hint; `provisionalReason` says which.
3. `quote.allowance` shows the Maker pool covering the run and
   `nextAllowanceAt`; when `remainingToday` is 0, `expectedDebit` equals
   `creditsAfterPool`.
4. A `400 invalid_request` from the quote is the same rejection `/generate`
   would give (for example a clip over `maximumUnits`).
5. Re-quote after any change to params or media.

## Maker Daily Caps

Maker accounts get free daily uses of capped model pools. `GET /me` →
`makerCaps[]` reports `dailyLimit`, `usedToday`, `remainingToday`,
`rollingWindowSeconds`, `nextAllowanceAt`. `/models` and `/pricing` carry
`makerCap.slug` so a model can be joined to its pool. Running out of a pool
is not an error; the model simply costs `creditsAfterPool`.

Do not confuse caps with the concurrency limit. `429 concurrency_limit` is
"too many at once"; a spent pool is "pay list price until the window rolls".

## When Credits Move

- Credits debit only on the transition to `succeeded`. Failed runs keep
  `creditsCost` (the quote) and `billedAt: null`.
- Refunds appear as positive ledger rows (`creditedCredits`). `billing.
  refundedCredits` counts only rows directly linked to the generation.
- Songcraft downloads debit on `GET /assets/{id}/download?tier=` (preview
  100, official 300; once per song per tier).
- The agent (`/agent`) requires a 5-credit floor and bills its generations
  like `/generate`.

## Reconciliation Recipe

```text
GET /generations/{id}
  -> billing.settledCost, billing.billedAt, billing.ledger.matchedBy
GET /credits/ledger?generationId={id}
  -> debitedCredits / creditedCredits per row
```

- `matchedBy: source_id`: exact link; trust it.
- `matchedBy: timestamp`: probable match on time and amount; label it so.
- `matchedBy: none` with `billedAt` set: the movement exists but was not
  linked; report unlinked, not unbilled.

## Converting To Dollars

`/pricing` publishes `usdPerCredit` (cheapest pack), `plans[].usdPerCredit`,
and `creditPacks[]`. Multiply `expectedDebit` by the rate the user actually
buys at; state which rate you used.

## Agent Rules

- Rank and budget with `yourCredits`, never `listCredits`.
- Promise a price only from a `measured` quote or a flat model.
- Show the user `expectedDebit`, `remainingToday` for covered pools, and the
  total for batches before dispatch.
- After completion report `billing.settledCost`, not `creditsCost`.
