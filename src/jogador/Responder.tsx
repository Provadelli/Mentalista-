import { useState } from 'react'
import { RESPOSTAS } from '../componentes/respostas'
import { useAgora } from '../componentes/useAgora'
import type { Aposta, FasePublica } from '../jogo/tipos'
import type { MinhaResposta } from '../realtime/useSalaJogador'
import Ordenar from './Ordenar'
import Tela from './Tela'

type Props = {
  fase: Extract<FasePublica, { fase: 'PERGUNTA' }>
  desvio: number
  minhaResposta: MinhaResposta | null
  responder: (r: { opcao?: number; ordem?: number[]; aposta?: Aposta }) => void
}

export default function Responder({ fase, desvio, minhaResposta, responder }: Props) {
  const agora = useAgora() + desvio
  const [aberto, setAberto] = useState(true)
  const [aposta, setAposta] = useState<Aposta>(1)
  const respondida = minhaResposta?.perguntaId === fase.perguntaId ? minhaResposta : null
  const travado = agora < fase.destravaEm
  const acabou = agora >= fase.fimEm

  if (respondida) {
    const r = respondida.opcao !== undefined ? RESPOSTAS[respondida.opcao] : null
    return (
      <Tela className="text-center">
        <div className="grid flex-1 place-items-center">
          <div>
            {r ? (
              <span className={`${r.cor} mx-auto grid h-24 w-24 place-items-center rounded-sm text-5xl text-papel`}>{r.simbolo}</span>
            ) : (
              <span className="mx-auto grid h-24 w-24 place-items-center rounded-sm bg-manila text-5xl text-tinta">⠿</span>
            )}
            <p className="mt-4 font-titulo text-2xl">
              {r ? `Resposta ${r.letra}` : 'Ordem'} {respondida.confirmada ? 'registrada' : 'enviada…'}
              {respondida.aposta && respondida.aposta > 1 ? ` · ${respondida.aposta}x` : ''}
            </p>
            <p className="mt-2 font-dossie text-manila">Olhe para a TV.</p>
          </div>
        </div>
      </Tela>
    )
  }

  return (
    <Tela>
      <button onClick={() => setAberto((a) => !a)} aria-expanded={aberto} className="papel-arquivo rounded-sm p-4 text-left">
        <p className={`font-dossie text-base leading-snug ${aberto ? '' : 'line-clamp-2'}`}>{fase.enunciado}</p>
      </button>
      <p className="mt-3 h-6 text-center font-dossie text-sm text-manila">
        {acabou
          ? 'Tempo esgotado'
          : travado
            ? `Leia com calma… liberado em ${Math.ceil((fase.destravaEm - agora) / 1000)} s`
            : `${Math.ceil((fase.fimEm - agora) / 1000)} s`}
      </p>

      {fase.aposta && (
        <div className="mt-2" role="radiogroup" aria-label="A aposta de Jane">
          <p className="text-center font-titulo text-ouro">A aposta de Jane</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {([1, 2, 3] as const).map((a) => (
              <button key={a} role="radio" aria-checked={aposta === a} onClick={() => setAposta(a)}
                className={`min-h-12 rounded-sm border-2 font-titulo text-xl ${aposta === a ? 'border-ouro bg-ouro text-tinta' : 'border-manila/40 text-papel'}`}>
                {a}x
              </button>
            ))}
          </div>
          <p className="mt-1 text-center text-xs text-manila">
            {aposta === 1 ? 'Sem risco.' : `Acerto vale ${aposta}x. Erro tira ${(aposta - 1) * 500} pontos.`}
          </p>
        </div>
      )}

      {fase.tipo === 'ordenar' ? (
        <Ordenar opcoes={fase.opcoes} travado={travado || acabou} enviar={(ordem) => responder({ ordem })} />
      ) : (
        <ul className="mt-3 grid flex-1 grid-cols-2 gap-3">
          {fase.opcoes.map((o, i) => (
            <li key={o} className="flex">
              <button
                disabled={travado || acabou}
                onClick={() => {
                  navigator.vibrate?.(30)
                  responder(fase.aposta ? { opcao: i, aposta } : { opcao: i })
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
      )}
    </Tela>
  )
}
