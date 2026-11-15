import { motion, useReducedMotion } from 'framer-motion'
import Avatar from '../componentes/Avatar'
import type { Jogador } from '../jogo/tipos'
import Tela from './Tela'

export default function Aguardando({ eu, posicao, texto }: { eu: Jogador; posicao: number; texto: string }) {
  const reduzir = useReducedMotion()
  return (
    <Tela className="text-center">
      <div className="flex items-center gap-3 text-left">
        <span className="w-12"><Avatar id={eu.avatar} className="text-sm" /></span>
        <div className="flex-1">
          <p className="font-titulo text-lg leading-tight">{eu.nome}</p>
          <p className="font-dossie text-sm text-manila">{posicao}º lugar · {eu.pontos} pts</p>
        </div>
      </div>
      <div className="grid flex-1 place-items-center">
        <div>
          <motion.span
            aria-hidden
            animate={reduzir ? undefined : { rotate: [0, -8, 8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity }}
            className="inline-block text-6xl text-pires"
          >
            ☕
          </motion.span>
          <p className="mt-4 font-titulo text-2xl">{texto}</p>
        </div>
      </div>
    </Tela>
  )
}
