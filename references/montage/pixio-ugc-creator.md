---
name: pixio-ugc-creator
description: How to make creator-style (UGC) videos with Montage (Pixio's Director API) - talking-to-camera ads, reviews, unboxings, tutorials and reactions that look filmed on a phone - casting a consistent creator, real-looking settings, handheld framing, writing a script that fits the seconds, getting the exact words lip-synced (native dialogue, Audio Lock with a recording or a generated voiceover, lip fix), captions, and several creators or variants. Use whenever a person speaks to the camera about a product, app or service. Not for the ad funnel and the variation table (that is pixio-ads), polished product films (pixio-product-ads) or brand stories (pixio-brand-promo).
---

# UGC creator videos

UGC works because it looks like a real person filmed it on their phone. It fails when it looks like an ad
pretending to be a person: studio light, perfect skin, a slogan read in a radio voice, a label held upside down.
`references/montage/pixio-ads.md` gives the basic 3-beat structure; this skill is the craft of making it believable and making the
lips say the exact words.

Shared ad basics (the 2-second hook, packaging, graphics, the variation table, spending) are in `references/montage/pixio-ads.md`.

Base URL `$BASE` (`https://beta.pixio.myapps.ai`), key in `Authorization: Bearer $PIXIO_API_KEY`. Every render and
tool call is a billed job you poll with `GET /api/v1/director/jobs/{id}`.

## House rules

- **Test on Basic.** Every test, draft or trial render uses `video_model: "montage-basic"` (also the default when
  `video_model` is left out). Premium or Ultra only when the user asks for it and has seen the quote
  (`?check=true`, `credits.quoted`).
- **Use every picture the user supplied.** Never drop a reference picture, not even for speed or a fight. Product,
  creator and room pictures are all references.
- **No film grain.** Keep `grain` at 0 in `finish`; never write grain, noise or film-stock words in a prompt or `style`.
  A "phone video look" is framing and light, not noise.
- **Never put an API key in a prompt, a log, a URL or a shared file.** Examples use `$BASE` and `$PIXIO_API_KEY`.

Captions are drawn by packaging or graphics, never by the video model.

**Honesty rule:** an AI creator is a performer in an ad, not a real customer. Never write a script that claims a
real person's experience ("I'm a nurse and I've used it for 3 years") or invent ratings, results or before/after
numbers. Benefits come from the brand's facts (`references/montage/pixio-brand-promo.md`, section 4).

## 1. Decision rules

| Need | Route |
|---|---|
| One creator, one short line, 5-15 s | `/api/v1/director/videos/reference`; Basic native dialogue `(S1) <d>...</d>` |
| Exact script, any voice, perfect lip-sync | make the audio first (customer recording or `POST /api/v1/director/audio/voiceover`), then `/api/v1/director/videos/reference` with it in `audios` and `audio_lock=1` (advanced) |
| 20-60 s review with several cuts | `/api/v1/director/videos/film`, `duration` 30-60, `cast` binding the creator's picture and voice sample |
| Lips drifted in one part | `POST /api/v1/director/videos/lipfix` on that 4-14 s window (one Basic render, at least 16 credits) |
| Premium render whose lips don't match a fixed track | `POST /api/v1/director/videos/relip` (only the mouth and jaw change; priced per second of video, ask first) |
| Several creators | one picture per creator; one speaker per shot; or one video per creator (section 8) |

## 2. Cast the creator once

1. **Design:** `/api/v1/director/images/text`, 2:3 or 9:16, 3-4 candidates in an ordinary setting, not a catalogue studio:
   "A woman in her early thirties with shoulder-length dark curly hair, a faded olive sweatshirt, sitting on an
   unmade bed in a small bedroom, morning window light, natural skin with visible pores, no makeup, phone-camera
   framing at arm's length." One seed per candidate; the human picks.
2. **Lock the face:** `/api/v1/director/images/reference` with the pick as the only picture, `megapixels=8`,
   `image_model=high`: a close portrait, mouth closed, plain wall. Don't describe her face; write "exactly her
   face, features and skin from `<Picture 1>`".
3. **Room plate:** `/api/v1/director/images/text` starting with "No people and no animals." then the room, its light and a few
   lived-in details (a mug, a charger cable, a plant). Or the customer's own room photo.
4. Keep these files and reuse them in every video with this creator. If the customer sent a creator photo, it is
   the face reference; never swap it for a designed one.

## 3. Authentic setting and camera

- **Places:** bedroom, bathroom mirror, kitchen counter, car (parked), desk, gym corner, walking on a pavement.
  Real clutter in the background, slightly out of focus.
- **Light:** one practical source: a window, a ring of daylight from the side, bathroom overhead light, a desk
  lamp. A little overexposed is fine. Never "studio lighting".
- **Framing:** selfie medium close-up at arm's length, eyes near the top third, slight angle from above; or the
  phone propped on a surface (static, slightly low).
- **Movement:** Basic camera words only: "Shake Slightly", "Static Shot", "The camera pushes in with small amplitude".
  Premium: "handheld selfie, slight sway".
- **Faces need pixels:** dialogue only in medium or close shots (face at least about 13% of the frame height).
- **Wardrobe:** casual, matching the room and the product's audience; the same outfit word for word in every shot.

## 4. The script

Budget about **2.6 words per second** plus about 1 s of silence after a line. A 15 s video holds about 25-30
spoken words in total, split across 2-3 lines.

Formats that work (pick one per video):
- **Problem -> find -> proof:** "My phone died every afternoon." / shows the product / "Now it's at forty percent
  at night."
- **Unboxing:** one line of anticipation, the reveal, one honest reaction.
- **Tutorial in 3 steps:** one step per shot, hands close-up; the creator speaks only the first and last line.
- **Review:** holds it up, one specific pro, uses it, one closing line.
- **Reaction / POV:** the creator reacts to the result; the hook is the reaction itself.
- **"Three things":** one line per thing, numbered with graphics later, not in the speech.

Write like people talk: short plain sentences, contractions, one idea per line, no slogans, no brand name in every
line (once is enough). Example, 12 s, three lines:
```
(0-4 s)  "Okay, I didn't think a sponge could change my mornings."
(4-9 s)  [no speech: she wipes the pan once, it's clean]
(9-12 s) "Yeah. I'm buying two."
```

## 5. Getting the exact words on the lips

**A. Native Basic dialogue (simplest).** In the reference format, the line sits in the shot:
`Nobody else speaks. <Subject 1> (S1), in a relaxed, slightly amused young female voice, says: <d>[English]
Okay, I didn't think a sponge could change my mornings.</d> The camera shakes slightly.` Describe the voice once at
the first line. After `</d>` write only camera or action. To keep the same voice across videos, upload a clean
5-10 s sample in `audios` and bind it: `<Audio 1> is the voice-timbre reference for <Subject 1> (S1).`

**B. Audio Lock (exact words, exact timing).** Make the speech first, then render the picture to it:
```bash
# 1) a voiceover (billed like finishing, at least 16 credits; or use the customer's own recording)
curl -X POST "$BASE/api/v1/director/audio/voiceover" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "Okay, I did not think a sponge could change my mornings. Yeah. I am buying two.", "voice": "af_bella", "pad_s": 0.3}'
# poll GET /api/v1/director/jobs/{id}; when done, download output.url (or pass output.assetPath as the audio)
# 2) the picture, locked to that audio: quote first (free), then send again without ?check=true
curl -X POST "$BASE/api/v1/director/videos/reference?check=true" -H "Authorization: Bearer $PIXIO_API_KEY" \
  -F video_model=montage-basic -F aspect=9:16 -F duration=12 \
  -F "images=@maya_face.png" -F "images=@sponge.png" -F "images=@kitchen.png" \
  -F "audios=@line.wav" -F audio_lock=1 -F "prompt=<ugc_prompt.txt"
```
In the prompt: start the summary with `[reference generation + audio reuse]` and put
`<Audio 1>: fully_copy - <Audio 1> is reused 1:1 as the target video's complete final audio track.` in
`retention_analysis`. Reference audio is 2-15 s; shorter audio is padded with silence, longer is cut. For a clone
of a real person's voice send `voice_sample` (an upload) to the voiceover, only with that person's consent.

**C. Repair afterwards.** `POST /api/v1/director/videos/lipfix` with `job_id`, `start_s`, `end_s` (a 4-14 s window) re-makes
just that window on Montage Basic against its own vocal; everything else stays. `POST /api/v1/director/videos/relip`
re-mouths a whole video to its audio (only the mouth and jaw change; priced per second, tell the human and ask).
More in `references/montage/pixio-lipsync-fixing.md`.

## 6. Prompt shape (Basic, 9:16, 12 s, 3 shots)

```
subject_definitions:
<Subject 1> is Maya, the woman in <Picture 1>, in a faded olive sweatshirt, hair loose.
<Subject 2> is the yellow kitchen sponge in <Picture 2>, plain with no text on it, the size of her palm.
<Subject 3> is the small kitchen in <Picture 3>.
summary:
[reference generation] Maya films herself in <Subject 3>, tells the lens one line, cleans a pan once with
<Subject 2>, and closes with a short reaction.
retention_analysis: ...
detailed_description:
Live-action, vertical phone-video look, ordinary morning window light, natural colour. [Shot 1] Selfie medium
close-up at arm's length ... Nobody else speaks. <Subject 1> (S1), in a relaxed, amused young female voice, says:
<d>[English] Okay, I didn't think a sponge could change my mornings.</d> The camera shakes slightly.
[Shot 2] At 00:04.000, the camera cuts to a close-up from above: her hand wipes a greasy pan once with
<Subject 2>; the pan is clean where it passed. Static Shot. [Shot 3] At 00:09.000, ...
overall_soundscape: Shot 1: her voice, a fridge hum. Shot 2: a soft scrub on metal. Shot 3: her voice, room tone.
non_diegetic_music: N/A
```
Write `N/A` for music: the customer's track or a bed is added in packaging. Premium UGC uses the Premium block format and
Commercials rules in `references/montage/montage-premium-prompting.md` (one spoken line in the first 3-4 s, `{line}` dialogue syntax, "handheld
selfie, slight sway").

Bad vs good:
- Bad: "A beautiful influencer in a perfect studio enthusiastically presents the amazing BRANDNAME sponge with
  text 'BEST SPONGE EVER' on screen."
- Good: "Maya, the woman in `<Picture 1>`, holds the sponge in `<Picture 2>` up to the lens in her small kitchen,
  morning window light from the left, and says one line."

## 7. Captions and finishing

Captions are part of the format: most people watch muted. On the render or afterwards:
```json
{"job_id": "JOB_ID", "brand_id": "BRAND_ID", "captions": "auto", "caption_style": "pop", "caption_words": 3,
 "caption_position": "center", "caption_uppercase": true, "caption_highlight_color": "#FFD400",
 "end_card_s": 2, "cta": "Link in bio", "formats": ["1:1", "4:5"]}
```
to `POST /api/v1/director/videos/package` (or as `package` on the render). `captions: "auto"` transcribes the speech (or the
voiceover). Or burn word-by-word captions plus a hook text with `POST /api/v1/director/videos/graphics` (`captions: true`,
`safe_area: "all"`, faces never covered). Use one or the other, not both. Keep the end card short (0-2 s) on UGC:
a long branded card breaks the illusion. Loudness `lufs: -14` for social.

## 8. Several creators and variants

- **Duo video:** two creators, each with their own picture and their own voice sample; speaker IDs `(S1)`, `(S2)`
  in order of first speech; one speaker per shot; the other "keeps her mouth closed". Never "two people who look
  like `<Picture 1>`": that makes twins.
- **Same script, different creators:** keep the shot list, timings, product picture slot and package byte for byte;
  swap only the creator picture, wardrobe, room and voice. Name the files clearly (ugc-sponge-maya, ugc-sponge-tom).
- **Same creator, different hooks:** change only the first line and the first shot.
- Quote every variant with `?check=true` (free), show the total, ask once. Test all variants on Basic; move only winners to Premium.

## Checklist

- No claims, results or credentials the brand can't back; the AI creator never poses as a real customer.
- Creator, product and room pictures all used, creator face locked from one picture.
- Real room, one practical light, selfie framing, casual wardrobe written the same in every shot.
- Script at about 2.6 words a second with pauses; one line per shot; dialogue only on medium or close faces.
- Exact words: Audio Lock with a recording or `/api/v1/director/audio/voiceover`; lipfix for a drifted window.
- Captions on (package or graphics, not both), centred out of the platform UI; short end card.
- Basic test approved; `credits.quoted` shown; no grain anywhere.

