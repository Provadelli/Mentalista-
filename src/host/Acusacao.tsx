import { motion } from 'framer-motion'
import RelogioDeBolso from '../componentes/RelogioDeBolso'
import Smiley from '../componentes/Smiley'
import { useAgora } from '../componentes/useAgora'

export default function Acusacao({ fimEm, acusaram, total }: { fimEm: number; acusaram: number; total: number }) {
  const agora = useAgora()
  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}
      className="grid min-h-dvh place-items-center bg-tinta p-6 text-center">
      <div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1, duration: 2.5 }}>
          <Smiley className="mx-auto w-[clamp(10rem,22vw,22rem)]" />
        </motion.div>
        <h1 className="mt-6 font-titulo text-[clamp(2.5rem,5vw,5rem)] font-extrabold">A acusação</h1>
        <p className="mt-2 font-dossie text-[clamp(1.1rem,1.6vw,1.8rem)] text-manila">Culpado, motivo e as três provas mais fortes. No seu celular.</p>
        <p className="mt-8 font-titulo text-[clamp(1.5rem,2.4vw,2.6rem)] text-papel">{acusaram} de {total} acusaram</p>
        <div className="mt-6 flex justify-center"><RelogioDeBolso restanteMs={fimEm - agora} totalMs={90000} tamanho={110} /></div>
      </div>
    </motion.main>
  )
}
