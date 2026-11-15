import type { Evidencia } from '../jogo/tipos'

export default function CartaoPista({ e, i = 0 }: { e: Evidencia; i?: number }) {
  return (
    <article
      className="papel-arquivo relative rounded-sm p-4 pt-6"
      style={{ transform: `rotate(${(i % 3) - 1}deg)` }}
    >
      <span aria-hidden className="absolute left-1/2 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full bg-redjohn shadow" />
      <h3 className="font-titulo text-lg font-bold">
        {e.id} — {e.titulo}
      </h3>
      <p className="mt-2 font-dossie text-sm leading-snug lg:text-base">{e.texto}</p>
    </article>
  )
}
