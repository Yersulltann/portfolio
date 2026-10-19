(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- LANGUAGES ----------
     Ссылка с ?lang=ru|kz|pl сразу открывает нужный язык — удобно для QR-кодов. */
  const LANGS = ['en', 'ru', 'kz', 'pl'];
  const HTML_LANG = { en: 'en', ru: 'ru', kz: 'kk', pl: 'pl' };
  const store = {
    get() { try { return localStorage.getItem('lang'); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem('lang', v); } catch (e) {} }
  };
  function detect() {
    const q = new URLSearchParams(location.search).get('lang');
    if (q && LANGS.includes(q)) return q;
    const saved = store.get();
    if (saved && LANGS.includes(saved)) return saved;
    const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    if (nav === 'kk') return 'kz';
    if (LANGS.includes(nav)) return nav;
    return 'en';
  }
  let current = 'en';
  function t(key) {
    const d = window.I18N || {};
    return (d[current] && d[current][key]) || (d.en && d.en[key]) || null;
  }
  function apply(lang) {
    current = lang;
    $$('[data-i18n]').forEach(el => {
      const v = t(el.dataset.i18n);
      if (v != null) el.innerHTML = v;
    });
    document.documentElement.lang = HTML_LANG[lang];
    $$('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  }
  $$('.lang button').forEach(b => b.addEventListener('click', () => {
    apply(b.dataset.lang);
    store.set(b.dataset.lang);
    const u = new URL(location.href);
    u.searchParams.set('lang', b.dataset.lang);
    history.replaceState(null, '', u);
  }));
  apply(detect());


  /* ---------- THEME: день / ночь ----------
     По умолчанию — как в настройках устройства. Кнопка в меню переключает и запоминает. */
  const root = document.documentElement;
  const sysDark = window.matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : sysDark.matches;
  const themeBtn = $('#theme');
  if (themeBtn) themeBtn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    const swap = () => {
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
    };
    // новая тема «разливается» кругом от кнопки (View Transitions API; где нет — просто плавная смена)
    if (!document.startViewTransition || reduce) return swap();
    const r = themeBtn.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add('vt');
    const vt = document.startViewTransition(swap);
    vt.ready.then(() => root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
      { duration: 750, easing: 'cubic-bezier(.65,0,.2,1)', pseudoElement: '::view-transition-new(root)' }
    )).catch(() => {});
    vt.finished.finally(() => root.classList.remove('vt'));
  });

  /* ---------- NAV ---------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- REVEAL ---------- */
  requestAnimationFrame(() => setTimeout(() => { $('.h1').classList.add('in'); const f = $('.figure'); if (f) f.classList.add('in'); }, 60));
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const sibs = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal'));
      el.style.transitionDelay = Math.min(sibs.indexOf(el), 5) * 70 + 'ms';
      el.classList.add('in');
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- COUNTERS ---------- */
  const cio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, to = +el.dataset.to;
      cio.unobserve(el);
      if (reduce) return;
      const t0 = performance.now(), dur = 1200;
      (function step(now) {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold: 0.6 });
  $$('.count').forEach(el => cio.observe(el));

  /* ---------- VIDEO SLOTS ----------
     Пока файла assets/hero.mp4 нет — показывается плейсхолдер.
     Как только положишь видео — оно само появится. */
  $$('.media video').forEach(v => {
    const sources = $$('source', v);
    const kill = () => v.remove();
    if (!sources.length) return kill();
    sources[sources.length - 1].addEventListener('error', kill);
    v.addEventListener('error', kill);
    v.addEventListener('loadeddata', () => v.classList.add('ready'));
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); }
  });
  const vio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const v = e.target;
      if (!v.isConnected || reduce) return;
      if (e.isIntersecting) { const p = v.play(); if (p) p.catch(() => {}); } else v.pause();
    });
  });
  $$('.media video').forEach(v => vio.observe(v));

  /* ---------- COPY EMAIL ---------- */
  $$('.copy').forEach(btn => btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(btn.dataset.copy); }
    catch (e) {
      const ta = document.createElement('textarea');
      ta.value = btn.dataset.copy; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (_) {}
      ta.remove();
    }
    btn.textContent = t('copied');
    setTimeout(() => { btn.textContent = t('copy'); }, 1600);
  }));

  /* ---------- CV ----------
     Если PDF ещё не загружен в cv/, кнопка превращается в «Запросить CV» (письмо). */
  const cvLinks = $$('.js-cv');
  if (cvLinks.length) {
    const url = cvLinks[0].getAttribute('href');
    const fallback = () => cvLinks.forEach(a => {
      a.removeAttribute('download');
      a.href = 'mailto:yersultanagzamov@gmail.com?subject=' + encodeURIComponent('CV request — Yersultan Kumaruly');
      a.dataset.i18n = 'cta_cv_req';
      a.innerHTML = t('cta_cv_req');
    });
    if (location.protocol === 'file:') fallback();
    else fetch(url, { method: 'HEAD' }).then(r => { if (!r.ok) fallback(); }).catch(fallback);
  }
})();
