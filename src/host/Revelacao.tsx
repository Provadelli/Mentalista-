import { motion } from 'framer-motion'
import { RESPOSTAS } from '../componentes/respostas'
import type { Pergunta } from '../jogo/tipos'
import BotaoAvancar from './Botao'

type Props = {
  pergunta: Extract<Pergunta, { tipo: 'escolha' | 'memoria' }>
  contagem: number[]
  avancar: () => void
}

export default function Revelacao({ pergunta, contagem, avancar }: Props) {
  const max = Math.max(1, ...contagem)
  return (
    <main className="fundo-couro min-h-dvh p-6 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <section className="papel-arquivo relative rounded-sm p-8">
          <motion.span
            initial={{ opacity: 0, scale: 2.4, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: -8, x: [0, -4, 4, 0] }}
            transition={{ duration: 0.35, ease: 'easeIn' }}
            className="carimbo absolute right-8 top-6 text-[clamp(1.2rem,2vw,2rem)]"
          >
            Resolvido
          </motion.span>
          <p className="pr-48 font-dossie text-[clamp(1.1rem,1.6vw,1.8rem)]">{pergunta.enunciado}</p>
          <h2 className="mt-6 font-titulo text-[clamp(1.6rem,2.8vw,3.2rem)] font-bold">
            {RESPOSTAS[pergunta.correta].simbolo} {RESPOSTAS[pergunta.correta].letra}. {pergunta.opcoes[pergunta.correta]}
          </h2>
          <p className="mt-4 border-l-4 border-redjohn pl-4 font-dossie text-[clamp(1rem,1.5vw,1.7rem)] leading-relaxed">
            <strong className="font-titulo">Dedução:</strong> {pergunta.deducao}
          </p>
        </section>

        <div className="mt-8 grid h-56 grid-cols-4 items-end gap-6" aria-label="Distribuição das respostas">
          {pergunta.opcoes.map((o, i) => (
            <div key={o} className="flex h-full flex-col justify-end text-center">
              <span className="font-titulo text-3xl text-papel">{contagem[i]}</span>
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: Math.max(contagem[i] / max, 0.04) }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{ transformOrigin: 'bottom' }}
                className={`${RESPOSTAS[i].cor} mt-2 h-40 rounded-t-sm ${i === pergunta.correta ? 'ring-4 ring-papel' : 'opacity-60'}`}
              />
              <span className="mt-2 font-titulo text-xl text-papel">
                {RESPOSTAS[i].simbolo} {RESPOSTAS[i].letra} {i === pergunta.correta && '✓'}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 text-right">
          <BotaoAvancar onClick={avancar}>Ver ranking</BotaoAvancar>
        </div>
      </div>
    </main>
  )
}
