import { useState } from 'react'
import { RESPOSTAS } from '../componentes/respostas'
import { useAgora } from '../componentes/useAgora'
import type { FasePublica } from '../jogo/tipos'
import Tela from './Tela'

type Props = {
  fase: Extract<FasePublica, { fase: 'PERGUNTA' }>
  desvio: number
  minhaResposta: { perguntaId: string; opcao: number; confirmada: boolean } | null
  responder: (opcao: number) => void
}

export default function Responder({ fase, desvio, minhaResposta, responder }: Props) {
  const agora = useAgora() + desvio
  const [aberto, setAberto] = useState(true)
  const respondida = minhaResposta?.perguntaId === fase.perguntaId ? minhaResposta : null
  const travado = agora < fase.destravaEm
  const acabou = agora >= fase.fimEm

  if (respondida) {
    const r = RESPOSTAS[respondida.opcao]
    return (
      <Tela className="text-center">
        <div className="grid flex-1 place-items-center">
          <div>
            <span className={`${r.cor} mx-auto grid h-24 w-24 place-items-center rounded-sm text-5xl text-papel`}>{r.simbolo}</span>
            <p className="mt-4 font-titulo text-2xl">Resposta {r.letra} {respondida.confirmada ? 'registrada' : 'enviada…'}</p>
            <p className="mt-2 font-dossie text-manila">Olhe para a TV.</p>
          </div>
        </div>
      </Tela>
    )
  }

  return (
    <Tela>
      <button
        onClick={() => setAberto((a) => !a)}
        aria-expanded={aberto}
        className="papel-arquivo rounded-sm p-4 text-left"
      >
        <p className={`font-dossie text-base leading-snug ${aberto ? '' : 'line-clamp-2'}`}>{fase.enunciado}</p>
      </button>
      <p className="mt-3 h-6 text-center font-dossie text-sm text-manila">
        {acabou
          ? 'Tempo esgotado'
          : travado
            ? `Leia com calma… liberado em ${Math.ceil((fase.destravaEm - agora) / 1000)} s`
            : `${Math.ceil((fase.fimEm - agora) / 1000)} s`}
      </p>
      <ul className="mt-3 grid flex-1 grid-cols-2 gap-3">
        {fase.opcoes.map((o, i) => (
          <li key={o} className="flex">
            <button
              disabled={travado || acabou}
              onClick={() => {
                navigator.vibrate?.(30)
                responder(i)
              }}
              className={`${RESPOSTAS[i].cor} flex min-h-24 w-full flex-col items-center justify-center gap-1 rounded-sm p-3 text-papel shadow-lg transition active:scale-95 disabled:opacity-40`}
            >
              <span aria-hidden className="text-4xl">{RESPOSTAS[i].simbolo}</span>
              <span className="font-titulo text-xl font-bold">{RESPOSTAS[i].letra}</span>
              <span className="text-sm leading-tight">{o}</span>
            </button>
          </li>
        ))}
      </ul>
    </Tela>
  )
}
