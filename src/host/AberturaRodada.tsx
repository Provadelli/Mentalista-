import { motion } from 'framer-motion'
import CartaoPista from '../componentes/CartaoPista'
import type { Rodada } from '../jogo/tipos'
import { CASO } from '../dados/caso'
import BotaoAvancar from './Botao'

export default function AberturaRodada({ rodada, avancar }: { rodada: Rodada; avancar: () => void }) {
  const pistas = CASO.evidencias.filter((e) => rodada.abre.includes(e.id))
  const envelope = pistas[0]?.envelope
  return (
    <main className="fundo-cortica min-h-dvh p-6 lg:p-12">
      <div className="mx-auto max-w-7xl">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-tinta">
          <p className="font-dossie text-lg">Rodada {rodada.id}{envelope && ` · Envelope ${envelope}`}</p>
          <h1 className="font-titulo text-[clamp(2.5rem,5vw,5rem)] font-extrabold">{rodada.titulo}</h1>
        </motion.header>

        {rodada.abre.includes('cenario') ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <motion.article initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="papel-arquivo -rotate-1 rounded-sm p-6">
              <h2 className="font-titulo text-2xl font-bold">O cenário</h2>
              <p className="mt-3 font-dossie text-[clamp(1rem,1.3vw,1.4rem)] leading-relaxed">{CASO.cenario.texto}</p>
              <ul className="mt-4 list-disc space-y-1 pl-5 font-dossie text-[clamp(0.9rem,1.1vw,1.2rem)]">
                {CASO.cenario.fatos.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </motion.article>
            <motion.article initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="papel-arquivo rotate-1 rounded-sm p-6">
              <h2 className="font-titulo text-2xl font-bold">Linha do tempo inicial</h2>
              <ol className="mt-3 space-y-3">
                {CASO.cenario.linhaDoTempo.map((l) => (
                  <li key={l.hora} className="flex gap-4 font-dossie text-[clamp(1rem,1.3vw,1.4rem)]">
                    <span className="font-bold text-redjohn">{l.hora}</span>
                    {l.fato}
                  </li>
                ))}
              </ol>
            </motion.article>
          </div>
        ) : (
          <ul className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {pistas.map((e, i) => (
              <motion.li key={e.id} initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.15 * i }}>
                <CartaoPista e={e} i={i} />
              </motion.li>
            ))}
          </ul>
        )}

        <div className="mt-10 text-right">
          <BotaoAvancar onClick={avancar}>Primeira pergunta</BotaoAvancar>
        </div>
      </div>
    </main>
  )
}
