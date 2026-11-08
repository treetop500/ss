# M&H HVAC website

Static site with no build step. Open `index.html` or serve the folder (`python3 -m http.server`).

- `index.html`: page structure
- `assets/css/site.css`: all styles (colors taken from the logo, mobile-first breakpoints at 1100 / 850 / 650 px)
- `assets/js/site.js`: header, mobile menu, scroll reveals, swipe dots, request form

## Contact details
Set in the `SITE` config at the top of `assets/js/site.js` (phones, email, hours, area). Hours and area rows stay hidden until filled in. Set `formEndpoint` to a form service URL; until then the form opens a pre-filled email.

## Photos
- `assets/work/<id>.webp` (full, 1600px) and `<id>-sm.webp` (720px thumbnail). EXIF/GPS data is stripped.
- `assets/media/*.mp4`: short muted clips used in the gallery.
- Gallery tiles live in `index.html` under `#work`; each has `data-cat` (`splits`, `cassettes`, `outdoor`, `refrig`, `cases`, `service`). Add a tile by copying one and changing the image and caption.

## Walkthrough
The hero (`.walk > .stage`, with `#view`, `.title`, `#chapter`, `.meter i`, `#rooms`) uses the markup the walkthrough handoff expects. The scroll film can mount there later without changing the rest of the page.
