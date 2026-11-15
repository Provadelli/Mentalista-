import { useState } from 'react'
import { useAgora } from '../componentes/useAgora'
import Smiley from '../componentes/Smiley'
import type { FasePublica, MsgAcusar } from '../jogo/tipos'
import type { MinhaResposta } from '../realtime/useSalaJogador'
import Tela from './Tela'

type Props = {
  fase: Extract<FasePublica, { fase: 'ACUSACAO' }>
  desvio: number
  enviada: MinhaResposta | null
  acusar: (a: Omit<MsgAcusar, 'playerId'>) => void
}

const ETAPAS = ['Culpado', 'Motivo', 'Provas', 'Confirmar'] as const

export default function Acusar({ fase, desvio, enviada, acusar }: Props) {
  const agora = useAgora() + desvio
  const [etapa, setEtapa] = useState(0)
  const [culpado, setCulpado] = useState<string | null>(null)
  const [motivo, setMotivo] = useState<number | null>(null)
  const [provas, setProvas] = useState<string[]>([])
  const restante = Math.max(0, Math.ceil((fase.fimEm - agora) / 1000))

  if (enviada?.perguntaId === 'acusacao')
    return (
      <Tela className="bg-tinta text-center">
        <div className="grid flex-1 place-items-center">
          <div>
            <Smiley className="mx-auto w-32" />
            <p className="mt-4 font-titulo text-2xl">Acusação {enviada.confirmada ? 'registrada' : 'enviada…'}</p>
            <p className="mt-2 font-dossie text-manila">Olhe para a TV.</p>
          </div>
        </div>
      </Tela>
    )

  const alternar = (id: string) =>
    setProvas((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < 3 ? [...p, id] : p))
  const pode = [!!culpado, motivo !== null, provas.length === 3, true][etapa]
  const opcao = (sel: boolean) =>
    `min-h-12 w-full rounded-sm border-2 px-3 py-2 text-left transition ${sel ? 'border-redjohn bg-manila text-tinta' : 'border-manila/30'}`
  const nomeCulpado = fase.suspeitos.find((s) => s.id === culpado)?.nome

  return (
    <Tela>
      <div className="flex items-center justify-between font-dossie text-sm text-manila">
        <span>{ETAPAS[etapa]} · {etapa + 1} de 4</span>
        <span className={restante <= 10 ? 'text-redjohn' : ''}>{restante} s</span>
      </div>
      <div className="mt-3 flex-1 space-y-2 overflow-y-auto">
        {etapa === 0 && fase.suspeitos.map((s) => (
          <button key={s.id} className={opcao(culpado === s.id)} onClick={() => setCulpado(s.id)} aria-pressed={culpado === s.id}>
            <span className="font-titulo text-lg">{s.nome}</span>
            <span className="block font-dossie text-xs opacity-80">{s.papel}</span>
          </button>
        ))}
        {etapa === 1 && fase.motivos.map((m, i) => (
          <button key={m} className={opcao(motivo === i)} onClick={() => setMotivo(i)} aria-pressed={motivo === i}>
            <span className="font-dossie">{m}</span>
          </button>
        ))}
        {etapa === 2 && (
          <>
            <p className="font-dossie text-sm text-manila">Escolha as 3 provas mais fortes ({provas.length}/3)</p>
            <div className="grid grid-cols-2 gap-2">
              {fase.evidencias.map((e) => (
                <button key={e.id} className={opcao(provas.includes(e.id))} onClick={() => alternar(e.id)} aria-pressed={provas.includes(e.id)}>
                  <span className="font-titulo font-bold">{e.id}</span>
                  <span className="block font-dossie text-xs">{e.titulo}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {etapa === 3 && (
          <div className="papel-arquivo rounded-sm p-4 font-dossie">
            <p className="font-titulo text-2xl text-redjohn">{nomeCulpado}</p>
            <p className="mt-2">Motivo: {motivo !== null && fase.motivos[motivo]}</p>
            <p className="mt-2">Provas: {provas.join(', ')}</p>
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-3">
        {etapa > 0 && (
          <button onClick={() => setEtapa(etapa - 1)} className="min-h-12 rounded-sm border-2 border-manila/40 px-5 font-titulo">Voltar</button>
        )}
        <button
          disabled={!pode || restante === 0}
          onClick={() => (etapa < 3 ? setEtapa(etapa + 1) : culpado && motivo !== null && acusar({ culpado, motivo, provas }))}
          className="min-h-12 flex-1 rounded-sm bg-redjohn px-6 py-3 font-titulo text-xl text-papel disabled:opacity-40"
        >
          {etapa < 3 ? 'Continuar' : 'Acusar'}
        </button>
      </div>
    </Tela>
  )
}
