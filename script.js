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

})();

// ---------- BARRA DE ROLAGEM: só visível enquanto a página é rolada ----------
// Ao rolar, marca o <html> com .is-scrolling; 1s depois que o movimento para,
// a classe sai e a barra some de novo.
(function () {
  var root = document.documentElement;
  var timer = null;
  window.addEventListener('scroll', function () {
    root.classList.add('is-scrolling');
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () {
      root.classList.remove('is-scrolling');
    }, 1000);
  }, { passive: true });
})();

// ---------- FORMULÁRIO: validação do Instagram ----------
var campoInstagram = document.getElementById('campoInstagram');
var liInstagram = campoInstagram ? campoInstagram.closest('li') : null;

// Aceita "@perfil", "perfil" ou uma URL do tipo instagram.com/perfil.
// Handle do Instagram: 1 a 30 caracteres, letras, números, ponto e underline.
function instagramHandle(valor) {
  return String(valor).trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^(www\.)?instagram\.com\//i, '')
    .replace(/[/?#].*$/, '')
    .replace(/^@/, '');
}

function instagramPareceValido(valor) {
  return /^[A-Za-z0-9._]{1,30}$/.test(instagramHandle(valor));
}

function limparErroInstagram() {
  if (liInstagram) liInstagram.classList.remove('has-error', 'is-retry');
}

// ---------- FORMULÁRIO: validação do Email ----------
var campoEmail = document.getElementById('campoEmail');
var liEmail = campoEmail ? campoEmail.closest('li') : null;

function emailPareceValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor).trim());
}

// Marca um <li> com .has-error (deixa o campo vermelho e abre o espaço com a
// mensagem). Se o erro JÁ estava na tela, reaplica o pulso de atenção
// (.is-retry) removendo/forçando reflow/readicionando a classe.
function marcarErroCampo(li, reanimar) {
  if (!li) return;
  var erroJaVisivel = li.classList.contains('has-error');
  li.classList.add('has-error');
  if (erroJaVisivel && reanimar) {
    li.classList.remove('is-retry');
    void li.offsetWidth;
    li.classList.add('is-retry');
  }
}

function limparErroCampo(li) {
  if (li) li.classList.remove('has-error', 'is-retry');
}

// Valida TODOS os campos obrigatórios (nome, Instagram, telefone e email).
// Marca cada campo inválido, rola a tela até o primeiro deles e foca nele.
// Devolve true/false pro fluxo de envio saber se pode seguir.
function validarFormulario() {
  var form = document.querySelector('form');
  if (!form) return true;

  var campoNome = document.getElementById('campoNome');
  var campoTel = document.getElementById('campoTelefone');

  // se já existe erro na tela, os campos ainda inválidos ganham o pulso extra
  var reanimar = !!document.querySelector('.closing .form li.has-error');
  var primeiroInvalido = null;

  // Nome
  var liNome = campoNome ? campoNome.closest('li') : null;
  if (campoNome && campoNome.value.trim() === '') {
    marcarErroCampo(liNome, reanimar);
    primeiroInvalido = primeiroInvalido || campoNome;
  } else {
    limparErroCampo(liNome);
  }

  // Instagram (aceita @perfil, perfil ou URL do instagram.com)
  if (campoInstagram && liInstagram) {
    if (instagramPareceValido(campoInstagram.value)) {
      limparErroInstagram();
    } else {
      marcarErroCampo(liInstagram, reanimar);
      primeiroInvalido = primeiroInvalido || campoInstagram;
    }
  }

  // Telefone
  var liTel = campoTel ? campoTel.closest('li') : null;
  if (campoTel && campoTel.value.trim() === '') {
    marcarErroCampo(liTel, reanimar);
    primeiroInvalido = primeiroInvalido || campoTel;
  } else {
    limparErroCampo(liTel);
  }

  // Email
  if (campoEmail && liEmail) {
    if (emailPareceValido(campoEmail.value)) {
      limparErroCampo(liEmail);
    } else {
      marcarErroCampo(liEmail, reanimar);
      primeiroInvalido = primeiroInvalido || campoEmail;
    }
  }

  if (primeiroInvalido) {
    var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    primeiroInvalido.scrollIntoView({ behavior: reduzir ? 'auto' : 'smooth', block: 'center' });
    primeiroInvalido.focus({ preventScroll: true });
    return false;
  }
  return true;
}

// assim que a pessoa começa a preencher um campo, o erro dele some sozinho
function limparErroAoDigitar(campo) {
  if (!campo) return;
  campo.addEventListener('input', function () {
    if (campo.value.trim() !== '') limparErroCampo(campo.closest('li'));
  });
}

if (campoInstagram) {
  // Instagram tem regra própria: só limpa quando o formato fica válido
  campoInstagram.addEventListener('input', function () {
    if (liInstagram.classList.contains('has-error') && instagramPareceValido(campoInstagram.value)) {
      limparErroInstagram();
    }
  });
}
if (campoEmail) {
  // Email tem regra própria: só limpa quando o formato fica válido
  campoEmail.addEventListener('input', function () {
    if (liEmail.classList.contains('has-error') && emailPareceValido(campoEmail.value)) {
      limparErroCampo(liEmail);
    }
  });
}
limparErroAoDigitar(document.getElementById('campoNome'));
limparErroAoDigitar(document.getElementById('campoTelefone'));

// ---------- ENVIO DOS DADOS DO FORMULÁRIO PARA A API ----------
// Recebe os dados coletados do formulário e faz o envio para a API.
// TODO: implementar a chamada à API.

async function sendForm(data, callback) {
  const jsonData = JSON.stringify(data);
  const maxTentativas = 3;

  for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
    try {
      const response = await fetch('https://app.relinqsales.com.br/api/form/0ae6ff0c', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: jsonData
      });

      if (response.ok) {
        return true; // sucesso, encerra a função aqui
      }

    } catch (err) {
      console.log(`Tentativa ${tentativa} falhou: ${err.message}`);
    }
  }

  return false; // esgotou as 3 tentativas sem sucesso
}

// ---------- CONFIRMAÇÃO DE ENVIO: retângulo central com fade-in ----------
async function enviado(event) {
  if (event && typeof event.preventDefault === 'function') event.preventDefault();

  // todos os campos são obrigatórios; se algum estiver inválido, marca e não
  // abre a confirmação
  if (!validarFormulario()) return;

  // coleta os dados do formulário e dispara o envio para a API
  var campoNome = document.getElementById('campoNome');
  var campoTel = document.getElementById('campoTelefone');

  //payload da requisição
  const req = {
    "source": "LP Relinq Beauty Fair",
    "utm": {
      "utm_source": "landing",
      "utm_medium": "cpc",
      "utm_campaign": "beauty"
    },
    "fields": {
      "lead": {
        "name": campoNome ? campoNome.value.trim() : '',
        "phoneNumber": campoTel?.value.trim() ? '55' + campoTel.value.replace(/\D/g, '') : '',
        "email": campoEmail ? campoEmail.value.trim() : ''
      },
      "cardCustomField": {
        "85d6c758-94e3-4752-b5e1-d87253fb850d": campoInstagram ? '@' + instagramHandle(campoInstagram.value) : ''
      }
    }
  }

  sendForm(req)

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
  moreLink.href = 'https://relinqbeauty.com.br/lpcamisa'; // TODO: trocar pelo link real
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
