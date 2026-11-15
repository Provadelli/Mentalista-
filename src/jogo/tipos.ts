export type Jogador = { playerId: string; nome: string; avatar: string; pontos: number; online: boolean }

export type EstadoSala = { jogadores: Jogador[]; avataresEmUso: string[]; cheia: boolean }

export type MsgEntrar = { playerId: string; nome: string; avatar: string }
export type MsgRecusa = { playerId: string; motivo: 'cheia' | 'avatar' | 'emAndamento' }

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

/** O que o celular recebe em cada fase. Nunca contém o gabarito antes da REVELACAO. */
export type FasePublica =
  | { fase: 'LOBBY' }
  | { fase: 'ABERTURA_RODADA'; rodada: { id: number; titulo: string } }
  | {
      fase: 'PERGUNTA'
      perguntaId: string
      tipo: 'escolha' | 'memoria' | 'ordenar'
      enunciado: string
      opcoes: string[]
      aposta: boolean
      /** Relógio do host: o celular corrige pela diferença com `agora`. */
      agora: number
      destravaEm: number
      fimEm: number
    }
  | {
      fase: 'REVELACAO'
      perguntaId: string
      tipo: 'escolha' | 'memoria' | 'ordenar'
      correta: number | null
      ordemCorreta: number[] | null
      deducao: string
      resultados: Record<string, Resultado>
    }
  | { fase: 'RANKING' }
  | {
      fase: 'ACUSACAO'
      suspeitos: { id: string; nome: string; papel: string }[]
      motivos: string[]
      evidencias: { id: string; titulo: string }[]
      agora: number
      fimEm: number
    }
  | {
      fase: 'VEREDITO'
      modo: ModoFinal
      /** Caso fechado: o culpado definido. Júri: o(s) mais votado(s). */
      acusados: string[]
      votos: Record<string, number>
      resultados: Record<string, Resultado>
    }
  | { fase: 'PODIO' }

export type Resultado = { acertou: boolean; ganho: number; detalhe?: string }
export type ModoFinal = 'fechado' | 'juri'
export type Aposta = 1 | 2 | 3

export type MsgResponder = { playerId: string; perguntaId: string; opcao?: number; ordem?: number[]; aposta?: Aposta }
export type MsgAcusar = { playerId: string; culpado: string; motivo: number; provas: string[] }
export type MsgFicha = { playerId: string; tipo: 'suspeito' | 'apoio'; nome: string; papel: string; ficha: string }
