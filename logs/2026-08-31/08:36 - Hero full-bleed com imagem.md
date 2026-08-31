# 08:36 — Hero full-bleed com imagem, gradient e seta de rolagem

## Pedido
Criar uma hero ocupando toda a largura da página, com a imagem de `src/hero.png`,
terminando num gradient na parte inferior com transição fluida para o texto abaixo.
Título grande único com palavras-chave destacadas e uma seta clicável que rola para
a próxima seção. Depois: imagem maior (mostrar mais da metade), seta no pé da tela
abaixo do texto, texto sem sobrepor a imagem. Por fim: reajustar proporções após a
troca da imagem (que passou de paisagem para retrato 1122×1402) para ficar harmônico.

## Arquivos alterados

### index.html
- `<header class="hero">` movido para fora de `.page` (era filho do container de
  640/760px) — agora é filho direto do `<body>` e ocupa a largura toda.
- Conteúdo da hero reduzido ao essencial:
  - `.hero-media > img` com `src="src/hero.png"` e `alt` descritivo.
  - `.hero-copy > h1` único: "A agenda que <em>cuida</em> do seu <em>salão inteiro</em>."
  - `<button class="scroll-cue">` com apenas a seta (SVG chevron), `aria-label`.
- `.page` passou a envolver só `<main>` e `<footer>` (fechamento de `</div>` mantido).

### style.css
- `.hero`: `min-height: 100svh`, coluna flex, `background: var(--paper)`, `overflow: hidden`.
- `.hero-media`:
  - Mobile: full-bleed, `height: 58svh` (`min 340px` / `max 600px`), `object-fit: cover`,
    `object-position: center 22%` (mantém rosto + letreiro de neon + notebook).
  - `≥640px`: vira cartão retrato centrado — `width: min(84vw, 26rem)`,
    `height: min(66svh, 32rem)`, `border-radius: 20px` (token de cartão),
    `box-shadow: var(--shadow)` (token), `margin-top` para descolar do topo,
    `object-position: center 28%`.
  - `≥900px`: cartão um pouco maior — `min(46vw, 28rem)` × `min(68svh, 34rem)`.
- `.hero-media::after`: gradient `to bottom` de transparente → `var(--paper)` cobrindo
  os 46% inferiores da imagem (via `color-mix` com `--paper`, funciona claro/escuro).
  Fica contido na `.hero-media`, então NÃO sobrepõe o texto.
- `.hero-copy`: `flex: 1 1 auto`, sem margem negativa (texto fica abaixo da imagem,
  sem sobrepor), `padding` com `env(safe-area-inset-bottom)`.
- `.hero h1`: tokens do guia — `font-size: clamp(2.3rem, 8vw, 3.4rem)`,
  `line-height: 1.1`, `letter-spacing: -0.01em`, `max-width: 16ch`.
  `≥640px` recebe `margin-top: auto` para centrar no espaço livre.
- `.hero h1 em`: `color: var(--magenta)` + itálico (mesmo tratamento de ênfase do guia).
- `.scroll-cue`: botão circular `border-radius: 100px` (token de pílula),
  `border: 1px solid var(--line-strong)`, `background: var(--paper-raised)`,
  `color: var(--magenta)`, `box-shadow: var(--shadow)`, `margin-top: auto`
  (ancora no pé da tela). Animação `bob` respeitando `prefers-reduced-motion`.
- Reintroduzidos `.eyebrow` e `.script-line` base (haviam sido removidos junto com a
  hero antiga, mas são usados nas seções Features e Closing).
- Removidos: `.hero::before/::after` (blobs), `drift-a/drift-b`, `.hero p.sub`,
  `.hero-mark` — não existem mais na marcação.

### script.js
- Bloco da seta simplificado: como agora é `<button>` nativo, removido
  `role`/`tabindex`/`keydown` manuais; só `click` → `scrollIntoView({behavior:'smooth'})`
  na seção `.features`.

## Conformidade com identidade-visual/
Auditado contra os tokens. Corrigidos 3 desvios introduzidos numa versão intermediária:
`border-radius: 26px` → `20px`; `border-radius: 50%` no botão → `100px`;
`box-shadow` custom no hover da seta → removido (mantém `var(--shadow)`);
marca-texto com gradiente no `<em>` → revertido para `color: var(--magenta)`.
Nenhuma cor/fonte/raio/sombra fora do guia permaneceu; guia não precisou ser atualizado.

## Testes (Playwright/Chromium, deviceScaleFactor 2)
Viewports: 360×740, 390×844, 768×1024, 1280×900, 1920×1080.
- Hero (above-the-fold): imagem no topo, gradient dissolvendo no fundo, título grande
  com "cuida" e "salão inteiro" em magenta, seta circular no pé da tela, texto sem
  sobrepor a imagem. OK em todos.
- Mobile: imagem full-bleed mostra rosto + neon + notebook; título logo abaixo.
- Desktop/tablet: imagem vira cartão retrato centrado (raio 20px + sombra token),
  base dissolvendo na página; título centrado no espaço livre; seta no rodapé.
- Página inteira (com scroll para disparar os reveals): seções Features (grade 2 col),
  Closing e footer intactas; sticky CTA aparece após a hero sair da tela.
  (O "vão em branco" observado num 1º print era artefato do IntersectionObserver não
  disparar sem scroll real — confirmado OK ao rolar a página.)

## Resultado
Implementação concluída e verificada com prints em 5 tamanhos de tela. Nada fora do
escopo foi afetado.
