(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- FEATURES: cartões revelam ao entrar na tela, em leve cascata ----------
  var cards = document.querySelectorAll('.menu-card');
  cards.forEach(function (c, i) {
    c.style.transitionDelay = reduce ? '0ms' : ((i % 2) * 90) + 'ms';
  });

  if (reduce || !('IntersectionObserver' in window)) {
    cards.forEach(function (c) { c.classList.add('is-visible'); });
  } else {
    var cardsIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          cardsIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    cards.forEach(function (c) { cardsIo.observe(c); });
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

  // ---------- HERO: seta de rolagem leva direto pra próxima seção ----------
  var scrollCue = document.querySelector('.scroll-cue');
  var nextSection = document.querySelector('.features');
  if (scrollCue && nextSection) {
    scrollCue.addEventListener('click', function () {
      nextSection.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  }
})();
