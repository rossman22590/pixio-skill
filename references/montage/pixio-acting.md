---
name: pixio-acting
description: The Director acting system - character performance as behaviour under pressure in Montage Basic and Montage Premium / Ultra prompts - objective, obstacle, tactics, beats and subtext, listening, the body (gravity, tempo, breath, business, distance, status), the master acting profile (a character's manner) with its mask and crack, eye life, rewriting it per scene within each model's budget, transferring behaviour a scene blocks, the fixed voice line, ensembles, the catalogue of bad acting and the 0-5 scale. Use whenever you build a recurring character's manner, write the performance layer of a clip, film or episode, or fix wooden, mugging or dead-eyed acting. Not for the quick behaviour vocabulary (pixio-emotion-acting), voice samples and line formats (pixio-dialogue-voices) or the rest of the prompt (pixio-prompt-director).
---

# Director acting

Apply this every time you write, review or fix the performance part of a video prompt on Director. The acting you
write goes into the action of each shot (Premium: the `[Shot list]`; Basic: the shots of `detailed_description`),
in whatever template the rest of the prompt uses.

**The axiom: acting is BEHAVIOUR under pressure, not a display of emotion.** A character wants something, something
is in the way, and they act to get it. Emotion is the by-product of that struggle; you never write it directly.

**`references/montage/pixio-emotion-acting.md`** is the short version of this system (decision rules, a behaviour vocabulary table, the
smile budget, per-model delivery formats, what each model overdoes). This skill is the depth behind it: how to
build a character's manner once and play it truthfully in every scene. Where they overlap, they agree.

Base URL `$BASE` (`https://beta.pixio.myapps.ai`), key `$PIXIO_API_KEY` in the `Authorization: Bearer $PIXIO_API_KEY`
header only.

## House rules

- **Test performances on Basic:** `video_model: "montage-basic"` (also what you get when `video_model` is left out),
  `speed: "draft"`; every render is billed in Pixio credits, so quote first with `?check=true` (`credits.quoted`).
  Premium or Ultra only after the user saw that quote and said yes.
- **Never describe a pictured face's features** (eye shape, nose, lips, skin, scars on the face): the reference
  picture carries the face; words redraw it and it drifts. Write what the face *does*.
- **Use every picture the user supplied**; no grain words; no famous names (no "plays it like <actor>"); the API key
  never goes in a prompt, URL or log.
- Never put lyrics in prompts; sung performance is described, not transcribed (`references/montage/pixio-music-video.md`).

# Part I: the craft

## 1. What good acting is

Truthful behaviour in imaginary circumstances. Not depicting feelings, not reciting text, not "expressive faces".

| Bad acting | Good acting |
|---|---|
| shows the emotion ("I am angry") | pursues the objective ("make you give the money back"); anger arises on its own |
| waits for its cue | listens and reacts to the partner every second |
| body illustrates the words | body lives its own life, sometimes contradicts the words |
| every line in one tempo and tone | rhythm changes with every change of tactic |
| emotion switches on at the line and off after | state is continuous: a life before and after the line |
| the face performs (brows, grimaces) | the face thinks: the thought reads in the eyes before the words |

## 2. The five pillars

Every character in every scene breaks into five parts. Missing one, the performance falls apart.

**2.1 Objective.** What the character wants here, now, from a specific person, as a verb aimed at the partner: "make
him confess", "beg a week's extension", "convince her I'm not afraid". Never a state ("be angry"): states cannot be
played. Behind it sits a super-objective for the whole story; each scene objective is a step toward it.

**2.2 Obstacle and stakes.** What stops them: external (the other wants the opposite, witnesses, a deadline) or
internal (pride won't let him beg, she doesn't believe her own words). Answer "what happens if I do NOT get it?":
the answer must frighten the character.

**2.3 Tactics.** The method right now, as an action verb: press, charm, shame, plead, provoke, bargain, threaten,
stall. When a tactic fails, a living person changes it. One tactic for a whole scene is dead acting.

**2.4 Beats.** The stretch in which the character wants one thing and pursues it one way. A beat ends when the
objective is won, the tactic fails, news arrives or the balance of power shifts. **Every beat change is visible:** a
pause, a posture change, a tempo change, a shift of gaze. Budget: a scene (one or several clips) holds 2-4 beat
changes; one 15 s clip holds one or two; **one shot holds at most one shift**, with its cause earlier in the same
shot (`references/montage/pixio-emotion-acting.md` rule 3).

**2.5 Subtext.** What the character really thinks, against what they say. It is never played; it leaks while they
pursue the true objective under the false text. Markers you can write: questions that are not questions; asking the
same thing twice (he doesn't believe the answer); an abrupt change of topic; a joke at the wrong moment (a shield);
answers that are too short ("Fine." "Sure.": a closed door).

## 3. Listening and reaction: the real test

Performance lives between the lines. Write these:
1. **Reaction starts before the partner's line ends.** The face answers mid-phrase. A neutral face until the end of
   the line, then "switching on", is dead acting.
2. **Thought before word.** Before a hard answer, a micro-pause in which the person visibly decides.
3. **The assessment moment.** After news, a threat or an insult, time to take it in: a fraction of a second or a long
   pause; a face, a defocused gaze.
4. **Contagion.** Tempo and volume answer the partner: a shout is met by a counter-shout or by pointed quiet, never
   simply continued over.

On both models, the listener needs a line of their own in the shot: "Elena keeps her mouth closed and responds only
with her eyes; her gaze drops to the letter before he finishes." Otherwise the listener mouths along or freezes.

## 4. The body

**4.1 Physical state before psychology.** Set for every character: **centre of gravity** high (chest, chin:
confidence, status) or low (shoulders, slouch: fatigue, fear); **tempo** fast and ragged or slow and economical (the
most dangerous people move least); **openness** (squared shoulders, open palms vs crossed arms, dropped head);
**breath** high and fast (panic) or low and slow (control). Sound and body must agree: someone who just ran cannot
speak in a steady voice.

**4.2 Business.** A character almost always has a physical task: fixing an engine, counting money, wiping a glass,
and talks over it. It kills theatricality, gives rhythm and makes subtext (how he counts the money says more than the
words). **Interrupted action** is the strongest accent: he was slicing bread and stops at a phrase; the phrase
becomes an event. Keep business simple and in medium shots; small business close to the face (lighting a cigarette,
eating in close-up) renders badly on Montage Basic.

**4.3 Distance.** Intimate (under 0.5 m): love or violence; a threat whispered 10 cm from a face beats a shout.
Personal (0.5-1.2 m): trust. Social (1.2-3.5 m): business, wariness. Public (3.5 m+): alienation, hierarchy. Many
scenes are the story of a distance: who closes it, who breaks it, who freezes. **A change of distance is a change of
beat.** Write distances in metres; they double as blocking (`references/montage/pixio-prompt-director.md` section 5).

**4.4 Status.** What you do, not who you are. High: still head, slow movements, long looks, pauses before answering,
taking space, touching other people's things. Low: fussing, self-touching (face, hair), broken speech, filler
laughs, asking permission with the eyes. The best moments are **status breaks**: the boss's one second of fear, the
underling who stops smiling.

## 5. Speech

- Rhythm is in the text; deliver it exactly. Fast is not mushy.
- **The most frightening things are said the quietest.** Shouting is the currency of the weak. Volume rises are also
  risky on both models; let anger come out lower and slower.
- A pause is legal only if something happens in it (an assessment, a decision, a refusal).
- Real speech has litter: interruptions, repeats, unfinished phrases. Keep it in the *written line* only as far as the
  models can speak it: plain full sentences on Basic (clipped slang reads as nonsense), no "gonna", numbers as words,
  commas for pauses on Premium and Ultra.
- Word budgets: Basic about 2.6 words/s plus 1 s; Premium about 1.6 words/s plus 1 s, 5-10 words per line, no line
  in the last third (`references/montage/pixio-dialogue-voices.md`).

# Part II: writing the acting

## 6. The master acting profile (a character's manner)

Every recurring character gets one master profile: the permanent truth of how they behave. Write it once, keep it
in the project notes (and, shortened, in the film `cast` `description` or series cast `what`, which is limited to
400 characters), then rewrite it for each scene (section 8). Target: **150-220 words, one flowing paragraph**,
English, everything observable.

```text
Character acting as [NAME]. [Age, build, posture: the body as a record of their life; no face features if they have a picture]. [The inner engine in one clause]. Vocal profile: [pitch and timbre, accent or origin, pace and delivery, how the voice breaks or shifts under pressure]. Habits and tics: [signature tic + its trigger; stress tic + its trigger; concealment behaviour (what they do to hide what they feel); the facial mask and the exact condition under which it cracks]. Eye life: [blink quality, scanning pattern, where the gaze settles, how the eyes lead the head]. Walk: ["a named gait" + weight, rhythm, foot placement, torso, arms, head]. However, when [trigger], [the transformation of posture, gait and face]. [Optional: the one person or thing that makes the face truly soften].
```

Rules:
1. **Only observable behaviour.** Never "he is nervous": the lower lip trembles, a heavy swallow, a long inhale
   through the mouth and a sharp exhale through pursed lips.
2. **Every tic has a trigger.** Not "cracks his knuckles" but "cracks his knuckles during small talk to fake
   confidence". Tics without triggers are decoration; with triggers they are drama.
3. **Name the gait** in quotes ("a power-walk", "a battering-ram stride"), then unpack weight, step, torso, arms, head.
4. **Mask and crack.** Every profile has at least one "However, when X, ..." clause: the facade and the exact trigger
   that collapses it. A character playing two truths at once is a person, not a puppet.
5. **One softening target**, where it fits: one person, animal or object. One, not two.
6. **No wardrobe** (it lives in the references and the look), **no camera, no colour, no light.**
7. **Body carries biography:** build "weathered from past work", shoulders "permanently tense", posture
   "over-corrected to project authority". Profession, old injuries and self-image read in the body; facial marks
   belong to the picture, not the words.
8. **No extreme emotion words** (furious, hysterical, terrified, ecstatic): on Premium and Ultra they make eyes glow, on
   Basic faces grimace, and the prompt checker WARNs on them.

## 7. Eye life: in every profile and every scene

Dead eyes are the first tell of generated acting.
- **Gaze targeting and small saccades:** the gaze keeps moving, drifts away in thought, flicks to a detail and
  settles back; it never locks frozen on one point.
- **Blinks tied to state:** blink bursts under stress, slow calm lids in control, a blink-and-glaze in shock.
- **Live catchlights:** the eyes read wet, lit, alive. Close-ups on Basic: add "natural skin with visible pores" so the
  face stays real.
- **Chosen stillness is never dead:** a predator calm has rare, slow, deliberate blinks, and the gaze still shifts
  with intent.
- **Eyes lead the thought:** the eyes reach the target a beat before the head turns.
- **Eye life reacts to the beat:** blink rate, steadiness and warmth change when the beat changes.
- Premium close-ups with strong feeling: add "Normal human eyes, no glowing eyes." to `[Constraints]`.

## 8. Scene adaptation: rewritten, never pasted

The master profile is who the character is. For each clip, rewrite it into the moment:
1. **Present characters only.** No one in frame, no paragraph.
2. **Keep the constant core:** identity, vocal profile, signature tics, eye life, the emotional through-line. Never
   contradict the master.
3. **Re-express for this scene:** select, emphasise, change or drop behaviours to fit posture (seated, running,
   hiding), action, beat, state, time of day.
4. **Transform, don't delete** (section 9).
5. **Fold it into the shots**, in the character's register; no bullet lists, headers or "dial" lines in the prompt.
6. **Lead with the reference binding** so the model ties the acting to the right person: on Premium the defined name
   (after "Define the man in the grey coat in @Image1 as Viktor"); on Basic `<Subject 1>`.

**Budgets per model:**

| | Montage Premium / Ultra | Montage Basic |
|---|---|---|
| where | the action of each `Shot N (a-bs)` | the action sentence of each `[Shot N]` |
| size | 40-90 words per character per clip, spread across their shots | one or two clauses per character per shot; `detailed_description` is 350-500 words in all |
| what survives | tics with triggers, eye life, one beat change per shot, delivery before the line | one behaviour per shot, eyes and hands, the voice described once at the first line |
| failure mode | extreme words make glowing eyes; silent setup before a line makes it start late | an unwritten face gets a neutral stare; one repeated phrase ("smiling") repeats in every shot |

Full master profiles never go into a prompt whole; they go in your notes.

## 9. Transferring behaviour that cannot happen

When the scene blocks a behaviour, convert its energy into an outlet the scene allows. The engine is constant; the
outlet changes.

| Master behaviour | Scene blocks it | Transferred outlet |
|---|---|---|
| restless pacing | slumped on a sofa | micro-sway, wrist flicks, tearing a paper label into strips |
| a heavy rolling walk | seated in a car | stillness of the shoulders, a coin walking across the knuckles |
| expansive gestures | handcuffed | chin and eyebrows carry it; the cuffs rattle on the table |
| scanning exits | blindfolded | the head tilts toward each sound; breath held to listen |
| a booming voice | must whisper | the same rhythm and emphasis at whisper volume; the jaw works harder |
| fidgeting hands | carrying a tray | the thumb taps the tray rim; the shoulders bounce |
| impossible physics (flying, shrinking, a creature's movement) | a model can't stage the process | play the *state* (mid-flight, already small) and the human reaction to it; the transformation itself is cut around |

## 10. The voice line: fixed, never adapted

Acting is rewritten per scene; the voice is locked. Each speaking character gets one **voice line** (1-2 sentences),
written once and reused word for word wherever they speak:

```text
a [age]-year-old [origin / accent], [timbre and register], [pace and delivery], [emotional colour and how it shifts under pressure]
```

How it goes into the prompt:
- **Premium:** `Viktor says in a low, hoarse, unhurried working-class baritone, calm and faintly amused: {line}`.
  Delivery once, before the line, never on single words. With a sample: bind it ("Viktor from @Image1, voiced by
  @Audio1") and keep the same timbre words; voice samples can change the take's price, so re-quote with `?check=true`.
- **Basic:** the voice is described once at the character's first line: `<Subject 1> (S1), in a low, hoarse,
  unhurried male voice, says: <d>[English] ...</d>`; a sample is `<Audio N> is the voice-timbre reference for
  <Subject 1> (S1).`; across a film use `cast` with `audio`, or `voice_lock=true`.
- The vocal profile inside the acting describes how speech *behaves* (tempo, breaks, whispers); the voice line
  locks the *sound*. They must agree. A silent character gets no voice line in that clip.
- Samples, cloning, `voices`, `clip_audios`, `no_speech`: `references/montage/pixio-dialogue-voices.md`.

## 11. States, not transitions

Video models fail transitions and nail states. Write the character already in the action (mid-throw, mid-pace,
mid-argument), not the process of getting there ("reaches into the bag, pulls out, winds up" collapses; "mid-throw,
arm extended" lands). Chain states beat by beat. For a start frame on `/api/v1/director/videos/image` the picture is already the
state; write what continues, never a replay.

## 12. Ensemble and space

- **Reactions travel in a wave, never in sync:** one gets it first, the next half a beat later, a third not at all
  (unless a synchronised comic beat is the point).
- **The reaction is worth more than the action:** after an event, the best frame is the face of whoever saw it. Give
  it its own shot.
- **Freeze at the threat:** constant ensemble micro-movement, then at the key threat everything stops.
- **Movement is motivation:** nobody crosses a room without an impulse toward or away from something. Strong moves:
  closing in (escalation), turning one's back (dismissal or hiding the face), standing while the other sits
  (dominance), sitting down mid-conflict (paradoxical power), stopping in a doorway (the decision point), starting to
  pack (an ultimatum by body).
- **The strong are still and quiet; the weak fidget and shout.** Danger is played by everyone's tension around the
  dangerous one. Violence arrives without wind-up: no menacing pauses, no slow turns.
- **Wear accumulates:** a character worn down across a story carries it cumulatively (greyer, heavier, slower) and
  never resets between clips or episodes.
- Model limits: at most 4 people per Premium clip; on Basic name exactly who may appear ("`<Subject 1>` and
  `<Subject 2>` are the only people anywhere in the video") or Basic adds extras. Say who speaks and that every other
  mouth stays closed.

# Part III: quality control

## 13. Catalogue of bad acting

| # | Symptom | Looks like | Fix in the prompt |
|---|---|---|---|
| 1 | Indication (mugging) | brows arched, grimaces | remove the face from the task; write the objective and give the hands business |
| 2 | Playing the result | plays the ending from second one | write only what the character knows now |
| 3 | Waiting for the cue | blank face while the partner speaks | the reaction starts mid-line of the partner |
| 4 | One tactic | all shouting or all whining | mark the beats; a new tactic verb for each |
| 5 | Gesture illustration | "big" with arms spread | the gesture comes before the thought, contradicts the words, or is absent |
| 6 | Free emotion | tears or rage with no build-up | a ladder: restraint, then break; emotion must cost something |
| 7 | Body false to biography | a thug with a dancer's posture | set centre of gravity, tempo, wear |
| 8 | Speech too clean | a street character in polished periods | interruptions, repeats (within each model's line rules) |
| 9 | Threat signalling | menacing pauses, squints, slow turns | the threat is ordinary; violence without wind-up |
| 10 | Synchronised ensemble | everyone reacts at once | stagger in a wave, vary strength |
| 11 | Dead pauses | silence where nothing happens | fill with assessment or business, or cut |
| 12 | Emotional reset | instantly recovers after a strong event | states have inertia; the trail carries into the next beat |
| 13 | Commenting the role | the performance winks at the viewer | full belief; comedy is played dead serious |
| 14 | Close-up overload | busy face in a close-up | the tighter the shot, the less movement: only eyes and thought |
| 15 | Dead eyes | frozen stare, no blinks, glassy | section 7 in full |
| 16 | Glowing eyes (Premium) | eyes light up on strong feeling | remove extreme words; "Normal human eyes, no glowing eyes." |
| 17 | Grin in every shot (Basic) | the same smile throughout | vary per shot; smile budget (`references/montage/pixio-emotion-acting.md`) |

Reading a render: watch with the sound off for the body, then with it on for the speech; the cheapest machine checks are
`POST /api/v1/director/videos/edit/analyze` (`"checks": ["lipsync"]`, the minimum price) and
`POST /api/v1/director/understand/video` (`"measure_only": true`, the minimum price); both are billed jobs you poll.
Fix one clip with `POST /api/v1/director/videos/film/{id}/redo` and a corrected prompt, patching only the acting lines
(`references/montage/pixio-prompt-director.md` section 17).

## 14. The performance scale

- **0 Mannequin:** text delivered, no behaviour.
- **1 Declaimer:** "expressive" text, indicated emotion, illustrating body.
- **2 Diligent:** an objective can be guessed; one tactic, late reactions, empty pauses.
- **3 Craftsman:** objective and beats, listens, the body makes sense; no subtext, no surprise, no inertia.
- **4 Alive:** continuous behaviour, contrasting tactics, subtext against the text, status in the body, reactions
  ahead of lines, at least one unexpected-but-true choice.
- **5 Magnet:** all of 4 plus paradox: funny and frightening, cruel and charming. **Two truths at once** (helps and
  hates it; apologises and defends). One clean emotion reads as synthetic in a close-up.

Aim hero shots at 4+. A paragraph that scores 2 or less is rewritten before it ships.

## 15. Pre-send checklist

- [ ] Every character in frame has an objective as a verb aimed at a partner.
- [ ] Obstacle and stakes are real.
- [ ] Beats: 2-4 per scene, 1-2 per 15 s clip, at most one shift per shot, each visible and caused.
- [ ] Reactions start before the partner's line ends; assessment moments present; listeners' mouths closed.
- [ ] Every character has business; interrupted action used on purpose.
- [ ] Distances in metres, changes motivated; status in the body.
- [ ] Tics have triggers; the mask has its crack.
- [ ] Eye life written: gaze targets, blink quality, eyes lead the head.
- [ ] Voice line reused word for word for speakers; none for silent characters.
- [ ] States, not transitions; no wardrobe, camera, light or colour in the acting; no pictured-face features.
- [ ] Ensemble staggered; strong still, weak fidgety.
- [ ] Within the model's budget; no extreme emotion words; scores 4+.
- [ ] Drafted on `video_model: "montage-basic"`; prompt passed `POST /api/v1/director/prompts/check`.

# Part IV: worked example

## 16. Master profile (invented character; he has a reference picture)

```text
Character acting as VIKTOR. Early sixties, a retired night-shift taxi driver and former amateur boxer; a heavy, thick-necked build gone soft at the middle, knuckles thickened from old fights; sits and stands with a low, grounded centre of gravity, weight always on the whole foot. One engine: decades of waiting for fares, for rounds, for trouble have made patience his weapon. Vocal profile: a low, hoarse, unhurried baritone with a working-class rasp, short flat sentences, dropping slower and quieter the more serious things get; he never speeds up. Habits and tics: rolls an old coin across his knuckles when sizing a situation up; one slow, audible breath through the nose before he says no; when someone lies in front of him he goes completely still and lets the silence press; his default face is a heavy-lidded, bored mask hiding total attention. Eye life: hooded eyes, slow deliberate blinks, constant quiet scanning of mirrors, hands and exits; the gaze settles on a speaker a beat before his head turns; catchlights low but alive. Walk: a heavy, rolling "old boxer's walk", short economical steps, shoulders level, hands loose and ready, never hurrying. However, when someone raises a hand near him, the sleepy mask vanishes in half a second: chin down, hands halfway up, feet in the old stance; then he catches himself and folds it away, embarrassed. His face only truly softens for stray dogs, which he feeds from his coat pocket.
```

Voice line: "a sixty-year-old ex-boxer and night-cab driver with a working-class city accent; a low, hoarse,
unhurried baritone; short flat sentences with long comfortable pauses; calm and faintly amused, going quieter, never
louder, as things get serious."

## 17. Scene adaptation

Scene: Viktor sits in his parked cab at night; a nervous young passenger in the back seat is lying about having the
fare. The walk is impossible (seated), so its energy goes into stillness and the coin; the tics keep their
triggers; the eyes re-target to the mirror, the hands and the door lock; the beat changes are visible (coin stops,
silence, quieter voice, softening).

**Premium** (`[Shot list]` excerpt; Viktor defined from `@Image1`, the passenger from `@Image2`):
```text
Shot 1 (0-4s): [Medium close-up on Viktor, 29° lens, fixed shot] Viktor sits motionless, heavy and grounded, watching the passenger in the rear-view mirror instead of turning; his hooded eyes move slowly between the mirror, the passenger's hands and the door lock, blinks rare and deliberate. The old coin walks across his knuckles on the seat rest. <rain ticking on the roof>.
Hard cut.
Shot 2 (4-7s): [Close-up on the mirror, Viktor's eyes in it, fixed shot] As the passenger's story falls apart, the coin stops mid-roll. Viktor lets the silence sit, then takes one slow, audible breath through the nose. Silent.
Hard cut.
Shot 3 (7-12s): [Medium close-up on Viktor, front-on, fixed shot] Viktor says in a low, hoarse, unhurried baritone, flatter and quieter than before: {We wait till you find it.} Realistic lip articulation, no head turns while speaking. The passenger keeps his mouth closed.
Hard cut.
Shot 4 (12-15s): [Close-up, slow push-in] The kid's chin trembles; Viktor's mask eases a fraction: a long exhale, a slow blink, the coin rolling again. Silent.
```

**Basic** (shots of `detailed_description`; `<Subject 1>` is Viktor in `<Picture 1>`, `<Subject 2>` the passenger):
```text
[Shot 1] ... <Subject 1> sits motionless in the driver's seat, watching <Subject 2> in the rear-view mirror without turning; his eyes move slowly from the mirror to the passenger's hands and back, blinks slow and rare, an old coin walking across his knuckles. The camera holds a static shot.
[Shot 2] At 00:04.000, the camera cuts to a close-up of the mirror: the coin stops mid-roll; <Subject 1> breathes in slowly through his nose and stays silent. Static shot.
[Shot 3] At 00:07.000, the camera cuts to a medium close-up of <Subject 1>, front-on. <Subject 2> keeps his mouth closed; nobody else speaks. <Subject 1> (S1), in a low, hoarse, unhurried male voice, says: <d>[English] We wait till you find it.</d> Static camera, holding.
[Shot 4] At 00:12.000, the camera pushes in slowly with small amplitude on <Subject 1>: he breathes out, blinks slowly, and the coin starts rolling again.
```

Same engine, same tics with triggers, same voice line; the budget changed, not the man. The line is six words in a
5 s shot: inside Premium's 1.6 words/s plus 1 s of silence (a first draft with eight words in 4 s drew a checker
WARN). Run `POST /api/v1/director/prompts/check` on each version.

# Final axioms

1. Acting is behaviour under pressure, not a demonstration of feelings.
2. Listening matters more than speaking; reacting more than declaiming.
3. Emotion is the result of a struggle won or lost, and it is expensive.
4. When text and body conflict, the viewer believes the body.
5. The strong are still and quiet; the weak fuss and shout. Exceptions are events.
6. Every tic needs a trigger; every mask needs a crack.
7. Every scene is somebody's defeat. If nobody lost, there was no scene.
8. Subtext is not shown; it fails to be hidden.
9. States, not transitions: the model films what is, not what becomes.
10. When in doubt, cut. Less acting, more truth.

## Related skills

`references/montage/pixio-emotion-acting.md`, `references/montage/pixio-dialogue-voices.md`, `references/montage/pixio-prompt-director.md`, `references/montage/pixio-characters.md`, `references/montage/pixio-music-video.md`,
`references/montage/pixio-comedy.md`, `references/montage/pixio-horror.md`, `references/montage/pixio-action-fights.md`, `references/montage/montage-basic-prompting.md`, `references/montage/montage-premium-prompting.md`.

