# Choose The Cheapest Suitable Model

Pick a model by what this account actually pays, not by name. One `GET /pricing`
call has everything: the per-account price, the plan's free models, today's
free pools, and the settings that are never free.

```bash
AUTH="Authorization: Bearer $PIXIO_API_KEY"
TYPE="text-to-video"   # the output you need

curl -fsS "$PIXIO_BASE_URL/pricing?type=$TYPE" -H "$AUTH" | jq '
  (.dailyFreePools // [] | map({ (.slug): .remainingToday }) | add // {}) as $left
  | [ .models[]
      | . + {
          freeNow: (.freeForCurrentPlan
                    and (.makerCap == null or (($left[.makerCap.slug] // 0) > 0)))
        }
      | {
          id,
          name,
          yourCredits,
          freeNow,
          freeExcept,
          perUnit: (if .pricing.rate then "\(.yourRate) per \(.pricing.rateQuantity) \(.pricing.rateUnit)" else null end),
          pricedFromParams
        } ]
  | sort_by([ (if .freeNow then 0 else 1 end), .yourCredits ])
  | .[0:10]'
```

How to read the result:

- `freeNow: true` first: the plan includes the model and its daily pool has a
  use left (or it has no pool). It costs nothing now, unless the request uses a
  setting listed in `freeExcept` (for example `{ "resolution": ["1080p"] }`).
  Choose a setting outside that list to keep the run free.
- Then by `yourCredits`, the price at the model's default settings for this
  account. It already includes plan discounts.
- `perUnit` set: the price scales with length or count. `yourCredits` is only
  the default-length price; quote the real request.
- `pricedFromParams: true`: `yourCredits` of `0` means "empty request", not
  free. Always quote these.

Then confirm the one you picked with the real params before spending:

```bash
node scripts/pixio-run.mjs --model "$MODEL_ID" --params "$PARAMS"            # quote only
node scripts/pixio-run.mjs --model "$MODEL_ID" --params "$PARAMS" --max-credits 100
```

Rules:

- Filter by `type` first; a cheaper model of the wrong type is not a choice.
- Prefer quality the user asked for over price when they named a model.
- Re-read `/pricing` each session; prices and free pools change daily. Never
  cache it.
