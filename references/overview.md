# Pixio User API Overview

## Trust Boundary

The public API is every implemented route under `/api/v1`. All authenticated
routes use a personal Pixio API key and operate on the account that owns the key.
Revoked keys return `401` and cannot be used.

Only these discovery routes are anonymous:

- `GET /api/v1/guide`
- `GET /api/v1/openapi.json`

Every other `/api/v1` call requires:

```http
Authorization: Bearer pxio_live_your_api_key
```

Create and revoke keys from the Pixio Integrations screen. Keys currently grant
the full user API surface for their owning account; there are no per-key scopes.

## Capability Domains

The API supports:

- discovering visible models and their exact inputs;
- optimizing prompts;
- estimating generation credit cost;
- reading balance, ledger, plan, and concurrency information;
- normalizing public media URLs and uploading reusable assets;
- listing, reading, renaming, downloading, and deleting owned assets;
- submitting, listing, polling, and deleting generations;
- listing and running workflows already saved in the Pixio app.

It does not expose Pixio project editors, Pix Agent, project export/rendering,
Boards, Canvas, Video Agent, Cinema, Cam View, or workflow-definition editing.

## Generation Lifecycle

```text
discover model
    -> inspect params
    -> normalize/upload media
    -> estimate cost
    -> submit once
    -> persist contentId
    -> poll status
    -> use or refresh output URL
```

`POST /generate` returns HTTP `202`. It never means the media is ready. Poll the
returned `contentId` until `succeeded` or `failed`.

## Account Semantics

- API jobs spend the same account credits as Pixio web app jobs.
- API jobs appear in the same generation and asset history.
- Concurrency is account-wide across every API key.
- `GET /subscription` is the authoritative current concurrency ceiling.
- Generation estimates do not account for every allowance; actual charge may be
  lower. A `402` response is authoritative when balance is insufficient.

## Media Semantics

Use `/images` or `/media` for clean public URLs. Use `/uploads` or `/assets` for
managed Pixio assets and metadata. Signed asset and generation URLs can expire;
refresh them by getting the resource again.

## Consistency And Retry Semantics

The API does not currently accept an idempotency key for generation submission.
After an uncertain network failure, inspect `/generations` before resubmitting.
Never assume a timeout means no provider work started.

List endpoints use page-based pagination and return `hasMore`. Follow pages until
`hasMore` is false when complete inventory matters.
