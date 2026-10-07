#!/usr/bin/env node

// Quote -> budget check -> one idempotent generate -> poll, in one command.
// Without --max-credits it only quotes and spends nothing.

const HELP = `Usage: PIXIO_API_KEY=pxio_live_... node scripts/pixio-run.mjs \\
  --model pixio/<id> (--params '<json>' | --params-file <file.json>) \\
  [--max-credits <n>] [--key <idempotency-key>] [--no-wait]

Steps: GET /me, POST /generations/estimate, budget check, POST /generate with
an Idempotency-Key, then poll GET /generations/{id} until succeeded or failed.

  --max-credits <n>  Spend at most n credits. Omit it to quote only (no spend).
  --key <value>      Idempotency-Key to send. Reuse the printed key to retry
                     safely after a timeout; the original job comes back.
  --no-wait          Return right after the job is queued.

Exit codes: 0 done (or quote only), 1 generation failed or API error,
2 bad usage, 3 over budget or not enough credits, 4 quote is provisional for a
measured model (supply the real media file), 5 account concurrency limit,
6 still running at the wait timeout (resume with pixio-wait.mjs).
Optional: PIXIO_BASE_URL, PIXIO_WAIT_TIMEOUT_SECONDS (default 900).`;

const argv = process.argv.slice(2);

function flag(name) {
  return argv.includes(name);
}

function option(name) {
  const index = argv.indexOf(name);
  return index === -1 ? undefined : argv[index + 1];
}

if (flag("--help") || flag("-h")) {
  console.log(HELP);
  process.exit(0);
}

const apiKey = process.env.PIXIO_API_KEY?.trim();
const baseUrl = (
  process.env.PIXIO_BASE_URL ?? "https://beta.pixio.myapps.ai/api/v1"
).replace(/\/$/, "");
const timeoutSeconds = Number(process.env.PIXIO_WAIT_TIMEOUT_SECONDS ?? 900);
const modelId = option("--model");
const maxCreditsRaw = option("--max-credits");
const maxCredits = maxCreditsRaw === undefined ? null : Number(maxCreditsRaw);

function usage(message) {
  console.error(`${message}\n\n${HELP}`);
  process.exit(2);
}

if (!apiKey) usage("PIXIO_API_KEY is required.");
if (!modelId) usage("--model is required.");
if (maxCredits !== null && !(Number.isFinite(maxCredits) && maxCredits >= 0)) {
  usage("--max-credits must be a number >= 0.");
}

let params = {};
try {
  const inline = option("--params");
  const file = option("--params-file");
  if (inline) params = JSON.parse(inline);
  else if (file) {
    const { readFileSync } = await import("node:fs");
    params = JSON.parse(readFileSync(file, "utf8"));
  }
} catch (error) {
  usage(`Could not read params: ${error.message}`);
}

const idempotencyKey =
  option("--key") ??
  `pixio-run-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

function emit(result, code) {
  const stream = code === 0 ? console.log : console.error;
  stream(JSON.stringify(result, null, 2));
  process.exit(code);
}

async function call(method, path, body, headers = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${apiKey}`,
      accept: "application/json",
      ...(body ? { "content-type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(60_000),
  });
  const data = await response.json().catch(() => ({}));
  return { status: response.status, ok: response.ok, data };
}

function apiError(step, result) {
  return {
    ok: false,
    step,
    status: result.status,
    code: result.data?.code ?? null,
    error: result.data?.message ?? result.data?.error ?? null,
    details: result.data?.details ?? undefined,
  };
}

// 1. Account
const me = await call("GET", "/me");
if (!me.ok) emit(apiError("me", me), 1);
const balance = Number(me.data?.credits?.total ?? 0);

// 2. Quote
const estimate = await call("POST", "/generations/estimate", {
  modelId,
  params,
});
if (!estimate.ok) emit(apiError("estimate", estimate), 1);

const quote = estimate.data?.quote ?? {};
const expectedDebit = Number(quote.expectedDebit ?? estimate.data?.estimatedCost);
const summary = {
  modelId: estimate.data?.modelId ?? modelId,
  plan: me.data?.plan ?? null,
  balance,
  quote: {
    status: quote.status ?? null,
    expectedDebit,
    listCost: quote.listCost ?? null,
    allowance: quote.allowance ?? null,
    notCoveredBy: quote.notCoveredBy ?? null,
    provisionalReason: quote.provisionalReason ?? null,
  },
};

if (quote.status === "provisional" && estimate.data?.pricing?.measured) {
  emit(
    {
      ok: false,
      step: "estimate",
      reason:
        "Provisional quote for a model billed from your media. Supply the real file in params, then run again.",
      ...summary,
    },
    4,
  );
}

if (maxCredits === null) {
  emit({ ok: true, dispatched: false, reason: "Quote only; pass --max-credits to run.", ...summary }, 0);
}

if (expectedDebit > maxCredits) {
  emit({ ok: false, step: "budget", reason: `Quote ${expectedDebit} exceeds --max-credits ${maxCredits}.`, ...summary }, 3);
}
if (expectedDebit > balance) {
  emit({ ok: false, step: "budget", reason: `Quote ${expectedDebit} exceeds the balance ${balance}.`, ...summary }, 3);
}

// 3. Generate once
console.error(`Idempotency-Key: ${idempotencyKey} (reuse with --key to retry safely)`);
const generated = await call(
  "POST",
  "/generate",
  { modelId, params },
  { "idempotency-key": idempotencyKey },
);

if (generated.status === 402) emit({ ...apiError("generate", generated), ...generated.data, ...summary }, 3);
if (generated.status === 429) {
  emit(
    {
      ...apiError("generate", generated),
      generationId: generated.data?.generationId ?? null,
      retryAfter: generated.data?.retryAfter ?? null,
      idempotencyKey,
      ...summary,
    },
    5,
  );
}
if (!generated.ok) emit({ ...apiError("generate", generated), idempotencyKey, ...summary }, 1);

const job = {
  contentId: generated.data?.contentId,
  idempotencyKey,
  idempotentReplay: generated.data?.idempotentReplay ?? false,
  creditsCharged: generated.data?.creditsCharged ?? null,
  freeAllowance: generated.data?.freeAllowance ?? null,
  notCoveredBy: generated.data?.notCoveredBy ?? null,
};

if (flag("--no-wait")) {
  emit({ ok: true, dispatched: true, status: "queued", ...summary, ...job }, 0);
}

// 4. Poll
const deadline = Date.now() + Math.max(1, timeoutSeconds) * 1000;
let delayMs = 2_000;

while (Date.now() < deadline) {
  const polled = await call(
    "GET",
    `/generations/${encodeURIComponent(job.contentId)}`,
  );
  if (!polled.ok) emit({ ...apiError("poll", polled), ...summary, ...job }, 1);

  const status = polled.data?.status;
  if (status === "succeeded" || status === "failed") {
    emit(
      {
        ok: status === "succeeded",
        dispatched: true,
        status,
        ...summary,
        ...job,
        creditsCost: polled.data?.creditsCost ?? null,
        billedAt: polled.data?.billedAt ?? null,
        outputUrl: polled.data?.outputUrl ?? null,
        outputs: polled.data?.outputs ?? null,
        error: polled.data?.error ?? polled.data?.errorMessage ?? null,
      },
      status === "succeeded" ? 0 : 1,
    );
  }

  console.error(`${status ?? "unknown"} ${job.contentId}`);
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  delayMs = Math.min(15_000, Math.round(delayMs * 1.5));
}

emit(
  {
    ok: false,
    dispatched: true,
    status: "processing",
    resume: `node scripts/pixio-wait.mjs ${job.contentId}`,
    ...summary,
    ...job,
  },
  6,
);
