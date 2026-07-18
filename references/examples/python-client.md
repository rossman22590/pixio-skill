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

    def request(self, method, path, body=None, timeout=30):
        data = None if body is None else json.dumps(body).encode("utf-8")
        request = urllib.request.Request(
            self.base_url + path,
            method=method,
            data=data,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Accept": "application/json",
                **({"Content-Type": "application/json"} if data else {}),
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

    def estimate(self, body):
        return self.request("POST", "/generations/estimate", body)

    def generate(self, body):
        return self.request("POST", "/generate", body)

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
body = {"modelId": "pixio/example/model", "params": {"prompt": "..."}}
print(client.estimate(body))
queued = client.generate(body)
print(client.wait_for_generation(queued["contentId"]))
```

Use `requests` or `httpx` in applications that already depend on them, but keep
the same error, timeout, and no-blind-resubmit behavior.
