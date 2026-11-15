export type Jogador = { playerId: string; nome: string; avatar: string; pontos: number; online: boolean }

export type EstadoSala = { jogadores: Jogador[]; avataresEmUso: string[]; cheia: boolean }

export type MsgEntrar = { playerId: string; nome: string; avatar: string }
export type MsgRecusa = { playerId: string; motivo: 'cheia' | 'avatar' }

export const LIMITE_JOGADORES = 7

export type Personagem = { id: string; nome: string; papel: string; ficha: string }
export type Evidencia = { id: string; envelope: 'A' | 'B' | 'C'; titulo: string; texto: string; pesaContra: string[] }

type PerguntaBase = { id: string; enunciado: string; deducao: string; travaSeg: number; tempoSeg: number; aposta: boolean }
export type Pergunta =
  | (PerguntaBase & { tipo: 'escolha'; opcoes: string[]; correta: number })
  | (PerguntaBase & { tipo: 'memoria'; opcoes: string[]; correta: number; mostrarPistasSeg: number })
  | (PerguntaBase & { tipo: 'ordenar'; opcoes: string[]; ordemCorreta: number[] })
  | (PerguntaBase & { tipo: 'acusacao' })

export type Rodada = { id: number; titulo: string; abre: string[]; perguntas: Pergunta[] }

export type Caso = {
  titulo: string
  cenario: { texto: string; fatos: string[]; linhaDoTempo: { hora: string; fato: string }[] }
  suspeitos: Personagem[]
  apoio: Personagem[]
  evidencias: Evidencia[]
  motivos: string[]
  rodadas: Rodada[]
}
