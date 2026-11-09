/* M&H HVAC — scroll-driven building walkthrough.
   Native vertical scroll moves one camera through the building, forward or back.

   Segment types (built from #tour-script):
     film      camera move; scroll scrubs a short-GOP video (one seek in flight,
               last decoded frame held on a canvas, poster fallback)
     showcase  hold the last film frame; three panels fade in (pan on phones)
     item      hold the last film frame; equipment pulls out of the scene and
               spins with scroll from a preloaded image sequence (no seeking),
               title + description slide in, then it settles back

   Performance rules: one rAF per scroll burst, geometry read only on resize,
   DOM written only when a value changes, canvases repainted only when the
   source frame changes, media loaded only for the current/next segment. */
(() => {
  const BASE = 'assets/tour/';
  const LEAD = 0.22, TAIL = 0.35;
  const WEIGHT = { film: 1, showcase: 0.8, item: 0.72 };

  const walk = document.querySelector('.walk');
  const stage = walk && walk.querySelector('.stage');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!stage || reduced.matches) return;

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const touch = matchMedia('(pointer: coarse)');
  const $ = s => stage.querySelector(s);
  const view = $('#view'), title = $('.title'), label = $('#tour-label'), meter = $('.meter i');
  const rooms = [...stage.querySelectorAll('#rooms [data-room]')];
  const showcase = $('[data-showcase]'), grid = showcase && showcase.querySelector('.tour-grid');
  const itemEls = new Map([...stage.querySelectorAll('[data-item]')].map(el => [el.dataset.item, el]));

  // Write-if-changed helpers keep style recalcs to a minimum.
  const last = new WeakMap();
  function set(el, prop, val) {
    let m = last.get(el); if (!m) last.set(el, (m = {}));
    if (m[prop] === val) return;
    m[prop] = val;
    if (prop.startsWith('--')) el.style.setProperty(prop, val); else el.style[prop] = val;
  }

  fetch(BASE + 'manifest.json').then(r => (r.ok ? r.json() : null)).catch(() => null).then(m => {
    if (!m) return;
    const segs = [];
    for (const s of m.script || []) {
      if (s.type === 'film' && !(m.films || {})[s.name]) continue;
      if (s.type === 'item' && (!(m.spins || {})[s.name] || !itemEls.has(s.name))) continue;
      segs.push({ ...s, frames: s.type === 'film' ? m.films[s.name] : s.type === 'item' ? m.spins[s.name] : 0 });
    }
    if (!segs.length || segs[0].type !== 'film') return;
    start(segs);
  });

  function start(segs) {
    document.documentElement.classList.add('tour-on');
    $('#rooms').hidden = false;
    const n = segs.length;
    // Cumulative layout in "segment units" so items can be shorter than films.
    let acc = 0;
    segs.forEach(s => { s.at = acc; s.len = WEIGHT[s.type]; acc += s.len; });
    const total = acc;
    // Which film is behind each segment.
    segs.forEach((s, i) => { let j = i; while (segs[j].type !== 'film') j--; s.film = segs[j]; });

    const canvas = document.createElement('canvas');
    canvas.className = 'tour-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    view.append(canvas);
    const ctx = canvas.getContext('2d', { alpha: false });
    for (const el of itemEls.values()) {
      const cv = document.createElement('canvas');
      cv.className = 'item-canvas';
      el.querySelector('.item-media').append(cv);
      el._cv = cv; el._ctx = cv.getContext('2d', { alpha: false });
    }

    /* ---------- Film decoder ---------- */
    const pool = new Map(), posters = new Map();
    function poster(name, which) {
      const k = name + which + tier;
      if (!posters.has(k)) { const i = new Image(); i.decoding = 'async'; i.src = `${BASE}${name}/${which}-${tier}.webp`; i.onload = schedule; posters.set(k, i); }
      const i = posters.get(k); return i.complete && i.naturalWidth ? i : null;
    }
    function seek(p) {
      const v = p.video;
      if (p.dead || v.readyState < 1 || v.seeking) return;
      const t = Math.min((p.want + 0.5) / 24, Math.max(0, v.duration - 0.045));
      if (Math.abs(v.currentTime - t) < 0.02) return;
      try { v.currentTime = t; } catch { p.error = true; }
    }
    function film(name, frame) {
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
          p.ready = Math.floor(v.currentTime * 24);
          schedule();
        };
        v.addEventListener('loadedmetadata', () => seek(p));
        v.addEventListener('loadeddata', () => { capture(); seek(p); });
        v.addEventListener('seeked', () => { capture(); seek(p); });
        v.addEventListener('error', () => { p.error = true; schedule(); });
        v.src = `${BASE}${name}/${tier}.mp4`;
        v.load();
      }
      p.want = frame; seek(p);
      if (p.ready < 0 && performance.now() - p.t0 > 8000) p.error = true;
      return p;
    }
    function keepFilms(keys) {
      for (const [k, p] of pool) if (!keys.has(k)) { p.dead = true; p.video.removeAttribute('src'); p.video.load(); p.video.remove(); p.snap.width = p.snap.height = 1; pool.delete(k); }
    }

    /* ---------- Spin sequences (image frames, preloaded) ---------- */
    const seqs = new Map();
    function seq(seg) {
      const key = tier + '/' + seg.name;
      let s = seqs.get(key);
      if (!s) {
        s = { imgs: [], urls: [], ctrl: new AbortController() };
        seqs.set(key, s);
        // One request per spin: [count][lengths...][webp bytes...]
        fetch(`${BASE}${seg.name}/${tier === 'phone' ? 'p' : 'd'}.pack`, { signal: s.ctrl.signal })
          .then(r => { if (!r.ok) throw Error('pack'); return r.arrayBuffer(); })
          .then(buf => {
            if (s.dead) return;
            const v = new DataView(buf), count = v.getUint32(0, true);
            let off = 4 + count * 4;
            for (let i = 0; i < count; i++) {
              const len = v.getUint32(4 + i * 4, true);
              const url = URL.createObjectURL(new Blob([new Uint8Array(buf, off, len)], { type: 'image/webp' }));
              off += len;
              const img = new Image(); img.decoding = 'async'; img.src = url;
              img.onload = () => { if (img.decode) img.decode().catch(() => {}); schedule(); };
              s.urls.push(url); s.imgs.push(img);
            }
            schedule();
          })
          .catch(() => {});
      }
      return s;
    }
    function nearestLoaded(s, f) {
      for (let d = 0; d < s.imgs.length; d++) {
        for (const i of [f - d, f + d]) { const im = s.imgs[i]; if (im && im.complete && im.naturalWidth) return [im, i]; }
      }
      return [null, -1];
    }
    function keepSeqs(keys) {
      for (const [k, s] of seqs) if (!keys.has(k)) { s.dead = true; s.ctrl.abort(); s.imgs.forEach(i => (i.src = '')); s.urls.forEach(u => URL.revokeObjectURL(u)); seqs.delete(k); }
    }

    /* ---------- Geometry + camera clock ---------- */
    let w = 0, h = 0, top = 0, L = 2.2, tier = '', dirty = true, raf = 0, y, lastT;
    const painted = new WeakMap();
    function geometry() {
      w = stage.clientWidth; h = stage.clientHeight;
      top = scrollY + walk.getBoundingClientRect().top;
      const nextTier = w / h < 0.85 ? 'phone' : 'desktop';
      if (tier && nextTier !== tier) { keepFilms(new Set()); keepSeqs(new Set()); }
      tier = nextTier;
      L = w <= 650 ? 2.0 : 2.2;
      const maxPx = tier === 'phone' ? 2073600 : 3686400;
      const dpr = Math.min(devicePixelRatio || 1, 2, Math.sqrt(maxPx / (w * h)));
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      for (const el of itemEls.values()) {
        const r = el.querySelector('.item-media').getBoundingClientRect();
        const d2 = Math.min(devicePixelRatio || 1, 2);
        el._cv.width = Math.max(1, Math.round(r.width * d2)); el._cv.height = Math.max(1, Math.round(r.height * d2));
        painted.delete(el._cv);
      }
      painted.delete(canvas);
      walk.style.setProperty('--tour-length', String(100 * (1 + LEAD + total * L + TAIL)));
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
      if (!cv.classList.contains('on')) cv.classList.add('on');
    }
    function locate(units) {
      let i = 0;
      while (i < n - 1 && units >= segs[i + 1].at) i++;
      return [i, clamp((units - segs[i].at) / segs[i].len)];
    }

    /* ---------- Frame ---------- */
    function draw(now) {
      raf = 0;
      if (document.hidden) return;
      if (dirty) geometry();
      const pos = position(now);
      const dist = (pos.y - top) / h;
      const units = (dist - LEAD) / L;
      const [c, u] = locate(Math.max(0, units));
      const seg = segs[c], bg = seg.film;
      const fu = seg === bg ? (units < 0 ? 0 : u) : 1;
      const f = Math.round(fu * (bg.frames - 1));
      const inRange = dist > -1 && dist < 1 + LEAD + total * L + TAIL;
      const filmKeys = new Set(), seqKeys = new Set();

      if (inRange) {
        const p = film(bg.name, f); filmKeys.add(tier + '/' + bg.name);
        const src = !p.error && p.ready >= 0 ? p.snap : poster(bg.name, f > bg.frames / 2 ? 'end' : 'start');
        paint(canvas, ctx, src, [bg.name, p.ready, tier, canvas.width, canvas.height].join('/') + (src === p.snap ? '' : '/poster' + f));
        // Prewarm upcoming media so arrival never waits on the network.
        for (let k = c + 1; k < Math.min(n, c + 3); k++) {
          const nx = segs[k];
          if (nx.type === 'film' && (k === c + 1 ? u > 0.4 : u > 0.75)) { film(nx.name, 0); filmKeys.add(tier + '/' + nx.name); }
          if (nx.type === 'item') { seq(nx); seqKeys.add(tier + '/' + nx.name); }
        }
        if (c > 0 && segs[c - 1].type === 'item' && u < 0.2) { seq(segs[c - 1]); seqKeys.add(tier + '/' + segs[c - 1].name); }
      }

      // Item pull-out
      let itemOp = 0, active = null;
      if (seg.type === 'item' && inRange && units >= 0) {
        active = itemEls.get(seg.name);
        const s = seq(seg); seqKeys.add(tier + '/' + seg.name);
        const pullIn = smooth(0, 0.18, u), pullOut = smooth(0.84, 1, u);
        itemOp = pullIn * (1 - pullOut);
        const want = Math.round(smooth(0.12, 0.86, u) * (seg.frames - 1));
        const [img, got] = nearestLoaded(s, want);
        paint(active._cv, active._ctx, img, tier + '/' + seg.name + '/' + got + '/' + active._cv.width);
        set(active, '--pull', (1 - pullIn + pullOut).toFixed(3));
        set(active, '--text', (smooth(0.18, 0.32, u) * (1 - smooth(0.8, 0.9, u))).toFixed(3));
      }
      for (const el of itemEls.values()) {
        const on = el === active;
        set(el, 'opacity', on ? itemOp.toFixed(3) : '0');
        set(el, 'visibility', on && itemOp > 0.01 ? 'visible' : 'hidden');
      }
      set(stage, '--dim', itemOp.toFixed(3));
      // Only pay for the blur filter while an item is actually over the scene.
      set(canvas, 'filter', itemOp > 0.01 ? `blur(${(itemOp * 8).toFixed(1)}px) brightness(${(1 - itemOp * 0.55).toFixed(3)})` : 'none');
      keepFilms(filmKeys); keepSeqs(seqKeys);

      // Hero title leaves as the camera starts moving.
      const heroOut = smooth(0.04, LEAD + 0.35 * L, dist);
      set(title, 'opacity', (1 - heroOut).toFixed(3));
      set(title, 'transform', `translateY(${(-24 * heroOut).toFixed(1)}px)`);
      const heroGone = heroOut > 0.5;
      if (title._gone !== heroGone) {
        title._gone = heroGone;
        title.style.pointerEvents = heroGone ? 'none' : '';
        title.querySelectorAll('a').forEach(a => (heroGone ? a.setAttribute('tabindex', '-1') : a.removeAttribute('tabindex')));
      }

      // Room caption: arrives at the end of its film, hidden under panels/items.
      const exOp = seg.type === 'showcase' && units >= 0 ? smooth(0, 0.12, u) * (1 - smooth(0.9, 1, u)) : 0;
      // Captions never share the screen with an item card: shown at the end of
      // its film, faded out as the first item lifts, back only at the very end.
      let capOp = 0;
      if (units >= total) capOp = 1;
      else if (units >= 0 && seg.type === 'film') capOp = c === 0 ? smooth(0.72, 0.88, u) : smooth(0.7, 0.86, u);
      else if (units >= 0 && seg.type === 'showcase') capOp = 1 - exOp;
      else if (units >= 0 && seg.type === 'item' && segs[c - 1].type === 'film') capOp = 1 - smooth(0, 0.1, u);
      if (c === n - 1 && seg.type === 'item') capOp = Math.max(capOp, smooth(0.9, 1, u));
      for (const el of rooms) {
        const on = el.dataset.room === bg.chapter;
        set(el, 'opacity', on ? capOp.toFixed(3) : '0');
        set(el, 'visibility', on && capOp > 0.01 ? 'visible' : 'hidden');
      }
      if (showcase) {
        set(showcase, 'opacity', exOp.toFixed(3));
        set(showcase, 'visibility', exOp > 0.01 ? 'visible' : 'hidden');
        const pan = seg.type === 'showcase' ? (smooth(0.27, 0.39, u) + smooth(0.59, 0.71, u)) * (-100 / 3) : 0;
        set(grid, '--pan', pan.toFixed(2) + '%');
      }

      const txt = units < 0.3 ? 'Heating · Cooling · Refrigeration' : active ? active.dataset.label : seg.type === 'showcase' ? 'Refrigeration' : (rooms.find(r => r.dataset.room === bg.chapter) || {}).dataset?.label || '';
      if (label.textContent !== txt) label.textContent = txt;
      if (meter) set(meter, '--progress', clamp(dist / (LEAD + total * L)).toFixed(3));
      if (pos.moving) schedule();
    }
    function schedule() { if (!raf && !document.hidden) raf = requestAnimationFrame(draw); }

    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', () => { dirty = true; schedule(); }, { passive: true });
    new ResizeObserver(() => { dirty = true; schedule(); }).observe(stage);
    document.addEventListener('visibilitychange', schedule);
    addEventListener('pageshow', e => { if (e.persisted) { dirty = true; schedule(); } });
    addEventListener('pagehide', () => { keepFilms(new Set()); keepSeqs(new Set()); });
    reduced.addEventListener('change', () => location.reload());
    schedule();
  }
})();
