import { motion } from 'framer-motion'
import Avatar from '../componentes/Avatar'
import type { JogadorHost } from '../realtime/useSalaHost'
import BotaoAvancar from './Botao'

export default function Ranking({ jogadores, avancar, rotulo }: { jogadores: JogadorHost[]; avancar: () => void; rotulo: string }) {
  const ordem = [...jogadores].sort((a, b) => b.pontos - a.pontos)
  return (
    <main className="fundo-couro min-h-dvh p-6 lg:p-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-titulo text-[clamp(2.2rem,4vw,4rem)] font-extrabold">Ranking</h1>
        <ol className="mt-6 space-y-3">
          {ordem.map((j, i) => (
            <motion.li
              key={j.playerId}
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="papel-arquivo flex items-center gap-4 rounded-sm p-3"
            >
              <span className="w-10 text-center font-titulo text-3xl font-bold">{i + 1}</span>
              <span className="w-14"><Avatar id={j.avatar} className="text-base" /></span>
              <span className="flex-1 truncate font-dossie text-[clamp(1.1rem,1.8vw,2rem)]">{j.nome}</span>
              {j.ultimoGanho !== 0 && (
                <span className={`font-sans text-lg font-semibold ${j.ultimoGanho > 0 ? 'text-feltro' : 'text-redjohn'}`}>
                  {j.ultimoGanho > 0 ? '+' : ''}{j.ultimoGanho}
                </span>
              )}
              <span className="w-28 text-right font-titulo text-[clamp(1.3rem,2vw,2.2rem)] font-bold">{j.pontos}</span>
            </motion.li>
          ))}
        </ol>
        <div className="mt-8 text-right">
          <BotaoAvancar onClick={avancar}>{rotulo}</BotaoAvancar>
        </div>
      </div>
    </main>
  )
}
