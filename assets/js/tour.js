/* M&H HVAC — scroll-driven building walkthrough.
   Native vertical scroll moves one camera through the building, forward or back.
   Ported from the Gallery Comfort film tour: one pinned stage, short-GOP clips
   seeked by a hidden <video>, one seek in flight per clip, last decoded frame
   held on a canvas, captions faded by local progress.

   Segment types (TOUR.clips):
     film      camera move; scroll scrubs the clip
     showcase  hold the previous film's last frame, three panels fade in
     item      hold the previous film's last frame; the equipment pulls out of
               the scene, spins with scroll (a turntable clip), then settles back */
(() => {
  const TOUR = {
    base: 'assets/tour/',
    lead: 0.22,
    tail: 0.35,
    length: () => (innerWidth <= 650 ? 2.0 : 2.3),
    clips: [
      { type: 'film', name: '01-street-to-deli', chapter: 'deli' },
      { type: 'showcase', showcase: 'refrigeration' },
      { type: 'item', name: 'item-walk-in-cooler', item: 'walk-in-cooler' }
    ]
  };

  const walk = document.querySelector('.walk');
  const stage = walk && walk.querySelector('.stage');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!stage || reduced.matches) return;

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const view = stage.querySelector('#view');
  const title = stage.querySelector('.title');
  const label = stage.querySelector('#tour-label');
  const meter = stage.querySelector('.meter i');
  const rooms = [...stage.querySelectorAll('#rooms [data-room]')];
  const showcase = stage.querySelector('[data-showcase]');
  const grid = showcase && showcase.querySelector('.tour-grid');
  const items = new Map([...stage.querySelectorAll('[data-item]')].map(el => [el.dataset.item, el]));
  const touch = matchMedia('(pointer: coarse)');

  fetch(TOUR.base + 'manifest.json').then(r => (r.ok ? r.json() : null)).catch(() => null).then(m => {
    if (!m || !m.frames) return;
    // Drop segments whose media isn't in the manifest, so a partial build still works.
    TOUR.clips = TOUR.clips.filter(c => c.type === 'showcase' || m.frames[c.name]);
    TOUR.clips.forEach(c => { if (c.name) { c.frames = m.frames[c.name]; c.fps = 24; } });
    if (!TOUR.clips.some(c => c.type === 'film')) return;
    start();
  });

  function start() {
    document.documentElement.classList.add('tour-on');
    stage.querySelector('#rooms').hidden = false;
    const canvas = document.createElement('canvas');
    canvas.className = 'tour-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    view.append(canvas);
    const ctx = canvas.getContext('2d', { alpha: false });
    for (const el of items.values()) {
      const cv = document.createElement('canvas');
      cv.className = 'item-canvas';
      el.querySelector('.item-media').append(cv);
      el._cv = cv; el._ctx = cv.getContext('2d', { alpha: false });
    }

    /* ---- Decoder: one hidden video per clip+tier, one seek in flight ---- */
    const pool = new Map();
    const posters = new Map();
    function poster(name, which, tier) {
      const k = name + which + tier;
      if (!posters.has(k)) { const i = new Image(); i.decoding = 'async'; i.src = `${TOUR.base}${name}/${which}-${tier}.webp`; i.onload = schedule; posters.set(k, i); }
      const i = posters.get(k); return i.complete && i.naturalWidth ? i : null;
    }
    function seek(p) {
      const v = p.video;
      if (p.dead || v.readyState < 1 || v.seeking) return;
      const t = Math.min(p.want / 24, Math.max(0, v.duration - 0.045));
      if (Math.abs(v.currentTime - t) < 0.015) return;
      try { v.currentTime = t; } catch { p.error = true; }
    }
    function request(name, frame, tier) {
      const key = tier + '/' + name;
      let p = pool.get(key);
      if (!p) {
        const v = document.createElement('video');
        v.muted = true; v.playsInline = true; v.preload = 'auto';
        v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
        v.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none';
        p = { video: v, snap: document.createElement('canvas'), want: frame, ready: -1, error: false, dead: false, t0: performance.now() };
        pool.set(key, p);
        document.body.append(v);
        const capture = () => {
          if (p.dead || v.readyState < 2) return;
          const s = p.snap;
          if (s.width !== v.videoWidth) { s.width = v.videoWidth; s.height = v.videoHeight; }
          s.getContext('2d', { alpha: false }).drawImage(v, 0, 0);
          p.ready = Math.round(v.currentTime * 24);
          schedule();
        };
        v.addEventListener('loadedmetadata', () => seek(p));
        v.addEventListener('loadeddata', () => { capture(); seek(p); });
        v.addEventListener('seeked', () => { capture(); seek(p); });
        v.addEventListener('error', () => { p.error = true; schedule(); });
        v.src = `${TOUR.base}${name}/${tier}.mp4`;
        v.load();
      }
      p.want = frame; seek(p);
      if (p.ready < 0 && performance.now() - p.t0 > 6000) p.error = true;
      return p;
    }
    function keep(keys) {
      for (const [k, p] of pool) {
        if (!keys.includes(k)) { p.dead = true; p.video.removeAttribute('src'); p.video.load(); p.video.remove(); p.snap.width = p.snap.height = 1; pool.delete(k); }
      }
    }
    function source(name, frame, frames, tier, keys) {
      const p = request(name, frame, tier);
      keys.push(tier + '/' + name);
      return { src: !p.error && p.ready >= 0 ? p.snap : poster(name, frame > frames / 2 ? 'end' : 'start', tier), ready: p.ready };
    }

    /* ---- Geometry + camera clock ---- */
    let w = 0, h = 0, top = 0, L = 2.3, tier = '', dirty = true, raf = 0, y, lastT;
    const painted = new WeakMap();
    function geometry() {
      w = stage.clientWidth; h = stage.clientHeight;
      top = scrollY + walk.getBoundingClientRect().top;
      const nextTier = w / h < 0.85 ? 'phone' : 'desktop';
      if (tier && nextTier !== tier) keep([]);
      tier = nextTier;
      L = TOUR.length();
      const maxPx = tier === 'phone' ? 2073600 : 3686400;
      const dpr = Math.min(devicePixelRatio || 1, 3, Math.sqrt(maxPx / (w * h)));
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      for (const el of items.values()) {
        const r = el.querySelector('.item-media').getBoundingClientRect();
        el._cv.width = Math.max(1, Math.round(r.width * dpr)); el._cv.height = Math.max(1, Math.round(r.height * dpr));
        painted.delete(el._cv);
      }
      painted.delete(canvas);
      walk.style.setProperty('--tour-length', String(100 * (1 + TOUR.lead + TOUR.clips.length * L + TOUR.tail)));
      dirty = false;
    }
    function position(now) {
      const target = scrollY;
      const dt = lastT === undefined ? 0 : now - lastT;
      const d = target - y;
      if (!touch.matches || y === undefined || Math.abs(d) > 240 || Math.abs(d) < 0.35) y = target;
      else y += d * -Math.expm1(-Math.min(48, Math.max(8, dt)) / 38);
      lastT = now;
      return { y, moving: y !== target };
    }
    function paint(cv, c2, src, stamp) {
      if (!src || painted.get(cv) === stamp) return;
      const fw = src.width || src.naturalWidth, fh = src.height || src.naturalHeight;
      const s = Math.max(cv.width / fw, cv.height / fh);
      const sw = cv.width / s, sh = cv.height / s;
      c2.drawImage(src, (fw - sw) / 2, (fh - sh) / 2, sw, sh, 0, 0, cv.width, cv.height);
      painted.set(cv, stamp);
      cv.classList.add('on');
    }

    /* ---- Frame ---- */
    function draw(now) {
      raf = 0;
      if (document.hidden) return;
      if (dirty) geometry();
      const pos = position(now);
      const dist = (pos.y - top) / h;
      const raw = (dist - TOUR.lead) / L;
      const n = TOUR.clips.length;
      const c = clamp(Math.floor(Math.max(0, raw)), 0, n - 1);
      const u = clamp(raw - c);
      const seg = TOUR.clips[c];
      // The scene behind holds the most recent camera move.
      let fi = c; while (fi > 0 && TOUR.clips[fi].type !== 'film') fi--;
      const film = TOUR.clips[fi];
      const fu = fi === c ? u : 1;
      const f = Math.round(fu * (film.frames - 1));
      const keys = [];

      if (dist > -1 && dist < 1 + TOUR.lead + n * L + TOUR.tail) {
        const s = source(film.name, f, film.frames, tier, keys);
        paint(canvas, ctx, s.src, [film.name, f, s.ready, tier, canvas.width].join('/'));
        stage.dataset.frame = String(f); stage.dataset.decoded = String(s.ready);
        // Prewarm the next segment's media near the end of this one.
        const next = TOUR.clips[c + 1];
        if (next && next.name && u > 0.55) source(next.name, 0, next.frames, tier, keys);
      }

      // Item pull-out: rise out of the scene, spin with scroll, settle back.
      let itemOp = 0, active = null;
      if (seg.type === 'item' && raw >= 0 && raw < n) {
        active = items.get(seg.item);
        const pullIn = smooth(0, 0.16, u), pullOut = smooth(0.86, 1, u);
        itemOp = pullIn * (1 - pullOut);
        const spin = smooth(0.14, 0.84, u);
        const tf = Math.round(spin * (seg.frames - 1));
        const s = source(seg.name, tf, seg.frames, tier, keys);
        paint(active._cv, active._ctx, s.src, [seg.name, tf, s.ready, tier, active._cv.width].join('/'));
        const k = 1 - pullIn + pullOut;
        active.style.setProperty('--pull', k.toFixed(4));
        active.style.setProperty('--text', (smooth(0.2, 0.34, u) * (1 - smooth(0.8, 0.9, u))).toFixed(4));
      }
      for (const el of items.values()) {
        const on = el === active;
        el.style.opacity = on ? String(itemOp) : '0';
        el.style.visibility = on && itemOp > 0.01 ? 'visible' : 'hidden';
      }
      stage.style.setProperty('--dim', itemOp.toFixed(4));
      keep(keys);

      // Hero title leaves as the camera starts moving.
      const heroOut = smooth(0.04, TOUR.lead + 0.35 * L, dist);
      title.style.opacity = String(1 - heroOut);
      title.style.transform = `translateY(${-24 * heroOut}px)`;
      title.style.pointerEvents = heroOut > 0.5 ? 'none' : '';
      title.querySelectorAll('a').forEach(a => (heroOut > 0.5 ? a.setAttribute('tabindex', '-1') : a.removeAttribute('tabindex')));

      // Room caption: in at the end of its film, held through holds, hidden under panels/items.
      const exOp = seg.type === 'showcase' && raw >= 0 && raw < n ? smooth(0, 0.12, u) * (1 - smooth(0.9, 1, u)) : 0;
      let capOp = raw < 0 ? 0 : seg.type === 'film' ? smooth(0.72, 0.88, u) : 1;
      capOp *= (1 - exOp) * (1 - itemOp);
      rooms.forEach(el => {
        const on = el.dataset.room === film.chapter;
        el.style.opacity = on ? String(capOp) : '0';
        el.style.visibility = on && capOp > 0.01 ? 'visible' : 'hidden';
      });

      if (showcase) {
        showcase.style.opacity = String(exOp);
        showcase.style.visibility = exOp > 0.01 ? 'visible' : 'hidden';
        const pan = (smooth(0.27, 0.39, u) + smooth(0.59, 0.71, u)) * (-100 / 3);
        grid.style.setProperty('--pan', (seg.type === 'showcase' ? pan : 0) + '%');
      }

      label.textContent = raw < 0.6 ? 'Heating · Cooling · Refrigeration' : active ? active.dataset.label : seg.type === 'showcase' ? 'Refrigeration' : 'Commercial refrigeration';
      if (meter) meter.style.setProperty('--progress', clamp(dist / (TOUR.lead + n * L)).toFixed(3));
      if (pos.moving) schedule();
    }
    function schedule() { if (!raf && !document.hidden) raf = requestAnimationFrame(draw); }

    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', () => { dirty = true; schedule(); }, { passive: true });
    new ResizeObserver(() => { dirty = true; schedule(); }).observe(stage);
    document.addEventListener('visibilitychange', schedule);
    addEventListener('pageshow', e => { if (e.persisted) { dirty = true; schedule(); } });
    addEventListener('pagehide', () => keep([]));
    reduced.addEventListener('change', () => location.reload());
    schedule();
  }
})();
