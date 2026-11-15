import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Jogador } from '../jogo/tipos'
import Tela from './Tela'

export default function Resultado({ eu, posicao, resultado }: { eu: Jogador; posicao: number; resultado?: { acertou: boolean; ganho: number } }) {
  const acertou = !!resultado?.acertou
  useEffect(() => {
    navigator.vibrate?.(acertou ? [40, 60, 40] : 200)
  }, [acertou])
  return (
    <Tela className={`text-center ${acertou ? '' : 'bg-redjohn/30'}`}>
      <div className="grid flex-1 place-items-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <p className={`font-titulo text-5xl font-extrabold ${acertou ? 'text-ouro' : 'text-papel'}`}>
            {resultado ? (acertou ? 'Dedução certeira!' : 'Não foi dessa vez') : 'Sem resposta'}
          </p>
          <p className="mt-4 font-titulo text-3xl">
            {resultado && resultado.ganho !== 0 ? `${resultado.ganho > 0 ? '+' : ''}${resultado.ganho} pts` : '+0 pts'}
          </p>
          <p className="mt-6 font-dossie text-lg text-manila">
            Você está em {posicao}º lugar, com {eu.pontos} pontos.
          </p>
        </motion.div>
      </div>
    </Tela>
  )
}
