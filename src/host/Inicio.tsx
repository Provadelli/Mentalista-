import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const gerarSala = () => String(Math.floor(1000 + Math.random() * 9000))

export default function Inicio() {
  const navigate = useNavigate()

  return (
    <main className="fundo-couro grid min-h-dvh place-items-center p-6">
      <motion.section
        initial={{ opacity: 0, y: 24, rotate: -1 }}
        animate={{ opacity: 1, y: 0, rotate: -1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="papel-arquivo relative w-full max-w-2xl rounded-sm p-8 sm:p-12"
      >
        <span className="carimbo absolute right-6 top-6 text-sm sm:text-base">Confidencial</span>
        <p className="font-dossie text-sm text-vinho">Dossiê de investigação · Caso 047</p>
        <h1 className="mt-3 font-titulo text-4xl font-extrabold leading-tight sm:text-6xl">
          A última noite no <em className="text-redjohn">Hotel Aurora</em>
        </h1>
        <p className="mt-6 font-dossie text-base leading-relaxed sm:text-lg">
          Às 22h17, Augusto Valença foi encontrado morto no escritório. Uma taça quebrada, um relógio parado e uma
          mensagem incompleta. Alguém está mentindo.
        </p>
        <button
          onClick={() => navigate(`/host/${gerarSala()}`)}
          className="mt-10 w-full rounded-sm bg-couro px-6 py-4 font-titulo text-xl text-papel transition hover:bg-couro-claro focus-visible:outline-4 focus-visible:outline-ouro sm:w-auto"
        >
          Abrir investigação
        </button>
      </motion.section>
    </main>
  )
}
