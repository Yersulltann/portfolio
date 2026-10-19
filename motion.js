/* ============================================================
   MOTION — интерактив поверх main.js.
   Lenis (плавный скролл) + GSAP ScrollTrigger, если загрузились с CDN;
   без них всё остальное работает на чистом JS.
   ============================================================ */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const hasGsap = !!(window.gsap && window.ScrollTrigger);

  /* ---------- разбивка текста на буквы (вложенные <em> сохраняются) ---------- */
  function split(el) {
    if (!el || el.dataset.split === el.innerHTML) return;
    const label = el.textContent.trim();
    let i = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          // буквы одного слова держим в обёртке, чтобы слово не переносилось посередине
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const word = document.createElement('span');
            word.className = 'wd';
            Array.from(part).forEach((c) => {
              const s = document.createElement('span');
              s.className = 'ch';
              s.style.setProperty('--i', i++);
              s.textContent = c;
              word.appendChild(s);
            });
            frag.appendChild(word);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains('sr')) {
          walk(n);
        }
      });
    };
    walk(el);
    // экранный диктор читает слово целиком, а не по буквам
    Array.from(el.children).forEach((c) => c.setAttribute('aria-hidden', 'true'));
    const sr = document.createElement('span');
    sr.className = 'sr';
    sr.textContent = label;
    el.prepend(sr);
    el.dataset.split = el.innerHTML;
  }

  const splitAll = () => {
    $$('.h1 .w').forEach(split);
    $$('.big').forEach((b) => {
      split(b);
      if (b.classList.contains('in')) b.classList.add('settled');
    });
  };
  splitAll();

  /* ---------- подпись курсора на языке страницы ---------- */
  const VIEW = { en: 'View ↗', ru: 'Смотреть ↗', kk: 'Қарау ↗', pl: 'Zobacz ↗' };
  const viewLabel = () => VIEW[document.documentElement.lang] || VIEW.en;

  // main.js перерисовывает тексты при смене языка — разбиваем заново
  $$('.lang button').forEach((b) => b.addEventListener('click', () => setTimeout(splitAll, 0)));

  // большие заголовки: после выезда букв hover реагирует без задержки
  if ('IntersectionObserver' in window) {
    const bio = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      setTimeout(() => e.target.classList.add('settled'), 1600);
      bio.unobserve(e.target);
    }), { threshold: 0.3 });
    $$('.big').forEach((b) => bio.observe(b));
  }

  // чипы навыков появляются по одному
  $$('.sk .chips').forEach((ul) => $$('li', ul).forEach((li, i) => li.style.setProperty('--i', i)));

  // кнопка «скопировать» — короткая вспышка
  $$('.copy').forEach((b) => b.addEventListener('click', () => {
    b.classList.add('done');
    setTimeout(() => b.classList.remove('done'), 1600);
  }));

  // активный пункт меню
  if ('IntersectionObserver' in window) {
    const links = $$('.links a');
    const sio = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    ['work', 'about', 'experience', 'contact'].forEach((id) => { const s = document.getElementById(id); if (s) sio.observe(s); });
  }

  if (reduce) return;

  /* ---------- плавный скролл (Lenis) ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGsap) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add((t) => lenis.raf(t * 1000));
      window.gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
    }
    // якорные ссылки меню — тоже плавно
    $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id.length > 1 && document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: id === '#top' ? 0 : -64 });
    }));
  }

  /* ---------- ScrollTrigger: маска картинок в карточках ---------- */
  if (hasGsap) {
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    $$('.card .img').forEach((box) => {
      const pic = box.querySelector('img');
      gsap.fromTo(box,
        { clipPath: 'inset(18% 10% 18% 10% round 18px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.3, ease: 'expo.out',
          scrollTrigger: { trigger: box, start: 'top 88%', once: true } });
      if (pic) gsap.fromTo(pic, { scale: 1.25 }, { scale: 1, duration: 1.6, ease: 'expo.out', clearProps: 'scale',
        scrollTrigger: { trigger: box, start: 'top 88%', once: true } });
    });
    // после загрузки картинок высоты меняются — пересчитать точки
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  /* ---------- всё, что зависит от скролла — в одном rAF ---------- */
  const bar = document.createElement('div');
  bar.className = 'progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  const reel = $('.reel');
  const about = $('.about');
  const figure = $('.figure');
  const bands = $$('.band div, .mq div');
  const bandBox = $('.band');
  let lastY = window.scrollY, velocity = 0, ticking = false;

  function onFrame() {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);

    if (figure) figure.style.setProperty('--sy', clamp(y / vh, 0, 1.2).toFixed(3));
    if (reel) {
      const r = reel.getBoundingClientRect();
      // 1 → видео «сжато», 0 → раскрыто на всю ширину
      const p = clamp((r.top - vh * 0.15) / (vh * 0.75), 0, 1);
      reel.style.setProperty('--clip', p.toFixed(3));
    }
    if (about) {
      const r = about.getBoundingClientRect();
      const p = clamp((vh - r.top) / (vh + r.height), 0, 1);
      about.style.setProperty('--sp', (p - 0.5).toFixed(3));
    }
  }
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } };
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  onFrame();

  // бегущие строки ускоряются и разворачиваются от скорости скролла
  (function loop() {
    const y = window.scrollY;
    velocity += ((y - lastY) - velocity) * 0.2;
    lastY = y;
    const speed = Math.max(Math.abs(clamp(1 + velocity * 0.12, -5, 6)), 1);
    const dir = velocity < -0.5 ? -1 : 1;
    bands.forEach((el) => el.getAnimations().forEach((a) => {
      a.playbackRate = Math.abs(velocity) > 0.5 ? dir * speed : 1;
    }));
    if (bandBox) bandBox.style.setProperty('--skew', clamp(velocity * 0.08, -3, 3).toFixed(2));
    requestAnimationFrame(loop);
  })();

  if (!fine) return; // дальше — только для мыши

  /* ---------- параллакс фигуры в hero за курсором ---------- */
  const hero = $('.hero');
  if (hero && figure) {
    hero.addEventListener('pointermove', (e) => {
      figure.style.setProperty('--mx', (e.clientX / window.innerWidth - 0.5).toFixed(3));
      figure.style.setProperty('--my', (e.clientY / window.innerHeight - 0.5).toFixed(3));
    });
    hero.addEventListener('pointerleave', () => {
      figure.style.setProperty('--mx', 0);
      figure.style.setProperty('--my', 0);
    });
  }

  /* ---------- магнитные кнопки ---------- */
  $$('.roll, .ghost, .copy, .lang, .theme, .socials i').forEach((el) => {
    el.classList.add('magnet');
    const strength = el.classList.contains('lang') ? 0.15 : 0.3;
    const zone = el.closest('.socials a') || el;
    zone.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.classList.add('pull');
      el.style.translate = `${clamp(dx * strength, -24, 24)}px ${clamp(dy * strength * 1.2, -16, 16)}px`;
    });
    zone.addEventListener('pointerleave', () => {
      el.classList.remove('pull');
      el.style.translate = '';
    });
  });

  /* ---------- 3D-наклон карточек + блик + курсор «View ↗» ---------- */
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cursor);
  let cx = -200, cy = -200, tx = -200, ty = -200;
  (function follow() {
    cx += (tx - cx) * 0.18;
    cy += (ty - cy) * 0.18;
    cursor.style.setProperty('--cx', cx.toFixed(1) + 'px');
    cursor.style.setProperty('--cy', cy.toFixed(1) + 'px');
    requestAnimationFrame(follow);
  })();
  window.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  // при прокрутке колесом мышь стоит на месте — прячем пузырь, если карточка уехала
  window.addEventListener('scroll', () => {
    if (!cursor.classList.contains('on')) return;
    const under = document.elementFromPoint(tx, ty);
    if (!under || !under.closest('.card')) {
      cursor.classList.remove('on');
      $$('.card.tilting').forEach((c) => c.classList.remove('tilting'));
    }
  }, { passive: true });

  $$('.card').forEach((card) => {
    const inner = card.firstElementChild;
    if (!inner) return;
    const isLink = inner.tagName === 'A';
    inner.addEventListener('pointerenter', () => {
      card.classList.add('tilting');
      const go = $('.go', inner);
      cursor.textContent = isLink ? viewLabel() : (go ? go.textContent : '');
      cursor.classList.toggle('muted', !isLink);
      cursor.classList.add('on');
    });
    inner.addEventListener('pointermove', (e) => {
      const r = inner.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      inner.style.setProperty('--ry', ((px - 0.5) * 7).toFixed(2) + 'deg');
      inner.style.setProperty('--rx', ((0.5 - py) * 6).toFixed(2) + 'deg');
      inner.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
      inner.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
    });
    inner.addEventListener('pointerleave', () => {
      card.classList.remove('tilting');
      inner.style.setProperty('--rx', '0deg');
      inner.style.setProperty('--ry', '0deg');
      cursor.classList.remove('on');
    });
  });
})();
