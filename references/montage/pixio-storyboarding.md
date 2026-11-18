---
name: pixio-storyboarding
description: How to use the storyboard stop on Montage (Pixio's Director API) - storyboard=true on POST /api/v1/director/videos/film with an idea (story, commercial, explainer, documentary) and on /api/v1/director/videos/remake, the waiting state, GET /api/v1/director/jobs/{id}/storyboard, sheet.jpg and single stills, redo of one shot with a director's note, what to check before approving, approve or cancel, and what to do where there is no storyboard (own clips, music videos, series episodes). Use whenever you want to see and fix a film's shots before any clip is rendered. Not for writing the clip prompts themselves (montage-basic-prompting / montage-premium-prompting) or the overall film workflow (pixio-film).
---

# Storyboarding: see every shot before the film renders

With `storyboard=true`, a film job writes the whole film, makes its reference pictures, then draws **one still per
shot** (Montage's image model, a few seconds each, each with that shot's own cast pictures) and waits for you. No
clip is rendered until you approve. Rewriting a shot here costs seconds; rerendering a clip costs minutes.

## House rules

- **Test on Montage Basic.** Every test, draft or trial render runs on `video_model: "montage-basic"` (also what you
  get when `video_model` is left out). Montage Premium or Ultra only when the user asks for it and has seen the quote
  (`?check=true`, `credits.quoted`). Every call is billed in Pixio credits, Basic included.
- **The customer's own song first.** A music video uses the song the user gave you (`song`). `POST /api/v1/director/music/generate`
  is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `videos/finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE`
  (`https://beta.pixio.myapps.ai`) and `$PIXIO_API_KEY`.
- **Approve the story first**, then storyboard: the one-line goal and beat list are agreed before you submit.
- A storyboard that drops a supplied picture is a reason to redo, not approve. Show the user the contact sheet before
  approving when they asked to see the plan.

## Where storyboards exist

| job | storyboard? |
|---|---|
| `POST /api/v1/director/videos/film` with `idea` (`film_type` story, commercial, explainer, documentary) | yes, `storyboard=true` (not with `variants`) |
| `POST /api/v1/director/videos/remake` | yes, `storyboard=true` (the remake renders as a film) |
| `POST /api/v1/director/videos/film` with your own `clips` | no: it works with an `idea` only. Run `?check=true` (free quote plus the prompt report), render `speed=draft` first, or write the clips with `POST /api/v1/director/prompts/write` and read them before sending |
| `POST /api/v1/director/videos/music` | no field. Use `?check=true` for the quote, `POST /api/v1/director/music/plan` to read the planned sections, and `speed=draft` + section redo |
| `POST /api/v1/director/series/{id}/episodes` | no field. Use `speed=draft` and clip redo |

Default is off. The storyboard endpoints answer `404 not_found` for jobs without one.

Price: each still is charged (up to 4 a clip are held when the job starts; the real count is charged). A redo costs
one still, plus a writer charge when it carries a note. If you never approve, the writing and the stills are still
charged. Prices are in `GET /api/v1/director/catalog`; `?check=true` on the film quotes the whole job.

## 1. Submit

```bash
BASE=https://beta.pixio.myapps.ai
curl -X POST "$BASE/api/v1/director/videos/film" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-basic -F duration=60 -F speed=draft -F storyboard=true \
  --form-string "idea=A night nurse answers a call light from a room that was emptied this morning." \
  -F images=@nurse.png -F 'references=["Ruth, 48, the night nurse, grey-streaked bun, navy scrubs"]'
```

Poll `GET /api/v1/director/jobs/{id}` every 10-30 s. While it writes, makes pictures and draws, the job is
`running`. When the stills are ready it stays `running`, its `stage` reads "Storyboard ready — approve to shoot" and
its `storyboard.waiting` is `true`. Treat that as "waiting for you", not as an error or as done: nothing more
happens until you approve or cancel.

At this point the job already lists the pictures it will use (`pictures`, with `designed: true` for the ones the
studio made; each served at `GET /api/v1/director/jobs/{id}/pictures/{n}`). Read them together with the stills.

## 2. Look at it

```bash
curl -H "Authorization: Bearer $PIXIO_API_KEY" "$BASE/api/v1/director/jobs/$JID/storyboard"                    # JSON: every shot
curl -H "Authorization: Bearer $PIXIO_API_KEY" -o sheet.jpg "$BASE/api/v1/director/jobs/$JID/storyboard/sheet.jpg"   # contact sheet
curl -H "Authorization: Bearer $PIXIO_API_KEY" -o c2s3.png "$BASE/api/v1/director/jobs/$JID/storyboard/2/3"          # one still (PNG)
```

`GET .../storyboard` (free) returns `{ object: "director.storyboard", jobId, waiting, stills, sheetUrl, storyboard }`.
`storyboard` holds the shots in order, each with its `clip`, `shot`, the shot's text and a `url` for its still; a
shot whose still failed carries an error and no still: redo it before approving. The sheet has one row per clip,
each still labelled "clip K shot S".

How to read a still honestly:

- A still is a quick image-model approximation of one frozen moment, with at most 4 of the shot's pictures. It
  shows framing, who is in the shot, place, props and staging. It does not show motion, timing, lip-sync or voices.
- Dialogue is left out of the still (a still has no sound): judge lines from the shot text, not the image.
- The video will not match the still pixel for pixel. A good still means the shot text is right; a bad still almost
  always means the shot text is wrong.

## 3. What to check before approving

Go shot by shot, sheet in one window, the shot texts in the other:

1. **Hook.** Clip 1 shot 1 shows something wrong, strange or at stake. A slow establishing view is a redo.
2. **Right people.** Every face matches its reference picture; nobody appears who should not.
3. **No twins.** No two copies of the same person, no reflections or mirrors of the lead, no over-the-shoulder
   framing with a second head in the foreground. Two-shots are front-on.
4. **Every supplied picture used** somewhere in the film, and used for the right person, place or product.
5. **Continuity.** Same wardrobe across clips; wounds only from the shot where they happen, on the named spot;
   weapons in the same hand; left/right geography holds across cuts.
6. **Readable staging.** Faces chest-up or closer when someone talks; far-away people only from behind or in
   silhouette.
7. **No phones, screens, laptops, drones or written text** carrying the story.
8. **Every clip ends on a turn** (a reveal, a decision, a door, a hit) and the last shot of each clip is a hold.
9. **Product and brand shots** (commercials): the product looks like its picture, logo side visible, no garbled text.
10. **The prompt rules**: if a shot text breaks the rules in `references/montage/montage-basic-prompting.md`
    (several actions, off-vocabulary camera words, a speech direction after a line), fix it with a note.
    `POST /api/v1/director/prompts/check` (free) checks any text you paste.
11. **Every shot earns its seconds.** Name its goal and what is different between its first and last moment; a
    shot with no change is a cut or a merge. Frame one is already occupied: people in place, no empty plate.
12. **Place pictures set the room, not the framing.** If a still copies the location picture's exact angle, say
    the framing you want in a note (lens, height, who is where against an anchor object such as a lamp or a door).

Make a list of fixes before redoing anything; one note per shot is cleaner than many tries.

## 4. Redo one shot

`POST /api/v1/director/jobs/{id}/storyboard/redo` (JSON):

```json
{"clip": 2, "shot": 3, "note": "a close-up of Ruth's face, rain running down the window behind her, she is alone"}
```

- **With `note`** (up to 500 characters): the writer rewrites only that `[Shot N]` paragraph to follow the note,
  keeping its timing marker, every `<Subject N>` / `<Picture N>` / `<Audio N>` label and dialogue lines (unless the
  note asks to change the line). The rest of the clip stays word for word. If the rewrite would break that
  structure, nothing changes and you are not charged (try a clearer note). Then the still is drawn again, and the
  film's clip prompt is updated, so the render follows the storyboard.
- **Without `note`**: the same shot is drawn again with a new seed (use it when the text is right but the still came
  out odd).
- Answers when the new still is ready (seconds; longer with a note) with the updated storyboard JSON.
- Only while the job is waiting on its storyboard; a wrong clip or shot number is refused.

Writing good notes:

| bad note | good note |
|---|---|
| "better" | "medium close-up, chest up, Ruth facing the camera, call light glowing red above the door behind her" |
| "fix the twins" | "Walter is the only person in the frame; Ruth is not in this shot" |
| "more dramatic" | "low angle from the bed's height, the door slowly opening, the corridor dark beyond it" |
| "remove the phone" | "she holds the paper patient chart, no phone anywhere" |
| "make it cinematic with film grain" | never ask for grain; describe light and framing instead |

A note changes the shot, not the story. If a whole clip or the story is wrong, cancel and resubmit with a better
`idea` (cheaper than ten notes).

## 5. Approve or cancel

```bash
curl -X POST "$BASE/api/v1/director/jobs/$JID/storyboard/approve" -H "Authorization: Bearer $PIXIO_API_KEY"
curl -X DELETE "$BASE/api/v1/director/jobs/$JID" -H "Authorization: Bearer $PIXIO_API_KEY"     # cancel while waiting
```

Approve sends the job on to render the approved shots (it goes back in line; `GET /api/v1/director/queue` shows
your waiting jobs and their place); the reference pictures are already made. Approve is refused unless the job is
waiting on its storyboard. Cancelling still charges the writing and the stills already drawn.

Before approving a Premium film, make sure the human has seen and accepted its `?check=true` quote.

## 6. After the render

The storyboard reduces surprises; it does not replace QA. Look at about 1 frame per second in action
(`GET /api/v1/director/jobs/{id}/shots`, free thumbnails), listen to every line, then fix single clips with
`POST /api/v1/director/videos/film/{id}/redo` (`{"clip": 3, "seed": 777}`, optional corrected `prompt`). With
`speed=draft`, move to full quality with `POST /api/v1/director/videos/film/{id}/final`. Details in
`references/montage/pixio-film.md` and `references/montage/pixio-video-qa.md`.

## Typical flow

1. Story approved -> submit with `storyboard=true`, `video_model=montage-basic`, `speed=draft`.
2. Waiting (`storyboard.waiting: true`) -> sheet + shot texts + `pictures`.
3. Checklist below -> redo shots with notes -> recheck those stills.
4. Show the sheet to the human if they want to see it -> approve.
5. Draft render -> frame check -> clip redo -> final.

## Checklist before approving

- [ ] Every still exists (no failed shot without a still).
- [ ] First shot hooks; every clip ends on a turn.
- [ ] Right faces, no twins, no reflections, no OTS; every supplied picture used correctly.
- [ ] Wardrobe, wounds, props and left/right continuous across clips.
- [ ] No phones, screens or written text as story devices.
- [ ] Shot texts follow the prompt rules.
- [ ] Dialogue read in the shot texts (stills carry none).
- [ ] Premium priced and approved by the human; tests on `video_model=montage-basic`.
