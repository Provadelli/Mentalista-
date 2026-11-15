import type { Caso, Pergunta } from './tipos'

// LOBBY → ABERTURA_RODADA → PERGUNTA → REVELACAO → RANKING → … → ACUSACAO → VEREDITO → PODIO
export type Passo =
  | { fase: 'LOBBY' }
  | { fase: 'ABERTURA_RODADA'; rodada: number }
  | { fase: 'PERGUNTA' | 'REVELACAO' | 'RANKING'; rodada: number; pergunta: number }
  | { fase: 'ACUSACAO' }
  | { fase: 'VEREDITO' }
  | { fase: 'PODIO' }

export function montarRoteiro(caso: Caso): Passo[] {
  const passos: Passo[] = [{ fase: 'LOBBY' }]
  caso.rodadas.forEach((r, ri) => {
    const normais = r.perguntas.map((p, pi) => [p, pi] as const).filter(([p]) => p.tipo !== 'acusacao')
    if (!normais.length) return
    passos.push({ fase: 'ABERTURA_RODADA', rodada: ri })
    for (const [, pi] of normais) {
      passos.push({ fase: 'PERGUNTA', rodada: ri, pergunta: pi })
      passos.push({ fase: 'REVELACAO', rodada: ri, pergunta: pi })
      passos.push({ fase: 'RANKING', rodada: ri, pergunta: pi })
    }
  })
  passos.push({ fase: 'ACUSACAO' }, { fase: 'VEREDITO' }, { fase: 'PODIO' })
  return passos
}

export const perguntaDoPasso = (caso: Caso, p: Passo): Pergunta | null =>
  'pergunta' in p ? caso.rodadas[p.rodada].perguntas[p.pergunta] : null

export const acusacaoDoCaso = (caso: Caso) => {
  for (const r of caso.rodadas) for (const p of r.perguntas) if (p.tipo === 'acusacao') return p
  return null
}
