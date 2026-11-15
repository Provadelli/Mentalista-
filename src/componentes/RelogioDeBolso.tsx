import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { som } from './som'

/** Cronômetro em forma de relógio de bolso. Ponteiro vermelho nos últimos 5 s. */
export default function RelogioDeBolso({ restanteMs, totalMs, tamanho = 120, tiquetaque = false }: { restanteMs: number; totalMs: number; tamanho?: number; tiquetaque?: boolean }) {
  const reduzir = useReducedMotion()
  const seg = Math.ceil(Math.max(restanteMs, 0) / 1000)
  const fracao = totalMs > 0 ? 1 - Math.max(restanteMs, 0) / totalMs : 1
  const urgente = seg <= 5
  useEffect(() => {
    if (tiquetaque && seg > 0 && seg <= 10) som.tique(seg <= 5)
  }, [seg, tiquetaque])
  return (
    <motion.div
      style={{ width: tamanho, transformOrigin: '50% -20%' }}
      animate={reduzir ? undefined : { rotate: [-4, 4, -4] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      className="relative shrink-0"
      role="timer"
      aria-label={`${seg} segundos`}
    >
      <svg viewBox="0 0 100 112" className="w-full">
        <circle cx="50" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="3" className="text-ouro" />
        <circle cx="50" cy="62" r="46" className="fill-ouro" />
        <circle cx="50" cy="62" r="40" className="fill-papel" />
        <line
          x1="50" y1="62" x2="50" y2="28"
          strokeWidth="4" strokeLinecap="round"
          className={urgente ? 'stroke-redjohn' : 'stroke-tinta'}
          style={{ transform: `rotate(${fracao * 360}deg)`, transformOrigin: '50px 62px' }}
        />
        <circle cx="50" cy="62" r="4" className="fill-tinta" />
      </svg>
      <span className={`absolute inset-x-0 bottom-[18%] text-center font-titulo text-xl font-bold ${urgente ? 'text-redjohn' : 'text-tinta'}`}>
        {seg}
      </span>
    </motion.div>
  )
}
