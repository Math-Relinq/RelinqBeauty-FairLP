## Fluxo obrigatório ao concluir uma alteração

1. **Revisar e confirmar**: valide que o bug foi corrigido ou a implementação funcionou.
2. **Classificar a alteração**:
   - **Visual** (UI, layout, estilo, componente visível): revise com prints, garanta que nada além do solicitado foi alterado/quebrado, e valide responsividade em diferentes tamanhos de tela (especialmente mobile). Se algo mudou indevidamente, corrija e reteste antes de finalizar.
   - **Não visual** (lógica, backend, dados, etc.): rode os testes lógicos normalmente, sem necessidade de prints.
3. **Log**: salvar em `logs/<Mês (NN)>/Dia <DD>/` (mês por extenso e capitalizado + número entre parênteses, ex. `Agosto (08)`; dia como `Dia 26`), criando as pastas que faltarem. Arquivo `HH:MM-descricao-curta.txt` (hora 24h, kebab-case) resumindo o que foi alterado. Ex.: `logs/Agosto (08)/Dia 26/14:30-clarear-cores.txt`.
4. **Responsividade**: toda alteração visual deve funcionar bem em todos os tamanhos de tela (especialmente mobile) — testar com prints em diferentes resoluções.
5. **Identidade visual**: seguir os tokens definidos em `identidade-visual/` (cores, tipografia, raios, sombras, componentes — extraídos de style.css/index.html). Não introduzir estilos fora do guia sem antes atualizá-lo.