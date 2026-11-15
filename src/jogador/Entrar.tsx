import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PERSONAGENS, iniciais } from '../dados/personagens'

export default function Entrar() {
  const [params] = useSearchParams()
  const sala = params.get('sala') ?? ''
  const [nome, setNome] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)

  return (
    <main className="fundo-couro min-h-dvh px-4 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="mx-auto max-w-md">
        <p className="font-dossie text-sm text-manila/80">Caso 047 · Sala {sala}</p>
        <h1 className="mt-1 font-titulo text-3xl">Identifique-se, investigador</h1>

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
          {PERSONAGENS.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => setAvatar(p.id)}
                aria-pressed={avatar === p.id}
                className={`papel-arquivo flex w-full flex-col items-center rounded-sm p-2 transition active:scale-95 ${
                  avatar === p.id ? 'ring-4 ring-ouro' : ''
                }`}
              >
                <span className="grid aspect-square w-full place-items-center overflow-hidden bg-couro-claro font-titulo text-xl text-papel">
                  {iniciais(p.nome)}
                </span>
                <span className="mt-1 text-center text-xs font-semibold leading-tight">{p.nome}</span>
              </button>
            </li>
          ))}
        </ul>

        <button
          disabled={!nome.trim() || !avatar}
          className="mt-8 min-h-12 w-full rounded-sm bg-redjohn px-6 py-3 font-titulo text-xl text-papel transition disabled:opacity-40"
        >
          Entrar no caso
        </button>
      </div>
    </main>
  )
}
