# Agent Integration Guide

This guide is for agents using Pixio on behalf of a user.

## Required Inputs

An agent needs:

- a Pixio API key;
- a user goal;
- optional prompt text;
- optional local files or public media URLs.

## Decision Flow

1. If no API key is available, ask the user for one.
2. If the user requested a specific model, call `/api/v1/models` and confirm it exists.
3. If no model is specified, call `/api/v1/models` and pick a visible model matching the task.
4. Call `/api/v1/params` for the selected model.
5. Map user inputs into required params.
6. Upload local files with `/api/v1/uploads`.
7. Create the generation.
8. Poll the generation.
9. Return final URLs and a concise summary.

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

1. Upload it with `/api/v1/uploads`.
2. Use the upload result in the relevant media param.
3. Keep the original file private; do not expose the API key or local path in final output.

## Polling

Use a 2-5 second polling interval. For long video jobs, continue polling until a final status or the user's timeout policy is reached.

## Final Response

When done, return:

- generation id;
- final status;
- output URL;
- any extra output URLs such as thumbnails;
- credit cost when available.
