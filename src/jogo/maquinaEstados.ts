import type { Caso, Pergunta } from './tipos'

// LOBBY → ABERTURA_RODADA → PERGUNTA → REVELACAO → RANKING → … → PODIO
// (ACUSACAO e VEREDITO entram na Fase 4.)
export type Passo =
  | { fase: 'LOBBY' }
  | { fase: 'ABERTURA_RODADA'; rodada: number }
  | { fase: 'PERGUNTA' | 'REVELACAO' | 'RANKING'; rodada: number; pergunta: number }
  | { fase: 'PODIO' }

/** Tipos de pergunta já jogáveis. Os demais são pulados até a Fase 4. */
const SUPORTADOS: Pergunta['tipo'][] = ['escolha', 'memoria']

export function montarRoteiro(caso: Caso): Passo[] {
  const passos: Passo[] = [{ fase: 'LOBBY' }]
  caso.rodadas.forEach((r, ri) => {
    const jogaveis = r.perguntas.map((p, pi) => [p, pi] as const).filter(([p]) => SUPORTADOS.includes(p.tipo))
    if (!jogaveis.length) return
    passos.push({ fase: 'ABERTURA_RODADA', rodada: ri })
    for (const [, pi] of jogaveis) {
      passos.push({ fase: 'PERGUNTA', rodada: ri, pergunta: pi })
      passos.push({ fase: 'REVELACAO', rodada: ri, pergunta: pi })
      passos.push({ fase: 'RANKING', rodada: ri, pergunta: pi })
    }
  })
  passos.push({ fase: 'PODIO' })
  return passos
}

export const perguntaDoPasso = (caso: Caso, p: Passo): Pergunta | null =>
  'pergunta' in p ? caso.rodadas[p.rodada].perguntas[p.pergunta] : null
