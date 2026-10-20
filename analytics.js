/* ============================================================
   АНАЛИТИКА — Microsoft Clarity (бесплатно): посетители, источники,
   страны, устройства, карты кликов и прокрутки, записи сессий.
   Включается только после согласия посетителя (GDPR) — плашка внизу.
   Чтобы включить: вставь ID проекта Clarity в CLARITY_ID ниже.
   ============================================================ */
(function () {
  const CLARITY_ID = 'z0vnsl2e74'; // ← ID проекта из clarity.microsoft.com (Settings → Overview → Project ID)

  if (!CLARITY_ID) return;

  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const KEY = 'analytics-consent';
  const store = {
    get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} },
    clear() { try { localStorage.removeItem(KEY); } catch (e) {} }
  };

  const TEXT = {
    en: { msg: 'I use Microsoft Clarity to see how visitors use this site (clicks, scrolling) and make it better. No ads, no data sold.', yes: 'Accept', no: 'Decline', settings: 'Cookie settings' },
    ru: { msg: 'Я использую Microsoft Clarity, чтобы видеть, как посетители пользуются сайтом (клики, прокрутка), и делать его лучше. Без рекламы, данные никому не продаются.', yes: 'Разрешить', no: 'Отклонить', settings: 'Настройки cookie' },
    kk: { msg: 'Сайтты жақсарту үшін Microsoft Clarity арқылы келушілердің оны қалай қолданатынын (басулар, айналдыру) көремін. Жарнама жоқ, деректер сатылмайды.', yes: 'Рұқсат беру', no: 'Бас тарту', settings: 'Cookie баптаулары' },
    pl: { msg: 'Korzystam z Microsoft Clarity, aby widzieć, jak odwiedzający korzystają ze strony (kliknięcia, przewijanie), i ją ulepszać. Bez reklam, dane nie są sprzedawane.', yes: 'Akceptuję', no: 'Odrzucam', settings: 'Ustawienia cookies' }
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
  const track = (name) => { if (on()) window.clarity('event', name); };
  function tag(k, v) { if (on()) window.clarity('set', k, String(v)); }

  /* ---------- плашка согласия ---------- */
  let banner = null;
  function showBanner() {
    if (banner) return;
    banner = document.createElement('div');
    banner.className = 'consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML = '<p></p><div class="consent-b"><button type="button" data-c="no"></button><button type="button" data-c="yes"></button></div>';
    fill();
    banner.addEventListener('click', (e) => {
      const b = e.target.closest('[data-c]');
      if (!b) return;
      const yes = b.dataset.c === 'yes';
      store.set(yes ? 'yes' : 'no');
      hideBanner();
      if (yes) loadClarity();
      else if (loaded) window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' });
    });
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add('in'));
  }
  function hideBanner() {
    if (!banner) return;
    const b = banner; banner = null;
    b.classList.remove('in');
    setTimeout(() => b.remove(), 400);
  }
  function fill() {
    const x = t();
    if (banner) {
      banner.querySelector('p').textContent = x.msg;
      banner.querySelector('[data-c="yes"]').textContent = x.yes;
      banner.querySelector('[data-c="no"]').textContent = x.no;
    }
    $$('[data-cookie-settings]').forEach((b) => { b.textContent = x.settings; });
  }
  // язык переключается в main.js → обновляем тексты плашки
  new MutationObserver(() => { fill(); tag('lang', document.documentElement.lang); if (document.documentElement.dataset.theme) tag('theme', document.documentElement.dataset.theme); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'data-theme'] });

  // ссылка «Настройки cookie» в подвале — можно передумать
  $$('[data-cookie-settings]').forEach((b) => {
    b.hidden = false;
    b.addEventListener('click', () => { store.clear(); showBanner(); });
  });
  fill();

  const choice = store.get();
  if (choice === 'yes') loadClarity();
  else if (choice !== 'no') setTimeout(showBanner, 1200);

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
