# Walkthrough media

Pilot leg `01-street-to-deli` (illustrative concept building, not a client job).

| Item | Value |
|---|---|
| Start still | Higgsfield job 392d1cc2-c2cb-48d2-8815-b501a046c7c4 (gpt_image_2_6, 2k, high) |
| End still | Higgsfield job 1a6e4b11-a8bb-4636-aa85-69e4db23f71f (gpt_image_2_6, 2k, high, ref: start still) |
| Video | Higgsfield job a7f89f7c-88d1-433b-b99f-8d9aaee65770, kling3_0, 4k, 10 s, sound off, start_image + end_image |
| Master | 3828x2164, 24 fps, 241 frames |
| Credits | 60 (video) + 11 (4 stills) + 8.25 (3 panels) |
| Known issue | Single entry door becomes a double door at ~5.4-6.6 s |

Encodes: `desktop.mp4` 1920x1080 CRF 26, `phone.mp4` 720x1280 centered crop CRF 26; both 24 fps, GOP 6, no B-frames, faststart.
`manifest.json` holds the delivered frame count. The host must answer HTTP Range requests (206) or seeking fails; the player then falls back to the start/end posters.

## Item: walk-in cooler (pull-out + spin)
| Item | Value |
|---|---|
| Product still | job e405a7a7-8850-4055-bf6d-d024ba04dc72 (gpt_image_2_6, 2k, high), 2.75 credits |
| Turntable | job 29b99a53-e262-4d03-a6c3-903d89c67ef7, kling3_0 pro, 5 s, start_image only, 8.75 credits |
| Delivered | 121 frames; desktop 1920x1080, phone 4:3.4 center crop |

## Full route (Nov 9)
Films (Kling 3.0, 4K master, first+last frame): 01 street→deli (10 s), 02 deli→back room, 03 back room→basement, 04 basement→roof (5 s each).
Films ship as `desktop.mp4` 2560x1440 and `phone.mp4` 1080x1920, GOP 6, no B-frames.
Spins (Kling 3.0 pro, 5 s, start frame only) ship as `d.pack` / `p.pack`: 61 WebP frames in one file
(uint32 count, uint32 lengths[count], bytes). Loaded with one request and drawn from memory, so spinning never seeks.
Known: 04 rises from basement to roof with a vertical wipe rather than a true camera climb.
Rebuild counts with the manifest script after replacing media; `manifest.json` `script` defines the order.
