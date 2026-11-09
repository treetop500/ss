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
