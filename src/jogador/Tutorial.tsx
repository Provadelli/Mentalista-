import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Tela from './Tela'

const CARTOES = [
  ['Leia com calma', 'As respostas só destravam depois de alguns segundos. Use esse tempo para pensar nas provas.'],
  ['Raciocínio vale mais', 'Velocidade vale pouco: no máximo 30% a mais. Acertar é o que importa.'],
  ['A aposta de Jane', 'Na última rodada você pode apostar 2x ou 3x. Só aposte alto se tiver certeza: o erro custa pontos.'],
] as const

export const CHAVE_TUTORIAL = 'mentalista:tutorialVisto'

export default function Tutorial({ fechar }: { fechar: () => void }) {
  const [i, setI] = useState(0)
  const concluir = () => {
    try {
      localStorage.setItem(CHAVE_TUTORIAL, '1')
    } catch {
      /* sem armazenamento */
    }
    fechar()
  }
  return (
    <Tela>
      <div className="flex justify-end">
        <button onClick={concluir} className="min-h-12 px-4 font-dossie text-manila underline">Pular</button>
      </div>
      <div className="grid flex-1 place-items-center">
        <AnimatePresence mode="wait">
          <motion.article key={i} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="papel-arquivo w-full rounded-sm p-6">
            <p className="font-dossie text-sm text-vinho">{i + 1} de {CARTOES.length}</p>
            <h2 className="mt-2 font-titulo text-3xl font-bold">{CARTOES[i][0]}</h2>
            <p className="mt-3 font-dossie text-lg leading-relaxed">{CARTOES[i][1]}</p>
          </motion.article>
        </AnimatePresence>
      </div>
      <button onClick={() => (i < CARTOES.length - 1 ? setI(i + 1) : concluir())}
        className="min-h-12 w-full rounded-sm bg-redjohn px-6 py-3 font-titulo text-xl text-papel">
        {i < CARTOES.length - 1 ? 'Próximo' : 'Entendi'}
      </button>
    </Tela>
  )
}
