import { motion } from 'framer-motion'
import type { MsgFicha } from '../jogo/tipos'

/** A ficha secreta: só neste celular, nunca na TV. */
export default function Ficha({ ficha, fechar }: { ficha: MsgFicha; fechar: () => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-label="Sua ficha secreta"
      className="fixed inset-0 z-50 flex items-end bg-tinta/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center sm:justify-center">
      <motion.article initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="papel-arquivo relative max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-sm p-6">
        <span className="carimbo absolute right-4 top-4 text-xs">Secreto</span>
        <p className="font-dossie text-sm text-vinho">{ficha.tipo === 'suspeito' ? 'Você é suspeito' : 'Papel de apoio'}</p>
        <h2 className="mt-1 font-titulo text-3xl font-bold">{ficha.nome}</h2>
        <p className="font-dossie">{ficha.papel}</p>
        <p className="mt-4 font-dossie text-base leading-relaxed">{ficha.ficha}</p>
        <p className="mt-4 text-sm text-tinta/70">Não mostre esta ficha. Você pode omitir segredos, mas não inventar fatos que contradigam as provas.</p>
        <button onClick={fechar} className="mt-6 min-h-12 w-full rounded-sm bg-couro px-6 py-3 font-titulo text-xl text-papel">Fechar</button>
      </motion.article>
    </div>
  )
}
