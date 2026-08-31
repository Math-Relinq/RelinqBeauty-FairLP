## Fluxo obrigatório ao concluir uma alteração
1. **Revisar e confirmar**: valide que o bug foi corrigido ou a implementação funcionou.
2. **Checar regressões**: revise com prints, garanta que nada além do solicitado foi alterado/quebrado. Se algo mudou indevidamente, corrija e reteste antes de finalizar.
3. **Responsividade**: toda alteração visual deve funcionar bem em todos os tamanhos de tela (especialmente mobile) — testar com prints em diferentes resoluções.
4. **Identidade visual**: seguir os tokens definidos em `identidade-visual/` (cores, tipografia, raios, sombras, componentes — extraídos de style.css/index.html). Não introduzir estilos fora do guia sem antes atualizá-lo.
5. **Log**: salvar em `logs/AAAA-MM-DD/` (criar pasta/subpasta se não existir) um arquivo nomeado `HH:MM` (24h) resumindo o que foi alterado.