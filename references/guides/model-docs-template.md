# Model-Specific Docs Template

Use this when creating copyable docs for one selected Pixio model.

````markdown
# <Model Name> API Reference

Use this reference when integrating with the Pixio API.

## Base URL

`https://beta.pixio.myapps.ai`

## Authentication

All requests require a Pixio API key.

```http
Authorization: Bearer pxio_live_your_api_key
```

## Core Endpoints

### Create Generation

```http
POST https://beta.pixio.myapps.ai/api/v1/generate
```

Body:

```json
{
  "providerId": "pixio",
  "modelId": "<selected model id>",
  "params": {
    "<param>": "<example value>"
  }
}
```

Returns immediately with a generation id. Poll the generation endpoint for status and outputs.

### Upload Media Asset

```http
POST https://beta.pixio.myapps.ai/api/v1/uploads
```

Use for local files or public URL imports.

### Get Generation

```http
GET https://beta.pixio.myapps.ai/api/v1/generations/{id}
```

### List Models

```http
GET https://beta.pixio.myapps.ai/api/v1/models
```

### Get Input Params For A Model

```http
GET https://beta.pixio.myapps.ai/api/v1/params?modelId=<selected model id>
```

### Check Credits

```http
GET https://beta.pixio.myapps.ai/api/v1/credits
```

## Media URL Inputs

When params include media URLs, Pixio imports those public URLs into Pixio media storage first.

## Concurrency

API concurrency is shared across the account, across all API keys. Default accounts get 1 in-flight API generation. Maker accounts get 3 in-flight API generations.

## Credits

API generations spend from the same Pixio account credits as web app generations.

## Selected Model

This model was selected when copied.

### <Model Name>

- modelId: `<selected model id>`
- type: `<model type>`
- credits: `<credit cost>`

Params:

- `<param>` (`<type>`, required/optional): `<label>`. Default: `<default>`.
````
