# Example: Reusable Node Client

Requires Node 18+ for built-in `fetch`.

```js
export class PixioClient {
  constructor({ apiKey, baseUrl = 'https://beta.pixio.myapps.ai/api/v1' }) {
    if (!apiKey) throw new Error('PIXIO_API_KEY is required');
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async request(path, init = {}) {
    const headers = new Headers(init.headers);
    headers.set('authorization', `Bearer ${this.apiKey}`);
    headers.set('accept', 'application/json');
    if (init.body && !(init.body instanceof FormData)) {
      headers.set('content-type', 'application/json');
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
      signal: init.signal ?? AbortSignal.timeout(30_000),
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) {
      const error = new Error(data?.message ?? data?.error ?? response.statusText);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  }

  getMe() {
    return this.request('/me');
  }

  getPricing(modelId) {
    const query = modelId ? `?modelId=${encodeURIComponent(modelId)}` : '';
    return this.request(`/pricing${query}`);
  }

  getModel(modelId) {
    return this.request(`/models/${modelId}`);
  }

  estimate(body) {
    return this.request('/generations/estimate', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  generate(body, { idempotencyKey }) {
    if (!idempotencyKey) throw new Error('idempotencyKey is required');
    // Reuse the same key on every retry of this intent. A 200 with
    // idempotentReplay: true is the original job, not a new one.
    return this.request('/generate', {
      method: 'POST',
      headers: { 'idempotency-key': idempotencyKey },
      body: JSON.stringify(body),
    });
  }

  getGeneration(id) {
    return this.request(`/generations/${encodeURIComponent(id)}`);
  }

  async waitForGeneration(id, { timeoutMs = 15 * 60_000 } = {}) {
    const deadline = Date.now() + timeoutMs;
    let delayMs = 2_000;
    while (Date.now() < deadline) {
      const generation = await this.getGeneration(id);
      if (generation.status === 'succeeded') return generation;
      if (generation.status === 'failed') {
        throw Object.assign(new Error(generation.error ?? 'Generation failed'), {
          generation,
        });
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      delayMs = Math.min(15_000, Math.round(delayMs * 1.5));
    }
    return { id, status: 'processing', resume: true };
  }
}
```

Usage:

```js
const pixio = new PixioClient({ apiKey: process.env.PIXIO_API_KEY });
const me = await pixio.getMe();
console.log(me.plan, me.concurrencyLimit, me.credits.total);

const request = { modelId: 'pixio/example/model', params: { prompt: '...' } };
const { quote } = await pixio.estimate(request);
console.log(quote.status, quote.expectedDebit);

const idempotencyKey = `job-${crypto.randomUUID()}`; // persist with the job
const queued = await pixio.generate(request, { idempotencyKey });
const result = await pixio.waitForGeneration(queued.contentId);
console.log(result.status, result.outputUrl, result.billing);
```

Retry `generate` only with the same `idempotencyKey`; never wrap it in generic
retry middleware that would mint a new key per attempt.
