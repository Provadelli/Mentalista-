import { QRCodeSVG } from 'qrcode.react'
import { useParams } from 'react-router-dom'

export default function Lobby() {
  const { sala = '' } = useParams()
  const link = `${window.location.origin}/entrar?sala=${sala}`

  return (
    <main className="fundo-cortica min-h-dvh p-6 lg:p-12">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[auto_1fr]">
        <div className="papel-arquivo -rotate-2 rounded-sm p-6 text-center">
          <QRCodeSVG value={link} size={280} bgColor="#e9d8b4" fgColor="#1e1a17" className="mx-auto h-auto w-full max-w-72" />
          <p className="mt-4 font-dossie text-sm">Escaneie para entrar</p>
          <p className="font-titulo text-5xl font-extrabold tracking-widest">{sala}</p>
        </div>
        <div>
          <h1 className="font-titulo text-4xl text-tinta drop-shadow-sm lg:text-6xl">Aguardando investigadores</h1>
          <p className="mt-3 font-dossie text-lg text-tinta/80">0 de 7 na sala</p>
          {/* Próximo passo: lista de jogadores em tempo real (Supabase Realtime) */}
        </div>
      </div>
    </main>
  )
}
