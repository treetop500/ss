"""Build the service and service-area pages.

Shared header/menu/footer/action bar are copied from index.html (between the
SHARED:CHROME markers), so the whole site stays consistent.

    python3 tools/build_pages.py
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
index = open(os.path.join(ROOT, 'index.html')).read()
TOP = re.search(r'  <!-- SHARED:CHROME-TOP -->.*?<!-- /SHARED:CHROME-TOP -->', index, re.S).group(0)
BOTTOM = re.search(r'  <!-- SHARED:CHROME-BOTTOM -->.*?<!-- /SHARED:CHROME-BOTTOM -->', index, re.S).group(0)
PHONE = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 3h3.5l1.8 4.6-2.3 1.5a12 12 0 0 0 6.9 6.9l1.5-2.3L21 15.5V19a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z"/></svg>'

SERVICES = {
  'commercial-refrigeration': dict(
    name='Commercial refrigeration', form='Refrigeration',
    title='Commercial Refrigeration Repair in NYC | Walk-in Coolers &amp; Deli Cases | M&amp;H HVAC',
    desc='Walk-in cooler, walk-in freezer, deli case and commercial fridge repair and installation in all 5 NYC boroughs. 24/7 for emergencies. Call 347-951-4761.',
    h1='Commercial refrigeration repair in <em>New York City.</em>',
    lede='Walk-in coolers, walk-in freezers, deli cases, open cases, glass-door fridges and commercial ice machines for delis, markets and restaurants. When a box goes warm, call any hour.',
    photo=('/assets/work/7ee8f78b.webp', 'Two condensing units M&amp;H installed, labelled for a deli case and a walk-in box', 'M&amp;H job · units for a deli case and walk-in'),
    q='My walk-in isn’t holding temperature. What should I do until you get here?',
    a='''<p><strong>Call us first</strong>, then do what you can to slow the warm-up:</p>
          <ol>
            <li>Keep the door shut and make sure it closes all the way and the gasket seals.</li>
            <li>Check that nothing is blocking the fan inside the box, and the breaker for the unit hasn’t tripped.</li>
            <li>Note the temperature on the display so we know how fast it’s rising.</li>
            <li>If another cooler is holding, move the most sensitive product into it.</li>
          </ol>
          <p>On site we check the condensing unit outside, the evaporator and defrost inside, and the door, then tell you what failed and what it takes to fix.</p>''',
    covers=[('Walk-in coolers', 'Boxes, doors, evaporators and the condensing units that run them.'), ('Walk-in freezers', 'Low-temp boxes, defrost problems, iced-up coils.'), ('Deli cases', 'Service and display cases that have to hold temp all day.'), ('Open cases', 'Open-front grab-and-go cases and their units.'), ('Glass-door fridges', 'Reach-in coolers and full runs of cooler doors.'), ('Ice machines', 'Commercial ice machine service for restaurants and other businesses. <a href="/services/ice-machine-service/">Explore ice machine service</a>.')],
    shots=[('/assets/work/commercial-ice-machine-sm.webp', 'Commercial ice machine with an M&amp;H HVAC service sticker in a restaurant kitchen', 'Commercial ice machine · restaurant kitchen'), ('/assets/work/ice-machine-bin-sm.webp', 'Open commercial ice machine bin filled with ice', 'Ice machine · full ice bin'), ('/assets/work/fd72f06d-sm.webp', 'Curved glass deli case M&amp;H installed', 'Deli case install'), ('/assets/work/c01c44b5-sm.webp', 'A full run of glass-door fridges in a market buildout', 'Glass-door fridges · market'), ('/assets/work/80ff66cd-sm.webp', 'Row of refrigeration units on a rooftop', 'Refrigeration units · rooftop'), ('/assets/work/f8306ac4-sm.webp', 'Condensing units mounted on a wall for open cases', 'Units for open cases'), ('/assets/work/2298e119-sm.webp', 'Refrigeration unit mounted on a brick wall', 'Wall-mounted unit'), ('/assets/work/81988476-sm.webp', 'Deli service cases on a store floor', 'Deli service cases')],
  ),
  'ice-machine-service': dict(
    name='Ice machine service', form='Refrigeration',
    title='Commercial Ice Machine Service in NYC | M&amp;H HVAC',
    desc='Commercial ice machine service for restaurants and businesses in NYC, Long Island and New Jersey. Not making ice or keeping up? Call M&amp;H HVAC at 347-951-4761.',
    h1='Commercial ice machine service in <em>New York City.</em>',
    lede='Ice machine not making ice or keeping up with your kitchen? M&amp;H HVAC services commercial ice machines for restaurants and other businesses across NYC, Long Island and New Jersey.',
    photo=('/assets/work/commercial-ice-machine.webp', 'Commercial ice machine with an M&amp;H HVAC service sticker in a restaurant kitchen', 'M&amp;H job · commercial ice machine'),
    q='What should I tell you when I call about an ice machine?',
    a='''<p>Tell us the business address, the machine’s make and model if you have them, and what has changed:</p>
          <ul>
            <li>Whether it has stopped making ice or is producing less than usual.</li>
            <li>Any error message shown on the display.</li>
            <li>When the issue started and when we can access the kitchen.</li>
          </ul>
          <p>A photo of the machine and its model label can help. We check the equipment on site, explain what we find and discuss the work before starting.</p>''',
    covers=[('Not making ice', 'Service for commercial machines that have stopped producing ice.'), ('Low ice production', 'Troubleshooting when the machine is no longer keeping up.'), ('Commercial kitchens', 'Ice machine service for restaurants and other businesses.')],
    shots=[('/assets/work/commercial-ice-machine-sm.webp', 'Commercial ice machine with an M&amp;H HVAC service sticker in a restaurant kitchen', 'Commercial ice machine · restaurant kitchen'), ('/assets/work/ice-machine-bin-sm.webp', 'Open commercial ice machine bin filled with ice', 'Ice machine · full ice bin')],
  ),
  'mini-split-installation': dict(
    name='Mini splits &amp; AC', form='New install',
    title='Mini Split Installation &amp; AC Repair in NYC | M&amp;H HVAC',
    desc='Ductless mini split installation and AC repair for NYC apartments, homes and storefronts. Wall units, ceiling cassettes, outdoor condensers. Call 347-951-4761.',
    h1='Mini split installation &amp; AC repair in <em>New York City.</em>',
    lede='Ductless cooling, and heat with heat-pump models, for apartments, brownstones, shops and restaurants. Wall units, ceiling cassettes and the condensers outside.',
    photo=('/assets/work/4bde5bf9.webp', 'Two wall-mounted mini splits M&amp;H installed in a retail store', 'M&amp;H job · two wall units, retail store'),
    q='Can I get real AC in my apartment or storefront without ductwork?',
    a='''<p><strong>Yes. That’s what a mini split is for.</strong> An indoor unit on the wall or in the ceiling connects to an outdoor condenser through a small line set, so there’s no ductwork to run.</p>
          <ul>
            <li><strong>Indoor:</strong> a wall unit for a room, or a ceiling cassette for an open store floor.</li>
            <li><strong>Outdoor:</strong> the condenser goes on a wall bracket, a roof stand or the yard, wherever the building allows.</li>
            <li><strong>Heat too:</strong> heat-pump models also heat in winter.</li>
          </ul>
          <p class="callout">In many NYC buildings the landlord, co-op or management has to approve outside equipment. Check that early; we can tell you what the install needs.</p>''',
    covers=[('Wall units', 'Single rooms, bedrooms, offices.'), ('Ceiling cassettes', 'Open retail and restaurant floors.'), ('Outdoor condensers', 'Wall brackets, rooftop stands, stacked installs.'), ('AC repair', 'Not cooling, leaking or icing up.')],
    shots=[('/assets/work/1106fd8f-sm.webp', 'Mini split above a bedroom window', 'Mini split · home'), ('/assets/work/3181999e-sm.webp', 'Ceiling cassette being installed in a retail store', 'Ceiling cassette · retail'), ('/assets/work/7cc33594-sm.webp', 'Two mini split condensers mounted on a brick wall', 'Condensers · wall-mounted'), ('/assets/work/31f174af-sm.webp', 'Two mini split condensers on a roof', 'Condensers · rooftop'), ('/assets/work/f5b5ffdf-sm.webp', 'Wall unit installed in a restaurant', 'Wall unit · restaurant'), ('/assets/work/1945f345-sm.webp', 'Mini split in a bedroom', 'Mini split · bedroom')],
  ),
  'heating-repair': dict(
    name='Heating', form='Repair',
    title='Boiler, Water Heater &amp; Heating Repair in NYC | M&amp;H HVAC',
    desc='Boiler repair, water heater installation and gas and electric heater service in all 5 NYC boroughs. 24/7 for no-heat emergencies. Call 347-951-4761.',
    h1='Boiler &amp; heating repair in <em>New York City.</em>',
    lede='Boilers, water heaters and gas and electric heaters for homes and businesses. No heat in the middle of winter is an emergency: call any hour.',
    bgvideo=('/assets/media/water-heater-1.mp4', '/assets/media/water-heater-1.webp'),
    photo=('/assets/media/water-heater-2.mp4', 'Mo’s crew swapping a gas water heater in a basement', 'M&amp;H job · water heater swap'),
    credits='Photo credits: <a href="https://commons.wikimedia.org/wiki/File:ModCon_boiler_system.jpg" target="_blank" rel="noopener">“ModCon boiler system”</a> by Audetat, <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener">CC BY-SA 3.0</a>; <a href="https://commons.wikimedia.org/wiki/File:Hydronic_Unit_Heater.jpg" target="_blank" rel="noopener">“Hydronic Unit Heater”</a> by SAF1999, <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>, via Wikimedia Commons. Resized.',
    q='The heat’s out. What should I check before calling?',
    a='''<p class="callout"><strong>If you smell gas, leave the building and call 911 from outside.</strong> Don’t flip switches or try to relight anything.</p>
          <p>Otherwise, a few quick checks:</p>
          <ol>
            <li>The thermostat is set to heat and above the room temperature, and its batteries aren’t dead.</li>
            <li>The boiler’s or heater’s power switch is on, and the breaker hasn’t tripped.</li>
            <li>For hot water, check whether the water heater’s pilot or display shows an error.</li>
          </ol>
          <p>Still nothing? Call. We find the cause on site, whether that’s the boiler, a pump, a valve or the controls, and give you the price before we fix it.</p>''',
    covers=[('Boilers', 'No heat, short cycling, leaks, pressure problems.'), ('Water heaters', 'Tank and tankless, repair and replacement.'), ('Gas &amp; electric heaters', 'Unit heaters for shops, garages and basements; electric heat.')],
    shots=[('/assets/work/commercial-water-heater-sm.webp', 'A. O. Smith commercial water heater with an M&amp;H HVAC service sticker', 'Commercial water heater · restaurant kitchen'), ('/assets/media/water-heater-1.mp4', 'Mo’s crew installing a new gas water heater', 'M&amp;H job · water heater install'), ('/assets/stock/boiler-modcon-sm.webp', 'Basement boiler with copper piping, pumps and expansion tank', 'Example boiler · not an M&amp;H job'), ('/assets/stock/unit-heater-sm.webp', 'Ceiling-hung unit heater', 'Example unit heater · not an M&amp;H job')],
  ),
  'ductwork': dict(
    name='Ductwork', form='Quote',
    title='Ductwork Installation &amp; Repair in NYC | M&amp;H HVAC',
    desc='New duct runs, duct repair and sealing for NYC homes and commercial buildouts. Fix rooms that never get enough air. Call 347-951-4761.',
    h1='Ductwork installation &amp; repair in <em>New York City.</em>',
    lede='New runs for buildouts and renovations, and repairs for systems where some rooms never get enough air.',
    photo=('/assets/work/duct-2.webp', 'Mo walking a store buildout under new exposed ductwork with supply registers', 'M&amp;H job · ductwork, store buildout'),
    q='Why is one room always hotter or colder than the rest?',
    a='''<p><strong>Usually it’s airflow, not the equipment.</strong> The common causes:</p>
          <ul>
            <li>A duct that’s undersized, crushed or disconnected somewhere you can’t see.</li>
            <li>Leaky joints losing air before it reaches the room.</li>
            <li>Registers that are closed or blocked by furniture.</li>
            <li>A dirty filter starving the whole system.</li>
          </ul>
          <p>We trace the run to that room, then seal, repair, resize or add a run, and give you the price before we start.</p>''',
    covers=[('New duct runs', 'Buildouts, renovations, new equipment.'), ('Repairs &amp; sealing', 'Leaks, disconnects, crushed flex.'), ('Airflow problems', 'Rooms that never get air.')],
    shots=[('/assets/work/duct-1-sm.webp', 'New rectangular duct with supply registers along a store ceiling', 'Exposed duct &amp; registers'), ('/assets/work/ductwork-sm.webp', 'Insulated duct sections ready to go in', 'Duct sections · buildout'), ('/assets/media/ductwork.mp4', 'Ductwork going in on a buildout', 'Ductwork going in')],
  ),
  'emergency-hvac-repair': dict(
    name='24/7 emergency repair', form='Repair',
    title='24/7 Emergency HVAC &amp; Refrigeration Repair in NYC | M&amp;H HVAC',
    desc='24/7 emergency repair in all 5 NYC boroughs: no heat, no cooling, walk-in or freezer going warm. Call 347-951-4761 any hour.',
    h1='24/7 emergency HVAC repair in <em>New York City.</em>',
    lede='No heat, no cooling, or a walk-in going warm with product inside. Call 347-951-4761, any hour.',
    photo=('/assets/work/6cc25122.webp', 'Mo charging an outdoor unit on a snow-covered roof', 'M&amp;H job · winter service call'),
    q='Is this an emergency, or can it wait until morning?',
    a='''<p><strong>Call now if:</strong></p>
          <ul>
            <li>There’s no heat and it’s cold out, especially with kids, older people or pipes at risk.</li>
            <li>A walk-in, freezer or case is going warm with product inside.</li>
            <li>Water is leaking from a unit, or there’s a burning smell from equipment.</li>
            <li>A business can’t open because the space is too hot or too cold.</li>
          </ul>
          <p class="callout"><strong>If you smell gas, leave and call 911 first.</strong></p>
          <p>Not sure? Call anyway and describe it. We’ll tell you if it can wait.</p>''',
    covers=[('Heating', 'No heat, no hot water.'), ('Cooling', 'No AC, leaking or iced units.'), ('Refrigeration', 'Walk-ins, freezers and cases going warm.')],
    shots=[('/assets/work/80ff66cd-sm.webp', 'Refrigeration units on a rooftop', 'Refrigeration · rooftop'), ('/assets/work/7ee8f78b-sm.webp', 'Condensing units for a deli case and walk-in', 'Deli case &amp; walk-in units'), ('/assets/work/38e83700-sm.webp', 'Mini split condenser on a roof', 'Condenser · rooftop')],
  ),
}

AREAS = {
  'nyc': dict(
    name='NYC', label='NYC · all 5 boroughs', where='New York City', state='NY', photo='7cc33594',
    pill='24/7 emergency service · All 5 boroughs',
    lede='Heating, cooling and commercial refrigeration for homes and businesses in Brooklyn, Queens, Manhattan, the Bronx and Staten Island.',
    q='Do you cover my borough?',
    answer='<p><strong>Yes, all five.</strong> Brooklyn, Queens, Manhattan, the Bronx and Staten Island are all part of our regular service area. Emergencies are handled 24/7; for installs, quotes and maintenance we set a time that works for you.</p>\n          <p>In apartment, co-op and condo buildings, roof and exterior work usually has to be scheduled with building management, so tell us who handles access when you call.</p>',
  ),
  'long-island': dict(
    name='Long Island', label='Long Island', where='Long Island', state='NY', photo='38e83700',
    pill='24/7 emergency service · Nassau &amp; Suffolk',
    lede='Heating, cooling and commercial refrigeration for homes and businesses on Long Island.',
    q='Do you come out to Long Island?',
    answer='<p><strong>Yes.</strong> We take jobs on Long Island as well as in the five boroughs and New Jersey. Call with the address and what’s going on, and we’ll tell you when we can get there.</p>',
  ),
  'new-jersey': dict(
    name='New Jersey', label='New Jersey', where='New Jersey', state='NJ', photo='31f174af',
    pill='Heating · Cooling · Refrigeration',
    lede='Heating, cooling and commercial refrigeration for homes and businesses in New Jersey.',
    q='Do you come out to New Jersey?',
    answer='<p><strong>Yes.</strong> We take jobs in New Jersey as well as NYC. Call with the address and what’s going on, and we’ll tell you when we can get there.</p>',
  ),
}

STEPS = '''        <ol class="mini-steps">
          <li><strong>You call or send a request</strong>Address, what’s going on, when we can get in.</li>
          <li><strong>We find the cause</strong>A tech checks the equipment on site and explains it plainly.</li>
          <li><strong>You approve the price</strong>Before the work starts.</li>
          <li><strong>Fixed or scheduled</strong>Small repairs often the same visit; installs get a date.</li>
        </ol>'''

def head(title, desc, path):
    return f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <meta name="theme-color" content="#0d0e11">
  <link rel="icon" href="/assets/img/icon-32.png" sizes="32x32">
  <link rel="apple-touch-icon" href="/assets/img/icon-180.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=JetBrains+Mono:wght@500;600&family=PT+Serif:wght@400;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/site.css">
  <link rel="stylesheet" href="/assets/css/jobsite.css">
  <link rel="stylesheet" href="/assets/css/pages.css">
  <link rel="stylesheet" href="/assets/css/ultimate.css">
  <script>document.documentElement.classList.add('js')</script>
  <script src="/assets/js/site.js" defer></script>
</head>
<body class="u-site">
  <a class="skip" href="#main">Skip to content</a>

{TOP}

  <main id="main">
'''

def cta_buttons(form):
    return f'''<div class="hero-cta">
          <a class="btn btn-primary btn-lg" href="tel:+13479514761" data-tel>{PHONE}Call <span data-phone>347-951-4761</span></a>
          <a class="btn btn-outline btn-lg" href="/?service={form.replace(' ', '+')}#request">Book service</a>
        </div>'''

def media(src, alt, attrs='loading="lazy"'):
    if src.endswith('.mp4'):
        return f'<video src="{src}" poster="{src[:-4]}.webp" muted loop playsinline autoplay preload="metadata" aria-label="{alt}"></video>'
    return f'<img src="{src}" alt="{alt}" {attrs}>'

def shots(items):
    return '\n'.join(f'          <figure class="shot">{media(s, a)}</figure>' for s, a, c in items)

def area_chips(current=None):
    return '\n'.join(f'          <li><a href="/service-areas/{k}/">{v["label"]}</a></li>' for k, v in AREAS.items() if k != current)

def service_covers(current=None):
    return '\n'.join(f'          <li><a href="/services/{k}/"><strong>{v["name"]}</strong><span>{v["lede"].split(".")[0]}.</span></a></li>' for k, v in SERVICES.items() if k != current)

def page_end(form, heading):
    return f'''    <section class="page-cta">
      <div class="wrap">
        <h2>{heading}</h2>
        <p>Emergencies: call any hour. Everything else: call or send a request and we’ll set a time.</p>
        <div class="hero-cta">
          <a class="btn btn-light btn-lg" href="tel:+13479514761" data-tel>{PHONE}Call <span data-phone>347-951-4761</span></a>
          <a class="btn btn-outline btn-lg" href="/?service={form.replace(' ', '+')}#request">Send a request</a>
        </div>
      </div>
    </section>
  </main>

{BOTTOM}
</body>
</html>
'''

def write(path, html):
    full = os.path.join(ROOT, path, 'index.html')
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, 'w').write(html)
    print('wrote', '/' + path + '/')

for slug, s in SERVICES.items():
    src, alt, cap = s['photo']
    covers = '\n'.join(f'          <li><strong>{t}</strong><span>{d}</span></li>' for t, d in s['covers'])
    bg = s.get('bgvideo')
    bg_html = f'\n      <video class="page-hero-bg" src="{bg[0]}" poster="{bg[1]}" muted loop playsinline autoplay preload="metadata" aria-hidden="true"></video>' if bg else ''
    credits = f'\n        <p class="credits">{s["credits"]}</p>' if s.get('credits') else ''
    html = head(s['title'], s['desc'], f'services/{slug}') + f'''    <section class="page-hero{' page-hero--video' if bg else ''}">{bg_html}
      <div class="wrap page-hero-grid">
        <div>
          <ol class="crumbs"><li><a href="/">Home</a></li><li><a href="/#services">Services</a></li><li aria-current="page">{s['name']}</li></ol>
          <p class="pill"><span class="pulse" aria-hidden="true"></span>24/7 emergency service · All 5 boroughs</p>
          <h1>{s['h1']}</h1>
          <p class="lede">{s['lede']}</p>
          {cta_buttons(s['form'])}
        </div>
        <figure class="page-hero-photo">{media(src, alt, 'fetchpriority="high"')}</figure>
      </div>
    </section>

    <section class="page-sec">
      <div class="wrap qa">
        <h2>{s['q']}</h2>
        <div class="answer">
          {s['a']}
        </div>
      </div>
    </section>

    <section class="page-sec">
      <div class="wrap">
        <h2>What we <em>cover.</em></h2>
        <ul class="covers" role="list">
{covers}
        </ul>
      </div>
    </section>

    <section class="page-sec">
      <div class="wrap">
        <h2>Real <em>work.</em></h2>
        <div class="shots">
{shots(s['shots'])}
        </div>{credits}
      </div>
    </section>

    <section class="page-sec">
      <div class="wrap">
        <h2>After you <em>call.</em></h2>
{STEPS}
      </div>
    </section>

    <section class="page-sec">
      <div class="wrap">
        <h2>Where we <em>work.</em></h2>
        <ul class="chips" role="list">
{area_chips()}
        </ul>
      </div>
    </section>

''' + page_end(s['form'], f"Need {s['name'].lower().replace('24/7 ', '')}? <em>Call Mo.</em>")
    write(f'services/{slug}', html)

for slug, a in AREAS.items():
    n = a['where']; nn = n
    title = f'HVAC &amp; Refrigeration Repair in {n} | M&amp;H HVAC'
    desc = f'Heating, cooling and commercial refrigeration repair in {n}. Mini splits, boilers, walk-in coolers and deli cases. 24/7 emergencies. Call 347-951-4761.'
    html = head(title, desc, f'service-areas/{slug}') + f'''    <section class="page-hero">
      <div class="wrap page-hero-grid">
        <div>
          <ol class="crumbs"><li><a href="/">Home</a></li><li><a href="/#areas">Service areas</a></li><li aria-current="page">{a['name']}</li></ol>
          <p class="pill"><span class="pulse" aria-hidden="true"></span>{a['pill']}</p>
          <h1>HVAC &amp; refrigeration repair in <em>{n}.</em></h1>
          <p class="lede">{a['lede']}</p>
          {cta_buttons('Repair')}
        </div>
        <figure class="page-hero-photo"><img src="/assets/work/{a['photo']}.webp" alt="Outdoor units on an M&amp;H job" fetchpriority="high"></figure>
      </div>
    </section>

    <section class="page-sec">
      <div class="wrap qa">
        <h2>{a['q']}</h2>
        <div class="answer">
          {a['answer']}
          <p>Call <a href="tel:+13479514761" data-tel><span data-phone>347-951-4761</span></a> with the address and what’s going on.</p>
        </div>
      </div>
    </section>

    <section class="page-sec">
      <div class="wrap">
        <h2>What we handle in <em>{nn}.</em></h2>
        <ul class="covers" role="list">
{service_covers()}
        </ul>
      </div>
    </section>

    <section class="page-sec">
      <div class="wrap">
        <h2>After you <em>call.</em></h2>
{STEPS}
      </div>
    </section>

    <section class="page-sec">
      <div class="wrap">
        <h2>Other <em>areas.</em></h2>
        <ul class="chips" role="list">
{area_chips(slug)}
        </ul>
      </div>
    </section>

''' + page_end('Repair', f'In {nn}? <em>Call Mo.</em>')
    write(f'service-areas/{slug}', html)
