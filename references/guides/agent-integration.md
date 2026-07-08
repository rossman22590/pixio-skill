# Agent Integration Guide

This guide is for agents using Pixio on behalf of a user.

## Required Inputs

An agent needs:

- a Pixio API key;
- a user goal;
- optional prompt text;
- optional local files or public media URLs.

## Decision Flow

1. If the route surface is uncertain, fetch `/api/v1/guide` or `/api/v1/openapi.json`.
2. If no API key is available, ask the user for one.
3. If the user requested a specific model, call `/api/v1/models` and confirm it exists.
4. If no model is specified, call `/api/v1/models` and pick a visible model matching the task.
5. Call `/api/v1/params` for the selected model.
6. Map user inputs into required params.
7. Convert local media to clean URLs with `/api/v1/images` or `/api/v1/media`, or use `/api/v1/uploads` when Pixio asset metadata is needed.
8. Create the generation.
9. Poll the generation.
10. Return final URLs and a concise summary.

## Model Selection

Prefer models by output need:

- text/image prompt to image: choose image generation models.
- image edit: choose image-to-image/edit models.
- prompt to video: choose text-to-video models.
- image to video: choose image-to-video models.
- add or modify audio on video: choose video/audio operations.

Always use the actual `/models` response instead of memorized model names.

## Handling User Files

If the user provides a local file path:

1. Upload it with `/api/v1/images` for images or `/api/v1/media` for image/video/audio clean URLs.
2. Use the upload result in the relevant media param.
3. Keep the original file private; do not expose the API key or local path in final output.

Use `/api/v1/uploads` instead when the selected model needs `filePath` or other Pixio asset metadata.

## Running Saved Workflows

If the user wants to run a workflow saved in Pixio:

1. Call `/api/v1/workflows` and choose the correct workflow.
2. Convert any local media to a clean URL with `/api/v1/images` or `/api/v1/media`.
3. Start the run with `POST /api/v1/workflows/{id}/runs`.
4. Save `runId`.
5. Poll `/api/v1/workflows/{id}/runs/{runId}`.
6. Return `outputs[]` and any step errors.

## Polling

Use a 2-5 second polling interval. For long video jobs, continue polling until a final status or the user's timeout policy is reached.

## Final Response

When done, return:

- generation id;
- final status;
- output URL;
- any extra output URLs such as thumbnails;
- credit cost when available.

For workflow runs, return:

- workflow id;
- run id;
- final status;
- `outputs[]`;
- failed step errors when present.
