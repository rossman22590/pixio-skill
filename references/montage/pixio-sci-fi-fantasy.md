---
name: pixio-sci-fi-fantasy
description: How to make science fiction and fantasy videos with Montage (Pixio's Director API) - invented worlds, creatures, magic and VFX beats, scale shots, keeping invented props, ships and creatures identical across clips with reference pictures, and what the models struggle with (small tech props, flying drones, screens and readouts, swarms, macro creatures) with workarounds. Use whenever someone asks for sci-fi, space, cyberpunk, fantasy, magic, dragons, monsters, robots or any invented world, or you plan, write, check or fix such a /api/v1/director/videos/film, /api/v1/director/videos/reference or /api/v1/director/images/* job. Not for the prompt format itself (that is `references/montage/montage-basic-prompting.md` for Basic and `references/montage/montage-premium-prompting.md` for Premium).
---

# Sci-fi and fantasy on Montage

Invented worlds fail in one predictable way: **the model draws the most generic version of every word.** "A
spaceship", "a dragon", "a magic staff" come out as a different stock object in every shot. Everything invented
must be (1) described so it can only be one thing and (2) locked with its own reference picture, used in every
clip it appears in. Prompt FORMAT lives in `references/montage/montage-basic-prompting.md` (Basic) and `references/montage/montage-premium-prompting.md` (Premium).

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
- Show the quote (`?check=true`) and wait for a yes before any Premium or Ultra render.
- **Never name famous franchises, films, studios or artists** as a style shortcut (it pulls in their designs and
  actors); describe the look in your own words.

## Decision rules (read first)

| need | do |
|---|---|
| anything recurring that does not exist (a creature, ship, weapon, robot, costume, alien place) | a reference picture first (`POST /api/v1/director/images/text`), checked, then used in every clip that shows it |
| tests, drafts, dialogue scenes, slow world-building shots | Montage Basic (`video_model: "montage-basic"`, the default) |
| big creature action, chases, sweeping camera moves, a force-push or impact beat | Montage Premium (`video_model: "montage-premium"`): it excels at action and big camera moves; quote and a yes first |
| a mix | `tier_mix=auto` or `manual` + `basic_clips` on `/api/v1/director/videos/film`; `?check=true` quotes it for free |
| on-screen text: HUD readouts, alien signs, ship names, holographic numbers | never in the prompt; add real text afterwards with `POST /api/v1/director/videos/graphics` or `package` |
| a small gadget the story can't lose (a key card, a drone, a phone) | redesign it big and physical, or add it after with Montage Edit (`POST /api/v1/director/videos/edit`); see section 5 |
| an animated or painted world | `realism: 0`, the style stated in every clip; see `references/montage/pixio-anime-styles.md` / `references/montage/pixio-3d-animation.md` |

## 1. Build the world once

- **One style sentence for the whole film,** the same words in every clip: "Live-action science fiction, a worn
  industrial orbital station, cold white work lights and amber warning lamps, a clean digital cinema image." Put
  it in `style` with `idea`, or as the first sentence of every `detailed_description`.
- **A location picture per place** (wide), plus a detail picture when the layout matters. Lock the geography in
  words every time you are in that room: "the round airlock door on the left, the long window of stars on the
  right, cables along the ceiling." Keep the camera on one side (180-degree rule).
- **Tech is big, physical and mechanical:** a hatch with a wheel, a lever wall, a cargo arm, a reactor the size of
  a room. It renders cleanly and reads at film scale. Screens, tablets and handheld gadgets render badly.
- **Magic is light and matter, not abstraction:** "pale blue light pulses from her palms", "frost spreads across
  the stone floor from his staff", "embers lift from the pages". Say where the light comes from and what it touches.
- **Props and places use a style line with nobody in it.** A shared style line with characters ("expressive
  creatures") put random characters into prop and place pictures. For those, write "an empty scene with nobody in it".

## 2. Creatures

- **Describe the build so it can only be one thing:** size against something known, body plan, skin or scale
  texture, colour, number of limbs and eyes, how it moves. "A creature the height of a horse, six thin jointed legs
  like a crane fly's, a smooth grey-blue shell like wet slate, no eyes, a long soft trunk it sweeps over the ground."
- **Reference picture:** `POST /api/v1/director/images/text`, plain grey background, full body, side or three-quarter view,
  neutral pose (reference poses get copied into the video), no text, no rim light, and never the word "studio"
  (it puts a photo studio in frame). Check it and regenerate with new seeds until it
  is right; pictures take seconds, a clip takes minutes.
- **One creature = one subject = one picture.** Several of the same species: one picture plus clear differences
  in words ("the smaller one has a cracked shell"), or each its own picture. Never "three creatures like
  `<Picture 4>`": you get identical clones.
- **On Premium,** bind it as design only: "`@Image2` is the stone troll, a giant of grey rock: take only its
  design." Add "Natural limb anatomy; real-world physics" and keep it moving heavily if it is big.
- **Creatures that should not talk need no mouth movement words,** and objects that should not come alive need
  "an ordinary inanimate object with no face, no eyes and no mouth" in their subject line (animation styles give
  props faces otherwise).
- **Creature vs person:** the fight rules hold. One move per shot, contact on a named body part, a reaction with a
  destination, both in frame, never a held clinch. Two takes per action clip. Details in `references/montage/pixio-action-fights.md``.
- **Small creatures in macro are hard;** so are swarms and herds (crowds of horses or people come out as clones).
  Show a swarm as a dark moving cloud in a wide shot, or one creature close.

## 3. VFX beats

- **An effect gets its own shot.** Liquid, magic, shockwaves and transformations never share a shot with a
  strike: the goo melted into the punch in testing. Shot A: the spell. Shot B: what it hits.
- **Say what does NOT glow.** "Blue light only from her palms." On Premium add "Normal human eyes, no glowing
  eyes" (strong emotion words make eyes glow on Premium).
- **Transformations:** start state, then end state, in two shots with a cut, not a morph in one shot.
- **Rigid things stay rigid:** "the beam stays rigid", "metal plates never bend or melt". Name it for robots,
  mechs, armour and ships.
- **Slow motion only once,** and only on Premium where you can say "slow motion only in Shot 3". On Basic no
  slow-motion cues in action at all: it already plays action slower than real.
- **Explosions and debris:** a wide, locked-off shot, the cause in the same shot ("the fuel tank bursts into a
  ball of orange flame; burning panels fall onto the deck"). The people react in the next shot, close.

## 4. Scale shots

- **Scale needs a known thing in frame:** a person, a door, a tree beside the giant thing. "A tiny figure in a red
  coat walks along the base of the hull, which rises out of frame."
- **People in scale shots are seen from behind or in silhouette.** A named person needs a face of at least ~13 %
  of the frame height to stay recognisable; far faces smear. Do the face in the next shot, close.
- **Basic camera words for scale** (trained vocabulary only): "The camera pulls out with large amplitude at slow
  speed", "Tilt Up", "Pedestal Up", "Arc Shot", "low angle". Not "crane", "aerial", "drone shot", "orbit".
  On Premium "crane up", "aerial" and a slow orbit (give the arc, "a 90-degree arc") are fine.
- **One big move per shot,** with a start and an end: "pushes in from the wide valley to the castle gate".
- Space: stars, planets and nebulae as a lit backdrop through a window or behind a ship are reliable; tiny ships
  dogfighting in deep space are not (small, fast, numerous). Make one ship big in frame.

## 5. What the models struggle with, and workarounds

| struggles | why | workaround |
|---|---|---|
| small flying drones | a contraband drone became a silver package on the ground | a craft at least the size of a person, from a reference picture; or a light that moves across the sky; or add it to a finished window with Montage Edit ("Add a small black drone hovering above the car") |
| phones, tablets, laptops, wrist gadgets, screens | small and full of text; read as silly | big physical controls (levers, a glowing panel the size of a door); faces lit by an unseen screen's glow |
| HUDs, readouts, signs, ship names, runes with meaning | text garbles | no text in prompts or reference pictures; overlay real text with `POST /api/v1/director/videos/graphics` (text, badges, arrows) |
| guns firing, lasers hitting precise spots | fast and small | one shot of the muzzle flash, one shot of the impact on a named spot |
| hand business: loading, typing, lighting, small tools near the face | hands melt | wider shot, or cut to the result |
| liquids splashing, cars flying | physics | keep them off camera or in one wide shot; aftermath close |
| crowds and armies | clones and posing | silhouettes, backs, raised spears against the sky; every face visible needs "every one a clearly different person" and medium-wide framing |
| a prop that differs between pictures | the location picture shows its own version | match the prop in the location picture to the prop picture, or leave it out of the location picture |

## 6. Keeping invented things identical across clips

- **The same pictures, in the same order, in every clip** (`<Picture 1>` is always the hero). Each clip can have its
  own set with `clip_images` (up to 9 pictures on Basic, up to 30 uploads on Premium / Ultra): the cast in every clip,
  plus that clip's place, creature and props. On Premium 6-9 pictures per clip work best.
- **The same subject words in every clip,** pasted word for word. Define each thing once per clip, then use its
  label; never re-describe a pictured face in words.
- **Costume and armour pieces stay put:** "his crossbow slung on his back", "the sword sheathed on her left hip".
  Without a place a prop wanders into the hands.
- **Damage only accumulates:** the scorch mark on the hull from clip 2 is still there in clip 4.
- **One hairstyle per person** across all their pictures, or the model mixes them. One state per picture: a clean suit
  and a scorched suit are two pictures, the second made by editing only the damage onto the first.
- **Storyboard first** for long builds: `storyboard=true` stops after writing with one still per shot;
  check every creature and prop on the contact sheet before any full video render.

## 7. Worked example: "Salt Line" (60 s, 4 clips)

**One line:** a salvage pilot on a dead ocean world has to lure a blind shell-creature away from her stranded
crawler before the tide of salt dust rolls in. References: the pilot (waist-up, orange pressure suit, helmet off),
the crawler (a six-wheeled rust-red tracked vehicle the size of a bus, side view, empty scene), the creature (from
section 2's description, full body, side view), the salt flats (wide, empty), a flare (a thick red flare tube,
plain, no text).

Clip 2 opening shots on Basic (inside the official six-section format):

```text
<Subject 3> is the shell-creature in <Picture 3>, the height of a horse, six thin jointed legs, a smooth grey-blue shell like wet slate, no eyes, a long soft trunk; an animal with no face and no mouth.
...
The target video is live-action science fiction on a white salt desert under a hazy pale sun, a clean digital cinema image. Exactly one person appears in this clip: <Subject 1>; <Subject 3> is the only creature anywhere in the video.
[Shot 1] An extreme wide shot of the empty salt flats: <Subject 2> sits tilted on its side in the middle distance, and <Subject 3> walks slowly past it, its trunk sweeping the ground. The camera pulls out with large amplitude at slow speed.
[Shot 2] At 00:04.000, the camera cuts to a medium shot of <Subject 1> crouched behind the crawler's rear wheel, her face lit by the white glare off the salt; she slowly lifts the flare from <Picture 5>. Static Shot.
```

Clip 3's chase on Premium (write it in full with `references/montage/montage-premium-prompting.md`):

```text
[Assets] @Image1 is Ines, a woman in an orange pressure suit: take only her face, hair and suit, not the pose or background. @Image2 is the shell-creature: take only its design. @Image3 is the salt flats: take only the place. @Image4 is the red flare: take only its shape. Define the woman in the orange suit in @Image1 as Ines.
[Summary] Ines runs across the salt holding a burning flare and the blind creature follows the light; live-action science fiction, one backward tracking path.
[Shot list]
Shot 1 (0-4s): [Full shot, backward tracking] Ines runs toward camera, the flare in her right hand spitting red light and smoke. <boots crunching on salt>, <the flare hissing>.
Hard cut.
Shot 2 (4-8s): [Wide shot, low angle, locked-off] the creature turns its trunk toward the red light and strides after her on six jointed legs. <a deep clicking from the shell>.
[Continuity] Ines looks exactly like @Image1 in every shot; the flare stays in her right hand. The creature has no eyes and no mouth.
[Sound] Footsteps, the flare and the creature close; wind low. No BGM.
[Constraints] Keep it subtitle-free. Do not generate any on-screen text, logos or watermarks. No duplicate or twin characters; one creature only. Natural limb anatomy; real-world physics. Normal human eyes, no glowing eyes.
```

## 8. Requests

Make and check a creature picture (repeat with new seeds until it is right; poll the job, then
`GET /api/v1/director/jobs/{id}/image`):

```bash
curl -X POST "$BASE/api/v1/director/images/text" -H "Authorization: Bearer $PIXIO_API_KEY" -H "Content-Type: application/json"  \
  -d '{"prompt": "A creature the height of a horse with six thin jointed legs like a crane fly, a smooth grey-blue shell like wet slate, no eyes, a long soft trunk resting on the ground; full body, side view, neutral standing pose, plain grey background, even soft light from the front, an empty scene with nobody in it, no text", "aspect": "16:9", "megapixels": 4}'
```

The film, your own clips, per-clip pictures, the chase clip on Premium (free quote first; drop `?check=true` to
start it once the user has said yes):

```bash
curl -X POST "$BASE/api/v1/director/videos/film?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-premium -F duration=60 -F "clips=<clips.json" \
  -F images=@ines.png -F images=@crawler.png -F images=@creature.png -F images=@salt_flats.png -F images=@flare.png \
  -F 'clip_images=[[1,2,4],[1,2,3,4,5],[1,3,4,5],[1,2,4]]' \
  -F tier_mix=manual -F basic_clips='[1, 2, 4]' -F seed=5150
```

From an idea with a storyboard stop, all Basic: `-F video_model=montage-basic -F storyboard=true -F speed=draft`, plus
`idea`, `style`, `images` and `references` (a JSON list saying what each picture shows).

## 9. After the render

- One frame per second in action: the creature changing shape or gaining eyes, a second creature, the prop in the
  wrong hand, a ship that redesigned itself, glowing eyes, text that crept in.
- A wrong object in one stretch: Montage Edit on a 1-15 s window (`references/montage/montage-edit-prompting.md`), not a re-render.
- One clip wrong: `POST /api/v1/director/videos/film/{id}/redo` with `{"clip": 3, "seed": 777}` and optionally a corrected
  `prompt`, new `images` and `clip_images`; a redo keeps the clip's tier.

## Checklist

- [ ] Every invented person, creature, prop, vehicle and place has a checked reference picture (no text, neutral pose)
- [ ] Every invented thing described so it can only be one thing; the same words in every clip
- [ ] One style sentence for the whole film; no famous franchise, studio or artist names; no grain words
- [ ] No small gadgets, drones, screens or text in prompts; text added with graphics or packaging
- [ ] Effects in their own shots; "what does not glow" stated; rigid things stay rigid
- [ ] Scale shots have a known object for size; far people from behind; the faces in the next, closer shot
- [ ] Basic camera words only from the trained vocabulary; Premium big moves one per shot
- [ ] Tests on Montage Basic; the `?check=true` quote shown and a yes before Premium; `promptCheck` has no ERROR
