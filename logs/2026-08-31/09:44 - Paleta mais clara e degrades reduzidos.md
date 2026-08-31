# 09:44 — Paleta mais clara (derivada) + degradês reduzidos

## Pedido
Reduzir um pouco os degradês e adotar uma paleta mais clara, derivada da atual.
Amostra apresentada no chat e aprovada antes de aplicar.

## style.css — tokens (light `:root`)
| token | antes | depois |
|---|---|---|
| `--paper` | `#FBF1EF` | `#FDF8F6` |
| `--ink` | `#241019` | `#3B2430` |
| `--ink-soft` | `#5C3C4B` | `#7B5A68` |
| `--magenta` | `#D6007F` | `#D6007F` (mantido) |
| `--magenta-deep` | `#94004F` | `#AE1E6B` |
| `--magenta-ink` | `#7A0044` | `#8E1457` |
| `--rose-surface` | `#F6DCE4` | `#FAEAF0` |
| `--rose-surface-strong` | `#F0C7D6` | `#F4D8E3` |
| `--gold` | `#B98A44` | `#C6A06A` |
| `--line` | `rgba(36,16,25,.14)` | `rgba(59,36,48,.10)` |
| `--line-strong` | `rgba(36,16,25,.22)` | `rgba(59,36,48,.16)` |
| `--shadow` | `0 18px 40px -20px rgba(148,0,79,.35)` | `0 16px 34px -22px rgba(148,0,79,.22)` |

## style.css — tema escuro (ambos os blocos: `@media` e `[data-theme="dark"]`)
- `--ink-soft` `#D9AFC2` → `#E0B9CB`
- `--line` `.14` → `.10`; `--line-strong` `.24` → `.18`
- `--shadow` `0 18px 46px -18px rgba(0,0,0,.6)` → `0 16px 38px -20px rgba(0,0,0,.5)`
- (Correção: o bloco `:root[data-theme="dark"]` tem indentação de 2 espaços e não foi
  pego pelo primeiro replace de 4 espaços — ajustado num segundo passo.)

## style.css — degradês
- `.hero-media::after`: altura `46%` → `36%`, de 4 → 3 paradas, rampa mais suave
  (`… 55% em 62% … var(--paper) 100%`).
- `.closing` (faixa rosa): paradas `18%/82%` → `12%/88%` (feathering menor) + rosa
  mais claro pelo token novo.
- `.menu-card:hover`: sombra `0 26px 50px -20px …42` → `0 22px 42px -22px …26`
  (proporcional à nova `--shadow`).
- `.cta-btn` (todas as sombras) e `--magenta`: **inalterados** de propósito — é o
  elemento de ação, precisa manter presença e contraste (branco sobre magenta).

## identidade-visual/identidade-visual.html — sincronizado
- `:root` light + ambos os blocos dark (mesmos valores acima).
- Array `colors` do JS (swatches): `light`/`dark` atualizados.
- Rótulos `<code>` da seção "Forma": sombra e linhas com os novos valores.

## Testes (Playwright/Chromium, DSR 2)
- Light: 360, 390, 768, 1280, 1920 — hero, features (4 cartões revelam ok),
  closing, footer, sticky CTA. Visual mais claro/arejado; degradê da hero mais
  curto; faixa do closing mais sutil. Nada quebrou.
- Dark (`data-theme="dark"`, 390): tema continua coeso, linhas/sombra mais suaves,
  degradê da hero dissolve no `--paper` escuro. Ok.

## Resultado
Aplicado e verificado com prints (claro + escuro). Guia de identidade atualizado no
mesmo passo. `--magenta` e sombras do CTA preservados por contraste/hierarquia.
