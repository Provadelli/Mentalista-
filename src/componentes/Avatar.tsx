import { useState } from 'react'
import { PERSONAGENS, iniciais } from '../dados/personagens'

export default function Avatar({ id, className = '' }: { id: string; className?: string }) {
  const [semFoto, setSemFoto] = useState(false)
  const p = PERSONAGENS.find((x) => x.id === id)
  const nome = p?.nome ?? id
  return (
    <span className={`grid aspect-square w-full place-items-center overflow-hidden bg-couro-claro font-titulo text-xl text-papel ${className}`}>
      {semFoto ? (
        iniciais(nome)
      ) : (
        <img src={`/avatars/${id}.webp`} alt="" className="h-full w-full object-cover" onError={() => setSemFoto(true)} />
      )}
    </span>
  )
}
