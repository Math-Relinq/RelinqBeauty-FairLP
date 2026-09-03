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

    // avança sozinho a cada 3s (reinicia a contagem a cada interação)
    var AUTO_DELAY = 3000;
    function restartAuto() {
      if (reduce) return;
      clearInterval(autoTimer);
      autoTimer = setInterval(function () {
        goTo((current + 1) % slides.length, false);
      }, AUTO_DELAY);
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

  // ---------- HERO: seta de rolagem leva direto pra próxima seção ----------
  var scrollCue = document.querySelector('.scroll-cue');
  var nextSection = document.querySelector('.features');
  if (scrollCue && nextSection) {
    scrollCue.addEventListener('click', function () {
      nextSection.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  }

  // ---------- FORMULÁRIO: acompanha o teclado virtual no mobile ----------
  // Ao focar um campo, a tela reajusta pra manter o input visível acima do
  // teclado. Usa o visualViewport (que encolhe quando o teclado sobe) pra
  // saber a área realmente visível.
  var formFields = Array.prototype.slice.call(document.querySelectorAll('.formField'));
  if (formFields.length) {
    var vv = window.visualViewport;

    function keepFieldVisible(smooth) {
      var el = document.activeElement;
      if (!el || !el.classList || !el.classList.contains('formField')) return;

      var rect = el.getBoundingClientRect();
      var viewportH = vv ? vv.height : window.innerHeight;
      var topGap = 16;      // respiro acima do campo
      var bottomGap = 24;   // respiro entre o campo e o topo do teclado
      var behavior = (smooth && !reduce) ? 'smooth' : 'auto';

      if (rect.bottom > viewportH - bottomGap) {
        window.scrollBy({ top: rect.bottom - (viewportH - bottomGap), behavior: behavior });
      } else if (rect.top < topGap) {
        window.scrollBy({ top: rect.top - topGap, behavior: behavior });
      }
    }

    formFields.forEach(function (field) {
      field.addEventListener('focus', function () {
        // espera o teclado terminar de subir antes de reposicionar
        setTimeout(function () { keepFieldVisible(true); }, 300);
      });
    });

    // o visualViewport muda de tamanho/posição quando o teclado abre, fecha
    // ou quando a página rola com o teclado aberto
    if (vv) {
      var vvRaf;
      var onViewportChange = function () {
        if (vvRaf) cancelAnimationFrame(vvRaf);
        vvRaf = requestAnimationFrame(function () { keepFieldVisible(false); });
      };
      vv.addEventListener('resize', onViewportChange);
      vv.addEventListener('scroll', onViewportChange);
    }
  }

  // ---------- FORMULÁRIO: máscara de telefone ----------
  // Formata o que a pessoa digita como um telefone brasileiro:
  // (11) 1234-5678  para fixo e  (11) 91234-5678  para celular.
  var campoTelefone = document.getElementById('campoTelefone');
  if (campoTelefone) {
    function formatarTelefone(valor) {
      var d = valor.replace(/\D/g, '').slice(0, 11); // só dígitos, no máximo 11 (DDD + 9)
      if (!d) return '';
      var out = '(' + d.slice(0, 2);
      if (d.length < 3) return out;                  // ainda digitando o DDD
      out += ') ';
      if (d.length <= 6) {
        out += d.slice(2);                           // parte inicial do número
      } else if (d.length <= 10) {
        out += d.slice(2, 6) + '-' + d.slice(6);     // fixo: 4 + até 4
      } else {
        out += d.slice(2, 7) + '-' + d.slice(7);     // celular: 5 + 4
      }
      return out;
    }

    campoTelefone.addEventListener('input', function () {
      var antes = campoTelefone.value;
      var formatado = formatarTelefone(antes);
      if (formatado === antes) return;

      // mantém o cursor coerente contando quantos dígitos existem antes dele
      var selecao = campoTelefone.selectionStart;
      var digitosAntesDoCursor = antes.slice(0, selecao).replace(/\D/g, '').length;

      campoTelefone.value = formatado;

      var pos = 0, contados = 0;
      while (pos < formatado.length && contados < digitosAntesDoCursor) {
        if (/\d/.test(formatado[pos])) contados++;
        pos++;
      }
      campoTelefone.setSelectionRange(pos, pos);
    });
  }

  // ---------- FORMULÁRIO: combobox de especialização (janela translúcida) ----------
  // <select> nativo não deixa a lista aberta ficar translúcida, então montamos
  // um listbox próprio: botão + <ul role="listbox"> com opções.
  var comboBtn = document.getElementById('especializacao');
  var comboList = document.getElementById('especializacaoList');
  var comboValor = document.getElementById('especializacaoValor');
  var comboLabel = comboBtn ? comboBtn.querySelector('.comboValue') : null;
  var especOutroWrap = document.querySelector('.especializacao-outro');
  var especOutroInput = document.getElementById('especializacao-outro');

  if (comboBtn && comboList && comboValor && comboLabel) {
    var combo = comboBtn.closest('.combo');
    var options = Array.prototype.slice.call(comboList.querySelectorAll('.comboOption'));
    var activeIndex = -1;

    function isOpen() {
      return !comboList.hidden;
    }

    function setActive(i) {
      if (activeIndex >= 0 && options[activeIndex]) options[activeIndex].classList.remove('is-active');
      activeIndex = i;
      if (i >= 0 && options[i]) {
        options[i].classList.add('is-active');
        options[i].scrollIntoView({ block: 'nearest' });
        comboList.setAttribute('aria-activedescendant', options[i].id || '');
      } else {
        comboList.removeAttribute('aria-activedescendant');
      }
    }

    function openList() {
      if (isOpen()) return;
      comboList.classList.remove('comboList--up');
      comboList.hidden = false;
      if (combo) combo.classList.add('is-open');
      comboBtn.setAttribute('aria-expanded', 'true');
      // se não couber abaixo, abre pra cima
      var rect = comboList.getBoundingClientRect();
      if (rect.bottom > window.innerHeight - 8 && comboBtn.getBoundingClientRect().top > rect.height) {
        comboList.classList.add('comboList--up');
      }
      var sel = options.findIndex(function (o) { return o.getAttribute('aria-selected') === 'true'; });
      setActive(sel >= 0 ? sel : 0);
      comboList.focus();
      document.addEventListener('click', onDocClick, true);
    }

    function closeList(focusBtn) {
      if (!isOpen()) return;
      comboList.hidden = true;
      if (combo) combo.classList.remove('is-open');
      comboBtn.setAttribute('aria-expanded', 'false');
      setActive(-1);
      document.removeEventListener('click', onDocClick, true);
      if (focusBtn) comboBtn.focus();
    }

    function choose(opt) {
      options.forEach(function (o) { o.setAttribute('aria-selected', String(o === opt)); });
      comboLabel.textContent = opt.textContent;
      comboBtn.classList.remove('is-placeholder');

      // "Outro": o valor da especialização passa a ser o texto que a pessoa
      // digitar no campo livre (fica gravado na mesma variável das outras opções).
      var isOutro = opt.getAttribute('data-value') === 'outro';
      if (especOutroWrap) especOutroWrap.hidden = !isOutro;
      if (especOutroInput && !isOutro) especOutroInput.value = '';
      if (isOutro) {
        comboValor.value = especOutroInput ? especOutroInput.value.trim() : '';
      } else {
        comboValor.value = opt.getAttribute('data-value');
      }

      closeList(true);
      if (isOutro && especOutroInput) especOutroInput.focus();
    }

    function onDocClick(e) {
      if (!comboList.contains(e.target) && e.target !== comboBtn) closeList(false);
    }

    comboBtn.addEventListener('click', function () {
      if (isOpen()) closeList(false); else openList();
    });

    comboBtn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isOpen()) openList();
        else if (e.key === 'Enter' || e.key === ' ') choose(options[activeIndex] || options[0]);
        else setActive(Math.min(options.length - 1, Math.max(0, activeIndex + (e.key === 'ArrowDown' ? 1 : -1))));
      } else if (e.key === 'Escape' && isOpen()) {
        e.preventDefault();
        closeList(true);
      }
    });

    comboList.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(options.length - 1, activeIndex + 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(0, activeIndex - 1)); }
      else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
      else if (e.key === 'End') { e.preventDefault(); setActive(options.length - 1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (options[activeIndex]) choose(options[activeIndex]); }
      else if (e.key === 'Escape' || e.key === 'Tab') { closeList(e.key === 'Escape'); }
    });

    options.forEach(function (opt, i) {
      if (!opt.id) opt.id = 'especOpt-' + i;
      opt.addEventListener('click', function () { choose(opt); });
      opt.addEventListener('mouseenter', function () { setActive(i); });
    });

    // enquanto "Outro" estiver ativo, o texto digitado vai direto pra mesma
    // variável usada pelas demais opções (#especializacaoValor)
    if (especOutroInput) {
      especOutroInput.addEventListener('input', function () {
        if (especOutroWrap && !especOutroWrap.hidden) {
          comboValor.value = especOutroInput.value.trim();
        }
      });
    }
  }
})();

// ---------- FORMULÁRIO: validação do e-mail ----------
var campoEmail = document.getElementById('campoEmail');
var liEmail = campoEmail ? campoEmail.closest('li') : null;

function emailPareceValido(valor) {
  return /^[^\s@]+@[^\s@.]+\.[^\s@]+$/.test(String(valor).trim());
}

function limparErroEmail() {
  if (liEmail) liEmail.classList.remove('has-error', 'is-retry');
}

// Valida o campo. Se estiver inválido: marca o <li> com .has-error (deixa o
// campo vermelho e abre o espaço com a mensagem), sobe a tela até o campo e
// foca nele. Se o erro JÁ estava na tela e o e-mail continua inválido, dá um
// pulso rápido no campo + brilho no texto pra chamar a atenção.
// Devolve true/false pro fluxo de envio saber se pode seguir.
function validarEmailFormulario() {
  if (!campoEmail || !liEmail) return true;

  if (emailPareceValido(campoEmail.value)) {
    limparErroEmail();
    return true;
  }

  var erroJaVisivel = liEmail.classList.contains('has-error');
  liEmail.classList.add('has-error');

  if (erroJaVisivel) {
    // reinicia a animação de atenção (remove, força reflow, readiciona)
    liEmail.classList.remove('is-retry');
    void liEmail.offsetWidth;
    liEmail.classList.add('is-retry');
  }

  var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  campoEmail.scrollIntoView({ behavior: reduzir ? 'auto' : 'smooth', block: 'center' });
  campoEmail.focus({ preventScroll: true });
  return false;
}

if (campoEmail) {
  // assim que a pessoa corrige o e-mail, o erro some sozinho
  campoEmail.addEventListener('input', function () {
    if (liEmail.classList.contains('has-error') && emailPareceValido(campoEmail.value)) {
      limparErroEmail();
    }
  });
}

// ---------- ENVIO DOS DADOS DO FORMULÁRIO PARA A API ----------
// Recebe os dados coletados do formulário e faz o envio para a API.
// TODO: implementar a chamada à API.
async function sendForm(data, callback) {
  const jsonFormData = JSON.stringify(data)
  //envia o json e pega o status de envio
  //chama callback repassando status de envio
}

// ---------- CONFIRMAÇÃO DE ENVIO: retângulo central com fade-in ----------
function enviado(event) {
  if (event && typeof event.preventDefault === 'function') event.preventDefault();

  // e-mail precisa ser válido; se não for, marca o campo e não abre a confirmação
  if (!validarEmailFormulario()) return;

  // coleta os dados do formulário e dispara o envio para a API
  var formElement = document.querySelector('form');
  var campoNome = formElement ? formElement.querySelector('input[type="text"].formField') : null;
  var campoTel = document.getElementById('campoTelefone');
  var campoEspec = document.getElementById('especializacaoValor');
  var dadosFormulario = {
    nome: campoNome ? campoNome.value.trim() : '',
    email: campoEmail ? campoEmail.value.trim() : '',
    telefone: campoTel ? campoTel.value.trim() : '',
    especializacao: campoEspec ? campoEspec.value : '',
  };
  sendForm(dadosFormulario, (res) => {
    //recebe o status do envio da sendForm, e se for erro exibe um window.alert() e recarrega a pagina
  });

  // fecha o teclado virtual caso o envio seja disparado com um campo focado
  var focado = document.activeElement;
  if (focado && typeof focado.blur === 'function') focado.blur();
  Array.prototype.forEach.call(document.querySelectorAll('.formField'), function (f) {
    f.blur();
  });

  // evita empilhar modais em cliques repetidos
  if (document.querySelector('.enviado-overlay')) return;

  var prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var overlay = document.createElement('div');
  overlay.className = 'enviado-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'enviado-title');

  var card = document.createElement('div');
  card.className = 'enviado-card';

  var title = document.createElement('p');
  title.className = 'enviado-title';
  title.id = 'enviado-title';
  title.innerHTML = 'Parabéns, esse foi seu primeiro passo para fazer seu salão <em>DECOLAR</em>. Em breve um de nossos vendedores entrará em contato com você.';

  var hint = document.createElement('p');
  hint.className = 'enviado-hint';
  hint.textContent = 'Enquanto isso, clique aqui para ver mais informações:';

  var moreLink = document.createElement('a');
  moreLink.className = 'enviado-more';
  moreLink.href = 'https://example.com'; // TODO: trocar pelo link real
  moreLink.target = '_blank';
  moreLink.rel = 'noopener';
  moreLink.textContent = 'Ver mais informações';
  // o clique no botão não deve fechar o modal
  moreLink.addEventListener('click', function (e) { e.stopPropagation(); });

  card.appendChild(title);
  card.appendChild(hint);
  card.appendChild(moreLink);
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  // lê o layout pra forçar um reflow e garantir que a transição de opacidade dispare
  if (!prefersReduce) overlay.getBoundingClientRect();
  overlay.classList.add('is-visible');

  function fechar() {
    overlay.classList.remove('is-visible');
    overlay.removeEventListener('click', fechar);
    document.removeEventListener('keydown', onKey);
    if (prefersReduce) {
      overlay.remove();
    } else {
      window.setTimeout(function () { overlay.remove(); }, 280);
    }
  }

  function onKey(e) {
    if (e.key === 'Escape') fechar();
  }

  // some ao clicar em qualquer lugar da tela
  overlay.addEventListener('click', fechar);
  document.addEventListener('keydown', onKey);
}
