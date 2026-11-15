import { motion } from 'framer-motion'
import Avatar from '../componentes/Avatar'
import Smiley from '../componentes/Smiley'
import { CASO } from '../dados/caso'
import type { FasePublica, MsgAcusar } from '../jogo/tipos'
import type { JogadorHost } from '../realtime/useSalaHost'
import BotaoAvancar from './Botao'

type Props = { v: Extract<FasePublica, { fase: 'VEREDITO' }>; acusacoes: Record<string, MsgAcusar>; jogadores: JogadorHost[]; avancar: () => void }

const nome = (id: string) => CASO.suspeitos.find((s) => s.id === id)?.nome ?? id

export default function Veredito({ v, acusacoes, jogadores, avancar }: Props) {
  const titulo = v.modo === 'fechado' ? 'O culpado é' : v.acusados.length > 1 ? 'O júri se dividiu' : 'O júri acusa'
  return (
    <main className="min-h-dvh bg-tinta p-6 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-8">
          <Smiley className="w-32 shrink-0" />
          <div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-dossie text-2xl text-manila">{titulo}…</motion.p>
            <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2, duration: 1 }}
              className="font-titulo text-[clamp(2.5rem,5vw,5.5rem)] font-extrabold text-redjohn">
              {v.acusados.length ? v.acusados.map(nome).join(' e ') : 'ninguém'}
            </motion.h1>
          </div>
        </div>

        <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.2 }} className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jogadores.map((j) => {
            const a = acusacoes[j.playerId]
            const r = v.resultados[j.playerId]
            return (
              <li key={j.playerId} className={`papel-arquivo rounded-sm p-4 ${r?.acertou ? 'ring-4 ring-ouro' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="w-12"><Avatar id={j.avatar} className="text-sm" /></span>
                  <p className="flex-1 font-titulo text-xl">{j.nome}</p>
                  <p className="font-titulo text-xl font-bold">{r && r.ganho > 0 ? `+${r.ganho}` : '+0'}</p>
                </div>
                {a ? (
                  <div className="mt-2 font-dossie text-sm">
                    <p>Acusou <strong>{nome(a.culpado)}</strong></p>
                    <p>Motivo: {CASO.motivos[a.motivo]}</p>
                    <p>Provas: {a.provas.join(', ')}</p>
                    {r?.detalhe && <p className="mt-1 text-vinho">{r.detalhe}</p>}
                  </div>
                ) : (
                  <p className="mt-2 font-dossie text-sm">Não acusou ninguém.</p>
                )}
              </li>
            )
          })}
        </motion.ul>
        <div className="mt-8 text-right"><BotaoAvancar onClick={avancar}>Pódio</BotaoAvancar></div>
      </div>
    </main>
  )
}
