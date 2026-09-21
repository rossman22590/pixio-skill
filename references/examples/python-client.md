# Example: Python Client

This standard-library client keeps the dependency surface minimal.

```python
import json
import os
import time
import urllib.error
import urllib.request


class PixioError(RuntimeError):
    def __init__(self, status, data):
        super().__init__(data.get("message") or data.get("error") or f"HTTP {status}")
        self.status = status
        self.data = data


class PixioClient:
    def __init__(self, api_key, base_url="https://beta.pixio.myapps.ai/api/v1"):
        if not api_key:
            raise ValueError("PIXIO_API_KEY is required")
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")

    def request(self, method, path, body=None, timeout=30, headers=None):
        data = None if body is None else json.dumps(body).encode("utf-8")
        request = urllib.request.Request(
            self.base_url + path,
            method=method,
            data=data,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Accept": "application/json",
                **({"Content-Type": "application/json"} if data else {}),
                **(headers or {}),
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            try:
                payload = json.load(error)
            except Exception:
                payload = {"error": error.reason}
            raise PixioError(error.code, payload) from error

    def me(self):
        return self.request("GET", "/me")

    def estimate(self, body):
        return self.request("POST", "/generations/estimate", body, timeout=120)

    def generate(self, body, idempotency_key):
        # Same key on every retry of this intent; a 200 with idempotentReplay
        # is the original job, not a new one.
        return self.request(
            "POST", "/generate", body, headers={"Idempotency-Key": idempotency_key}
        )

    def get_generation(self, content_id):
        return self.request("GET", f"/generations/{content_id}")

    def wait_for_generation(self, content_id, timeout_seconds=900):
        deadline = time.monotonic() + timeout_seconds
        delay = 2.0
        while time.monotonic() < deadline:
            result = self.get_generation(content_id)
            if result["status"] == "succeeded":
                return result
            if result["status"] == "failed":
                raise RuntimeError(result.get("error") or "Generation failed")
            time.sleep(delay)
            delay = min(15.0, delay * 1.5)
        return {"id": content_id, "status": "processing", "resume": True}


client = PixioClient(os.environ["PIXIO_API_KEY"])
print(client.me()["concurrencyLimit"])
body = {"modelId": "pixio/example/model", "params": {"prompt": "..."}}
quote = client.estimate(body)["quote"]
print(quote["status"], quote["expectedDebit"])
queued = client.generate(body, idempotency_key=f"job-{uuid.uuid4()}")
print(client.wait_for_generation(queued["contentId"]))
```

Add `import uuid` alongside the other imports. Persist the idempotency key with
the job so a retry after a timeout reuses it.

Use `requests` or `httpx` in applications that already depend on them, but keep
the same error, timeout, idempotency-key, and no-blind-resubmit behavior.
