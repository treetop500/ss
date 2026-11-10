# Website rebuild handoff: local service business site, built like the M&H HVAC site

**Who this is for:** an AI coding agent (Codex) working in a *different* project for a *different* local service business.

**Your job:** rebuild that business's website using the exact system, layout, design language, page set, behaviors and quality bar of the M&H HVAC site described here. All content, photos, services, areas, contact details and claims come from **the new business** (its existing site, assets and owner). None of M&H's facts carry over.

**Reference:**
- Live preview of the finished M&H site: `https://6af34e20de588f78b5ad40ae--mh-hvac-nyc.netlify.app`
- Reference pack (`mh-reference-pack.zip`): the M&H source files plus phone and desktop screenshots of every page type. Where this document and the screenshots disagree on a visual detail, **match the screenshots**.

Read this whole document before writing code. Section 13 is your checklist.

---

## 0. The result in one paragraph

A fast, static, no-build website (plain HTML, CSS and JS) hosted on Netlify. The homepage is one long, mostly **black and royal-blue** page:
- Headlines are big and bold in a **serif** font; body text is a clean geometric sans.
- Buttons are **rounded pills**.
- It opens with a **full-screen photo of the owner on a real job** and a centered headline naming *the service and the city*.
- Below that, in order: a blue trust strip, a scrolling ticker of services, a big **"24/7" emergency section with a cartoon service van driving across**, four big photo cards ("How can we help?"), a blue **"Meet [Owner]"** section with social-media follower cards, a grid of **outlined service cards with white circle icons**, a 3-step "Get a quote" panel, a filterable **real-jobs photo/video gallery** with a full-screen viewer, a blue **FAQ** accordion, a **service-areas** split (area list left, Google map right), a booking form, a photo "Ready to get started?" band, and a blue footer.
- On phones, a **Text / Call now bar** stays pinned to the bottom.
- Every main service and every service area gets **its own page** with a real title, H1, a buyer question answered, real photos, the after-you-call steps and call/request buttons.
- Content **fades up** as you scroll.

---

## 1. What the owner and client asked for (hard rules, learned the hard way)

These came from many rounds of feedback on the M&H build. Treat each as a requirement.

1. **Real work only.**
   - Use the business's own job photos and videos everywhere you can. **No AI-generated illustrations or "AI art" anywhere.** M&H had them; the client made us remove every one.
   - Where a service has no real photo, use a **properly licensed** web photo (Wikimedia Commons / CC BY or CC BY-SA). Credit it in one small "Photo credits: …" line under that photo group, and list it in "Owner to supply" so it gets replaced. Never use random Google Images.
2. **No caption overlays on photos.** No "Example boiler · not an M&H job", "M&H job · …", "Mo, owner · not a stock photo" or similar labels on images. The client said they serve no point. Alt text carries the description. The only exception is short captions on the **gallery** tiles (section 5.10), which also feed the full-screen viewer.
3. **Fewer words, bigger headings, more space.**
   - Headings are short and punchy ("How can we help?", "You call. Mo shows up.", "Real jobs.", "Where we work").
   - Every body line must earn its place. No slogan spam, no paragraphs of marketing filler.
4. **Homes and businesses, not one or the other**, unless the business truly serves only one.
5. **24/7 and emergency service near the top**, in the hero badge, the trust strip, the ticker and its own section, if the business offers it. If it doesn't, drop the 24/7 section and badge; never fake it.
6. **The owner is the brand.** A "Meet [Owner name]" section with an "Owner" tag, a real photo of them on a job, and their social links with **real follower counts** (from screenshots the owner provides). Make the social buttons colorful and big.
7. **Blue, not red, for the accent.** M&H's logo is red/blue/navy; the client chose royal blue as the single accent. Use the new business's main brand blue if it has one, otherwise `#1659e6`. Use one accent hue only.
8. **No scroll-driven 3D or "walkthrough" experience.** We built one and the client had it removed. Normal scrolling only.
9. **Never invent facts.** No fake reviews, star ratings, license numbers, "certified", "insured", "family owned", "satisfaction guarantee", "same-day", "free estimates", years in business or response times, unless the owner confirms them in writing. When missing, leave the slot out and add it to "Owner to supply" (section 12).
10. **Don't copy competitors.** We studied two competitor sites for layout ideas: ultimatehvacsolutions.com and vacrock.com/hvac-repair. **Never copy their text, logos, photos or trade dress.** The system below is the result; build from it, not from them.
11. **Service area wording** follows the owner exactly. M&H ended at three groups: "NYC: all 5 boroughs", "Long Island (Nassau & Suffolk)" and "New Jersey". One page per group, not one per town, unless the owner wants that.
12. **Phone-first.** The owner reviews on an iPhone. Everything must look intentional at 390px wide, with no sideways scrolling, ever.

---

## 2. Inputs to collect first: build a fact sheet

Before designing, create `handoff/FACTS.md` in the new project from the business's existing site, assets and owner messages. Fill every row, and mark unknowns `UNKNOWN`. Never guess.

| Field | Example (M&H, do NOT reuse) |
|---|---|
| Business name (exact) | M&H HVAC |
| Trade / main service category | HVAC & refrigeration |
| Most important service (what customers search) | "HVAC & refrigeration repair" |
| Primary market (city) for the H1 | New York City |
| All service areas, grouped as the owner wants | NYC (all 5 boroughs) · Long Island (Nassau & Suffolk) · New Jersey |
| Main phone (also SMS-capable?) | 347-951-4761 (yes, texting works) |
| Second phone | 347-320-5867 |
| Email | (owner's) |
| Hours / emergency | 24/7 for emergencies |
| Owner first name + role | Mo, Owner |
| Customer types | Homes and businesses |
| Full service list (owner's own words) | Mini splits, AC, boilers, water heaters, gas & electric heaters, ductwork, walk-in coolers/freezers, deli cases, open cases, commercial fridges |
| Social links + follower counts + date | IG 5.9K, TikTok 5.6K (123.2K likes), FB 15K; "26K+" total |
| Logo file | transparent PNG |
| Job photos / videos (count, what each shows) | 31 photos, 6 videos |
| Reviews (platform, rating, count, link) | none found |
| License / insurance / certifications | none provided, so omitted |

**Analyze every photo and video yourself** (view them; don't trust filenames). For each one, write the equipment type, setting (home or commercial, indoor or rooftop), brand if visible, and quality (sharp or blurry, orientation). Mis-labeled photos were a big complaint on M&H: "a bunch of the captions are incorrect". Example: Copeland units are *refrigeration condensing units*, not AC. Check equipment labels and look up model or brand names when unsure. Exclude:
- blurry or shaky shots;
- sideways images you can't fix;
- selfies;
- anything showing children, house numbers or personal information;
- screenshots.

---

## 3. Stack and file structure

No framework and no build step. Static files deployed to Netlify.

```
/index.html                      homepage (source of the shared header/footer "chrome")
/assets/css/site.css             single stylesheet (see section 4; consolidate, don't stack 4 files like M&H did)
/assets/js/site.js               all behavior (section 6), no dependencies
/assets/img/                     logo-360.webp, logo-720.webp, logo-360.png, icon-32.png, icon-180.png, icon-512.png
/assets/work/                    job photos: <id>.webp (1600px long side, q80) + <id>-sm.webp (720px, q74), plus hero crops and og.jpg
/assets/media/                   short job videos <name>.mp4 (720px wide, H.264, CRF 26, muted, faststart) + <name>.webp poster
/assets/stock/                   licensed web photos (credited)
/services/<slug>/index.html      generated
/service-areas/<slug>/index.html generated
/tools/build_pages.py            generator for service & area pages (section 7)
/_headers                        Netlify cache headers (section 10)
/README.md                       how to edit contact config, add photos, rebuild pages
```

**Shared chrome:** the header + mobile menu live between `<!-- SHARED:CHROME-TOP -->` and `<!-- /SHARED:CHROME-TOP -->` in `index.html`. The final CTA band, footer and mobile action bar live between `<!-- SHARED:CHROME-BOTTOM -->` and `<!-- /SHARED:CHROME-BOTTOM -->`. The generator copies both blocks verbatim into every subpage. Every link in the chrome must be **root-absolute** (`/#services`, `/services/...`, `/assets/...`) so it works from subpages.

---

## 4. Design system (exact values)

### 4.1 Color tokens

```css
:root {
  --brand: #1659e6;      /* the one accent: buttons, bands, outlines, icons */
  --brand-2: #0f47c2;    /* hover / darker */
  --brand-ink: #9cc0ff;  /* light blue for small labels on black */
  --night: #000000;      /* main page background */
  --card: #05070c;       /* card fill on black */
  --ink: #ffffff;        /* text on dark */
  --muted: #c3c9d6;      /* secondary text on dark */
  --line: #ffffff1f;     /* hairlines on dark */
  --serif: "PT Serif", Georgia, "Times New Roman", serif;
  --sans: "Space Grotesk", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  --ease: cubic-bezier(.2, .7, .2, 1);
  --gutter: clamp(16px, 4vw, 64px);
  --header-h: 72px;      /* 64px at <=850px */
}
```

Section backgrounds alternate **black** and **brand blue**. White only appears in pill buttons, icon circles, the quote panel, the footer contact card and form surfaces. Social cards use platform colors: Instagram gradient `linear-gradient(135deg,#f9ce34 0%,#ee2a7b 45%,#6228d7 100%)`, TikTok `#111`, and Facebook `#0a2f86` (darker than FB blue so it separates from the blue band).

### 4.2 Type

- Google Fonts: `PT Serif` (400, 700) and `Space Grotesk` (400 to 700), with `display=swap`.
- Headings `h1–h3`: PT Serif 700, `text-transform:none`, `letter-spacing:-.01em`, `line-height:1.12`, `text-wrap:balance`.
- Body: Space Grotesk 17px, line-height 1.6. Inputs use 16px minimum (stops iOS zoom).
- Scale:
  - Hero H1: `clamp(42px, 5.4vw, 76px)` desktop, `clamp(34px, 9.5vw, 48px)` at ≤850px, max-width 16ch, centered.
  - Section H2: `clamp(36px, 4vw, 56px)`.
  - Card H3: 21px.
  - Eyebrow label: 11.5px, 600, uppercase, `letter-spacing:.12em`, color `--brand-ink`, shown as a pill (`background:#1659e626; padding:5px 12px; border-radius:999px`).

### 4.3 Buttons (pills)

```css
.btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; border-radius:999px;
       font:600 15px/1.2 var(--sans); text-decoration:none; border:1.5px solid transparent; min-height:44px; padding:10px 20px; }
.btn-lg { min-height:52px; padding:13px 28px; font-size:16px; }
.btn-primary { background:var(--brand); color:#fff; }          .btn-primary:hover { background:var(--brand-2); }
.btn-light   { background:#fff; color:#000; }                    .btn-light:hover { background:#e8eefb; }
.btn-outline { background:transparent; color:#fff; border-color:#ffffffb3; }  .btn-outline:hover { background:#fff; color:#000; }
```

Pair them the same way everywhere: **white "Get a free quote" + outlined "Call now"** on photos, **blue "Call [number]"** on black.

### 4.4 Shapes, lines, motion

- Cards: `border:1.5px solid var(--brand); border-radius:6px; background:var(--card)`. On hover: `background:#0a1630; transform:translateY(-4px); box-shadow:0 20px 40px -24px #1659e6aa`.
- Curved dividers: inline SVG, `preserveAspectRatio="none"`, full width.
  - **Wave** at the bottom of the hero: `viewBox 0 0 1440 80`, path `M0 80V40C240 0 480 0 720 20s480 40 720 0v40Z`, fill brand, 60px tall.
  - **Curve** at the bottom of the blue About band: `viewBox 0 0 1440 90`, path `M0 90V30C360 90 1080 90 1440 30v60Z`, fill `#000`, 80px.
  - **Curve** at the top of the blue FAQ band: path `M0 0h1440v60C1080 0 360 0 0 60Z`, fill `#000`.
- Icons: inline SVG line icons, 24×24 viewBox, `fill:none; stroke:currentColor; stroke-width:1.7; round caps/joins`. No icon fonts, no emoji.
- **Fades:**
  - Elements with `.reveal` start at `opacity:0; transform:translateY(34px)` and transition over `1s var(--ease)` to visible when they enter the viewport. IntersectionObserver uses `rootMargin:'0px 0px -8% 0px'` and `threshold:.12`, and unobserves after first show.
  - Stagger grid items: 2nd column +.1s, 3rd +.2s; FAQ items +.05s each.
  - Hero copy children fade up on load (`1.1s`, delays .12s steps).
  - Hero photo eases in: `scale(1.08)` with `opacity:.4` going to `scale(1)` with `opacity:1` over 2.6s.
  - Wrap everything in `@media (prefers-reduced-motion: reduce)` so it shows instantly.
- **The `.js` gate:** add `document.documentElement.classList.add('js')` in `<head>`, and only hide `.reveal` under `.js`, so content never stays invisible without JS.

---

## 5. Homepage: section by section (in this exact order)

The `[brackets]` are the new business's facts. Keep copy as short as shown.

### 5.1 Header (`.site-header`, sticky, `data-header`)

- **Over the hero:** transparent, white text.
- **After scrolling past the hero:** add class `is-solid`, which sets `background:#000000e8; backdrop-filter:blur(12px); box-shadow:0 1px 0 #ffffff14`.
- **Left:** logo inside a **white circle** (64px; 56px when solid; 54px on phones) with `padding:8px` and `box-shadow:0 4px 18px #0006`.
- **Nav links:** 24/7, Services, Our work, Service areas, FAQ (15px, 500).
- **Right:** white pill "Send us a text" (`sms:` link) and blue pill "Call us" (`tel:`).
- **≤1100px:** nav hides and a 46px round menu toggle (two bars that turn into an X) appears.
- **≤850px:** the header pills hide (the bottom bar replaces them).
- **Mobile menu:** a full-screen black sheet. Big serif links: Services, 24/7 emergency, Our work, Service areas, FAQ. Below them, a blue "Call [number]" and a white "Send us a text".
  - `hidden` attribute when closed.
  - **IMPORTANT:** add `.menu[hidden]{display:none}`. Without it, the invisible menu sat over the page and swallowed every tap (a real bug we shipped).
  - Escape closes the menu; the body gets `overflow:hidden` while it's open.

### 5.2 Hero (`.u-hero`, `data-hero`, `min-height:100svh`)

- **Background:** full-bleed photo of **the owner on a real job**.
  - Desktop: a wide 16:9 crop (`1d849ba9-wide.webp` in the pack). Phones: the full portrait photo, via `<picture>` with `media="(max-width: 850px)"`.
  - Use `object-fit:cover` and tune `object-position` so the person stays visible.
  - Overlay: `linear-gradient(180deg,#000000b3 0%,#00000080 40%,#000000c7 100%)`. On phones use a stronger one: `#00000066 → #00000099 35% → #000000d9 60% → #000000f2`, plus a `text-shadow` on the H1.
- **Centered copy stack** (`gap:22px`; 16px on phones):
  1. Blue pill badge with a pulsing white dot: "24/7 emergency service" (only if true).
  2. **H1 = "[Main service] in [Primary city]"** (M&H: "HVAC & Refrigeration Repair in New York City").
  3. One sentence (max 62ch): what they do, for whom, where, and "Owner-run by [Name]."
  4. Buttons: white "Get a free quote" (→ `#request`) + outlined "Call now" (`tel:`). On phones they sit side by side, max-width 380px, each `flex:1`.
  5. **Proof chip** (glassy pill: `background:#ffffff14; border:1px solid #ffffff2e; backdrop-filter:blur(6px)`). M&H: "**26K+** people follow Mo's real jobs on TikTok, Instagram & Facebook", linking to `#about`. Use the business's strongest *verifiable* proof: Google rating + count with a link to the listing if they have reviews, otherwise follower count. Put it **next to the main buttons**.
- Brand-blue wave SVG at the bottom edge.
- `<link rel="preload" as="image">` for both hero crops, with matching `media` attributes, and `fetchpriority="high"` on the `<img>`.

### 5.3 Trust strip (`.u-trust`)

Brand-blue band right under the wave (`padding:18px 0 30px`). A centered row of 4 items, each a 22px line icon + text (15px 600): "24/7 emergencies", "Owner-run", "Homes & businesses", "[Areas short form]" (M&H: "NYC, Long Island & NJ"). Only include true items. On phones the items left-align and wrap.

### 5.4 Ticker strip (`.strip`)

- Black band with a hairline top and bottom. A track that loops infinitely (`translateX(-50%)`, 38s linear); render the word list twice.
- Words in PT Serif 700, `clamp(20px,2.2vw,30px)`, separated by 10px **blue dots**.
- M&H words: 24/7 Emergency service · Heating · Cooling · Refrigeration · Walk-ins · Boilers · Mini splits · All 5 boroughs · Long Island · New Jersey.
- `aria-hidden="true"`. Animation off under reduced motion.

### 5.5 24/7 emergency + van (`#emergency`, `.emergency`)

- **Background:** black with two radial glows: `radial-gradient(60% 80% at 15% 30%, #1659e655, transparent 60%)` and `radial-gradient(50% 70% at 100% 0%, #0f47c240, transparent 60%)`.
- **Left-aligned content:**
  - Eyebrow "Emergency service" with a pulsing blue dot.
  - **Giant "24/7"**: PT Serif, `clamp(120px,24vw,340px)`, `line-height:.8`. Text filled with `linear-gradient(100deg,#fff 0%,#7fb0ff 45%,#1659e6 100%)` via `background-clip:text`.
  - H2 "Day or night. We pick up." at `clamp(36px,4.6vw,64px)`.
  - One line: "No heat. No cooling. Walk-in down. Call any hour." (adapt to the trade).
  - White "Call [number]" pill.
- **The van:**
  - A **road** at the bottom: 30px dark strip plus a dashed center line (`repeating-linear-gradient(90deg,#ffffff55 0 38px,transparent 38px 76px)`).
  - An **inline-SVG box van** drives across it. White body, the business's **real logo** placed on the side via SVG `<image href="/assets/img/logo-360.webp">`, two blue stripes (`#1659e6` and `#7fb0ff`), and "24/7 · [phone]" in small text. Copy the SVG from the pack's `index.html` (search `van-svg`) and swap the logo and phone.
  - **Animation:** `translateX(-105%)` to `translateX(100vw)` over 11s linear infinite (7s on phones), plus a 0.45s body bob and wheel-spoke spin.
  - **Only animate while the section is on screen:** an IntersectionObserver toggles `.is-driving`. Under reduced motion the van sits parked in the center.

### 5.6 How can we help? (`.help`)

- Black section. Centered eyebrow "Start here", H2 "How can we help?", and a line "Pick what's going on, or call [number] any hour."
- **4 photo cards** in a grid: 4 columns, 2 at ≤1100px; gap 20px desktop, 10px phone.
- Each card is an `<a>` with:
  - a real job photo (aspect `4/4.2`; `1/1` on phones; image zooms 1.05 on hover);
  - a serif title (`clamp(20px,1.7vw,25px)`) and a muted sub-line;
  - a round blue arrow button bottom-right;
  - the outline style from section 4.4.
- M&H cards and where they link (each goes to the matching **service page**; "Get a quote" goes to `#request` with `data-service="Quote"`):
  - "No heat or no cooling · Emergency repair, 24/7"
  - "Cooler, freezer or case down · Get product cold again, fast"
  - "New install or replacement · Sized right, installed clean"
  - "Get a quote · Clear price before work starts"

### 5.7 Meet [Owner] (`#about`, `.u-about`)

- Brand-blue band, two columns (text left, photo right; stacked on phones).
- **Text column:**
  - Tag row: "Meet [Name]" in serif plus a black pill "OWNER".
  - H2 "You call. [Name] shows up." (adapt only if untrue).
  - Two short paragraphs: who runs it and that they're on the jobs; what they cover; "you approve the price before we fix it" *only if confirmed*; emergencies 24/7.
  - "**26K+** people follow [Name]'s real jobs".
  - **3 social cards** (IG / TikTok / FB). Each has an icon tile, **"5.9K followers"** as the title (fed from a config map), and the handle as the subtitle. They sit 3 across on desktop and 1 per row (icon + text side by side) at ≤1100px.
- **Photo column:** a different real photo of the owner on a job, `aspect-ratio:4/4.4`, `border-radius:6px`, `object-position` tuned to their face.
- Black curve SVG at the bottom.

### 5.8 Our services (`#services`)

- Black. Centered H2 "Our Services", sub "[Trade summary]".
- **Grid:** 3 columns, max-width 1100px, gap 22px; 2 columns ≤1100px; 1 column ≤650px.
- **Card:** centered content, padding `30px 26px 28px`. It contains:
  - a **52px white circle icon** with a black line icon;
  - a serif title (21px);
  - one-line description (15px, muted);
  - an underlined "Learn more" link to that service's page.
- M&H's 9 cards: 24/7 Emergency Repair; Walk-in Coolers & Freezers; Deli Cases & Commercial Fridges; Ductless Mini Splits; AC Repair; Boilers & Heating; Water Heaters; Gas & Electric Heaters; Ductwork. Several cards may point to the same service page.

### 5.9 Get a quote (`.u-quote`)

- Background: `linear-gradient(180deg,#000 0%,#0a2a7a 40%,var(--brand) 100%)`.
- **Left:** H2 "Get a quote" and "Getting a price is easy and only takes three steps."
- **Right: a white panel** (radius 6) with 3 rows:
  1. "Send us a text" + a pill linking to `sms:`. This row is black with white text.
  2. "Chat on the phone" + an outlined "Call" pill.
  3. "Receive a quote", with small muted text "You approve before work starts" (only if true).
- Number circles: 30px with a 1.5px border.

### 5.10 Our work: real jobs gallery (`#work`)

- Black. Centered eyebrow pill "Our work" and H2 "Real jobs."
- **Filter chips** (pill buttons, `aria-pressed`). M&H set: All · Mini splits · Ceiling cassettes · Mini split condensers · Refrigeration condensers · Commercial fridges · Heating & hot water · Ductwork · Service & install. Build categories from the photo analysis in section 2.
- On phones the chips become one horizontally scrolling row, with no scrollbar, bleeding to the screen edges.
- **Grid:** 4 columns → 3 at ≤850px → 2 at ≤650px, gap 12px (8 on phones). Tiles are `aspect-ratio:3/4`, `border-radius:4px`, with a bottom gradient and a 14px white caption (12.5px on phones).
- Show the first **12** for "All", then a "Show all work" button. Other filters show everything in that category.
- **Video tiles:** muted, looping, `playsinline`, `preload="none"`. Play only while ≥40% visible. A small blue round play badge sits top-right.
- **Lightbox:** a `<dialog>` that's full screen and dark. It shows the large image (or the video with controls) and the caption. Controls:
  - prev/next arrows (hidden on phones), arrow keys, swipe left/right;
  - swipe down, tap outside, × or Escape to close;
  - focus returns to the tile on close.
  - It cycles **only through the currently visible tiles**.

### 5.11 FAQ (`#faq`)

- Brand-blue band with the black curve on top. Centered serif H2 "Frequently asked questions", max-width 860px.
- Use `<details>`/`<summary>` (no JS). The summary is 17px 600 with a "+" that rotates 45° when open; rows have `1px solid #ffffff4d` bottoms.
- 6 real questions, answered from facts only. M&H set:
  1. 24/7 emergency? (include "If you smell gas, leave the building and call 911 first")
  2. What areas?
  3. Homes or businesses?
  4. What refrigeration?
  5. What happens after I call?
  6. Can I text instead?

### 5.12 Service areas (`#areas`)

This is the *clean split* version the client approved. No floating card over the map.
- Black, 2 columns (`1fr 1.1fr`, gap `clamp(32px,6vw,90px)`).
- **Left:**
  - eyebrow "Service areas", H2 "Where we work", one line (muted, max 44ch);
  - a **list of area rows**, each a full-width link. Every row has a top/bottom hairline, padding `18px 4px`, the area name in serif 22px with a muted 14px sub-line beneath, and a 38px round blue "→" on the right. On hover the row nudges right by 6px and the arrow moves 4px.
  - M&H rows: "New York City / Brooklyn · Queens · Manhattan · the Bronx · Staten Island", "Long Island / Nassau & Suffolk", "New Jersey / Heating · cooling · refrigeration";
  - a blue "Call [number]" pill.
- **Right:** a Google Maps embed (`https://www.google.com/maps?q=[City]&z=8&output=embed`, `loading="lazy"`) in a frame: `border-radius:18px; border:1.5px solid var(--brand); aspect-ratio:4/3.4; box-shadow:0 30px 60px -30px #1659e666`.
- Phones: list first, map below.

### 5.13 Book service (`#request`)

- **Left:** H2 "Book service." and a definition list with Phone, Second line, Email, Hours, Area. The values come from the JS config, and empty rows hide themselves.
- **Right:** a form (dark surface, 1.5px brand border, radius 6) with these fields:
  - a **Home / Business** pill toggle (radios styled as pills; checked = brand blue);
  - Name* and Phone* (2 columns, 1 on phones);
  - Address*;
  - "What do you need?" select (Repair, Refrigeration, New install, Maintenance, Quote, Other, adapted to the trade);
  - Details (optional);
  - a full-width-on-phones blue "Send request" button.
- Inputs are 16px, min-height 52px.
- **The select needs its own `background-repeat:no-repeat; background-position:right 14px center; background-size:18px`, set *after* any `background` shorthand.** Otherwise the chevron tiles across the whole field (a bug we shipped).
- Validation and submit behavior: see section 6.

### 5.14 Final CTA (`.u-cta`)

A full-bleed real job photo with the gradient `linear-gradient(180deg,#000000a6,#0f47c2d9)`. Centered serif H2 "Ready to get started?" at `clamp(40px,5vw,68px)`, a line "Book an appointment today. Emergencies: call any hour.", and white "Get a free quote" + outlined "Call now" pills. Padding `clamp(110px,14vw,190px)`.

### 5.15 Footer (`.u-footer`, `id="site-footer"`)

- Brand-blue background, white text.
- **Grid:** 4 link columns + 1 wider contact card (`repeat(4,1fr) 1.3fr`); 2 columns ≤1100px with the contact card full width; 2 columns ≤650px.
- **Columns:**
  - Company: Home, Meet [Name], Our work, FAQ, Book service.
  - Services: one link per service page.
  - Service areas: each town or borough, linking to its group page.
  - Hours: "Open 24/7 for emergencies".
- **Contact card:** white box (radius 4, padding 22) with the logo (64px), business name, phones, email, areas, and a "Book now" pill. Give it explicit `.btn` sizing (`min-height:42px; padding:10px 22px; line-height:1`) or it squashes into an oval (a bug we shipped).
- **Bottom row:** round black social icons, "© [year] [Business] · All rights reserved".

### 5.16 Mobile action bar (`.action-bar`, `data-action-bar`)

- **≤850px only:** fixed to the bottom, `padding:10px 14px calc(10px + env(safe-area-inset-bottom))`, `background:#000000f0`, top hairline. Two buttons in a `1fr 1.5fr` grid: outlined **"Text"** (`sms:`) and blue **"Call now"** (`tel:`), both 50px+ tall with icons.
- **Slides up** (`translateY(110%)` → `none`) once the user scrolls past 60% of the first screen. It hides while the request form is on screen and while the menu is open.
- Add `padding-bottom: calc(76px + env(safe-area-inset-bottom))` to `body` at ≤850px so the bar never covers the last content.

---

## 6. `site.js` behaviors (one file, no libraries)

1. **Config block at the top.** It's the single source of truth; every phone, email, hours and area label on the page fills from it via `data-*` hooks (`data-phone`, `data-tel`, `data-phone2`, `data-tel2`, `data-email`, `data-mailto`, `data-hours`, `data-area`, `data-year`, `data-count`). Rows for empty values hide themselves (`data-row="hours"` etc.).
   ```js
   const SITE = { phone:'[display]', phoneE164:'+1XXXXXXXXXX', phone2:'', phone2E164:'', email:'',
     hours:'24/7', area:'[areas text]', formEndpoint:'',
     followers:{ instagram:'5.9K', tiktok:'5.6K', facebook:'15K' } };
   ```
2. **Scroll handling:** one rAF-throttled scroll pass. It toggles header `.is-solid` when `scrollY > hero.offsetTop + hero.offsetHeight - 90`, and the action bar `.is-on` when `scrollY > innerHeight*0.6 && !requestVisible`. An IntersectionObserver on `#request` (threshold .15) sets `requestVisible`. The scroll listener is passive and also runs on `resize` and `pageshow`.
3. **Mobile menu:** see section 5.1. Close it on any link click and on resize to ≥1101px.
4. **Reveals:** see section 4.4. If reduced motion is on or IntersectionObserver is missing, add `.in` to everything immediately.
5. **Service preselect:** clicking any `[data-service]` link sets the form's select. On page load, read `?service=Name` from the URL so service pages can link to `/?service=Refrigeration#request`.
6. **Form:**
   - Validate required fields, set `aria-invalid`, show "Please add your name, phone and address." and focus the first bad field.
   - If `SITE.formEndpoint` is set, POST JSON to it with a "Sending…" state, a success message, and an error message that includes the phone number.
   - **Otherwise** open a pre-filled `mailto:` with all fields in the body.
   - Every part must be guarded with `if (form)` so subpages without the form don't crash.
7. **Van:** IntersectionObserver (threshold .1) toggles `.is-driving`.
8. **Gallery + lightbox:** see section 5.10. Bail out early with `if (!$('[data-work]')) return;` on pages without the gallery.

---

## 7. Service and area pages (`tools/build_pages.py`)

A Python 3 script, standard library only. It reads `index.html`, extracts both `SHARED:CHROME` blocks, and writes `/services/<slug>/index.html` and `/service-areas/<slug>/index.html`. **Re-run it after any homepage chrome change.**

**Service data model** (one dict per page):
```python
'commercial-refrigeration': dict(
  name='Commercial refrigeration', form='Refrigeration',          # form = select value for ?service=
  title='Commercial Refrigeration Repair in NYC | Walk-in Coolers & Deli Cases | M&H HVAC',
  desc='<=160 chars, service + area + phone',
  h1='Commercial refrigeration repair in <em>New York City.</em>',
  lede='1–2 sentences: what, for whom, emergency line',
  photo=(src, alt, unused_caption),                                # real job photo or .mp4
  bgvideo=(mp4, poster) or None,                                   # optional dimmed background video in the hero
  q='A real buyer question',  a='HTML answer: bold lead line, steps or bullets, a safety callout if relevant',
  covers=[(title, one-line), ...],                                 # what's included
  shots=[(src, alt, unused_caption), ... 3–6],                     # real work; .mp4 allowed
  credits='Photo credits: …' or None)                              # only for licensed web photos
```

M&H shipped 5 service pages (commercial refrigeration, mini split installation, heating repair, ductwork, emergency HVAC repair) and 3 area pages (nyc, long-island, new-jersey).

**Service page template (top to bottom):**
1. **Hero**, 2 columns:
   - **Left:** breadcrumbs (Home / Services / Name), a 24/7 pill, the H1, the lede, then a blue "Call [number]" button with a phone icon and an outlined "Book service" button (→ `/?service=<form>#request`).
   - **Right:** the photo or video in a rounded frame with a 14px solid offset shadow in brand blue.
   - If `bgvideo` is set, the hero gets a dimmed looping background video with a dark left-to-right gradient.
   - **No figcaption overlays.**
2. Q&A section: the question as a big H2 on the left, the answer on the right.
3. "What we cover": rows/cards from `covers`.
4. "Real work": a 3-column grid of `shots` (2 at ≤850px, 1 at ≤650px), aspect `3/4`, videos autoplay muted. The credits line sits under it if present.
5. "After you call": 4 numbered steps (You call or send a request → We find the cause → You approve the price → Fixed or scheduled). **Use only steps the owner confirmed.**
6. "Where we work": pill links to each area page.
7. Shared chrome bottom (CTA band + footer + action bar).

**Area page template:**
- **Hero:** H1 "[Trade] repair in [Area]" and a pill (e.g. "24/7 emergency service · Nassau & Suffolk").
- **Q&A:** "Do you come out to [Area]?" with an honest answer, plus local access notes only if true (e.g. building management for roof access).
- **"What we handle in [Area]":** links to every service page.
- The steps, then "Other areas" links.

**Per-page SEO:** a unique `<title>` (service/area first, brand last), meta description, a single `<h1>`, and canonical-friendly root-absolute links. Phone links are `tel:` everywhere.

---

## 8. Media pipeline (exact commands)

Put downloaded or owner files in their own folder and run Python with `-I` when reading them.

- **Photos:** strip EXIF/GPS by re-encoding without metadata.
  ```python
  from PIL import Image, ImageOps
  im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
  for suffix, size, q in (('',1600,80),('-sm',720,74)):
      c = im.copy(); c.thumbnail((size,size), Image.LANCZOS); c.save(f'assets/work/{id}{suffix}.webp','WEBP',quality=q,method=6)
  ```
- **Hero crops:** desktop is a 16:9 band from the portrait original (`y≈40%` of height, tuned to keep the face), saved as `<id>-wide.webp`. Phones use the full portrait. **Look at both crops** before shipping.
- **OG image:** 1200×630 JPEG (q84) cropped from the wide hero, at `assets/work/og.jpg`.
- **Videos:** phone clips are usually rotated `.mov` files.
  ```sh
  ffmpeg -i in.mov -t 9 -an -map_metadata -1 -vf "fps=30,scale=720:-2" -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart out.mp4
  ffmpeg -ss 1.5 -i out.mp4 -frames:v 1 -c:v libwebp -quality 78 out.webp   # poster
  ```
  Target under 2 MB per clip. Pull frames at 10/35/60/85% to **see** what each video shows before captioning it. M&H's "boiler" videos were actually water-heater swaps.
- **Logo:** crop the transparent bounding box, then export `logo-360` and `logo-720` (webp + png 360) and square favicons 32/180/512 on a light background.
- **Licensed web photos:** query the Wikimedia Commons API with a User-Agent header and back off on 429. Keep only CC0/PD/CC BY/CC BY-SA. Record title, author, license URL and file page, and credit them as "Photo credits: “Title” by Author (CC BY-SA 4.0), via Wikimedia Commons."

---

## 9. SEO and the local-service audit (all of this is required)

These rules come from a local-service website audit the client gave us.

1. **Homepage `<title>`:** `[Main service] in [Primary city] | [Business]`. **H1:** `[Main service] in [Primary city]`. Service and market first, brand last.
2. **First screen must answer four questions:** what they do, where, why trust them, how to reach them. That means the H1 + sub-line, the area text, the proof chip next to the buttons, and call/quote visible without scrolling, on phone and desktop.
3. **Hero photo:** shows the owner or the team doing the work, cropped separately for phone and desktop, with clean edges (no blurred side panels).
4. **Proof:** verifiable and adjacent to the main action. Google rating + count with a link if it exists; otherwise follower counts dated in a config comment.
5. **Homepage order follows the decision to hire:** services → evidence (work) → why them (owner/benefits) → what happens after contact → areas → contact. Visitors can reach call/text from anywhere (header + bottom bar).
6. **Service and area pages** with readable URLs, unique titles/H1s and a real buyer question answered.
7. **Meta:** description ≤160 chars with phone; `theme-color`; Open Graph (`og:type`, `og:title`, `og:description`, `og:image` absolute URL) and `twitter:card=summary_large_image`.
8. **JSON-LD** on the homepage: the most specific schema.org type (e.g. `HVACBusiness`, `Plumber`, `Electrician`, `RoofingContractor`). Include `name`, `telephone`, `email`, `url`, `logo`, `image`, `description`, `openingHoursSpecification` (only if hours are known; 24/7 = all 7 days 00:00–23:59), `areaServed` (each area), and `sameAs` (social URLs). No `aggregateRating` unless real reviews exist.

---

## 10. Hosting and deploy (Netlify)

- **Access:** ask the user for a Netlify personal access token through the environment's credential flow. Never paste tokens into chat or files.
- **Create the site:** `POST https://api.netlify.com/api/v1/sites {"name":"<business-slug>"}`.
- **Deploy** with the file-digest API so only changed files upload:
  1. `POST /sites/{id}/deploys` with `{"files": {"/path": "<sha1>", ...}, "draft": true}`.
  2. PUT each `required` sha to `/deploys/{deploy_id}/files/<path>` (`Content-Type: application/octet-stream`).
  3. Poll until `state == "ready"`.
- **Always use `draft: true`** for review previews (unique `https://<deployid>--<site>.netlify.app` URLs). Production only changes when the user says "publish"; then repeat without `draft`.
- **`_headers`:** `Cache-Control: public, max-age=604800` for `/assets/work/*`, `/assets/media/*` and `/assets/stock/*`.
- **Verify on the live preview with curl:**
  - the page returns 200 and has the right `<title>`;
  - a video returns `206` with a `Content-Range` header for `Range: bytes=0-1023`;
  - a removed asset returns 404.
- Keep a `deploy.py` helper. Keep the site small: M&H ended at about 14 MB total.

---

## 11. QA gate: do all of this before every handoff to the user

Use Playwright (Chromium). The headless sizes are iPhone 13 (390×664 viewport) and desktop 1440×900.

1. **No horizontal overflow:** `document.documentElement.scrollWidth - innerWidth === 0` on every page at both sizes.
2. **No console errors** (ignore Google Maps embed noise).
3. **Link and asset checker** (a small Python script). For every `.html`, resolve every `href`, `src`, `srcset`, `poster`, `data-full` and `data-video` that isn't `http`/`tel:`/`mailto:`/`sms:` to a file on disk. Every `/#id` must exist in `index.html`. The result must be zero broken.
4. **Screenshots:** first screen + every section on phone and desktop. Look at them yourself (contact sheets help). Check:
   - text contrast over photos;
   - nothing clipped (portrait photos in landscape boxes get cut; use taller aspect ratios like `4/5` or `3/4` and tune `object-position`);
   - the bottom bar never covers content or captions (raise anything near the bottom by `calc(76px + env(safe-area-inset-bottom))` on phones).
5. **Flows:**
   - a hero service link lands on its service page;
   - an area link lands on its area page;
   - "Book service" on a service page arrives at `/#request` with the select preselected;
   - `tel:` and `sms:` hrefs are correct;
   - the mobile menu opens, links work, and Escape closes it;
   - gallery filters and the lightbox work (swipe and arrows);
   - FAQ items open.
6. **Bugs we actually hit, so check for them:**
   - hidden `[hidden]` elements still covering the page and intercepting taps;
   - a CSS `background` shorthand wiping a select's chevron settings;
   - selector specificity (`.section p` beating `.big-number`), so scope overrides properly;
   - arrow/chevron icons drawn in a token color that matches their button background (invisible);
   - iOS zoom on inputs under 16px;
   - safe-area insets on fixed bars;
   - a heredoc or inline script tripping tool safety checks (write scripts to files and run them).
7. **Reduced motion:** with `prefers-reduced-motion: reduce`, everything is visible and nothing animates.

---

## 12. Deliverables and how to report back

1. A working repo with the structure in section 3, committed and pushed to the branch you were given.
2. A **draft Netlify preview URL** and a phone + desktop first-screen screenshot.
3. The **homepage title and H1**, verbatim.
4. A short **"What I used from the business"** list: services, areas, photos used and where.
5. An **"Owner to supply"** list (only what's missing), for example:
   - Google Business Profile link + reviews;
   - license/insurance numbers (only if they want them shown);
   - business hours for non-emergency work;
   - specific areas inside each region;
   - photos for services that currently use credited web photos;
   - a truck or van photo for the hero.
6. Anything you assumed, stated plainly, so the user can correct it.

Write to the user in plain language: short sentences, no jargon, no long lists of options. Make sensible calls yourself and say what you chose.

---

## 13. Build order (follow it)

1. Read the new business's existing site and assets. Analyze every photo and video. Write `handoff/FACTS.md` (section 2). Ask the user **only** for missing critical facts (phone, areas, services, owner name); proceed with sensible defaults for the rest.
2. Process media (section 8): logo, favicons, photos (EXIF stripped), hero crops, OG image, videos + posters.
3. Write `index.html` (section 5) with shared chrome markers, `site.css` (sections 4–5) and `site.js` (section 6).
4. Write `tools/build_pages.py` (section 7) with real content for each service and area. Generate the pages.
5. SEO (section 9).
6. QA gate (section 11). Fix everything. Re-run.
7. Draft deploy (section 10) and verify on the live URL.
8. Report (section 12). Wait for "publish" before deploying to production.

When the user asks for tweaks later, change the source, re-run the generator if the chrome changed, run the QA gate again, commit, push, and send a new draft preview link every time.
