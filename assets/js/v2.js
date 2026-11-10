/* /hvac-repair/ landing page: header shadow, fades, carousel, form. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hd = $('[data-hd]');
  const onScroll = () => hd.classList.toggle('on', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  $$('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));

  const fades = $$('.fade');
  if (reduced || !('IntersectionObserver' in window)) fades.forEach(el => el.classList.add('in'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    fades.forEach(el => io.observe(el));
  }

  const car = $('[data-carousel]');
  $$('[data-car]').forEach(b => b.addEventListener('click', () => {
    const item = car.querySelector('.it');
    const step = item ? item.getBoundingClientRect().width + 20 : car.clientWidth;
    car.scrollBy({ left: Number(b.dataset.car) * step, behavior: reduced ? 'auto' : 'smooth' });
  }));

  const form = $('[data-form]'), status = $('[data-status]');
  form.addEventListener('submit', e => {
    e.preventDefault();
    status.className = 'status';
    let bad = null;
    $$('[required]', form).forEach(f => { const b = !f.value.trim(); f.setAttribute('aria-invalid', String(b)); if (b && !bad) bad = f; });
    if (bad) { status.textContent = 'Please add your name and phone number.'; status.classList.add('err'); bad.focus(); return; }
    const d = Object.fromEntries(new FormData(form));
    const body = [`Name: ${d.name}`, `Phone: ${d.phone}`, `Email: ${d.email || '-'}`, `ZIP: ${d.zip || '-'}`, '', d.message || ''].join('\n');
    location.href = `mailto:moe101221@gmail.com?subject=${encodeURIComponent('Service request from website')}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Opening your email app with the request filled in…';
    status.classList.add('ok');
  });
  $$('[required]', form).forEach(f => f.addEventListener('input', () => f.removeAttribute('aria-invalid')));
})();
