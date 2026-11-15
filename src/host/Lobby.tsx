import { AnimatePresence, motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { useParams } from 'react-router-dom'
import Avatar from '../componentes/Avatar'
import { PERSONAGENS } from '../dados/personagens'
import { LIMITE_JOGADORES } from '../jogo/tipos'
import { useSalaHost } from '../realtime/useSalaHost'

export default function Lobby() {
  const { sala = '' } = useParams()
  const link = `${window.location.origin}/entrar?sala=${sala}`
  const { jogadores, conectado, remover } = useSalaHost(sala)

  return (
    <main className="fundo-cortica min-h-dvh p-6 lg:p-12">
      <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[auto_1fr]">
        <div className="papel-arquivo -rotate-2 rounded-sm p-6 text-center">
          <QRCodeSVG value={link} size={280} bgColor="#e9d8b4" fgColor="#1e1a17" className="mx-auto h-auto w-full max-w-72" />
          <p className="mt-4 font-dossie text-sm">Escaneie para entrar</p>
          <p className="font-titulo text-5xl font-extrabold tracking-widest">{sala}</p>
        </div>
        <div>
          <h1 className="font-titulo text-4xl text-tinta drop-shadow-sm lg:text-6xl">Aguardando investigadores</h1>
          <p className="mt-3 font-dossie text-lg text-tinta/80">
            {jogadores.length} de {LIMITE_JOGADORES} na sala
          </p>
          {!conectado && (
            <p className="mt-3 rounded-sm bg-redjohn px-4 py-2 font-dossie text-papel">
              Tempo real desligado: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
            </p>
          )}
          <ul className="mt-8 grid grid-cols-3 gap-6 sm:grid-cols-4 xl:grid-cols-5">
            <AnimatePresence>
              {jogadores.map((j, i) => (
                <motion.li
                  key={j.playerId}
                  layout
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: j.online ? 1 : 0.5, scale: 1, rotate: i % 2 ? 3 : -3 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  className="papel-arquivo group relative rounded-sm p-2 pt-4"
                >
                  <span aria-hidden className="absolute left-1/2 top-1 h-3 w-3 -translate-x-1/2 rounded-full bg-redjohn shadow" />
                  <Avatar id={j.avatar} />
                  <p className="mt-1 truncate text-center font-dossie text-sm">{j.nome}</p>
                  <p className="truncate text-center text-xs text-tinta/70">
                    {PERSONAGENS.find((p) => p.id === j.avatar)?.nome}
                    {!j.online && ' · offline'}
                  </p>
                  <button
                    onClick={() => remover(j.playerId)}
                    aria-label={`Remover ${j.nome}`}
                    className="absolute right-1 top-1 hidden h-6 w-6 rounded-full bg-tinta text-xs text-papel group-hover:block"
                  >
                    ×
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <button
            disabled={jogadores.length < 2}
            className="mt-10 min-h-12 rounded-sm bg-couro px-8 py-3 font-titulo text-xl text-papel transition hover:bg-couro-claro disabled:opacity-40"
          >
            Começar
          </button>
        </div>
      </div>
    </main>
  )
}
