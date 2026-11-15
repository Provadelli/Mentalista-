# Plano — O Mentalista: Caso 047, Hotel Aurora

Jogo de dedução multiplayer no estilo Kahoot, com a temática da série *O Mentalista*.
O conteúdo vem do dossiê **"Caso 047 — A última noite no Hotel Aurora"** (`docs/dossie-caso-047.pdf`).

---

## 1. Visão geral

- **Jogadores:** 7, cada um no próprio celular. O computador é o **host** e mostra a partida na TV ou no projetor.
- **Entrada:** o jogador lê um QR code, digita só o **nome** e escolhe um **avatar** de personagem da série. Cada avatar só pode ser usado por uma pessoa.
- **Tutorial:** um resumo em 3 cartões aparece no celular, com o botão **"Pular"**. Quem já pulou uma vez fica registrado no `localStorage`.
- **Duração:** cerca de 30 minutos, com 13 perguntas em 4 rodadas e uma acusação final.
- **Proposta:** premiar quem raciocina sobre as provas, não quem clica rápido. As respostas destravam depois de um tempo de leitura, e o bônus de velocidade é pequeno.
- **Fichas secretas:** os 7 jogadores recebem no celular uma ficha do dossiê, sorteada entre os 6 suspeitos e 1 papel de apoio. Isso dá conversa entre as rodadas, mas não muda a pontuação.
- **Publicação:** código no GitHub (`Provadelli/mentalista-`), site na **Vercel** e tempo real pelo **Supabase Realtime**.

---

## 2. Mecânica do jogo

Cada rodada abre uma parte do dossiê e cobra um tipo de raciocínio. As perguntas usam **só provas públicas**, nunca os segredos das fichas, e por isso têm resposta certa.

| Rodada | Parte do dossiê | Tipo de pergunta | Exemplo (resposta certa) |
| --- | --- | --- | --- |
| 1. Leitura a frio | O cenário e a linha do tempo inicial | Múltipla escolha | A morte foi entre 22h00 e 22h15. Qual fato da linha do tempo cai nessa janela? (22h03, a música aumentada) |
| 2. Palácio da memória | Envelope A (A1 a A4) | O quadro de pistas aparece por 15 s e some. Depois vem a pergunta | Na foto das 22h02, quem não aparece? (Tomás. Sofia fica fora das opções) |
| 3. Linha do tempo | Envelope B (B1 a B4) | Ordenar 4 cartões + múltipla escolha | Depois de B1, o que vale o horário 22h06 do relógio? (Nada como prova, pode ter sido ajustado) |
| 4. A aposta de Jane | Envelope C (C1 a C4) | Múltipla escolha com aposta de 1x, 2x ou 3x | Com a nova janela de 22h02 a 22h12, quais entradas do elevador contam? (22h04 e 22h11) |
| Final. A acusação | Tudo | Culpado, motivo e as 3 provas mais fortes | Veja 2.2 |

### 2.1 Mais perguntas tiradas do dossiê

As opções erradas usam detalhes reais, mas fora de contexto.

- Por que o registro do elevador não identifica ninguém? (Foi usado o cartão geral, e a escada não tem leitor.)
- O que o botão de Miguel prova? (Que ele esteve no corredor, mas não a que horas.)
- A agenda marca "conversa final — sala de arquivo" às 22h00. Qual prova anterior combina com isso? (A pasta azul achada na sala de arquivo.)
- O que o guardanapo com tinta azul permite afirmar? (Só que a tinta é parecida. A opção "é a mesma caneta" é a pegadinha.)
- O que a taça quebrada indica, segundo C1? (Ela não tem vestígios relevantes. O copo intacto é que foi para análise.)
- Por quanto tempo a câmera do corredor ficou sem gravar? (Das 21h30 às 22h20, a janela toda.)
- O que a câmera do saguão mostra às 22h09? (Uma pessoa com a mão direita fechada e sem o rosto visível.)
- Ordenar: 21h35 Augusto entra no escritório → 21h48 discussão perto do elevador → 22h02 foto da festa → 22h09 pessoa no saguão.

### 2.2 A acusação final

O dossiê **não traz a solução**. Por isso a final tem dois modos, escolhidos antes da partida:

- **Modo caso fechado (recomendado):** antes do jogo, quem organiza define o culpado numa tela protegida por PIN. Acertar o culpado vale 2000 pontos.
- **Modo júri:** sem culpado definido. A tela revela o veredito da maioria com suspense. Cada prova escolhida que de fato pesa contra o acusado vale 300 pontos. A ligação entre prova e suspeito fica no arquivo de dados (`evidencias[].pesaContra`).

Nos dois modos, cada jogador escolhe no celular o **culpado** entre os 6 suspeitos, o **motivo** entre 4 opções e **3 provas** entre os 12 cartões (A1 a C4).

### 2.3 Pontuação

- Acerto: **1000** pontos base.
- Bônus de velocidade: até **+30%**, contado só depois que as respostas destravam.
- Trava de leitura: as opções ficam bloqueadas de **5 a 8 s**, conforme o tamanho do texto.
- Sequência: **+100** por acerto seguido, até +500.
- A aposta de Jane: 2x ou 3x multiplica o acerto. Um erro tira 500 ou 1000 pontos, sem deixar o placar negativo.
- Ordenar: pontuação parcial, 250 por cartão na posição certa.
- Tempo para responder: **30 s**, ou 45 s na linha do tempo e 90 s na acusação.

Fórmula do acerto: `pontos = round(1000 * aposta * (1 + 0.3 * (1 - tempoGasto / tempoTotal))) + bonusSequencia`

### 2.4 Depois de cada pergunta

A TV mostra a **"dedução"**: a resposta certa e o motivo, citando a prova (por exemplo, "B1: alguém ajustou os ponteiros"). Também mostra quantos jogadores escolheram cada opção. É a parte didática.

### 2.5 Fichas secretas

Quando a partida começa, o host sorteia as 6 fichas de suspeito e 1 de apoio. Com 7 jogadores, uma pessoa fica com papel de apoio. A ficha aparece no celular atrás do botão **"Ver minha ficha"** e nunca na TV. Os envelopes só aparecem na rodada indicada.

---

## 3. Fluxo de telas

### Host (computador / TV)

1. **Início** (`/`): a capa do dossiê com o botão "Abrir investigação". Gera a sala de 4 dígitos.
2. **Configuração:** escolhe o modo da final (caso fechado ou júri). No caso fechado, define o culpado com PIN.
3. **Lobby** (`/host/:sala`): o QR code, o número da sala e os jogadores entrando como fotos presas na cortiça (até 7). O botão "Começar" fica ativo com 2 ou mais jogadores.
4. **Abertura da rodada:** um envelope se abre e as pistas daquela rodada são presas no quadro.
5. **Pergunta:** a pasta abre, o enunciado aparece, o relógio de bolso conta o tempo e mostra quantos já responderam.
6. **Revelação:** o carimbo "RESOLVIDO", a dedução e a distribuição das respostas.
7. **Ranking:** os avatares sobem e descem. Volta ao passo 5 ou, no fim da rodada, ao passo 4.
8. **Acusação:** a tela escurece, aparece o smiley vermelho e a contagem de quem já acusou.
9. **Veredito e pódio:** o culpado é revelado (ou o veredito do júri), seguido do pódio dos 3 primeiros.

### Jogador (celular)

1. **Entrar** (`/entrar?sala=1234`): nome e avatar. Os avatares já escolhidos aparecem como "EM USO".
2. **Tutorial:** 3 cartões com o botão "Pular". (1) Leia com calma: as respostas destravam depois de alguns segundos. (2) Velocidade vale pouco, raciocínio vale muito. (3) Na aposta de Jane, só aposte alto se tiver certeza.
3. **Ficha secreta:** a ficha de personagem, que pode ser reaberta a qualquer momento.
4. **Aguardando:** "Olhe para a TV". Aparece entre as fases.
5. **Responder:** 4 botões (xícara, distintivo, carta, lupa), a área de ordenar ou a aposta.
6. **Resultado:** acertou ou errou, os pontos ganhos e a posição atual.
7. **Acusação:** culpado → motivo → 3 provas → confirmar.
8. **Fim:** posição final e "Jogar de novo".

Se o celular bloquear a tela, o jogador volta para a mesma vaga com os pontos (`playerId` no `localStorage`).

---

## 4. Identidade visual

A interface imita a mesa de um investigador do CBI, com quadro de cortiça, pastas de arquivo, carimbos e a xícara de chá de Jane. **O vermelho fica guardado para o crime e para a final.**

### Elementos da série na interface

- **Quadro de pistas:** fundo de cortiça, fotos presas por tachinhas e fios vermelhos ligando as pistas. É o cenário do lobby e das rodadas.
- **Pasta de arquivo:** cada pergunta abre como uma pasta parda com o carimbo "CONFIDENCIAL".
- **Relógio de bolso:** o cronômetro é um relógio de bolso que balança, como na hipnose de Jane. Nos últimos 5 s o ponteiro fica vermelho.
- **Sofá de couro e chá:** tons de couro no host e a xícara azul como ícone de carregamento.
- **Smiley vermelho:** um sorriso simples pintado em vermelho, só na acusação e no veredito.

### Botões de resposta (no lugar das formas do Kahoot)

| Botão | Símbolo | Cor |
| --- | --- | --- |
| A | Xícara de chá | Azul pires `#4F7CA8` |
| B | Distintivo | Dourado `#C9A227` |
| C | Carta de baralho | Verde feltro `#2F6B4F` |
| D | Lupa | Vinho `#7A2E3A` |

Cada botão tem símbolo e letra, além da cor, para funcionar para daltônicos.

### Paleta (já em `src/index.css`, `@theme`)

| Token | Uso | Hex |
| --- | --- | --- |
| `couro` | Fundo do host | `#2B1D14` |
| `cortica` | Quadro de pistas | `#B98B5E` |
| `manila` | Pastas e cartões | `#E9D8B4` |
| `papel` | Texto sobre fundo escuro | `#F5EEDC` |
| `tinta` | Texto sobre papel | `#1E1A17` |
| `redjohn` | Crime, final, erro | `#9B1B1B` |
| `ouro` | Pontos e pódio | `#C9A227` |

### Tipografia

- Títulos: **Playfair Display** (`font-titulo`).
- Enunciados e cartões: **Special Elite** (`font-dossie`), com cara de máquina de escrever.
- Interface e botões: **Inter** (`font-sans`).

### Animações (Framer Motion)

- A pasta abre e o papel desliza a cada pergunta.
- O carimbo "RESOLVIDO" bate com um tremor curto na revelação.
- No ranking, os avatares mudam de lugar com animação de layout.
- Na acusação, a tela escurece e o smiley aparece aos poucos.
- Tudo respeita a opção de reduzir movimento do aparelho (já em `index.css`).

### Avatares

São 10 opções para 7 jogadores (veja `src/dados/personagens.ts`): Patrick Jane, Teresa Lisbon, Kimball Cho, Wayne Rigsby, Grace Van Pelt, Virgil Minelli, Kim Fischer, Dennis Abbott, Lorelei Martins e Bret Stiles. Cada um aparece como uma foto 3x4 presa num cartão de arquivo.

> As fotos da série têm direitos autorais. Para uso privado entre amigos, coloque as imagens em `public/avatars/<id>.webp`. Se o jogo for publicado, troque-as por ilustrações próprias. Sem a imagem, a interface mostra as iniciais (já implementado).

---

## 5. Arquitetura técnica

O site é estático, hospedado na **Vercel**. A Vercel não mantém WebSocket aberto, então o tempo real usa o **Supabase Realtime**: um canal por sala, com *broadcast* e *presence*. **O navegador do host é a autoridade.** Ele guarda o gabarito, mede o tempo e calcula os pontos. Os celulares só enviam respostas e recebem o estado.

| Camada | Escolha | Função |
| --- | --- | --- |
| Front-end | React 19 + Vite + TypeScript | Telas do host e do jogador |
| Estilo | Tailwind CSS v4 (`@theme` em `index.css`) | Paleta, fontes e componentes |
| Tempo real | Supabase Realtime (`@supabase/supabase-js`) | Canal `sala:<código>`, broadcast + presence |
| Estado | Zustand | Estado da partida no cliente |
| Animação | Framer Motion | Transições |
| QR code | qrcode.react | Link `/entrar?sala=<código>` |
| Arrastar | dnd-kit (a instalar) | Rodada de ordenar, com toque |
| Som | Howler.js (a instalar) | Tique do relógio, carimbo, revelação |
| Hospedagem | Vercel | Deploy automático a cada push na `main` |

### Regras

- **Máquina de estados** (só no host): `LOBBY → ABERTURA_RODADA → PERGUNTA → REVELACAO → RANKING → … → ACUSACAO → VEREDITO → PODIO`. Só o host avança de fase.
- **Gabarito protegido:** o celular nunca recebe a resposta certa antes da revelação. O arquivo de perguntas é importado só pelas rotas do host (`lazy import`). Para um jogo entre amigos, isso basta.
- **Tempo:** o host anota a hora em que recebe cada resposta, com base no `inicioEm` que ele mesmo enviou. Não confia no relógio do celular.
- **Reconexão:** o `playerId` (UUID) fica no `localStorage`. Ao reentrar, o host devolve a mesma vaga, avatar, ficha e pontos.
- **Host recarregou a página:** o estado da partida é salvo no `localStorage` do host a cada fase e recuperado ao voltar.
- **Limite:** 7 jogadores. O 8º recebe "Sala cheia".

### Mensagens do canal (broadcast)

| Evento | Quem envia | Conteúdo |
| --- | --- | --- |
| `entrar` | Jogador | `playerId`, nome, avatar |
| `sala` | Host | jogadores, avatares livres, modo |
| `ficha` | Host | `playerId`, ficha sorteada (só aquele jogador a mostra) |
| `fase` | Host | fase, pergunta sem gabarito, `inicioEm`, `destravaEm`, duração |
| `responder` | Jogador | `playerId`, `perguntaId`, opção / ordem / aposta |
| `revelacao` | Host | resposta certa, dedução, pontos de cada um |
| `acusar` | Jogador | culpado, motivo, 3 provas |

A presença (`presence`) mostra quem está online no lobby.

### Variáveis de ambiente (Vercel e `.env`)

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Não é preciso criar tabelas: o Realtime broadcast funciona sem banco.

### Estrutura de pastas (alvo)

```
mentalista-/
├─ src/
│  ├─ host/            # Inicio, Configuracao, Lobby, Pergunta, Revelacao, Ranking, Acusacao, Podio
│  ├─ jogador/         # Entrar, Tutorial, Ficha, Aguardando, Responder, Resultado, Acusar, Fim
│  ├─ componentes/     # Pasta, RelogioDeBolso, Carimbo, BotaoResposta, CartaoPista, Avatar
│  ├─ jogo/            # maquinaEstados.ts, pontuacao.ts, sorteio.ts, tipos.ts
│  ├─ realtime/        # cliente Supabase + hooks useSalaHost / useSalaJogador
│  ├─ store/           # Zustand
│  └─ dados/           # personagens.ts, caso047.json
├─ public/avatars/     # fotos .webp
├─ docs/               # dossie-caso-047.pdf
└─ vercel.json         # rewrite para SPA
```

### Formato de `src/dados/caso047.json` (resumo)

```json
{
  "suspeitos": [{ "id": "helena", "nome": "Helena Valença", "papel": "esposa da vítima", "ficha": "..." }],
  "apoio": [{ "id": "livia", "nome": "Lívia Costa", "papel": "repórter local", "ficha": "..." }],
  "evidencias": [{ "id": "A1", "envelope": "A", "titulo": "Relatório do local", "texto": "...", "pesaContra": [] }],
  "rodadas": [{
    "id": 1, "titulo": "Leitura a frio", "abre": ["cenario"],
    "perguntas": [{
      "id": "r1q1", "tipo": "escolha" ,
      "enunciado": "...", "opcoes": ["...", "...", "...", "..."], "correta": 2,
      "deducao": "...", "travaSeg": 6, "tempoSeg": 30, "aposta": false
    }]
  }],
  "motivos": ["...", "...", "...", "..."]
}
```

Tipos de pergunta: `escolha`, `memoria` (com `mostrarPistasSeg`), `ordenar` (com `ordemCorreta`) e `acusacao`.

---

## 6. Responsividade e desempenho

O celular é pensado primeiro para telas pequenas. A tela do host é pensada para TV e projetor em 16:9.

| Aparelho | Largura | O que muda |
| --- | --- | --- |
| Celular pequeno | a partir de 320 px | Botões em 2x2, enunciado recolhível, avatares em grade de 3 |
| Celular e tablet | 640 a 1023 px | Botões maiores, avatares em grade de 4 ou 5 |
| Notebook (host) | 1024 a 1919 px | Layout 16:9, quadro de pistas ao lado da pergunta |
| TV e projetor | 1920 px ou mais | Fontes com `clamp()`, legíveis a 4 metros |

**Usabilidade**

- Área de toque de no mínimo 48 px.
- Usar `100dvh` e `env(safe-area-inset-*)` (já usado em `Entrar.tsx`).
- Vibrar no acerto e no erro com `navigator.vibrate`, onde houver suporte.
- Manter a tela acesa com a Wake Lock API durante a partida.
- Contraste mínimo AA em todo texto sobre cortiça e couro.

**Desempenho**

- Separar o código do host e do jogador (já feito com `lazy` em `main.tsx`).
- Avatares em WebP de 256 px, com cerca de 20 KB, pré-carregados no lobby.
- Texturas de cortiça e couro em CSS (já feito), sem imagens pesadas.
- Animar só `transform` e `opacity`.
- Meta: o celular abre a tela de entrada em menos de 2 s em 4G.

---

## 7. Cronograma e checklist

### Fase 0 — Base ✅
- [x] Repositório no GitHub
- [x] React + Vite + TS + Tailwind com o tema
- [x] Telas iniciais: Início, Lobby com QR, Entrar
- [x] `vercel.json` para as rotas
- [ ] Projeto na Vercel ligado ao repositório
- [ ] Projeto no Supabase e variáveis de ambiente na Vercel

### Fase 1 — Sala em tempo real
- [ ] Cliente Supabase e hooks `useSalaHost` / `useSalaJogador`
- [ ] Jogadores aparecem no lobby, avatares em uso bloqueados, limite de 7
- [ ] Reconexão com `playerId`

### Fase 2 — Conteúdo
- [ ] `caso047.json` com fichas, 12 evidências e 13 perguntas + deduções
- [ ] Revisar se cada pergunta tem só uma resposta defensável pelo dossiê

### Fase 3 — Ciclo da pergunta
- [ ] Máquina de estados no host
- [ ] Telas Pergunta / Revelação / Ranking no host
- [ ] Telas Responder / Resultado no celular, com trava de leitura
- [ ] Pontuação (`pontuacao.ts`) com testes

### Fase 4 — Rodadas especiais
- [ ] Memória (pistas somem), Ordenar (dnd-kit) e Aposta de Jane
- [ ] Tutorial com "Pular" e ficha secreta
- [ ] Acusação e veredito nos dois modos

### Fase 5 — Acabamento
- [ ] Animações, sons e relógio de bolso
- [ ] Teste com 7 celulares reais (iPhone e Android)
- [ ] Ajustes de contraste, tamanho de fonte na TV e desempenho
