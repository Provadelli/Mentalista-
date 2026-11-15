import { useState } from 'react'
import { som } from '../componentes/som'

export default function BotaoSom() {
  const [mudo, setMudo] = useState(som.mudo)
  return (
    <button
      onClick={() => setMudo(som.alternarMudo())}
      aria-label={mudo ? 'Ligar som' : 'Desligar som'}
      className="fixed bottom-4 left-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-tinta/70 text-xl text-papel opacity-60 transition hover:opacity-100"
    >
      {mudo ? '🔇' : '🔊'}
    </button>
  )
}
