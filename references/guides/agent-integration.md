# Autonomous Agent Integration

## Classify The User Goal

Route the request into one of these public capabilities:

1. **Generate media**: direct model generation.
2. **Run saved workflow**: list and run an existing workflow.
3. **Manage assets**: upload, list, rename, download, or delete.
4. **Inspect account**: credits, ledger, plan, or concurrency.
5. **Discover/document**: OpenAPI, models, params, route inventory.
6. **Unsupported app project**: explain the boundary; do not call internal routes.

## Direct Generation State Machine

```text
DISCOVER_MODEL
  -> LOAD_PARAMS
  -> COLLECT_REQUIRED_INPUTS
  -> INGEST_MEDIA
  -> ESTIMATE_COST
  -> APPROVE_IF_REQUIRED
  -> SUBMIT_ONCE
  -> PERSIST_ID
  -> POLL
  -> RETURN_OUTPUT | RETURN_FAILURE | RETURN_RESUMABLE_PENDING
```

### Discover And Select

- Match the user's requested output and inputs to returned model `type` and
  params.
- Prefer an explicitly requested visible model.
- If several models fit, compare capability, required inputs, base credits, and
  estimated cost. Explain a meaningful tradeoff instead of choosing randomly.
- Never use a memorized model ID without confirming current visibility.

### Collect And Validate Inputs

- Request missing required values rather than inventing them.
- Preserve booleans/numbers/arrays as declared; do not stringify values because
  a cURL example happened to use strings.
- Reject unknown enum values locally.
- Put media only into declared media/file params.

### Estimate And Approve

- Estimate with exact params.
- Compare `estimatedCost` with current credits and caller policy.
- Require explicit approval for spend above the caller's threshold, multi-run
  batches, destructive actions, or any policy-defined high-cost operation.

### Submit And Persist

- Submit once and durably save `contentId` before polling.
- Store model ID, sanitized params, estimate, submission time, and status.
- Never store the API key in task state or logs.

### Poll And Return

- Poll with bounded backoff until terminal.
- On success return ID, model, actual `creditsCost`, `outputUrl`, useful typed
  outputs, and URL expiry.
- On Pixio failure return ID and `error` without claiming no credits were used.
- On caller timeout return a resumable pending state with the ID.

## Workflow State Machine

```text
LIST_WORKFLOWS -> SELECT_ID -> PREPARE_MEDIA -> SUBMIT_RUN_ONCE
  -> PERSIST_RUN_ID -> POLL_RUN -> RETURN_OUTPUTS_AND_STEP_ERRORS
```

Workflows must already exist. Do not attempt to create or modify definitions.

## Memory And Secret Hygiene

An agent may remember resource IDs, model IDs, non-secret params, and last-known
status. It must not remember or repeat the API key. Redact authorization headers
and signed URL query strings from diagnostics.

## Final Response Contract

For a generation report:

- `contentId` and final/current status;
- public `modelId`;
- estimated and actual credits when available;
- primary and additional output URLs;
- expiration and refresh instructions when signed;
- failure or resumable-pending explanation.

For an asset operation report IDs, source, action, and not-found items. For a
workflow report workflow ID, run ID, status, final outputs, and failed steps.
