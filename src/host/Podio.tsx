import { motion } from 'framer-motion'
import Avatar from '../componentes/Avatar'
import type { JogadorHost } from '../realtime/useSalaHost'
import BotaoAvancar from './Botao'

const ALTURA = ['h-64', 'h-48', 'h-36']
const ORDEM_VISUAL = [1, 0, 2]

export default function Podio({ jogadores, reiniciar }: { jogadores: JogadorHost[]; reiniciar: () => void }) {
  const top = [...jogadores].sort((a, b) => b.pontos - a.pontos).slice(0, 3)
  return (
    <main className="fundo-couro flex min-h-dvh flex-col items-center justify-end p-6 lg:p-10">
      <h1 className="mb-auto mt-6 font-titulo text-[clamp(2.5rem,5vw,5rem)] font-extrabold text-ouro">Caso encerrado</h1>
      <div className="flex items-end gap-6">
        {ORDEM_VISUAL.filter((i) => top[i]).map((i) => (
          <motion.div
            key={top[i].playerId}
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 * (2 - i) }}
            className="flex w-[clamp(8rem,14vw,14rem)] flex-col items-center"
          >
            <div className="papel-arquivo w-3/4 rounded-sm p-2"><Avatar id={top[i].avatar} /></div>
            <p className="mt-2 truncate font-dossie text-xl">{top[i].nome}</p>
            <p className="font-titulo text-2xl text-ouro">{top[i].pontos}</p>
            <div className={`${ALTURA[i]} mt-2 grid w-full place-items-start justify-center rounded-t-sm bg-couro-claro pt-4 font-titulo text-5xl text-ouro`}>
              {i + 1}º
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-8"><BotaoAvancar onClick={reiniciar}>Jogar de novo</BotaoAvancar></div>
    </main>
  )
}
