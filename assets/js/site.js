/* M&H HVAC — site behavior. No dependencies. */

/* ------------------------------------------------------------------
   Business details. Fill these in once confirmed; every phone link,
   email link and label on the page updates from here.
   formEndpoint: a form service URL (Formspree, Netlify, your own API).
   Left empty, the form opens a pre-filled email to `email` instead.
------------------------------------------------------------------- */
const SITE = {
  phone: '347-951-4761',
  phoneE164: '+13479514761',
  phone2: '347-320-5867',
  phone2E164: '+13473205867',
  email: 'moe101221@gmail.com',
  hours: '24/7',
  area: 'NYC · All 5 boroughs',
  formEndpoint: '',
  // Follower counts shown on the social cards, e.g. '12.4K'. Empty shows the platform name.
  followers: { instagram: '5.9K', tiktok: '5.6K', facebook: '15K' }
};

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  /* Config → DOM */
  $$('[data-phone]').forEach(el => (el.textContent = SITE.phone));
  $$('[data-tel]').forEach(el => (el.href = `tel:${SITE.phoneE164}`));
  $$('[data-email]').forEach(el => (el.textContent = SITE.email));
  $$('[data-mailto]').forEach(el => (el.href = `mailto:${SITE.email}`));
  $$('[data-phone2]').forEach(el => (el.textContent = SITE.phone2));
  $$('[data-tel2]').forEach(el => (el.href = `tel:${SITE.phone2E164}`));
  $$('[data-hours]').forEach(el => (el.textContent = SITE.hours));
  $$('[data-area]').forEach(el => (el.textContent = SITE.area));
  ['hours', 'area', 'phone2'].forEach(k => { if (!SITE[k]) $$(`[data-row="${k}"]`).forEach(el => (el.hidden = true)); });
  $$('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));
  $$('[data-count]').forEach(el => {
    const n = SITE.followers[el.dataset.count];
    if (n) el.textContent = `${n} followers`;
  });

  /* Header, hero meter and mobile action bar: one rAF-throttled scroll pass */
  const header = $('[data-header]');
  const bar = $('[data-action-bar]');
  const walk = $('.walk');
  const meter = $('.meter i');
  const request = $('#request');
  let requestVisible = false;
  let ticking = false;

  function onScroll() {
    ticking = false;
    const y = scrollY;
    const heroH = walk ? walk.offsetHeight : innerHeight;
    header.classList.toggle('is-solid', y > heroH - 90);
    if (meter) meter.style.setProperty('--progress', Math.min(1, Math.max(0, y / heroH)).toFixed(3));
    if (bar) bar.classList.toggle('is-on', y > heroH * 0.6 && !requestVisible);
  }
  const schedule = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  addEventListener('pageshow', schedule);
  onScroll();

  if (request && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { requestVisible = e.isIntersecting; schedule(); }, { threshold: 0.15 }).observe(request);
  }

  /* Mobile menu */
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('is-open'));
      $('a', menu).focus({ preventScroll: true });
    } else {
      menu.classList.remove('is-open');
      setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduced.matches ? 0 : 300);
    }
  }
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); } });
  matchMedia('(min-width: 1101px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  /* Scroll reveals */
  const reveals = $$('.reveal');
  if (reduced.matches || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
  }

  /* Exhibit strips: dot indicator for the swipeable phone layout */
  $$('[data-strip]').forEach(strip => {
    const dots = $$('i', strip.parentElement.querySelector('[data-dots]'));
    let raf = 0;
    const update = () => {
      raf = 0;
      const i = Math.round(strip.scrollLeft / Math.max(1, strip.clientWidth));
      dots.forEach((d, n) => d.classList.toggle('on', n === i));
    };
    strip.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    strip.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      if (strip.scrollWidth <= strip.clientWidth) return;
      e.preventDefault();
      strip.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * strip.clientWidth, behavior: reduced.matches ? 'auto' : 'smooth' });
    });
    update();
  });

  /* "How can we help" choices pre-select the request form */
  const select = $('[data-service-select]');
  $$('[data-service]').forEach(a => a.addEventListener('click', () => {
    const v = a.dataset.service;
    const opt = [...select.options].find(o => o.value === v || o.text === v);
    if (opt) select.value = opt.value;
  }));

  /* Request form */
  const form = $('[data-form]');
  const status = $('[data-status]');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    status.className = 'form-status';
    let firstBad = null;
    $$('[required]', form).forEach(f => {
      const bad = !f.value.trim();
      f.setAttribute('aria-invalid', String(bad));
      if (bad && !firstBad) firstBad = f;
    });
    if (firstBad) {
      status.textContent = 'Please add your name, phone and address.';
      status.classList.add('err');
      firstBad.focus();
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    const btn = $('button[type=submit]', form);

    if (SITE.formEndpoint) {
      btn.disabled = true; btn.textContent = 'Sending…';
      try {
        const r = await fetch(SITE.formEndpoint, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (!r.ok) throw new Error(r.status);
        form.reset();
        status.textContent = 'Thanks, your request is in. We’ll be in touch shortly.';
        status.classList.add('ok');
      } catch {
        status.innerHTML = `Something went wrong sending that. Please call <a href="tel:${SITE.phoneE164}">${SITE.phone}</a>.`;
        status.classList.add('err');
      } finally {
        btn.disabled = false; btn.textContent = 'Send request';
      }
      return;
    }

    // No endpoint yet: hand off to the visitor's email app, pre-filled.
    const body = [
      `For: ${data.property}`, `Name: ${data.name}`, `Phone: ${data.phone}`,
      `Address: ${data.address}`, `Service: ${data.service}`, '', data.message || ''
    ].join('\n');
    location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(`Service request: ${data.service}`)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Opening your email app with the request filled in…';
    status.classList.add('ok');
  });
  $$('[required]', form).forEach(f => f.addEventListener('input', () => f.removeAttribute('aria-invalid')));

  /* Van: only drive while the emergency section is on screen */
  const van = $('[data-van]');
  if (van && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => van.classList.toggle('is-driving', e.isIntersecting), { threshold: 0.1 }).observe(van.closest('section'));
  } else if (van) van.classList.add('is-driving');

  /* Work gallery: filters, "show all", lightbox */
  const tiles = $$('[data-work] .w');
  const moreBtn = $('[data-more]');
  const LIMIT = 12;
  let filter = 'all';
  let expanded = false;
  function applyFilter() {
    let shown = 0;
    tiles.forEach(t => {
      const match = filter === 'all' || t.dataset.cat === filter;
      const visible = match && (filter !== 'all' || expanded || shown < LIMIT);
      if (match) shown++;
      t.hidden = !visible;
    });
    moreBtn.parentElement.hidden = filter !== 'all' || expanded || tiles.length <= LIMIT;
  }
  $$('[data-filters] .chip').forEach(chip => chip.addEventListener('click', () => {
    filter = chip.dataset.filter;
    $$('[data-filters] .chip').forEach(c => { const on = c === chip; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', String(on)); });
    chip.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced.matches ? 'auto' : 'smooth' });
    applyFilter();
  }));
  moreBtn.addEventListener('click', () => { expanded = true; applyFilter(); });
  applyFilter();

  // Video tiles play silently only while on screen.
  if ('IntersectionObserver' in window && !reduced.matches) {
    const vio = new IntersectionObserver(es => es.forEach(e => {
      const v = e.target.querySelector('video');
      if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
    }), { threshold: 0.4 });
    tiles.filter(t => t.dataset.video).forEach(t => vio.observe(t));
  }

  const lb = $('[data-lightbox]');
  const lbMedia = $('[data-lb-media]');
  const lbCap = $('[data-lb-cap]');
  let current = 0;
  const visibleTiles = () => tiles.filter(t => !t.hidden);
  function show(tile) {
    const list = visibleTiles();
    current = list.indexOf(tile);
    const cap = tile.querySelector('figcaption').textContent;
    lbMedia.replaceChildren();
    if (tile.dataset.video) {
      const v = document.createElement('video');
      Object.assign(v, { src: tile.dataset.video, poster: tile.dataset.full, controls: true, autoplay: true, muted: true, loop: true, playsInline: true });
      lbMedia.append(v);
    } else {
      const img = new Image();
      img.alt = cap; img.src = tile.dataset.full;
      lbMedia.append(img);
    }
    lbCap.textContent = cap;
  }
  function step(d) { const list = visibleTiles(); show(list[(current + d + list.length) % list.length]); }
  let lastFocus = null;
  tiles.forEach(t => t.querySelector('.w-btn').addEventListener('click', () => {
    lastFocus = document.activeElement;
    show(t);
    lb.showModal();
    document.body.classList.add('lb-open');
  }));
  lb.addEventListener('close', () => { lbMedia.replaceChildren(); document.body.classList.remove('lb-open'); if (lastFocus) lastFocus.focus({ preventScroll: true }); });
  $('[data-lb-close]').addEventListener('click', () => lb.close());
  $('[data-lb-prev]').addEventListener('click', () => step(-1));
  $('[data-lb-next]').addEventListener('click', () => step(1));
  lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb-media')) lb.close(); });
  lb.addEventListener('keydown', e => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });
  let sx = 0, sy = 0;
  lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    else if (dy > 90) lb.close();
  }, { passive: true });
})();
