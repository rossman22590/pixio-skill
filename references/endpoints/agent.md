# POST /api/v1/agent

The Pixio agent over the public API: the exact same tool-calling agent that
powers Pixio Chat in the app (generation with credit estimates and plan
approval, boards, canvas, editor projects, model recommendations, memory,
locked characters), streamed as Server-Sent Events.

```bash
curl -N -X POST "$PIXIO_BASE_URL/agent" \
  -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "messages": [
      { "role": "user", "content": "Make a 5-second product spin of the bottle in my last upload and estimate the cost first." }
    ]
  }'
```

## Request

- `messages`: the conversation so far, the same shape the in-app chat sends
  (`role` is `user` or `assistant`; `content` is text, and messages may carry
  the in-app attachment fields). The caller owns the history and resends it
  every turn; the server does not store API conversations.
- The request body may carry the same optional fields the in-app chat sends.
  Two behaviours are enabled only on this API surface: activated skills
  (instruction packs for a turn) and a required-media pre-dispatch guard that
  returns an ask-the-user tool result instead of an opaque provider `422`
  when a required file input is still empty.

### Size Limit

The agent resends the whole history on every tool round, so a request is capped
at **1,000,000 characters of message text** (string `content` plus `text` parts;
attachments and other fields do not count). A larger history is rejected up
front with `413`:

```json
{
  "error": "Conversation history exceeds 1,000,000 characters. Trim older messages and retry.",
  "code": "request_too_large",
  "limitChars": 1000000,
  "receivedChars": 250000
}
```

Nothing ran and nothing was charged. Drop or summarize older turns and resend.

## Response

A `text/event-stream` of agent events identical to the in-app stream: text
deltas, tool calls and results, generation IDs as they are created, and a
completion event. Consume it incrementally; the route may stay open up to
300 seconds.

Anything the agent generates is an ordinary generation: pick the
`contentId`/`generationId` out of the stream and poll `GET /generations/{id}`
as usual. Agent-driven generations bill exactly like `/generate` and count
against the account concurrency limit.

## Preconditions And Errors

- Requires at least 5 credits, the same floor as in-app chat.
- `400 invalid_json` / `invalid_request` when the body is not JSON or lacks a
  non-empty `messages` array. A body that passes that check but not the chat
  schema is a plain-text `400`; do not assume JSON on a failed agent call.
- `401` bad key (`missing_api_key` / `invalid_api_key`).
- `402` when below the 5-credit floor: the body is `{ error }` only, with no
  `code`. A tool that cannot afford its generation reports that inside the
  stream instead.
- `413 request_too_large` for an over-long history (see Size Limit).
- `429` when the agent's generation hits the concurrency limit (reported in
  the stream).
- Stream interruptions are not proof that nothing happened. Check
  `GET /generations?status=pending` before repeating a paid instruction.

## When To Use It

Use `/agent` when the user wants conversational direction, model
recommendations, or multi-step edits to boards, canvas, or editor projects
without the caller writing the pipeline. Use the deterministic routes
(`/generate`, `/workflows`, `/projects`) when the caller needs exact control,
idempotency keys, or predictable cost.

## Agent Rules

- Persist the full `messages` array between turns; losing it loses context.
- Surface the agent's credit estimates and approval prompts to the human
  instead of auto-approving them.
- Never echo the API key into a message; the agent does not need it.
- Treat generation IDs from the stream as durable state and record them
  before the stream closes.
