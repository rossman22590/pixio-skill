#!/usr/bin/env node

const [contentId] = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
const wantsHelp =
  process.argv.includes("--help") || process.argv.includes("-h");

if (wantsHelp || !contentId) {
  console.log(`Usage: PIXIO_API_KEY=pxio_live_... node scripts/pixio-wait.mjs <contentId>

Polls an existing generation only; it never dispatches or deletes work.
Optional: PIXIO_BASE_URL and PIXIO_WAIT_TIMEOUT_SECONDS (default 900).`);
  process.exit(wantsHelp ? 0 : 2);
}

const apiKey = process.env.PIXIO_API_KEY?.trim();
const baseUrl = (
  process.env.PIXIO_BASE_URL ?? "https://beta.pixio.myapps.ai/api/v1"
).replace(/\/$/, "");
const timeoutSeconds = Number(process.env.PIXIO_WAIT_TIMEOUT_SECONDS ?? 900);

if (!apiKey) {
  console.error("PIXIO_API_KEY is required.");
  process.exit(2);
}

const deadline = Date.now() + Math.max(1, timeoutSeconds) * 1000;
let delayMs = 2_000;

while (Date.now() < deadline) {
  const response = await fetch(
    `${baseUrl}/generations/${encodeURIComponent(contentId)}`,
    {
      headers: {
        authorization: `Bearer ${apiKey}`,
        accept: "application/json",
      },
      signal: AbortSignal.timeout(20_000),
    },
  );
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error(
      `${response.status}: ${data.message ?? data.error ?? response.statusText}`,
    );
    process.exit(1);
  }

  if (data.status === "succeeded") {
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  }
  if (data.status === "failed") {
    console.error(JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.error(`${data.status ?? "unknown"} ${contentId}`);
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  delayMs = Math.min(15_000, Math.round(delayMs * 1.5));
}

console.log(
  JSON.stringify(
    { id: contentId, status: "processing", resume: true },
    null,
    2,
  ),
);
process.exit(3);
