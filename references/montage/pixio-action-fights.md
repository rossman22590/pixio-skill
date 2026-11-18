---
name: pixio-action-fights
description: How an AI agent makes fights, chases and stunts that land with Montage (Pixio's Director API) - one blow per shot, mid-move openings, an angle change on every cut, speed wording, fight_flow and fight_motion on Montage Basic, action rules on Montage Premium and Ultra (blood allowed), two takes per action clip (variants), tier_mix (action on Premium, talk on Basic), action sound, and fight QA after the render. Use whenever a clip, film, episode or music video has fighting, chasing, weapons, crashes or stunts. Not for the general prompt format (that is montage-basic-prompting / montage-premium-prompting) or the film workflow (that is pixio-film).
---

# Pixio action: fights, chases, stunts

Action fails in predictable ways: posing instead of hitting, slow motion nobody asked for, blows that never land,
twins and melted hands. Each rule below answers one of them. On a timeout, keep polling the same job id; never
resubmit a job you already started.

## House rules

- **Test on Montage Basic.** Every test, draft or trial render runs on `video_model: "montage-basic"` (also what you
  get when `video_model` is left out). Montage Premium or Ultra only when the user asks for it and has seen the quote
  (`?check=true`, `credits.quoted`). Every render is billed in Pixio credits, Basic included.
- **The customer's own song first.** A music video uses the song the user gave you (`song`). `POST /api/v1/director/music/generate`
  is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `videos/finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE`
  (`https://beta.pixio.myapps.ai`) and `$PIXIO_API_KEY`.

**Montage Premium and Ultra allow blood:** wounds and hard hits on people render there. Write them where the
story wants them; add a no-blood line only when the user wants a clean fight. Pictures slow a fight down a little;
keep them anyway.

## 1. Decision rules (read first)

| situation | do this |
|---|---|
| A fight clip or film to test | Montage Basic; leave `fight_flow` at its default (automatic); write the 6-shot template |
| More energy on Basic | `fight_motion=0.4` (opt-in tuning, 0.1-0.6) |
| Big stunts, chases, camera moves, a crowd | Montage Premium clips; it excels at action |
| A film with fights and talking | `tier_mix=auto` (spoken close-ups on Basic, action on Premium) or `manual` + `basic_clips` |
| Any action clip | budget **two takes** (`variants=2` on a film, or a second job with a new `seed`) and keep the best per clip |
| Complex choreography on Premium | a muted reference video as `@Video1` ("take only the movement") on `/api/v1/director/videos/reference`; quote it first, it costs more |
| Slow, floaty fights | the speed wording, angle changes and `fight_flow` first; packaging `no_slowmo: true` only when asked (it plays accidental slow stretches at real speed and shortens the video) |

## 2. Montage Basic: the fight template

Measured in a fight lab (same fighters, place and seed, two takes each): **6 shots of about 2.5 s, each opening
mid-move, landed 6/6 beats in both takes.** One continuous take ("first... then... then...") was the worst (2/4, 3/4).

1. **A fight clip is 6 shots of ~2.5 s,** each "cuts mid-move". Never one continuous take.
2. **Open every shot mid-action:** "the guard is already lunging, his fist swinging". A stance opening ("fists up,
   circling") is 3 s of posing.
3. **Change the camera on every shot.** Montage Basic only cuts where the framing changes: over the hero's shoulder -> low
   angle -> reverse over the attacker's shoulder -> tight face close-up -> chest-high medium -> a wide for the fall.
   Never the same framing twice in a row.
4. **Speed wording** in the style line: "fast, explosive, full real-time speed: every punch snaps out and lands in a
   fraction of a second, bodies react instantly and violently, no slow motion, no lingering"; on each shot "the camera
   whips with large amplitude at fast speed".
5. **No slow-motion cues:** not "slow motion", "lingering", "graceful", "balletic", "dramatic pause", "time slows".
6. **One move per shot: weight -> contact on a named body part -> a reaction with a destination.** "His fist drives
   into the guard's ribs; the guard folds sideways, clutching his side."
7. **Every reaction shows its blow in the same shot.** A head snapping with nothing hitting it reads as a jiggle.
8. **Closed fists, elbows, knees, boots, weapons only.** No shoves, grabs, catches or arm blocks: they give double or
   melted hands.
9. **Two people per contact shot, and they look completely different:** a colour, hair and build (red bomber and a
   shaved head against a grey hoodie and long blond hair). Write "only two men in frame". Attackers come one at a time.
10. **Grounded physics:** no flips, wall runs, mid-air kicks or bodies flying without a blow shown. Write the outcome
    you want, not a prohibition: "he lands face down on the mat", not "he doesn't land on his back".
11. **Kicks in a low, leg-level shot** (boots, knees and the ground in frame).
12. **The face close-up is the shortest shot (~1.5 s) and has travel:** "his head snaps sideways and he staggers out of
    frame".
13. **Swords: never spend a shot on a parry** (blade contact holds 1-1.5 s whatever you write). Keep contact inside a
    shot that continues into a hit, or show hits on armour with sparks.
14. **No extreme close-up inserts of hands or weapons** in a fight; keep close two-shots or mediums.
15. **Effects get their own shot:** magic, liquid, shockwaves never share a shot with a strike.
16. **Only the last clip of a fight ends on a hold.** A hold mid-fight adds ~4 s of standing.
17. **Blood follows the tone:** Montage Basic adds a bloody nose after a punch on its own; write "no blood" when the story is clean.
18. Every prop in a fighter's picture gets a place it stays: "his crossbow slung on his back".

Bad (Basic):
```
[Shot 1] The two fighters circle each other, fists up. Then Dex throws a flurry of punches, the brawler blocks them all and grabs his collar, and they fight in slow motion across the garage.
```

Good (Basic, two of six shots):
```
[Shot 2] At 00:02.500, the shot cuts to a low side shot at waist height, only two men in frame: Dex's weight drops onto his front foot and his right fist drives into the brawler's ribs; the brawler jack-knifes sideways around the blow and stumbles two steps right. The camera whips with large amplitude at fast speed.
[Shot 3] At 00:05.000, the shot cuts to the reverse angle over the brawler's left shoulder, close on Dex's face: Dex's right elbow snaps up and cracks into the brawler's jaw; the brawler's head whips round to the right and sweat sprays off his hair. The camera whips with large amplitude at fast speed.
```

### Basic switches

| field | values | notes |
|---|---|---|
| `fight_flow` | not sent (auto), `true`, `false` | the Fight Flow look (each blow sets up the next, fewer frozen poses); auto turns it on for shots the checker reads as a fight. On `videos/text`, `videos/image`, `videos/reference`, `videos/film` and `videos/music` |
| `fight_motion` | 0.1-0.6, opt-in tuning | 0.4 recommended (+35-44 % motion, no frozen shots); higher costs hard cuts |
| `no_slowmo` | `package` field | plays accidental slow-motion stretches at real speed (`no_slowmo_max`, `speed_up`); the video gets shorter. Not a substitute for good wording |

The writer applies all these rules itself for `idea` films and `POST /api/v1/director/prompts/write`. `POST /api/v1/director/prompts/check`
(free) warns about several strikes in a shot, multi-target moves, more than two people in a strike, stance openings,
one-take fights, repeated framing, shoves, grabs, blocks, parries, inserts and mid-fight holds.

## 3. Montage Premium and Ultra: action rules

- **Direction, not adjectives.** "Fast, epic fight" defines nothing. Formula: fighter anchors (look, outfit, side of
  frame) -> place and starting distance -> ordered beats (one initiator, one responder) -> one camera path ->
  contact and reaction -> sound.
- **Each contact:** start pose -> path (limb, height) -> contact point -> reaction -> recovery. Cause before effect.
- **One specified exchange per shot, 2-3 detailed contacts per 15 s;** describe the rest generally; never repeat a move.
- **Cut counts:** 5 s: 1-2 shots; 10 s: 3-4; 15 s: 4-6; 30 s: 8-12; 2-4 s each.
- **One camera move per shot:** lateral track for exchanges, slow orbit for duels, backward track for runners,
  tracking follow for chases, handheld shake for blasts. Never cross the action line.
- **Fixed sides:** "left-right geography holds through all cuts". Contrasting outfits, separation between exchanges,
  no long clinches or pile-ups (faces merge).
- **Against floaty action:** "Real-time speed, no slow motion"; slow motion in one named shot at most.
- **Threat arrives without a wind-up.** Menacing slow turns read as theatre; the blow just comes. Start a peak shot
  in the state ("mid-swing, arm extended"), not in the preparation.
- **"Nobody speaks."** first in `[Constraints]`, or fights grow shouted lines. No dialogue during the fight.
- Add the anti-breakage line to action clips: "Keep facial and body proportions stable, limb anatomy natural and
  motion continuous, with no stiffness, clipping, stuttering or distorted limbs. All movement follows real-world physics."
- **Clip seams:** end each clip on separation, never mid-strike ("The take ends held on this frame."); the next clip
  restates that state and adds "Do not replay or recreate the previous clip's action." Damage only accumulates;
  weapons stay in the same hand.
- **Blood:** allowed. Show it in the shot where the hit lands and carry it forward; add a no-blood line only if the
  user wants a clean fight.
- Explosions: trigger -> fireball -> shockwave -> falling debris; the camera shudders. Powers: a visible source,
  direction, radius and what it moves.

Good (Premium, one shot):
```
Shot 3 (7-11s): [Medium shot, slow lateral track left] Mei drives her right knee into Bruno's ribs; he folds over it and staggers into a noodle stall, bowls crashing to the ground. <a dull body hit>, <ceramic shattering>.
```

The full layout and worked action prompts (duel, gunfight, car chase, parkour, explosion, two-clip continuous fight)
are in `references/montage/montage-premium-prompting.md`.

## 4. Chases and stunts

- **Chases:** one tracking path per shot (backward track ahead of the runner, tracking follow behind); staggered
  obstacles; each shot a new obstacle or gap closing. Cars: a low tracking shot, a cut to the driver, a near miss.
- **Stunts that read:** a vault (approach, palms on the ledge, landing roll), a fall through a stall, a slide under a
  closing door. Spell out start, path and landing.
- **Stunts that read as silly on Basic:** headbutts, flips, wall runs, people flying. Do them on Premium, or cut them.
- **Speed ramp / bullet time** (Premium): name the one shot and its seconds, in plain words.

## 5. Two takes and the tier mix

**Two takes per action clip.** Fights rarely land first time; dialogue usually does.

```bash
BASE=https://beta.pixio.myapps.ai
curl -X POST "$BASE/api/v1/director/videos/film?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-basic -F duration=30 -F "clips=<fight_clips.json" \
  -F images=@dex.png -F images=@brawler.png -F images=@garage.png \
  -F variants=2 -F fight_motion=0.4 -F visual_qa=local
```

`variants` 2-4 makes that many versions in all; each extra version is its own job (`versionJobIds` on the first),
billed like the first, and every version's credits are held when you start. Drop `?check=true` to render after the
quote is approved. Keep, per clip, the take with the right people, a visible hit and the wound in the right place;
redo a clip that failed in both with `POST /api/v1/director/videos/film/{id}/redo` `{"clip": 2, "seed": 902}`.

**Tier mix:** action on Premium, talking close-ups on Basic, one film.

```bash
curl -X POST "$BASE/api/v1/director/videos/film?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-premium -F duration=60 -F "clips=<clips.json" \
  -F images=@kane.png -F images=@danny.png -F images=@yard.png \
  -F tier_mix=manual -F basic_clips='[1, 4]'
```

- `tier_mix`: `off` (default), `auto`, `manual` + `basic_clips`; `tier_mix_size`: `larger` (default), `basic`, `premium`.
- Your `clips` are written in the Montage Basic format (the Premium clips are converted for you). Premium has to be
  offered (`videoModels.premiumAvailable` in `GET /api/v1/director/catalog`). Basic parts are billed at the Basic
  price, Premium parts at the Premium price; show the `?check=true` quote and ask before rendering.
- On Premium, 6-9 pictures per clip work best (still at most 4 people per clip).

## 6. Fight sound

- Basic: `overall_soundscape:` with hard dry impacts, grunts, heavy breathing, shoe soles on the floor, room tone,
  ending "No other voices."; `non_diegetic_music: N/A` unless a score is wanted.
- Premium: one `<effect>` per contact, 2-3 layers per shot, `[Sound] Impacts and breathing close. No BGM.`
- More: `references/montage/pixio-sound-design.md`.

## 7. QA of fights

- **Built-in:** the job's `qa` list counts `fightStillShots` per clip: shots that should show a blow but stay
  nearly still (a posed tableau, a fist stopping short, locked blades). `visual_qa=local` finds clones and extra
  faces (`qaIssues`); `full` adds an AI judge at a higher per-part price (quote it first and ask).
- **By eye, about 1 frame per second in action shots:** clones or swapped fighters, a third person in a contact shot,
  double or melted hands, a blow that never lands, a reaction with no blow, the wound in the wrong place, props in the
  wrong hand, posed crowds, a dissolve instead of a hard cut. `GET /api/v1/director/jobs/{id}/shots` lists every cut
  with a thumbnail (free).
- **Speech:** fights should have none; transcribe one 15 s clip at a time if you suspect shouted lines.
- **Fix:** keep the better take; redo only the bad clip with a new seed or a corrected prompt. Speed a slow fight up
  about 1.2x in the edit (`POST /api/v1/director/videos/assemble` clip `speed`) rather than adding more speed words
  (wording is at its ceiling).

## Checklist

- [ ] Story approved; fighters look completely different (colour, hair, build); every supplied picture kept.
- [ ] Basic: 6 shots of ~2.5 s, mid-move openings, a new angle every shot, speed wording, no slow-motion words.
- [ ] One blow per shot on a named body part with a reaction that travels; no shoves, grabs, blocks or parries.
- [ ] Two people per contact shot; no multi-target moves; grounded physics.
- [ ] Premium: anchors, one initiator per beat, one camera path, "Nobody speaks.", fixed sides, held seams.
- [ ] Blood only where the story wants it (allowed on Premium); wounds placed exactly and carried forward.
- [ ] `fight_flow` default (auto); `fight_motion=0.4` if more energy; `no_slowmo` only when asked.
- [ ] Two takes per action clip; tier mix `?check=true` quote shown and approved.
- [ ] `fightStillShots` and `qaIssues` read; frames checked about 1 per second; bad clip redone alone.
