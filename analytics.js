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
    en: { title: 'Can I have a cookie?', msg: 'Just one — so Microsoft Clarity can show me which projects you liked and how far you scrolled. No ads, nothing sold.', yes: 'Sure, take one', no: 'Nope, mine', thanks: 'Yum, thank you!', bye: 'Fair enough — keeping my hands off.', settings: '🍪 Cookie settings' },
    ru: { title: 'Можно печеньку?', msg: 'Всего одну — чтобы Microsoft Clarity показал мне, какие проекты понравились и докуда вы долистали. Без рекламы, ничего не продаю.', yes: 'Угощайся', no: 'Не, моё', thanks: 'Ням, спасибо!', bye: 'Понял, не трогаю.', settings: '🍪 Настройки cookie' },
    kk: { title: 'Бір печенье бересіз бе?', msg: 'Біреу ғана — Microsoft Clarity маған қай жобалар ұнағанын және сайтты қай жерге дейін айналдырғаныңызды көрсетуі үшін. Жарнама жоқ, ештеңе сатылмайды.', yes: 'Әрине, ал', no: 'Жоқ, менікі', thanks: 'Дәмді екен, рахмет!', bye: 'Түсіндім, тимеймін.', settings: '🍪 Cookie баптаулары' },
    pl: { title: 'Mogę ciasteczko?', msg: 'Tylko jedno — żeby Microsoft Clarity pokazał mi, które projekty się spodobały i dokąd udało się przewinąć. Bez reklam, nic nie sprzedaję.', yes: 'Jasne, częstuj się', no: 'Nie, moje', thanks: 'Mniam, dzięki!', bye: 'Jasne, nie ruszam.', settings: '🍪 Ustawienia cookies' }
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

  /* ---------- плашка согласия: «можно печеньку?» ----------
     «Угощайся» — печенье надкусывают, сыплются крошки; «Не, моё» — оно укатывается. */
  const COOKIE_SVG =
    '<svg class="ck" viewBox="0 0 64 64" aria-hidden="true">' +
      '<defs><mask id="ck-bites">' +
        '<rect width="64" height="64" fill="#fff"/>' +
        '<circle class="bite b1" cx="58" cy="12" r="11" fill="#000"/>' +
        '<circle class="bite b2" cx="62" cy="32" r="9" fill="#000"/>' +
        '<circle class="bite b3" cx="44" cy="2" r="10" fill="#000"/>' +
      '</mask></defs>' +
      '<g mask="url(#ck-bites)">' +
        '<circle cx="32" cy="32" r="28" class="ck-dough"/>' +
        '<circle cx="32" cy="32" r="28" class="ck-edge"/>' +
        '<circle cx="22" cy="22" r="3.6" class="ck-chip"/><circle cx="38" cy="18" r="2.8" class="ck-chip"/>' +
        '<circle cx="44" cy="34" r="3.4" class="ck-chip"/><circle cx="26" cy="40" r="3" class="ck-chip"/>' +
        '<circle cx="36" cy="46" r="2.4" class="ck-chip"/><circle cx="16" cy="34" r="2.2" class="ck-chip"/>' +
      '</g>' +
    '</svg>';

  let banner = null;
  function showBanner() {
    if (banner) return;
    banner = document.createElement('div');
    banner.className = 'consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'consent-title');
    banner.innerHTML =
      '<div class="ck-wrap">' + COOKIE_SVG + '<span class="crumbs" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span></div>' +
      '<div class="consent-txt"><b id="consent-title"></b><p></p>' +
      '<span class="consent-done" aria-live="polite"></span>' +
      '<div class="consent-b"><button type="button" data-c="no"></button><button type="button" data-c="yes"></button></div></div>';
    fill();
    const yesBtn = banner.querySelector('[data-c="yes"]');
    // печенька тянется к кнопке «Угощайся»
    yesBtn.addEventListener('pointerenter', () => banner && banner.classList.add('tempt'));
    yesBtn.addEventListener('pointerleave', () => banner && banner.classList.remove('tempt'));
    banner.addEventListener('click', (e) => {
      const b = e.target.closest('[data-c]');
      if (!b || !banner) return;
      const yes = b.dataset.c === 'yes';
      store.set(yes ? 'yes' : 'no');
      goat(yes ? 'cookie_yes' : 'cookie_no');
      const x = t();
      banner.querySelector('.consent-done').textContent = yes ? x.thanks : x.bye;
      banner.classList.add(yes ? 'eaten' : 'rolled');
      if (yes) loadClarity();
      else if (loaded) window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' });
      setTimeout(hideBanner, reduce ? 900 : 1700);
    });
    document.body.appendChild(banner);
    requestAnimationFrame(() => requestAnimationFrame(() => banner && banner.classList.add('in')));
  }
  function hideBanner() {
    if (!banner) return;
    const b = banner; banner = null;
    b.classList.remove('in');
    setTimeout(() => b.remove(), 500);
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
