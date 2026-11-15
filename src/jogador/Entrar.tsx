import { useState } from 'react'
import Avatar from '../componentes/Avatar'
import { PERSONAGENS } from '../dados/personagens'
import type { EstadoSala } from '../jogo/tipos'
import type { StatusJogador } from '../realtime/useSalaJogador'

type Props = {
  sala: string
  estado: EstadoSala | null
  status: StatusJogador
  entrar: (nome: string, avatar: string) => void
  tentarDeNovo: () => void
}

export default function Entrar({ sala, estado, status, entrar, tentarDeNovo }: Props) {
  const [nome, setNome] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const emUso = new Set(estado?.avataresEmUso ?? [])

  const aviso =
    status === 'semServidor'
      ? 'Tempo real indisponível neste site.'
      : status === 'conectando'
        ? 'Conectando à sala…'
        : status === 'cheia'
          ? 'Sala cheia: o caso já tem 7 investigadores.'
          : status === 'emAndamento'
            ? 'A investigação já começou. Aguarde a próxima partida.'
            : status === 'avatarEmUso'
            ? 'Esse personagem acabou de ser escolhido. Escolha outro.'
            : null

  return (
    <main className="fundo-couro min-h-dvh px-4 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="mx-auto max-w-md">
        <p className="font-dossie text-sm text-manila/80">Caso 047 · Sala {sala}</p>
        <h1 className="mt-1 font-titulo text-3xl">Identifique-se, investigador</h1>

        {aviso && <p className="mt-4 rounded-sm bg-redjohn px-4 py-2 font-dossie text-papel">{aviso}</p>}

        <label className="mt-6 block font-dossie text-sm text-manila" htmlFor="nome">
          Seu nome
        </label>
        <input
          id="nome"
          value={nome}
          maxLength={16}
          onChange={(e) => setNome(e.target.value)}
          className="mt-2 w-full rounded-sm bg-papel px-4 py-3 text-lg text-tinta outline-none focus:ring-4 focus:ring-ouro"
          placeholder="Ex.: Pedro"
        />

        <p className="mt-6 font-dossie text-sm text-manila">Escolha seu personagem</p>
        <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {PERSONAGENS.map((p) => {
            const ocupado = emUso.has(p.id)
            return (
              <li key={p.id}>
                <button
                  disabled={ocupado}
                  onClick={() => {
                    setAvatar(p.id)
                    if (status === 'avatarEmUso') tentarDeNovo()
                  }}
                  aria-pressed={avatar === p.id}
                  className={`papel-arquivo relative flex w-full flex-col items-center rounded-sm p-2 transition active:scale-95 disabled:opacity-50 ${
                    avatar === p.id && !ocupado ? 'ring-4 ring-ouro' : ''
                  }`}
                >
                  <Avatar id={p.id} />
                  {ocupado && (
                    <span className="carimbo absolute top-1/3 -rotate-12 bg-manila/80 text-xs">Em uso</span>
                  )}
                  <span className="mt-1 text-center text-xs font-semibold leading-tight">{p.nome}</span>
                </button>
              </li>
            )
          })}
        </ul>

        <button
          disabled={!nome.trim() || !avatar || emUso.has(avatar) || status !== 'escolhendo'}
          onClick={() => avatar && entrar(nome.trim(), avatar)}
          className="mt-8 min-h-12 w-full rounded-sm bg-redjohn px-6 py-3 font-titulo text-xl text-papel transition disabled:opacity-40"
        >
          {status === 'enviando' ? 'Entrando…' : 'Entrar no caso'}
        </button>
      </div>
    </main>
  )
}
