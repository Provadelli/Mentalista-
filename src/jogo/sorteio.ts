import type { Caso, MsgFicha } from './tipos'

export function embaralhar<T>(lista: T[], aleatorio = Math.random): T[] {
  const a = [...lista]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Sorteia uma ficha para cada jogador: primeiro os 6 suspeitos;
 * a partir do 7º jogador, papéis de apoio (PLANO.md, 2.5).
 */
export function sortearFichas(caso: Caso, playerIds: string[], aleatorio = Math.random): Record<string, MsgFicha> {
  const suspeitos = embaralhar(caso.suspeitos, aleatorio).map((p) => ({ ...p, tipo: 'suspeito' as const }))
  const apoio = embaralhar(caso.apoio, aleatorio).map((p) => ({ ...p, tipo: 'apoio' as const }))
  const fichas = [...suspeitos, ...apoio]
  const ordem = embaralhar(playerIds, aleatorio)
  const resultado: Record<string, MsgFicha> = {}
  ordem.forEach((playerId, i) => {
    const f = fichas[i]
    if (f) resultado[playerId] = { playerId, tipo: f.tipo, nome: f.nome, papel: f.papel, ficha: f.ficha }
  })
  return resultado
}
