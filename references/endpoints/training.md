# Model Training Status (Read-Only)

Status of the account's model-training (LoRA) jobs. Starting or cancelling a
job is not available over the API; do that in the app.

## GET /api/v1/training

Up to 200 jobs, newest first. `hasMore` is `true` when more than 200 exist
(older jobs are not reachable over the API).

```json
{
  "data": [
    {
      "id": "training-uuid",
      "lora_name": "brand-mascot-v2",
      "status": "completed",
      "progress": 100,
      "trigger_word": "brandmascot",
      "output_lora_url": "https://...",
      "output_config_url": "https://...",
      "output_profile_id": null,
      "thumbnail_url": "https://...",
      "error_message": null,
      "created_at": "...",
      "completed_at": "...",
      "model_type": "flux"
    }
  ],
  "hasMore": false
}
```

Fields are snake_case on this surface (they mirror the training table).

## GET /api/v1/training/{id}

One job in the same shape (a bare object, no `data` wrapper). `404 { code:
"TRAINING_NOT_FOUND" }` when absent or not yours. `500 { code:
"TRAINING_LOAD_FAILED" }` on a read failure; the list route's failure is
`TRAINING_LIST_FAILED`. Codes on this route family are UPPER_SNAKE. On the
`/{id}` route a `401`/`503` auth failure carries `error` only (no `code`).

## Agent Rules

- Use `trigger_word` in prompts for models that consume a trained LoRA; check
  the target model's `/params` for the input that accepts a LoRA reference.
- Poll status sparingly; training runs for minutes to hours.
- Report `error_message` verbatim on failed jobs and stop; there is no retry
  route.
