# GET /api/v1/params

Fetch accepted params for one Pixio model.

```bash
curl "https://beta.pixio.myapps.ai/api/v1/params?modelId=pixio/nano-banana/edit" \
  -H "Authorization: Bearer pxio_live_your_api_key"
```

Optional:

```text
providerId=pixio
```

## Response

```json
{
  "model": {
    "id": "pixio/nano-banana/edit",
    "providerId": "pixio",
    "name": "Nano Banana Edit",
    "description": "Model description",
    "type": "image-to-image",
    "credits": 4,
    "company": "Pixio"
  },
  "params": [
    {
      "name": "prompt",
      "type": "string",
      "label": "Prompt",
      "required": true,
      "defaultValue": null,
      "placeholder": "Describe the edit"
    },
    {
      "name": "image_url",
      "type": "file",
      "label": "Image",
      "required": true,
      "defaultValue": null
    }
  ]
}
```

## Param Fields

- `name`: key to put inside the `params` object.
- `type`: expected input type, such as `string`, `number`, `boolean`, `select`, or `file`.
- `label`: human-readable input label.
- `required`: whether generation needs this param.
- `defaultValue`: default value when available.
- `placeholder`: prompt or input guidance.
- `options`: valid values for select-style fields.

## Agent Rules

- Fetch params before creating a generation.
- Respect `required`.
- Use `options` for select fields.
- Do not send hidden fields.
- Do not guess missing required media fields.
