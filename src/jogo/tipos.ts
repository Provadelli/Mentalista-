export type Jogador = { playerId: string; nome: string; avatar: string; pontos: number; online: boolean }

export type EstadoSala = { jogadores: Jogador[]; avataresEmUso: string[]; cheia: boolean }

export type MsgEntrar = { playerId: string; nome: string; avatar: string }
export type MsgRecusa = { playerId: string; motivo: 'cheia' | 'avatar' }

export const LIMITE_JOGADORES = 7
