# GET /api/v1/credits

Check the authenticated account's Pixio credits.

```bash
curl https://beta.pixio.myapps.ai/api/v1/credits \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

## Response

```json
{
  "accountId": "00000000-0000-0000-0000-000000000000",
  "total": 3407,
  "recurring": {
    "current": 3000,
    "quota": 15000,
    "lastTopOffAt": "1970-01-01T00:00:00.000Z"
  },
  "permanent": 407
}
```

## Agent Rules

- Use this when the user asks whether they have enough credits.
- If generation returns `402`, show available credits, required credits, and shortfall.
- Do not try to estimate special plan behavior; trust the API response and generation errors.
