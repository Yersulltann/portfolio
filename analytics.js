/* ============================================================
   АНАЛИТИКА, два сервиса (оба бесплатные):
   1) GoatCounter — простой счётчик БЕЗ cookie: считает ВСЕХ посетителей
      (сколько, откуда, страны, устройства, нажатия). Согласие не нужно.
   2) Microsoft Clarity — карты кликов и прокрутки, записи сессий.
      Только после согласия посетителя (GDPR) — плашка внизу.
   Пустой код/ID = сервис выключен.
   ============================================================ */
(function () {
  const GOAT_CODE = 'yersultan';            // ← код сайта из goatcounter.com (часть адреса до .goatcounter.com)
  const CLARITY_ID = 'z0vnsl2e74'; // ← ID проекта из clarity.microsoft.com (Settings → Overview → Project ID)

  /* ---------- GoatCounter: без cookie, сразу для всех ---------- */
  if (GOAT_CODE) {
    const g = document.createElement('script');
    g.async = true;
    g.src = 'https://gc.zgo.at/count.js';
    g.dataset.goatcounter = 'https://' + GOAT_CODE + '.goatcounter.com/count';
    document.head.appendChild(g);
  }
  const goat = (name) => {
    if (window.goatcounter && typeof window.goatcounter.count === 'function') {
      window.goatcounter.count({ path: name, title: name, event: true });
    }
  };

  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'analytics-consent';
  const store = {
    get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} },
    clear() { try { localStorage.removeItem(KEY); } catch (e) {} }
  };

  const TEXT = {
    en: { title: 'Psst… can I have a cookie?', msg: 'Just an analytical (yummy) one — so Microsoft Clarity can show me which projects you liked and how far you scrolled. No ads, nothing sold.', yes: 'OK!', no: 'Nope, mine', thanks: 'Nom nom — thank you!', bye: 'Fair enough, hiding it.', settings: '🍪 Cookie settings' },
    ru: { title: 'Пс-с… можно печеньку?', msg: 'Аналитическую (вкусную) — чтобы Microsoft Clarity показал мне, какие проекты понравились и докуда вы долистали. Без рекламы, ничего не продаю.', yes: 'Угощайся!', no: 'Не, моё', thanks: 'Ням-ням, спасибо!', bye: 'Понял, прячу обратно.', settings: '🍪 Настройки cookie' },
    kk: { title: 'Пс-с… печенье бересіз бе?', msg: 'Аналитикалық (дәмді) біреуін — Microsoft Clarity маған қай жобалар ұнағанын және қай жерге дейін айналдырғаныңызды көрсетуі үшін. Жарнама жоқ, ештеңе сатылмайды.', yes: 'Әрине!', no: 'Жоқ, менікі', thanks: 'Мм, дәмді, рахмет!', bye: 'Түсіндім, жасырамын.', settings: '🍪 Cookie баптаулары' },
    pl: { title: 'Psst… mogę ciasteczko?', msg: 'Analityczne (pyszne) — żeby Microsoft Clarity pokazał mi, które projekty się spodobały i dokąd udało się przewinąć. Bez reklam, nic nie sprzedaję.', yes: 'Częstuj!', no: 'Nie, moje', thanks: 'Mniam, dzięki!', bye: 'Jasne, chowam.', settings: '🍪 Ustawienia cookies' }
  };
  const t = () => TEXT[document.documentElement.lang] || TEXT.en;

  /* ---------- Clarity ---------- */
  let loaded = false;
  function loadClarity() {
    if (loaded) return;
    loaded = true;
    (function (c, l, a, r, i, tg, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      tg = l.createElement(r); tg.async = 1; tg.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(tg, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
    window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
    tag('lang', document.documentElement.lang);
    tag('theme', document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  }
  const on = () => loaded && typeof window.clarity === 'function';
  const track = (name) => { goat(name); if (on()) window.clarity('event', name); };
  function tag(k, v) { if (on()) window.clarity('set', k, String(v)); }

  /* ---------- плашка согласия: кот с печенькой на мятом листке ----------
     Кот выглядывает из-за листка и держит печеньку. «OK!» — кот её откусывает,
     «Не, моё» — кот прячется, листок комкается и улетает. Глаза следят за курсором. */
  // задний слой: голова и уши (прячутся за листком)
  const CAT_BACK =
    '<svg class="cat cat-back" viewBox="0 0 170 130" aria-hidden="true">' +
      '<g class="cat-head">' +
        '<path class="ink fur" d="M38 70 L44 26 L72 52 Z"/><path class="ink fur" d="M98 52 L126 26 L132 70 Z"/>' +
        '<path class="ear-in" d="M46 40 L50 58 M124 40 L120 58"/>' +
        '<path class="ink fur" d="M85 46 C122 46 138 70 136 98 C134 124 112 136 85 136 C58 136 36 124 34 98 C32 70 48 46 85 46 Z"/>' +
        '<g class="eyes">' +
          '<circle class="ink eye" cx="67" cy="82" r="11.5"/><circle class="ink eye" cx="103" cy="82" r="11.5"/>' +
          '<g class="pupils"><circle cx="67" cy="83" r="5.6"/><circle cx="103" cy="83" r="5.6"/></g>' +
          '<path class="happy" d="M57 85 Q67 74 77 85 M93 85 Q103 74 113 85"/>' +
          '<path class="lid" d="M55.5 82 H78.5 M91.5 82 H114.5"/>' +
        '</g>' +
        '<ellipse class="blush" cx="54" cy="98" rx="7" ry="4"/><ellipse class="blush" cx="116" cy="98" rx="7" ry="4"/>' +
        '<path class="nose" d="M81 95 H89 L85 100 Z"/>' +
        '<path class="mouth" d="M78 103 Q81.5 107 85 103 Q88.5 107 92 103"/>' +
        '<path class="whisk" d="M44 96 L24 92 M44 102 L22 104 M126 96 L146 92 M126 102 L148 104"/>' +
      '</g>' +
    '</svg>';
  // передний слой: лапы и печенька (поверх края листка)
  const CAT_FRONT =
    '<svg class="cat cat-front" viewBox="0 0 170 130" aria-hidden="true">' +
      '<defs><mask id="ck-bites"><rect x="0" y="0" width="170" height="130" fill="#fff"/>' +
        '<circle class="bite b1" cx="112" cy="94" r="8" fill="#000"/>' +
        '<circle class="bite b2" cx="118" cy="104" r="7" fill="#000"/>' +
        '<circle class="bite b3" cx="124" cy="92" r="7" fill="#000"/>' +
      '</mask></defs>' +
      '<g class="cookie" mask="url(#ck-bites)">' +
        '<circle class="ink dough" cx="128" cy="106" r="19"/>' +
        '<circle class="chip" cx="121" cy="100" r="2.6"/><circle class="chip" cx="133" cy="98" r="2.2"/>' +
        '<circle class="chip" cx="136" cy="110" r="2.6"/><circle class="chip" cx="124" cy="113" r="2.2"/><circle class="chip" cx="129" cy="106" r="1.8"/>' +
      '</g>' +
      '<g class="paws">' +
        '<path class="ink fur" d="M50 126 V112 C50 105 54 102 60 102 C66 102 70 105 70 112 V126"/>' +
        '<path class="toe" d="M57 104 V110 M63 104 V110"/>' +
        '<path class="ink fur paw-r" d="M108 126 V114 C108 107 112 104 118 104 C124 104 128 107 128 114 V126"/>' +
        '<path class="toe" d="M115 106 V112 M121 106 V112"/>' +
      '</g>' +
    '</svg>';

  let banner = null;
  let stopEyes = null;
  function showBanner() {
    if (banner) return;
    banner = document.createElement('div');
    banner.className = 'consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'consent-title');
    banner.innerHTML =
      CAT_BACK +
      '<div class="paper">' +
        '<span class="ck-tag" aria-hidden="true">COOOOOOKIES ↘</span>' +
        '<b id="consent-title"></b><p></p>' +
        '<span class="consent-done" aria-live="polite"></span>' +
        '<div class="consent-b"><button type="button" data-c="no"></button><button type="button" data-c="yes"></button></div>' +
      '</div>' +
      CAT_FRONT +
      '<span class="crumbs" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span>';
    fill();

    const yesBtn = banner.querySelector('[data-c="yes"]');
    const noBtn = banner.querySelector('[data-c="no"]');
    const mood = (m) => () => banner && (banner.dataset.mood = m);
    yesBtn.addEventListener('pointerenter', mood('want'));
    noBtn.addEventListener('pointerenter', mood('worry'));
    [yesBtn, noBtn].forEach((b) => b.addEventListener('pointerleave', mood('')));
    stopEyes = followEyes(banner);

    banner.addEventListener('click', (e) => {
      const b = e.target.closest('[data-c]');
      if (!b || !banner) return;
      const yes = b.dataset.c === 'yes';
      store.set(yes ? 'yes' : 'no');
      goat(yes ? 'cookie_yes' : 'cookie_no');
      const x = t();
      banner.querySelector('.consent-done').textContent = yes ? x.thanks : x.bye;
      banner.dataset.mood = '';
      banner.classList.add(yes ? 'eaten' : 'rolled');
      if (yes) loadClarity();
      else if (loaded) window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' });
      setTimeout(hideBanner, reduce ? 900 : yes ? 2100 : 1500);
    });
    document.body.appendChild(banner);
    requestAnimationFrame(() => requestAnimationFrame(() => banner && banner.classList.add('in')));
  }

  // зрачки смотрят на курсор (только мышь, без reduced-motion)
  function followEyes(root) {
    if (reduce || !matchMedia('(hover: hover) and (pointer: fine)').matches) return null;
    const pupils = root.querySelector('.pupils');
    const svg = root.querySelector('.cat-back');
    const move = (e) => {
      const r = svg.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height * 0.63;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 120) * 4;
      pupils.setAttribute('transform', `translate(${(dx / d * k).toFixed(2)} ${(dy / d * k).toFixed(2)})`);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }

  function hideBanner() {
    if (!banner) return;
    const b = banner; banner = null;
    if (stopEyes) { stopEyes(); stopEyes = null; }
    b.classList.add('out');
    b.classList.remove('in');
    setTimeout(() => b.remove(), 700);
  }
  function fill() {
    const x = t();
    if (banner) {
      banner.querySelector('b').textContent = x.title;
      banner.querySelector('p').textContent = x.msg;
      banner.querySelector('[data-c="yes"]').textContent = x.yes;
      banner.querySelector('[data-c="no"]').textContent = x.no;
    }
    $$('[data-cookie-settings]').forEach((b) => { b.textContent = x.settings; });
  }
  // язык переключается в main.js → обновляем тексты плашки
  new MutationObserver(() => { fill(); tag('lang', document.documentElement.lang); if (document.documentElement.dataset.theme) tag('theme', document.documentElement.dataset.theme); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'data-theme'] });

  if (CLARITY_ID) {
    // ссылка «Настройки cookie» в подвале — можно передумать
    $$('[data-cookie-settings]').forEach((b) => {
      b.hidden = false;
      b.addEventListener('click', () => { store.clear(); showBanner(); });
    });
    fill();

    const choice = store.get();
    if (choice === 'yes') loadClarity();
    else if (choice !== 'no') setTimeout(showBanner, 1200);
  }

  /* ---------- события: что нажимали ---------- */
  const slug = (s) => (s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  document.addEventListener('click', (e) => {
    const el = e.target.closest('a, button');
    if (!el) return;
    let name = null;
    if (el.matches('.js-cv')) name = el.closest('.contact') ? 'cv_download_contact' : 'cv_download_hero';
    else if (el.matches('.roll')) name = 'cta_lets_talk';
    else if (el.matches('.mq')) name = 'email_marquee';
    else if (el.matches('.copy')) name = 'email_copy';
    else if (el.matches('a[href^="mailto:"]')) name = 'email_click';
    else if (el.closest('.socials')) name = 'social_' + slug(el.querySelector('span') && el.querySelector('span').textContent);
    else if (el.closest('.card')) name = 'project_' + slug(el.closest('.card').querySelector('h3').textContent);
    else if (el.matches('.lang button')) name = 'lang_' + el.dataset.lang;
    else if (el.matches('#theme')) name = 'theme_toggle';
    else if (el.closest('.links')) name = 'nav_' + (el.getAttribute('href') || '').replace('#', '');
    else if (el.closest('.foot') && el.getAttribute('href') === '#top') name = 'back_to_top';
    if (name) track(name);
  }, true);

  /* ---------- до какого раздела дочитали ---------- */
  if ('IntersectionObserver' in window) {
    const seen = new Set();
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting || seen.has(e.target)) return;
      seen.add(e.target);
      track('section_' + e.target.id);
      io.unobserve(e.target);
    }), { rootMargin: '0px 0px -50% 0px' }); // раздел засчитан, когда его верх дошёл до середины экрана
    ['work', 'about', 'experience', 'skills', 'contact'].forEach((id) => {
      const s = document.getElementById(id); if (s) io.observe(s);
    });
  }
})();
