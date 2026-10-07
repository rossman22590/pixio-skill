# Example: Cost-Aware Generation

Identify the account, price the model, validate inputs, quote the exact
request, submit once with an idempotency key, poll, and reconcile. Uses `jq`.

```bash
export PIXIO_BASE_URL="https://beta.pixio.myapps.ai/api/v1"
export PIXIO_API_KEY="pxio_live_..."
export MODEL_ID="pixio/example/model"
AUTH="Authorization: Bearer $PIXIO_API_KEY"
```

## 1. Identify And Budget

```bash
curl -fsS "$PIXIO_BASE_URL/me" -H "$AUTH" \
  | jq '{plan, total: .credits.total, concurrencyLimit, makerCaps}'

curl -fsS --get "$PIXIO_BASE_URL/pricing" -H "$AUTH" --data-urlencode "modelId=$MODEL_ID" \
  | jq '.models[0] | {id, listCredits, yourCredits, free, creditsAfterPool, pricing}'
```

## 2. Validate Inputs

```bash
curl -fsS "$PIXIO_BASE_URL/models/$MODEL_ID" -H "$AUTH" \
  | jq '.params[] | {name, type, required, options, constraints}'
```

## 3. Prepare One Exact Request

```bash
REQUEST=$(jq -n --arg m "$MODEL_ID" '{
  modelId: $m,
  params: {
    prompt: "premium studio photograph of a red running shoe",
    aspect_ratio: "1:1"
  }
}')
```

Replace the fields with values accepted by the live model detail. For a
per-second model include the real media URL so the quote is `measured`.

## 4. Quote And Approve

```bash
QUOTE=$(curl -fsS -X POST "$PIXIO_BASE_URL/generations/estimate" \
  -H "$AUTH" -H "Content-Type: application/json" -d "$REQUEST")

printf '%s\n' "$QUOTE" | jq '{status: .quote.status, reason: .quote.provisionalReason, expectedDebit: .quote.expectedDebit, listCost: .quote.listCost, allowance: .quote.allowance, notCoveredBy: .quote.notCoveredBy}'
```

Apply the approval threshold to `expectedDebit`. Stop on a `provisional`
quote for a per-second model until the file is supplied. If `notCoveredBy` is
set, the plan includes the model but this setting is never free; offer the
user a setting outside `freeExcept` before spending credits.

## 5. Submit Once, Idempotently

```bash
IDEMPOTENCY_KEY="shoe-hero-$(date +%s)-$RANDOM"   # store this with the job

RESPONSE=$(curl -sS -X POST "$PIXIO_BASE_URL/generate" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -d "$REQUEST")

CONTENT_ID=$(printf '%s' "$RESPONSE" | jq -er '.contentId')
printf 'queued %s (replay=%s)\n' "$CONTENT_ID" "$(printf '%s' "$RESPONSE" | jq -r '.idempotentReplay // false')"
printf '%s\n' "$RESPONSE" | jq '{creditsCharged, freeLeftToday: .freeAllowance.remainingToday, notCoveredBy: .notCoveredBy.message}'
```

Persist `CONTENT_ID` and `IDEMPOTENCY_KEY` before polling. If the request
times out, rerun this step unchanged; a `200` with `idempotentReplay: true`
is the original job.

Handle non-2xx before parsing: `402` carries `shortfall`, `422 content_policy`
carries `inputHint`, `429 concurrency_limit` carries `generationId` and
`retryAfter`.

## 6. Poll

```bash
while true; do
  RESULT=$(curl -fsS "$PIXIO_BASE_URL/generations/$CONTENT_ID" -H "$AUTH")
  STATUS=$(printf '%s' "$RESULT" | jq -r '.status')
  case "$STATUS" in
    succeeded)
      printf '%s\n' "$RESULT" | jq '{id,status,modelId,outputUrl,outputUrlExpiresAt,creditsCost,billedAt,billing,media}'
      break ;;
    failed)
      printf '%s\n' "$RESULT" | jq '{id,status,error,creditsCost,billedAt}' >&2
      exit 1 ;;
    pending|processing)
      sleep 4 ;;
    *)
      printf 'unexpected status: %s\n' "$STATUS" >&2
      exit 2 ;;
  esac
done
```

## 7. Reconcile

```bash
curl -fsS --get "$PIXIO_BASE_URL/credits/ledger" -H "$AUTH" \
  --data-urlencode "generationId=$CONTENT_ID" \
  | jq '.entries[] | {reason, debitedCredits, creditedCredits, createdAt}'
```

Report `billing.settledCost` as the cost, and `billing.ledger.matchedBy` as
the confidence of the link.
