# Project Authoring API

Additive project endpoints published in `GET /platform/openapi.json`. They let
an integration create, read, update, delete, and direct the same documents the
app's editors use. Every route requires the API key; ownership is enforced on
every call.

Project types:

| `type` | Typed base path | Operations | From prompt |
|---|---|---:|---:|
| `boards` | `/boards` | yes | yes |
| `canvas` | `/canvas` | yes | yes |
| `cinema-storyboards` | `/cinema/storyboards` | no | yes |
| `cam-view-scenes` | `/cam-view/scenes` | no | yes |
| `video-agent-projects` | `/video-agent/projects` | no (has `/generate`) | yes |
| `editor-projects` | `/editor/projects` | yes | no |

## Project Shape

```json
{
  "id": "project-uuid",
  "type": "boards",
  "name": "Launch board",
  "description": null,
  "thumbnailUrl": null,
  "content": { "...": "type-specific document" },
  "createdAt": "...",
  "updatedAt": "..."
}
```

`content` is the full, schema-valid document for that type. Media inside it is
stored as durable storage keys; display them with `POST /media/resolve`.

## Generic Routes

```http
GET    /api/v1/projects?type=&query=&limit=&cursor=
POST   /api/v1/projects
GET    /api/v1/projects/{id}
PATCH  /api/v1/projects/{id}
DELETE /api/v1/projects/{id}?expectedUpdatedAt=
```

- List: `type` (one of the six), `query` (name search, at most 200 chars),
  `limit` 1–100 (default 25), `cursor` from a previous `nextCursor`.
  Returns `{ data: Project[], nextCursor: string | null }`. Without `type` it
  scans every type, newest updated first.
- Create: the body is one of the typed create bodies plus a required `type`
  discriminator. Returns `201 Project`.
- Get, update, delete work on any type by ID.

## Typed Routes

Each family exposes `GET` (list, same cursor pagination), `POST` (create),
`GET/PATCH/DELETE .../{id}`.

Create bodies (`*CreateRequest` in the platform spec):

- Common: `name` (1–200), `description` (nullable, at most 2000),
  `thumbnailUrl` (nullable, at most 4096), `content` (a complete document;
  when omitted Pixio creates a valid starter document).
- Boards: `template` (`blank`, `storyboard`, `product-ad`, `music-video`,
  `character-sheet`, `image-to-video-chain`, and others in the spec enum;
  default `blank`).
- Canvas: `template` from the spec enum, default `blank`.
- Video Agent: `prompt`, `aspectRatio` (`9:16` default, `16:9`, `1:1`),
  `episodeCount` 1–8 (default 4), `modelId`.
- Storyboards, Cam View, Editor: common fields only.

Update body (`ProjectWrite`): `name`, `description`, `thumbnailUrl`,
`content`, `expectedUpdatedAt`. Delete accepts `?expectedUpdatedAt=`.

Payload limit: 5 MB (`413 PROJECT_TOO_LARGE`).

## Optimistic Concurrency

Send `expectedUpdatedAt` (the `updatedAt` you last read) on `PATCH`,
`DELETE`, and operations. If the project changed since, the server returns
`409 PROJECT_CONFLICT`. Reload, re-derive your change, and reapply. Never
force-overwrite a document another surface (the app, another agent) edited.

## Operations

```http
POST /api/v1/boards/{id}/operations
POST /api/v1/canvas/{id}/operations
POST /api/v1/editor/projects/{id}/operations
```

Body:

```json
{
  "operations": [ { "type": "add_node", "...": "..." } ],
  "expectedUpdatedAt": "2026-09-20T10:00:00.000Z",
  "fps": 30
}
```

- `operations`: 1–100 items, validated against the real operation union for
  the type. Invalid operations return `400` with details.
- `fps`: editor projects only, 1–120.
- Returns the updated `Project`.

Operation names:

- Boards: `add_node`, `update_node`, `remove_node`, `connect`, `disconnect`.
- Canvas: `add_element`, `add_frame`, `add_shape`, `add_image_frame`,
  `add_text`, `update_element`, `remove_element`, `duplicate_element`,
  `bring_to_front`, `send_to_back`, `align_elements`, `distribute_elements`,
  `group_elements`, `ungroup_elements`, `set_overall_prompt`,
  `set_instructions`, `set_tool_mode`, `clear_masks`.
- Editor (`op` field): `timeline.addOverlay`, `timeline.addText`,
  `timeline.deleteOverlay`, `timeline.deleteRow`, `timeline.duplicate`,
  `timeline.split`, `timeline.trim`, `timeline.slip`, `timeline.slide`,
  `timeline.roll`, `timeline.lift`, `timeline.extract`, `timeline.jCut`,
  `timeline.lCut`, `timeline.insert`, `timeline.overwrite`,
  `timeline.replace`, `timeline.move`, `timeline.align`,
  `timeline.rippleDelete`, `timeline.clear`, `timeline.setTransition`,
  `timeline.group`, `timeline.createPrecomp`, `overlay.update`,
  `overlay.setStyle`, `overlay.fitText`, `overlay.applyTextEffect`,
  `overlay.setKeyframes`, `overlay.setColorGrade`, `audio.setCurve`,
  `audio.setDucking`, `video.setPlayback`, `composition.setBeatGrid`,
  `composition.setAspect`.

Learn each operation's fields by reading a document created in the app or by
inspecting a `from-prompt` result; the server rejects malformed operations
with field-level details rather than guessing.

## From Prompt (Directed Creation)

```http
POST /api/v1/boards/from-prompt
POST /api/v1/canvas/from-prompt
POST /api/v1/cinema/storyboards/from-prompt
POST /api/v1/cam-view/scenes/from-prompt
POST /api/v1/video-agent/projects/from-prompt
```

Pixio's director model turns a brief into a saved, schema-valid document and
returns `201 Project`. These calls use an LLM and take seconds.

Bodies:

- Boards and Canvas (`VisualProjectPromptRequest`): `prompt` (4–4000),
  `name`, `template`.
- Cam View (`CamViewPromptRequest`): `prompt` (4–2000), `name`,
  `figureScale` 0.4–2 (default 1). Produces a keyed scene ready for prompt-
  to-3D blocking.
- Storyboards (`StoryboardPromptRequest`): `prompt` (4–8000), `name`,
  `format` (`long-video`, `movie`, `short-film` default, `commercial`),
  `aspectRatio` (`16:9` default, `9:16`, `1:1`, `2.39:1`),
  `targetRuntimeSeconds` 5–7200 (default 60), `frameCount` 1–24 (default 8).
- Video Agent (`VideoAgentPromptRequest`): `prompt` (20–12000), `title`,
  `episodeCount` 1–8 (default 1), `aspectRatio`, `modelId`. Produces a
  structured outline with episodes and segments (`visualPrompt`,
  `durationSeconds`) that `POST /video-agent/projects/{id}/generate` turns
  into clips. See `video-agent.md`.

## Error Codes

Every error is `{ error, code, details? }`.

| Status | Code | Meaning |
|---:|---|---|
| 400 | `INVALID_REQUEST` | Zod validation failed; `details` is the flattened error. |
| 400 | `INVALID_JSON` | Body was not JSON. |
| 400 | `INVALID_PROJECT`, `INVALID_PROJECT_CONTENT` | Content failed the type schema. |
| 400 | `INVALID_PROJECT_ID`, `MISSING_PROJECT_ID`, `INVALID_CURSOR` | Bad identifiers. |
| 404 | `PROJECT_NOT_FOUND` | Not yours or gone. |
| 409 | `PROJECT_CONFLICT` | `expectedUpdatedAt` mismatch. Reload and reapply. |
| 409 | `UNSUPPORTED_PROJECT_TYPE` | ID exists but is a different type than the route. |
| 413 | `PROJECT_TOO_LARGE` | Over 5 MB. |
| 422 | `CANVAS_HAS_NO_PAGE`, `CANVAS_OPERATION_UNSUPPORTED` | Canvas document cannot take that operation. |
| 500 | `PROJECT_LIST_FAILED`, `PROJECT_LOAD_FAILED`, `PROJECT_CREATE_FAILED`, `PROJECT_UPDATE_FAILED`, `PROJECT_DELETE_FAILED`, `PROJECT_OPERATION_FAILED` | Server failure; do not assume the write happened. |

## Agent Rules

- Prefer `from-prompt` to hand-writing a document; then refine with
  operations.
- Prefer operations to `PATCH content` for edits; operations are validated
  and preserve what you did not touch.
- Always carry `expectedUpdatedAt`; treat `409` as a normal branch.
- Store storage keys in content, resolve for display only.
- Never delete a project without explicit intent. There is no undo.
- Rendering, exporting, and autonomous assembly are not available over the
  API; hand the user back to the app for those steps.
