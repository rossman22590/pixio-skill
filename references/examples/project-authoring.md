# Example: Author A Board From A Brief

Direct a spatial board from a prompt, add a node with an uploaded reference,
apply operations with optimistic concurrency, and resolve media for display.

```bash
AUTH="Authorization: Bearer $PIXIO_API_KEY"
```

## 1. Direct The Board

```bash
BOARD=$(curl -fsS -X POST "$PIXIO_BASE_URL/boards/from-prompt" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"prompt":"Storyboard a 15-second sneaker launch: hero still, three motion beats, end card.","name":"Sneaker launch","template":"storyboard"}')

BOARD_ID=$(printf '%s' "$BOARD" | jq -er '.id')
UPDATED_AT=$(printf '%s' "$BOARD" | jq -er '.updatedAt')
printf '%s\n' "$BOARD" | jq '{id, type, name, nodes: (.content.nodes | length)}'
```

## 2. Upload A Reference And Keep The Storage Key

```bash
UPLOAD=$(curl -fsS -X POST "$PIXIO_BASE_URL/uploads" -H "$AUTH" -F "file=@./sneaker.png")
FILE_PATH=$(printf '%s' "$UPLOAD" | jq -er '.uploads[0].filePath')
```

Store `filePath` in the document, never the signed URL.

## 3. Apply Operations With Optimistic Concurrency

Operation field names come from the board schema; the server returns
field-level `details` on a `400`, so start from a node shape already present
in `content.nodes` and mirror it.

```bash
OPS=$(jq -n --arg ref "$FILE_PATH" --arg at "$UPDATED_AT" '{
  expectedUpdatedAt: $at,
  operations: [
    { type: "add_node", node: { id: "ref-1", kind: "image", title: "Reference", media: $ref } },
    { type: "connect", source: "ref-1", target: "shot-1" }
  ]
}')

RESULT=$(curl -sS -w '\n%{http_code}' -X POST "$PIXIO_BASE_URL/boards/$BOARD_ID/operations" \
  -H "$AUTH" -H "Content-Type: application/json" -d "$OPS")
CODE=$(printf '%s' "$RESULT" | tail -n1)
BODY=$(printf '%s' "$RESULT" | sed '$d')

case "$CODE" in
  200) UPDATED_AT=$(printf '%s' "$BODY" | jq -er '.updatedAt') ;;
  409) echo "conflict: reload GET /boards/$BOARD_ID and reapply" >&2 ;;
  400) printf '%s\n' "$BODY" | jq '.details' >&2 ;;
esac
```

## 4. Resolve Media For Display

```bash
REFS=$(curl -fsS "$PIXIO_BASE_URL/boards/$BOARD_ID" -H "$AUTH" \
  | jq -c '[.content.nodes[]?.media // empty] | unique')

curl -fsS -X POST "$PIXIO_BASE_URL/media/resolve" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"refs\": $REFS}" | jq '.urls'
```

Use the URLs until they expire; resolve again rather than persisting them.

## 5. Hand Off

Rendering and export are not available over the API. Return the board ID and
tell the user to open it in the app for those steps.
