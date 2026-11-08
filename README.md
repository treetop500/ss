# M&H HVAC website

Static site with no build step. Open `index.html` or serve the folder (`python3 -m http.server`).

- `index.html`: page structure
- `assets/css/site.css`: all styles (colors taken from the logo, mobile-first breakpoints at 1100 / 850 / 650 px)
- `assets/js/site.js`: header, mobile menu, scroll reveals, swipe dots, request form

## Before launch
1. Fill in the `SITE` config at the top of `assets/js/site.js` with the phone, email, hours and service area. Every link and label on the page updates from it.
2. Set `formEndpoint` to a form service URL. Until then the form opens a pre-filled email.
3. Replace each `.ph` placeholder with a photo, e.g. `<div class="card-media ph"><img src="..." alt="..." loading="lazy"></div>`. The placeholder label hides automatically.
   - Service cards: 4:3 landscape
   - Homes / Businesses / Maintenance panels: tall portrait (9:16)
   - "Recent projects": real M&H job photos only
4. Have the services list and wording confirmed by M&H.

## Walkthrough
The hero (`.walk > .stage`, with `#view`, `.title`, `#chapter`, `.meter i`, `#rooms`) uses the markup the walkthrough handoff expects. The scroll film can mount there later without changing the rest of the page.
