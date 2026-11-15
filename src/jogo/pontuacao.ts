// Regras de pontuação (PLANO.md, 2.3). Funções puras: rodam só no host.

export const BASE = 1000
export const BONUS_VELOCIDADE = 0.3
export const BONUS_SEQUENCIA = 100
export const MAX_SEQUENCIA = 500
export const PONTOS_POR_CARTAO = 250

export type Aposta = 1 | 2 | 3

/** Bônus de sequência para o N-ésimo acerto seguido (o 1º não ganha bônus). */
export const bonusSequencia = (acertosSeguidos: number) =>
  Math.min(Math.max(acertosSeguidos - 1, 0) * BONUS_SEQUENCIA, MAX_SEQUENCIA)

/**
 * Pontos de uma resposta de escolha.
 * tempoGastoMs e tempoTotalMs contam a partir do destrave das opções.
 * Retorna a variação no placar (negativa no erro com aposta 2x/3x).
 */
export function pontosEscolha(p: {
  acertou: boolean
  tempoGastoMs: number
  tempoTotalMs: number
  aposta?: Aposta
  acertosSeguidos?: number
}): number {
  const aposta = p.aposta ?? 1
  if (!p.acertou) return aposta === 1 ? 0 : -(aposta - 1) * 500
  const total = Math.max(p.tempoTotalMs, 1)
  const fracao = Math.min(Math.max(p.tempoGastoMs / total, 0), 1)
  return Math.round(BASE * aposta * (1 + BONUS_VELOCIDADE * (1 - fracao))) + bonusSequencia(p.acertosSeguidos ?? 1)
}

/** Ordenar: 250 por cartão na posição certa. */
export const pontosOrdenar = (resposta: number[], correta: number[]) =>
  correta.reduce((s, v, i) => s + (resposta[i] === v ? PONTOS_POR_CARTAO : 0), 0)

/** Aplica a variação sem deixar o placar negativo. */
export const aplicar = (placar: number, variacao: number) => Math.max(0, placar + variacao)
