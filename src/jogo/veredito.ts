import type { Evidencia, ModoFinal, MsgAcusar, Resultado } from './tipos'

export const PONTOS_CULPADO = 2000
export const PONTOS_PROVA = 300

/** Contagem de votos e os mais votados (empate devolve todos). */
export function apurar(acusacoes: MsgAcusar[]) {
  const votos: Record<string, number> = {}
  for (const a of acusacoes) votos[a.culpado] = (votos[a.culpado] ?? 0) + 1
  const max = Math.max(0, ...Object.values(votos))
  const maisVotados = max ? Object.keys(votos).filter((k) => votos[k] === max) : []
  return { votos, maisVotados }
}

/**
 * Caso fechado: acertar o culpado vale 2000.
 * Júri: cada prova escolhida que pesa contra o acusado pela maioria vale 300.
 */
export function pontuarAcusacao(
  modo: ModoFinal,
  acusacao: MsgAcusar | undefined,
  acusados: string[],
  evidencias: Evidencia[],
): Resultado {
  if (!acusacao) return { acertou: false, ganho: 0, detalhe: 'Sem acusação' }
  if (modo === 'fechado') {
    const acertou = acusados.includes(acusacao.culpado)
    return { acertou, ganho: acertou ? PONTOS_CULPADO : 0 }
  }
  const fortes = acusacao.provas.filter((id) =>
    evidencias.find((e) => e.id === id)?.pesaContra.some((s) => acusados.includes(s)),
  )
  return {
    acertou: fortes.length > 0,
    ganho: fortes.length * PONTOS_PROVA,
    detalhe: `${fortes.length} de 3 provas pesam contra o acusado`,
  }
}
