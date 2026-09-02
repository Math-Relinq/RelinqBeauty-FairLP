(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- FEATURES: iPhone com carrossel de telas ----------
  var phoneWrap = document.querySelector('.phone-wrap');
  if (phoneWrap) {
    // revela ao entrar na tela
    if (reduce || !('IntersectionObserver' in window)) {
      phoneWrap.classList.add('is-visible');
    } else {
      var revealIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });
      revealIo.observe(phoneWrap);
    }

    var track = phoneWrap.querySelector('.carousel-track');
    var slides = Array.prototype.slice.call(phoneWrap.querySelectorAll('.slide'));
    var dotsWrap = phoneWrap.querySelector('.carousel-dots');
    var prevBtn = phoneWrap.querySelector('.carousel-nav.prev');
    var nextBtn = phoneWrap.querySelector('.carousel-nav.next');
    var current = 0;
    var autoTimer = null;

    var dots = slides.map(function (_slide, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Ir para a tela ' + (i + 1));
      if (i === 0) b.setAttribute('aria-current', 'true');
      b.addEventListener('click', function () { goTo(i, true); });
      dotsWrap.appendChild(b);
      return b;
    });

    function updateDots() {
      dots.forEach(function (d, i) {
        if (i === current) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
    }

    function goTo(i, user) {
      current = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: current * track.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
      updateDots();
      if (user) restartAuto();
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1, true); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1, true); });

    // acompanha o swipe manual pra atualizar os dots
    var scrollRaf;
    track.addEventListener('scroll', function () {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(function () {
        var idx = Math.round(track.scrollLeft / track.clientWidth);
        if (idx !== current) { current = idx; updateDots(); }
      });
    }, { passive: true });

    function restartAuto() {
      if (reduce) return;
      clearInterval(autoTimer);
      autoTimer = setInterval(function () {
        goTo((current + 1) % slides.length, false);
      }, 5500);
    }
    ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(function (ev) {
      track.addEventListener(ev, restartAuto, { passive: true });
    });

    // autoplay só roda enquanto o telefone está visível
    if (!reduce && 'IntersectionObserver' in window) {
      var autoIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) restartAuto();
          else clearInterval(autoTimer);
        });
      }, { threshold: 0.4 });
      autoIo.observe(phoneWrap);
    }
  }

  // ---------- STICKY CTA: só aparece depois que a HERO sai da tela — menos insistente ----------
  var hero = document.querySelector('.hero');
  var stickyCta = document.querySelector('.sticky-cta');
  if (hero && stickyCta) {
    if ('IntersectionObserver' in window) {
      var heroIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          stickyCta.classList.toggle('is-visible', !entry.isIntersecting);
        });
      }, { threshold: 0, rootMargin: '-15% 0px 0px 0px' });
      heroIo.observe(hero);
    } else {
      stickyCta.classList.add('is-visible');
    }
  }

  // ---------- BARRA DE ROLAGEM: aparece ao rolar e some após 1s sem uso ----------
  var root = document.documentElement;
  var scrollbarTimer = null;
  function showScrollbar() {
    root.classList.add('is-scrolling');
    clearTimeout(scrollbarTimer);
    scrollbarTimer = setTimeout(function () {
      root.classList.remove('is-scrolling');
    }, 1000);
  }
  window.addEventListener('scroll', showScrollbar, { passive: true });

  // ---------- HERO: seta de rolagem leva direto pra próxima seção ----------
  var scrollCue = document.querySelector('.scroll-cue');
  var nextSection = document.querySelector('.features');
  if (scrollCue && nextSection) {
    scrollCue.addEventListener('click', function () {
      nextSection.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  }
})();
