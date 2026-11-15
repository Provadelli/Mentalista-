# O Mentalista — Caso 047: Hotel Aurora

Jogo de dedução multiplayer no estilo Kahoot, com a temática de *O Mentalista*.
O computador é o host da partida; até 7 jogadores entram pelo celular lendo um QR code.

## Stack

- React + Vite + TypeScript
- Tailwind CSS v4 (tema em `src/index.css`)
- Framer Motion (animações), React Router, Zustand
- Supabase Realtime (salas e respostas em tempo real)
- Deploy na Vercel

## Rodar localmente

```bash
npm install
cp .env.example .env   # preencha as chaves do Supabase
npm run dev
```

## Rotas

| Rota | Tela |
| --- | --- |
| `/` | Início do host |
| `/host/:sala` | Lobby com QR code |
| `/entrar?sala=1234` | Entrada do jogador (nome + avatar) |

## Avatares

Coloque as fotos dos personagens em `public/avatars/<id>.webp` (256×256).
Os ids estão em `src/dados/personagens.ts`. Sem foto, aparecem as iniciais.
