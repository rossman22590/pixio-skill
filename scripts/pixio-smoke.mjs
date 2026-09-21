#!/usr/bin/env node

const args = new Set(process.argv.slice(2));

if (args.has("--help") || args.has("-h")) {
  console.log(`Usage: PIXIO_API_KEY=pxio_live_... node scripts/pixio-smoke.mjs

Read-only checks: both OpenAPI documents, /me, /capabilities, /models, /credits.
Never dispatches generation work.
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
  const [mediaSpec, platformSpec, me, capabilities, catalog, credits] =
    await Promise.all([
      request("/openapi.json", false),
      request("/platform/openapi.json", false),
      request("/me", true),
      request("/capabilities", true),
      request("/models", true),
      request("/credits", true),
    ]);

  console.log(
    JSON.stringify(
      {
        ok: true,
        mediaSpecPaths: Object.keys(mediaSpec?.paths ?? {}).length,
        platformSpecPaths: Object.keys(platformSpec?.paths ?? {}).length,
        plan: me?.plan ?? null,
        concurrencyLimit: me?.concurrencyLimit ?? null,
        makerCaps: Array.isArray(me?.makerCaps) ? me.makerCaps.length : null,
        supportedSurfaces: Array.isArray(capabilities?.supported)
          ? capabilities.supported.length
          : null,
        unsupportedSurfaces: Array.isArray(capabilities?.unsupported)
          ? capabilities.unsupported.length
          : null,
        visibleModels: Array.isArray(catalog?.models)
          ? catalog.models.length
          : null,
        freeForCurrentPlan: Array.isArray(catalog?.models)
          ? catalog.models.filter((m) => m.freeForCurrentPlan).length
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
