/* M&H HVAC — site behavior. No dependencies. */

/* ------------------------------------------------------------------
   Business details. Fill these in once confirmed; every phone link,
   email link and label on the page updates from here.
   formEndpoint: a form service URL (Formspree, Netlify, your own API).
   Left empty, the form opens a pre-filled email to `email` instead.
------------------------------------------------------------------- */
const SITE = {
  phone: '(000) 000-0000',      // TODO: real number
  phoneE164: '+10000000000',    // TODO: same number, +1XXXXXXXXXX
  email: 'service@example.com', // TODO: real inbox
  hours: '[hours]',             // TODO e.g. 'Mon–Fri, 7am–5pm'
  area: '[service area]',       // TODO e.g. 'the Greater Houston area'
  formEndpoint: ''
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
  $$('[data-hours]').forEach(el => (el.textContent = SITE.hours));
  $$('[data-area]').forEach(el => (el.textContent = SITE.area));
  $$('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));

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
})();
