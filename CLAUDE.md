# CLAUDE.md

Jogo multiplayer estilo Kahoot com tema de *O Mentalista*, baseado no dossiê do Caso 047.

**Leia `PLANO.md` antes de qualquer tarefa.** Ele é a fonte de verdade sobre mecânica, telas, visual, arquitetura e a ordem de implementação (seção 7, checklist). Ao concluir um item, marque-o no checklist.

O dossiê original está em `docs/dossie-caso-047.pdf`. Perguntas e textos do jogo devem sair dele. Não invente fatos, e não defina o culpado: o dossiê não traz a solução (veja PLANO.md, 2.2).

## Comandos

- `npm run dev` — servidor local (aberto na rede, para testar no celular)
- `npm run build` — checagem de tipos + build de produção
- `npm run lint` — oxlint

## Regras do projeto

- Todo texto da interface em português do Brasil.
- Usar os tokens do tema (`bg-couro`, `text-papel`, `font-dossie`, etc.) definidos em `src/index.css`. Não usar cores soltas.
- O host é a autoridade: gabarito e pontuação nunca vão para o celular antes da revelação.
- Mobile first no jogador; host pensado para 16:9 na TV.
- Animar só `transform` e `opacity`; respeitar `prefers-reduced-motion`.
- Deploy: push na `main` publica na Vercel. Variáveis: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
