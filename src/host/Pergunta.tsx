import { motion } from 'framer-motion'
import CartaoPista from '../componentes/CartaoPista'
import RelogioDeBolso from '../componentes/RelogioDeBolso'
import { RESPOSTAS } from '../componentes/respostas'
import { useAgora } from '../componentes/useAgora'
import { CASO } from '../dados/caso'
import type { Pergunta as TPergunta, Rodada } from '../jogo/tipos'

type Props = {
  rodada: Rodada
  pergunta: Exclude<TPergunta, { tipo: 'acusacao' }>
  numero: number
  destravaEm: number
  fimEm: number
  responderam: number
  total: number
}

export default function Pergunta({ rodada, pergunta, numero, destravaEm, fimEm, responderam, total }: Props) {
  const agora = useAgora()
  const inicioPergunta = fimEm - pergunta.tempoSeg * 1000
  const memorizando = pergunta.tipo === 'memoria' && agora < inicioPergunta
  const textoOrdenar = pergunta.tipo === 'ordenar' ? ' Arraste os cartões no celular.' : ''

  if (memorizando) {
    const pistas = CASO.evidencias.filter((e) => rodada.abre.includes(e.id))
    return (
      <main className="fundo-cortica min-h-dvh p-6 lg:p-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between text-tinta">
            <h1 className="font-titulo text-[clamp(2rem,4vw,4rem)] font-extrabold">Memorize o quadro</h1>
            <RelogioDeBolso restanteMs={inicioPergunta - agora} totalMs={pergunta.mostrarPistasSeg * 1000} />
          </div>
          <ul className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {pistas.map((e, i) => <li key={e.id}><CartaoPista e={e} i={i} /></li>)}
          </ul>
        </div>
      </main>
    )
  }

  const travado = agora < destravaEm
  return (
    <main className="fundo-couro flex min-h-dvh flex-col p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="font-dossie text-manila/80">
              {rodada.titulo} · Pergunta {numero}
            </p>
            <p className="mt-1 font-dossie text-lg text-manila">
              {responderam} de {total} responderam
            </p>
          </div>
          <RelogioDeBolso restanteMs={fimEm - agora} totalMs={fimEm - inicioPergunta} tamanho={140} tiquetaque />
        </div>

        <motion.section
          key={pergunta.id}
          initial={{ opacity: 0, y: 40, rotateX: -20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.5 }}
          className="papel-arquivo relative mt-4 rounded-sm p-8"
        >
          <span className="carimbo absolute right-6 top-4 text-sm">Confidencial</span>
          <h1 className="pr-36 font-dossie text-[clamp(1.5rem,2.6vw,3rem)] leading-snug">{pergunta.enunciado}{textoOrdenar}</h1>
        </motion.section>

        {pergunta.aposta && (
          <p className="mt-4 font-titulo text-[clamp(1.2rem,1.8vw,2rem)] text-ouro">
            A aposta de Jane: 1x, 2x ou 3x. Só aposte alto se tiver certeza.
          </p>
        )}
        {pergunta.tipo === 'ordenar' ? (
          <ul className="mt-8 grid flex-1 grid-cols-2 gap-5 xl:grid-cols-4">
            {pergunta.opcoes.map((o, i) => (
              <motion.li key={o} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
                className="papel-arquivo flex items-center rounded-sm p-6 font-dossie text-[clamp(1.1rem,1.7vw,2rem)] leading-snug"
                style={{ transform: `rotate(${(i % 3) - 1}deg)` }}>
                {o}
              </motion.li>
            ))}
          </ul>
        ) : (
        <ul className="mt-8 grid flex-1 grid-cols-2 gap-5">
          {pergunta.opcoes.map((o, i) => (
            <motion.li
              key={o}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: travado ? 0.55 : 1, scale: 1 }}
              className={`${RESPOSTAS[i].cor} flex items-center gap-5 rounded-sm p-6 shadow-lg`}
            >
              <span aria-hidden className="text-[clamp(2rem,3vw,3.5rem)]">{RESPOSTAS[i].simbolo}</span>
              <span className="font-titulo text-[clamp(1.2rem,2vw,2.4rem)] font-bold">{RESPOSTAS[i].letra}</span>
              <span className="font-sans text-[clamp(1.1rem,1.8vw,2.1rem)] font-semibold leading-tight">{o}</span>
            </motion.li>
          ))}
        </ul>
        )}
        {travado && (
          <p className="mt-4 text-center font-dossie text-lg text-manila">
            Leia com calma… respostas liberadas em {Math.ceil((destravaEm - agora) / 1000)} s
          </p>
        )}
      </div>
    </main>
  )
}
