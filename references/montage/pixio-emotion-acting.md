---
name: pixio-emotion-acting
description: How an AI agent directs performance in Montage (Pixio's Director API) prompts so people on Montage Basic and Montage Premium / Ultra act like real people - objectives and tactics instead of emotion words, beats, eye life and micro-life, listening and reactions, status and the body, masks that crack, emotion shifts with a trigger, singing performance, what each model overdoes, and an acting failure table. Use whenever you write or fix what a character feels or does in a clip, film, music video, ad or episode, or a render's acting looks flat, wooden, mugging or dead-eyed. Not for line wording, voices and word budgets (that is `references/montage/pixio-dialogue-voices.md`) or framing (that is `references/montage/pixio-camera-language.md`).
---

# Montage emotion and acting

Neither model can act "sad". Both can render a woman whose grip on a paper cup tightens, then loosens, as she closes
her eyes and breathes out. Acting is behaviour under pressure: a person wants something from someone, something is
in the way, and they do something about it. The feeling is a side effect the audience reads; never write it as the
instruction.

## House rules

- **Test on Basic.** Every test, draft or trial render runs on Montage Basic (`video_model: "montage-basic"`, also
  what you get when `video_model` is left out). Basic is billed in credits too, just least. Premium or Ultra only
  when the user asks for it and has seen the quote (`?check=true`).
- **The customer's own song first.** A music video uses the song the user gave you (`song`). `POST /api/v1/director/music/generate`
  is only a fallback when there is no song at all.
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE`
  (`https://beta.pixio.myapps.ai`) and `$PIXIO_API_KEY`.

## Decision rules (read first)

1. **Objective, not emotion.** Each person in the shot gets a verb aimed at a partner ("get him to admit it",
   "talk her into staying"), never a state ("be sad"). The face then has something to do.
2. **Physics, not adjectives.** Replace every feeling word with what eyes, brows, mouth, breath, hands and posture
   do. "Heartbroken" renders as nothing or a cartoon; "her chin trembles once and she looks at the floor" renders.
3. **The cause comes first, in the same shot.** "After the door shuts, her shoulders drop." Without a trigger the
   expression arrives too early or at random.
4. **One emotional shift per shot.** Calm -> worried is one shot; calm -> worried -> furious -> resigned is four.
5. **Every face has an eye task.** Where the eyes look, what they are checking, when they move.
6. **The smaller the frame, the smaller the acting.** Close-ups get eyes, breath and jaw only; wide shots act with
   the whole body.
7. **Never describe a pictured face's features** (eye shape, nose, lips, skin tone): the picture carries the face;
   words redraw it and it drifts. Describe what the face **does**, not what it **looks like**.
8. **Restraint.** Extreme words (furious, hysterical, terrified) make Premium eyes glow and Basic faces grimace.
9. **Never name a feeling you do not want.** "She never cries: no tears, dry bright eyes, no sad or pained face" shows crying: naming an emotion (cry, tears, sad, angry, scared...) makes the video show it, even after "no" or "never". Write the feeling you want instead: "bright, shining eyes and an easy, open smile". The prompt checker warns with a rewrite (it never blocks); wanted crying and "never stops smiling" are fine.

## Before you write: one line per character per scene

- **Objective:** the verb aimed at the partner.
- **Obstacle and stakes:** what blocks it, and what they lose if they fail (it should frighten them).
- **Tactics:** press, charm, shame, plead, provoke, bargain, stall, go silent. When one fails they switch; **a beat
  ends when the tactic changes**, and the change must be visible: a pause, a posture shift, a new tempo, a gaze move.
- **Subtext:** the real objective played under other words: a question that is not a question, a clipped "Fine.",
  a joke at the wrong moment.

Ensemble scenes: one shared direction everyone plays toward ("keep the goodbye painless"), each person with their own
reason and their own visible channel for it (one tidies, one jokes, one watches the door). A 15 s clip holds one or
two beats. Put the turn on a close-up with its cause in the shot before, and end each clip on a turn the audience
reads in a face or a body, then hold.

Pre-flight a scene before it costs a render: Goal -> Obstacle -> Tactic -> Reversal -> the audience's view of
someone changes. A scene with no reversal and no change of view is usually a scene to cut.

## Physics vocabulary

| Instead of | Write |
|---|---|
| grief | eyes down, a long slow breath out, hands go still around a cup, chin trembles once |
| fear | breath held, eyes flick to the door and back, half a step back, fingers curl into her sleeve |
| anger held in | jaw muscle flexes, nostrils flare on the stressed word, a stare that doesn't blink, the voice gets quieter |
| relief | shoulders drop, eyes close for a second, a short laugh through the nose |
| shame | can't hold eye contact, turns his face a quarter away, rubs his thumb over a knuckle |
| suspicion | head tilts slightly, eyes narrow, a pause before answering |
| contempt | a slow blink, one corner of the mouth lifts, turns away mid-sentence |
| tenderness | eyes soften and stay on the other face, a small smile that builds, leans in an inch |
| resolve | chin lifts, a steady look at the partner, a small nod to herself |
| shock | a half-second freeze mid-movement, then one sharp inhale |
| sadness without tears | outer eye corners drop, eyes wet but never spilling, a faint lip tremble |
| control | even breathing, relaxed fingers, slow deliberate blinks |
| suppressed feeling | written as muscles resisting it: "her mouth holds the smile while her jaw tightens" |

Pick two to four cues per beat, never the whole menu. Defaults: no falling tears unless the story asks; no grimaces;
never "looks up, thinking" (name a direction: "her eyes drift to the window and settle back").

## Eyes and micro-life (the cure for dead faces)

- **An eye task aimed at the partner:** "her eyes search his face for a sign he means it, flick to the door, return".
  The eye movement is the action.
- **Eyes lead the head:** the eyes reach the new target a beat before the head turns.
- **Blinks match the state:** quick bursts under stress, slow lids when in control, rare deliberate blinks for chosen
  stillness. For a long still close-up: "one slow blink, then a quick double blink, then a firm reset blink".
- **Micro-life in every held shot:** a small visible event every second or two: the chest lifts with a breath, a
  nostril moves, a brow tightens and releases. Write stillness as held tension ("she holds still, breath shallow,
  jaw set"), never as "nobody moves".
- **Mask and crack:** give one controlled expression and the exact trigger that breaks it: "she keeps smiling until
  he says her name; the smile stays on her mouth but leaves her eyes".

## Body, business, distance, status

- **Set the body before the psychology:** centre of gravity (high or low), tempo (ragged or economical), openness,
  breath. Breath must match the physics: someone who just ran cannot speak evenly.
- **Business:** in every talking shot the hands are doing a task (drying a glass, counting change, folding a letter
  along its crease). The strongest accent is **stopping** the task on the key line. Keep hand business in medium
  shots: small business by the face (eating, lighting a cigarette) renders badly on Basic.
- **Distance is drama:** about half a metre is intimate, one metre personal, two to three social. A step closer or
  away is a beat change; on Premium say it in metres.
- **Status is behaviour:** high = still head, slow moves, long looks, takes space; low = fidgeting, self-touch,
  broken speech, eyes asking permission. A one-second status break (the boss shows fear) is gold.

## Listening and reactions

- In every shot with two or more people, say who speaks and who doesn't: "Elena keeps her mouth closed and answers
  only with her eyes." Otherwise the listener mouths along or a second voice appears.
- **The listener has a task** ("decide whether he is lying") and the reaction **starts before the partner's line
  ends**. A task-less listener is where dead faces come back in two-shots.
- **Thought before word:** a short pause in which the eyes decide, before a hard answer.
- **The reaction shot is its own beat:** after news or a threat, a close-up of the person it lands on.
- **Groups react in a wave,** a beat apart person to person and with different strength, never in sync.
- Eyelines follow screen positions: if he is screen-left, she looks screen-left in her single (`references/montage/pixio-camera-language.md`).

## Dialogue acting

Wording, budgets and voices are in `references/montage/pixio-dialogue-voices.md`. For the performance around a line:
- **Before the line:** an inhale, a swallow, a glance. **On the line:** name the one stressed word and what carries
  it (a nostril flare, a look up). **After it:** about half a second of held gaze or held breath, then release.
- Delivery is described once, before the line: quiet, low, careful, flat, clipped, warm, hoarse, steady. Let anger
  come out quieter and slower; volume rises are risky on both models.
- With audio driving the lips (your song, voice samples), put the acting in brows, eyes, cheeks and breath; leave
  the mouth to the sound.

## Emotion shifts: the trigger formula

When a feeling changes inside a shot, write it as an event:

> The mood shifts from calm to dread: after the phone lights up with his name, she first goes still; then her breath
> shortens and her thumb stops on the screen; finally she sets the phone face down, slowly, without looking at it.

Premium: two to four observable cues per change. Basic: one or two (Basic prompts are shorter; put the shift's cue
on the shot where it happens).

## Singing performance (music videos)

- Never just "sings": who she sings *to* (the lens, him, herself) and what eyes and brows do on this line: teasing =
  a sideways glance and a smirk; defiant = chin up, steady stare into the lens; vulnerable = eyes down, then up.
- Breath before phrases, the jaw opens on held notes, eyes may close on the peak. The vocal drives the mouth.
- Story and reaction shots during the vocal say "her lips stay closed".
- **Smile budget:** a smile, grin or laugh in at most about one shot in four, never two in a row for one person, at
  least two clearly different expressions per section. The writer enforces this for `idea` music videos.
- Never put lyrics in prompts; describe the singing, not the words.

## What each model does

**Montage Basic**
- Renders what you describe and invents nothing for a blank face: an unwritten shot gets a neutral stare.
- One phrase pasted into every shot ("joyful, smiling") made a singer grin in nearly every frame. Vary it per shot.
- Reference portraits pass on their pose and expression: make them neutral unless that expression is wanted, plus a
  smiling close-up for anyone who will laugh on camera (otherwise the model invents the teeth).
- Every voice you describe gets words: "a guard shouting" made Basic invent lines. Use exact `<d>` lines or "a wordless
  shout".
- Close-ups: "natural skin with visible pores, a light sheen of sweat" keeps faces human.

**Montage Premium / Ultra**
- Strong at subtle faces and lip-sync; overdoes extreme words (glowing eyes, mugging). In strong close-ups add
  "Normal human eyes, no glowing eyes." to the constraints.
- A long silent setup before a line makes the line start late: put the line early in its shot.
- Optional muscle shorthand for nuanced faces: a genuine smile is cheeks lifting with the mouth (FACS AU6+AU12), a
  polite one is the mouth alone (AU12). At most 3-4 expressions per clip and one or two per beat, each code with a
  short plain gloss; keep one slow camera move so the beat list is not read as cuts.
- Animation styles exaggerate by nature: still write behaviour.

## Acting failures and fixes

| You see | Fix in the prompt |
|---|---|
| Dead eyes, glassy stare | an eye task aimed at the partner, eyes lead the head, blinks tied to the state |
| Mannequin in a still shot | micro-life every second or two; stillness as held tension |
| Mugging, arched brows | delete the emotion words; write the objective and the hands' business |
| Busy face in close-up | tighter shot, smaller acting: eyes and breath only |
| The ending face from frame 1 | write only what the character knows at this moment |
| Blank while the partner talks | a listening task; the reaction starts mid-line |
| Same colour all scene | a new tactic verb per beat |
| Tears or rage from nowhere | build restraint first, then the break, with a trigger |
| Instant recovery | the state carries into the next beat |
| Everyone reacts at once | stagger the reactions, vary their strength |
| A silence with nothing in it | give it an assessment or business, or cut it |
| Hands illustrate the words ("big" = arms wide) | gesture before the line, against it, or not at all |

## Requests

Draft a scene with the writer (a writer job: poll it and read the clips in its `result`), then read and fix the
acting before any render:

```bash
curl -X POST "$BASE/api/v1/director/prompts/write" -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json" \
  -d '{"story": "A daughter visits her estranged father in hospital; he pretends to be asleep until she starts to leave.", "mode": "reference", "duration": 15, "references": ["Elena, the daughter", "Walter, the father", "the hospital room"]}'
```

Turn every feeling word into physics, run `POST /api/v1/director/prompts/check`, and render a draft with
`POST /api/v1/director/videos/reference` (`video_model=montage-basic`, `speed=draft`). For films, `storyboard=true` shows each shot's still
first; redraw a weak face with `POST /api/v1/director/jobs/{id}/storyboard/redo` and a note such as `"a close-up: his eyes open as
the door closes behind her"`. After rendering, redo only the clip whose performance is wrong
(`POST /api/v1/director/videos/film/{id}/redo`).

## Checklist

- [ ] Each person has an objective, an obstacle and tactics; each beat change is visible.
- [ ] No feeling or extreme words; two to four physical cues per beat; the trigger before the shift.
- [ ] Every face has an eye task; held shots have micro-life; listeners have a task and react mid-line.
- [ ] Hands have business; the key line stops it; distance and status changes mark beats.
- [ ] Acting in MCU or CU scaled to the frame; pictured faces never described by their features.
- [ ] Every multi-person shot says who speaks and that the others keep their mouths closed.
- [ ] Music videos: who she sings to, varied expressions, smile budget, lips closed in story shots, no lyrics.
- [ ] Drafts on Montage Basic; Premium only after the `?check=true` quote and the human's yes.
