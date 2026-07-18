#!/usr/bin/env node

const args = new Set(process.argv.slice(2));

if (args.has("--help") || args.has("-h")) {
  console.log(`Usage: PIXIO_API_KEY=pxio_live_... node scripts/pixio-smoke.mjs

Read-only checks: OpenAPI, subscription, models, and credits.
Optional: PIXIO_BASE_URL=https://beta.pixio.myapps.ai/api/v1`);
  process.exit(0);
}

const apiKey = process.env.PIXIO_API_KEY?.trim();
const baseUrl = (
  process.env.PIXIO_BASE_URL ?? "https://beta.pixio.myapps.ai/api/v1"
).replace(/\/$/, "");

if (!apiKey) {
  console.error("PIXIO_API_KEY is required.");
  process.exit(2);
}

async function request(path, authenticated) {
  const headers = { accept: "application/json" };
  if (authenticated) headers.authorization = `Bearer ${apiKey}`;
  const response = await fetch(`${baseUrl}${path}`, {
    headers,
    signal: AbortSignal.timeout(15_000),
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text.slice(0, 300) };
  }
  if (!response.ok) {
    throw new Error(
      `${path} returned ${response.status}: ${body?.message ?? body?.error ?? response.statusText}`,
    );
  }
  return body;
}

try {
  const [openapi, subscription, catalog, credits] = await Promise.all([
    request("/openapi.json", false),
    request("/subscription", true),
    request("/models", true),
    request("/credits", true),
  ]);

  console.log(
    JSON.stringify(
      {
        ok: true,
        apiVersion: openapi?.info?.version ?? null,
        documentedPaths: Object.keys(openapi?.paths ?? {}).length,
        plan: subscription?.plan ?? null,
        apiConcurrencyLimit: subscription?.apiConcurrencyLimit ?? null,
        visibleModels: Array.isArray(catalog?.models)
          ? catalog.models.length
          : null,
        totalCredits: credits?.total ?? null,
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
