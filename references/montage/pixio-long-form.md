---
name: pixio-long-form
description: How to make a long take on Montage (Pixio's Director API) - ONE unbroken 20-60 s shot with no cuts (a walk, a dance, a singer coming toward the camera), with long_form=true on POST /api/v1/director/videos/reference or POST /api/v1/director/videos/music. When it fits and when to use a film instead, the fields, how the pieces are written (one shot, carry-on openings, joins mid-movement, locked framing), the price, the refusals and their fixes. Use whenever a request wants a single continuous take longer than 15 s.
---

# Long takes: one unbroken shot of 20-60 s

A normal clip is at most 15 s, and films and music videos join clips with cuts. A **long take** is ONE continuous
shot of 20-60 s. Montage renders it as 2-4 pieces of at most 15 s in one job, and every later piece starts from the
last 22 frames (0.92 s, picture and sound) of the piece before, so the joins don't show and faces hold.

**Montage Basic only.** Premium and Ultra refuse it (400). If long takes are ever switched off, the call answers
400 `long_form_unavailable` and nothing is held.

## When to use it

| The user wants | Use |
|---|---|
| One camera move that keeps going for 20-60 s: a walk toward the camera, a dance, a long tracking shot | **a long take** |
| A singer performing a 20-60 s part of their song in one take | **a long take** on `videos/music` |
| A story with cuts, several places, a flashback, a montage | a film (`POST /api/v1/director/videos/film`) |
| The whole 3-minute song | a normal music video (with cuts), or a long take on a 20-60 s part |
| More than 3 main people who stay in the shot across the joins, a fight, a duet that cuts between singers | a film or a normal music video |
| 5-15 s | a normal clip: it is one shot already |

## The fields

`POST /api/v1/director/videos/long_form` (multipart; `long_form` is implied, `duration` defaults to 30), or
`POST /api/v1/director/videos/reference` with `long_form=true` (the same job and price):
- `long_form=true`, `duration` 20-60, 1-9 `images` (every piece sees every picture). Leave `video_model` out or send
  `montage-basic`.
- `prompt` = the idea of the whole shot in plain words (who, where, the one camera move, what happens, how it ends).
  The writer plans the pieces and writes each one. Name what each `<Picture N>` shows.
- Passers-by and crowds are fine: the 3-people limit covers only the main people who stay in the shot across a
  join. Anyone seen inside one piece only gets their own look and a visible face.
- Or `long_form_pieces`: your own prompt for every piece (a JSON list of strings, one per piece), when you write
  them yourself. No writer round is charged then.
- `megapixels=1.0` for a sharper 1344x768-class render (1.7x the price), `seed`, `steps`, `realism` as usual.

`POST /api/v1/director/videos/music` (multipart):
- `long_form=true`, the customer's own `song` (always their song first), 1-9 `images`.
- The whole song, or the part from `long_form_start` to `long_form_end` (seconds), must be 20-60 s.
- `idea` + `references` (the writer writes every piece, using where the voice sings), or `sections` = one prompt per
  piece. The lead vocal is locked over the whole take; the original song goes back on top at the end.

Pieces: the fewest pieces of at most 15 s, of equal length. 30 s = 2 x 15 s, 40 s = 3 x 13.3 s, 60 s = 4 x 15 s.

## Price

About 18 credits a second of the take, plus the 0.92 s each later piece re-renders, 1.7x at `megapixels: 1.0`,
plus one writer round when the writer writes the pieces. A 30 s take written for you is listed in
`GET /api/v1/director/catalog` and on `GET /api/v1/montage`. Long takes have no free quote: show the human the
price from the catalog before starting. Credits are held up front and given back if the take is refused.

## Writing the pieces yourself (`long_form_pieces` / `sections`)

Every piece is a full six-section prompt (see `references/montage/montage-basic-prompting.md`). The rules the writer
follows, and the checker enforces:
1. **One shot.** Only `[Shot 1]` in `detailed_description`, never `[Shot 2]` or "cuts to" (refused). Timed lines
   `00:00.000-00:05.000: ...` cover the piece.
2. **Plan the whole take first; put every join in the MIDDLE of a movement** (mid-stride, mid-turn, mid-line of the
   song), never on a stop, a pose or a new action.
3. **Lock the framing**: the same shot size and camera move written the same way in every piece ("eye-level medium
   close shot, head to waist, never wider and never closer; the camera moves backward at walking pace").
4. **Show the destination before the subject travels to it** (the lighthouse is in the background from piece 1).
5. **Every later piece opens with a carry-on block** that names no scenery: "The video opens already in progress,
   mid-stride. The camera holds exactly the position, height and distance it already has, moving backward at his
   pace. He keeps walking at exactly the same pace through the space he is already in, the light on him unchanged."
   For a singer add "and keeps singing, his mouth following every word". **Never** write a hold such as "for the
   first three seconds nothing changes": the lips slip for several seconds around the join.
6. **Later pieces run 0.92 s longer** in their timestamps (a 15 s piece 2 is timed 00:00.000-00:15.917): the
   carried frames come first.
7. Every piece but the last ends "At 00:15.000 he is still walking toward the camera, mid-stride, nothing else in
   progress." The last ends on a calm held moment.
8. Same subject definitions, music line and style line in every piece. No readable text, no grain words.

## What the job tells you

Poll `GET /api/v1/director/jobs/{id}` (`references/montage/pixio-jobs-polling.md`). `parts` holds each piece as
rendered (and, for music, the take with the locked vocal); the output is the joined take. A 60 s take keeps the
render line busy for a long time (tens of minutes), so `queue.estimatedCompletionAt` is the number to show.

## Refusals and fixes

| Answer | Why | Fix |
|---|---|---|
| 400 `long_form_unavailable` | long takes are switched off | send it without `long_form` (a film or normal clips) |
| 400, Montage Basic only | `montage-premium` / `montage-ultra` asked | leave `video_model` out |
| 400, 20-60 s | too short or too long | 5-15 s is a normal clip; over 60 s use a film, or `long_form_start` / `long_form_end` |
| 400, needs a cut | the idea asks for cuts, a montage, a new scene | one continuous place and move, or a film |
| 400, can't be combined | videos / audios, upscale, finish, package, tier mix, duets, draft... | run `videos/upscale`, `videos/finish`, `videos/package`, `videos/lipfix/auto` on the finished take |
| job `failed`: can't be one continuous shot | the idea needs cuts | rewrite it as one shot, or use a film |

After the render, watch each join and, for music, the lips around each join; fix a window with
`POST /api/v1/director/videos/lipfix/auto`. Redoing one piece means re-rendering it and every piece after it.
