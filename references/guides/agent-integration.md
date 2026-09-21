# Autonomous Agent Integration

## Classify The User Goal

Route the request into one public capability:

1. **Generate media**: direct model generation (`/generate`).
2. **Run or build a workflow**: saved multi-step pipelines (`/workflows`).
3. **Author a project**: Boards, Canvas, Cinema storyboards, Cam View scenes,
   Video Agent plans, timeline editor projects (`/projects`, typed routes,
   operations, from-prompt).
4. **Converse**: the user wants the Pixio agent to direct the work
   (`/agent`).
5. **Manage assets**: upload, folders, list, rename, download, delete.
6. **Inspect account or cost**: `/me`, `/pricing`, `/credits`, ledger,
   quotes.
7. **Discover or document**: OpenAPI documents, `/capabilities`, models,
   params, styles, prompt library, preferences, favorites.
8. **Unsupported**: renders/exports, autonomous Video Agent assembly, Cam
   View pairing, starting training, internal chat route. Explain the boundary
   and offer the nearest supported path.

## Direct Generation State Machine

```text
IDENTIFY (/me)
  -> DISCOVER_MODEL (/pricing, /models)
  -> LOAD_PARAMS (/models/{id}: inputs, constraints)
  -> COLLECT_REQUIRED_INPUTS
  -> INGEST_MEDIA (/uploads | /media | public URL)
  -> QUOTE (/generations/estimate: quote.status, expectedDebit)
  -> APPROVE_IF_REQUIRED
  -> SUBMIT_ONCE (/generate + Idempotency-Key)
  -> PERSIST_ID
  -> POLL (/generations/{id})
  -> RECONCILE (billing, ledger)
  -> RETURN_OUTPUT | RETURN_FAILURE | RETURN_RESUMABLE_PENDING
```

### Identify

Read `plan`, `credits.total`, `concurrencyLimit`, and `makerCaps`. Size the
semaphore. Note which pools still have `remainingToday`.

### Discover And Select

- Match the requested output and inputs to `type` and params.
- Prefer an explicitly requested visible model, then a saved preference for the
  action (`/preferences/models`), then favorites, then `yourCredits` from
  `/pricing`.
- If several fit, compare capability, required inputs, `freeForCurrentPlan`,
  and `yourCredits`. Explain a meaningful trade-off instead of choosing
  randomly.
- Never use a memorized model ID without confirming current visibility.

### Collect And Validate Inputs

- Ask for missing required values rather than inventing them.
- Preserve booleans, numbers, and arrays as declared.
- Reject unknown enum values and media over `constraints.maxBytes` or
  `constraints.maxSeconds` locally.
- Put media only into declared media params.
- Reuse prior successful prompts from `/prompt-library` when the subject
  repeats; optimize with `/prompts/optimize` using the target family's
  `messageType`; append a `/styles` fragment if the user asked for a look.

### Quote And Approve

- Quote with the exact params and the real file.
- A `measured` quote is a price; a `provisional` quote is arithmetic. For
  per-second models, do not promise a `provisional` figure.
- Require approval for spend above the caller's threshold, for batches, for
  Songcraft `official` downloads, and for anything destructive.

### Submit And Persist

- Submit once with an `Idempotency-Key` and durably save `contentId`, the key,
  model ID, sanitized params, quote, and submission time.
- Never store the API key in task state or logs.

### Poll, Reconcile, Return

- Poll with bounded backoff until terminal.
- On success return ID, model, `billing.settledCost`, `outputUrl`, typed
  outputs, and URL expiry.
- On Pixio failure return ID and `error`; state that failed runs are not
  billed (`billedAt: null`).
- On caller timeout return a resumable pending state with the ID and key.

## Workflow State Machine

```text
LIST_OR_CREATE (/workflows) -> READ_DEFINITION (/workflows/{id})
  -> PREPARE_MEDIA -> SUBMIT_RUN_ONCE -> PERSIST_RUN_ID
  -> POLL_RUN -> RETURN_OUTPUTS_AND_STEP_ERRORS
```

Author definitions from an app-built template; validate by reading the `400`
details. Prefer `PATCH` to preserve run history.

## Project Authoring State Machine

```text
CHOOSE_TYPE -> CREATE (from-prompt | template | content)
  -> READ (content, updatedAt)
  -> PLAN_OPERATIONS
  -> APPLY (operations + expectedUpdatedAt)
  -> ON_409: RELOAD -> PLAN_OPERATIONS
  -> RESOLVE_MEDIA_FOR_DISPLAY (/media/resolve)
  -> RETURN project id, summary of changes, app link for render/export
```

For Video Agent: `PLAN (from-prompt) -> QUOTE per segment -> DISPATCH (<=10)
-> POLL each generationId -> PATCH and re-dispatch failures`.

## Conversational Agent Loop

```text
messages[] -> POST /agent (SSE) -> stream text, tool calls, generation ids
  -> append assistant turn to messages[] -> persist generation ids
  -> poll generations -> next user turn
```

Surface the agent's approval prompts to the human. Never auto-approve spend.

## Memory And Secret Hygiene

An agent may remember resource IDs, model IDs, non-secret params, idempotency
keys, project `updatedAt` values, and last-known status. It must not remember
or repeat the API key. Redact authorization headers and signed URL query
strings from diagnostics.

## Final Response Contract

For a generation: `contentId`, status, public `modelId`, quote and settled
credits, primary and additional output URLs, expiry and refresh instructions,
failure or resumable-pending explanation.

For a project: project ID, type, what changed, current `updatedAt`, and what
the user must finish in the app (render, export, assembly).

For a workflow: workflow ID, run ID, status, final outputs, failed steps.

For an asset operation: IDs, source, folder, action, not-found or skipped
items.
