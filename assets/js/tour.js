/* M&H HVAC — scroll-driven building walkthrough.
   Native vertical scroll moves one camera through the building, forward or back.
   Ported from the Gallery Comfort film tour: one pinned stage, short-GOP clips
   seeked by a hidden <video>, one seek in flight per clip, last decoded frame
   held on a canvas, captions faded by local progress, a three-panel hold. */
(() => {
  const TOUR = {
    base: 'assets/tour/',
    lead: 0.22,                    // viewport heights of hero hold before the camera moves
    tail: 0.35,                    // hold after the last segment before release
    length: () => (innerWidth <= 650 ? 2.0 : 2.3), // viewport heights per segment
    clips: [
      { name: '01-street-to-deli', frames: 0, fps: 24, chapter: 'deli' },
      { name: '01-street-to-deli', frames: 0, fps: 24, chapter: 'deli', showcase: 'refrigeration' }
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
  const touch = matchMedia('(pointer: coarse)');

  fetch(TOUR.base + 'manifest.json').then(r => (r.ok ? r.json() : null)).catch(() => null).then(m => {
    if (!m) return;
    for (const c of TOUR.clips) c.frames = (m.frames && m.frames[c.name]) || c.frames;
    if (TOUR.clips.some(c => !c.frames)) return;
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
      const t = Math.min(p.want / p.fps, Math.max(0, v.duration - 0.045));
      if (Math.abs(v.currentTime - t) < 0.015) return;
      try { v.currentTime = t; } catch { p.error = true; }
    }
    function request(clip, frame, tier) {
      const key = tier + '/' + clip.name;
      let p = pool.get(key);
      if (!p) {
        const v = document.createElement('video');
        v.muted = true; v.playsInline = true; v.preload = 'auto';
        v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
        v.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none';
        p = { video: v, snap: document.createElement('canvas'), want: frame, ready: -1, error: false, dead: false, fps: clip.fps, t0: performance.now() };
        pool.set(key, p);
        document.body.append(v);
        const capture = () => {
          if (p.dead || v.readyState < 2) return;
          const s = p.snap;
          if (s.width !== v.videoWidth) { s.width = v.videoWidth; s.height = v.videoHeight; }
          s.getContext('2d', { alpha: false }).drawImage(v, 0, 0);
          p.ready = Math.round(v.currentTime * p.fps);
          schedule();
        };
        v.addEventListener('loadedmetadata', () => seek(p));
        v.addEventListener('loadeddata', () => { capture(); seek(p); });
        v.addEventListener('seeked', () => { capture(); seek(p); });
        v.addEventListener('error', () => { p.error = true; schedule(); });
        v.src = `${TOUR.base}${clip.name}/${tier}.mp4`;
        v.load();
      }
      p.want = frame; seek(p);
      // A clip that never decodes falls back to sharp posters instead of a blank stage.
      if (p.ready < 0 && performance.now() - p.t0 > 6000) p.error = true;
      return p;
    }
    function keep(names, tier) {
      for (const [k, p] of pool) {
        if (!names.includes(k)) { p.dead = true; p.video.removeAttribute('src'); p.video.load(); p.video.remove(); p.snap.width = p.snap.height = 1; pool.delete(k); }
      }
      void tier;
    }

    /* ---- Geometry + camera clock ---- */
    let w = 0, h = 0, top = 0, L = 2.3, tier = '', dirty = true, raf = 0, y, lastT, lastPaint = '';
    function geometry() {
      w = stage.clientWidth; h = stage.clientHeight;
      top = scrollY + walk.getBoundingClientRect().top;
      const nextTier = w / h < 0.85 ? 'phone' : 'desktop';
      if (tier && nextTier !== tier) keep([], tier);
      tier = nextTier;
      L = TOUR.length();
      const maxPx = tier === 'phone' ? 2073600 : 3686400;
      const dpr = Math.min(devicePixelRatio || 1, 3, Math.sqrt(maxPx / (w * h)));
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      walk.style.setProperty('--tour-length', String(100 * (1 + TOUR.lead + TOUR.clips.length * L + TOUR.tail)));
      lastPaint = ''; dirty = false;
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
    function cover(src) {
      const fw = src.width || src.naturalWidth, fh = src.height || src.naturalHeight;
      const s = Math.max(canvas.width / fw, canvas.height / fh);
      const sw = canvas.width / s, sh = canvas.height / s;
      ctx.drawImage(src, (fw - sw) / 2, (fh - sh) / 2, sw, sh, 0, 0, canvas.width, canvas.height);
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
      const clip = TOUR.clips[c];
      const f = Math.round((clip.showcase ? 1 : u) * (clip.frames - 1));
      const visible = dist > -1 && dist < 1 + TOUR.lead + n * L + TOUR.tail;

      if (visible) {
        const p = request(clip, f, tier);
        const next = TOUR.clips[c + 1];
        if (next && next.name !== clip.name && u > 0.6) request(next, 0, tier);
        keep([tier + '/' + clip.name].concat(next && u > 0.6 ? [tier + '/' + next.name] : []), tier);
        let src = !p.error && p.ready >= 0 ? p.snap : null;
        if (!src) src = poster(clip.name, f > clip.frames / 2 ? 'end' : 'start', tier);
        const stamp = [tier, c, f, p.ready, canvas.width, canvas.height, !!src].join('/');
        if (src && stamp !== lastPaint) { cover(src); lastPaint = stamp; canvas.classList.add('on'); }
        stage.dataset.frame = String(f); stage.dataset.decoded = String(p.ready);
      } else keep([], tier);

      // Hero title leaves as the camera starts moving.
      const heroOut = smooth(0.04, TOUR.lead + 0.35 * L, dist);
      title.style.opacity = String(1 - heroOut);
      title.style.transform = `translateY(${-24 * heroOut}px)`;
      title.style.pointerEvents = heroOut > 0.5 ? 'none' : '';
      title.querySelectorAll('a').forEach(a => (heroOut > 0.5 ? a.setAttribute('tabindex', '-1') : a.removeAttribute('tabindex')));

      // One caption at a time: the arriving room fades in over .72-.88.
      const exhibit = raw >= 0 && raw < n ? clip.showcase : null;
      const exOp = exhibit ? smooth(0, 0.12, u) * (1 - smooth(0.9, 1, u)) : 0;
      let capOp = raw < 0 ? 0 : clip.showcase ? 1 : smooth(0.72, 0.88, u);
      if (raw >= n) capOp = 1;
      capOp *= 1 - exOp;
      rooms.forEach(el => {
        const on = el.dataset.room === clip.chapter;
        el.style.opacity = on ? String(capOp) : '0';
        el.style.visibility = on && capOp > 0.01 ? 'visible' : 'hidden';
      });

      // Three-panel hold: fade in, pan on phones, fade back to the same frame.
      if (showcase) {
        showcase.style.opacity = String(exOp);
        showcase.style.visibility = exOp > 0.01 ? 'visible' : 'hidden';
        const pan = (smooth(0.27, 0.39, u) + smooth(0.59, 0.71, u)) * (-100 / 3);
        grid.style.setProperty('--pan', (exhibit ? pan : 0) + '%');
      }

      label.textContent = raw < 0.6 ? 'Heating · Cooling · Refrigeration' : exhibit ? 'Refrigeration' : 'Commercial refrigeration';
      if (meter) meter.style.setProperty('--progress', clamp(dist / (TOUR.lead + n * L)).toFixed(3));
      if (pos.moving) schedule();
    }
    function schedule() { if (!raf && !document.hidden) raf = requestAnimationFrame(draw); }

    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', () => { dirty = true; schedule(); }, { passive: true });
    new ResizeObserver(() => { dirty = true; schedule(); }).observe(stage);
    document.addEventListener('visibilitychange', schedule);
    addEventListener('pageshow', e => { if (e.persisted) { dirty = true; schedule(); } });
    addEventListener('pagehide', () => keep([], tier));
    reduced.addEventListener('change', () => location.reload());
    schedule();
  }
})();
