# Example: Stream The Pixio Agent

Drive `POST /agent`, keep the history, and pick generation IDs out of the
stream so they can be polled and reconciled like any other job.

## Node (fetch + streaming body)

```javascript
const base = process.env.PIXIO_BASE_URL ?? "https://beta.pixio.myapps.ai/api/v1";
const key = process.env.PIXIO_API_KEY;

const messages = [
  { role: "user", content: "Estimate the cost of a 5-second product spin of my last upload, then make it if it is under 150 credits." },
];

const response = await fetch(`${base}/agent`, {
  method: "POST",
  headers: {
    authorization: `Bearer ${key}`,
    "content-type": "application/json",
    accept: "text/event-stream",
  },
  body: JSON.stringify({ messages }),
});

if (!response.ok) {
  const error = await response.json().catch(() => ({}));
  throw new Error(`${response.status}: ${error.error ?? response.statusText}`);
}

const generationIds = new Set();
let assistantText = "";
const decoder = new TextDecoder();
let buffer = "";

for await (const chunk of response.body) {
  buffer += decoder.decode(chunk, { stream: true });
  let boundary;
  while ((boundary = buffer.indexOf("\n\n")) !== -1) {
    const frame = buffer.slice(0, boundary);
    buffer = buffer.slice(boundary + 2);
    const data = frame.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).join("\n");
    if (!data) continue;
    let event;
    try { event = JSON.parse(data); } catch { continue; }

    if (typeof event.textDelta === "string") assistantText += event.textDelta;
    for (const id of [event.contentId, event.generationId].filter(Boolean)) generationIds.add(id);
    // Also scan nested tool results for contentId / generationId fields.
    JSON.stringify(event, (k, v) => { if ((k === "contentId" || k === "generationId") && typeof v === "string") generationIds.add(v); return v; });
  }
}

messages.push({ role: "assistant", content: assistantText });
console.log({ generationIds: [...generationIds], turns: messages.length });
```

Persist `messages` for the next turn and every ID in `generationIds`.

## Poll What The Agent Started

```bash
node scripts/pixio-wait.mjs <generationId>
```

Or `GET /generations/{id}`; `billing` shows the settled cost. Agent-driven
generations are ordinary generations.

## Rules Illustrated

- The caller owns history; the server keeps no API conversation state.
- The agent asks for approval before spend; surface that to the human rather
  than answering for them.
- A dropped stream is not proof nothing ran; check
  `GET /generations?status=pending` before repeating a paid instruction.
- The route needs at least 5 credits and may stay open up to 300 seconds.
