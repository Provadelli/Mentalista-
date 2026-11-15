import { useState } from 'react'
import { CASO } from '../dados/caso'
import type { Config } from '../realtime/useSalaHost'

/** Antes da partida: modo da final e, no caso fechado, o culpado protegido por PIN (PLANO.md, 2.2). */
export default function Configuracao({ atual, salvar, cancelar }: { atual: Config | null; salvar: (c: Config) => void; cancelar?: () => void }) {
  const [desbloqueado, setDesbloqueado] = useState(!atual?.pin)
  const [pinTeste, setPinTeste] = useState('')
  const [modo, setModo] = useState<Config['modo']>(atual?.modo ?? 'fechado')
  const [culpado, setCulpado] = useState<string | null>(atual?.culpado ?? null)
  const [pin, setPin] = useState('')
  const [mostrar, setMostrar] = useState(false)

  if (!desbloqueado)
    return (
      <Moldura titulo="Configuração protegida">
        <p className="font-dossie">Digite o PIN para alterar o culpado.</p>
        <input
          type="password" inputMode="numeric" maxLength={4} value={pinTeste}
          onChange={(e) => setPinTeste(e.target.value.replace(/\D/g, ''))}
          className="mt-4 w-40 rounded-sm bg-papel px-4 py-3 text-center text-2xl tracking-[0.5em] text-tinta outline-none focus:ring-4 focus:ring-ouro"
        />
        {pinTeste.length === 4 && pinTeste !== atual?.pin && <p className="mt-2 text-redjohn">PIN incorreto.</p>}
        <div className="mt-6 flex gap-4">
          <button className="rounded-sm bg-couro px-6 py-3 font-titulo text-papel" disabled={pinTeste !== atual?.pin} onClick={() => setDesbloqueado(true)}>Abrir</button>
          {cancelar && <button className="font-dossie underline" onClick={cancelar}>Voltar</button>}
        </div>
      </Moldura>
    )

  const valido = modo === 'juri' || (culpado && /^\d{4}$/.test(pin))
  return (
    <Moldura titulo="Como termina o caso?">
      <div className="grid gap-4 md:grid-cols-2">
        {([
          ['fechado', 'Caso fechado', 'Você define o culpado agora. Acertar vale 2000 pontos.'],
          ['juri', 'Júri', 'Sem culpado definido: vale o veredito da maioria. Cada prova que pesa contra o acusado vale 300.'],
        ] as const).map(([id, nome, desc]) => (
          <button key={id} onClick={() => setModo(id)} aria-pressed={modo === id}
            className={`rounded-sm border-2 p-4 text-left transition ${modo === id ? 'border-redjohn bg-papel' : 'border-tinta/20'}`}>
            <p className="font-titulo text-xl font-bold">{nome}{id === 'fechado' && ' (recomendado)'}</p>
            <p className="mt-1 font-dossie text-sm">{desc}</p>
          </button>
        ))}
      </div>

      {modo === 'fechado' && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="font-titulo text-lg font-bold">Culpado</p>
            <button className="font-dossie text-sm underline" onClick={() => setMostrar((m) => !m)}>
              {mostrar ? 'Esconder nomes' : 'Mostrar nomes (cuidado com a TV)'}
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
            {CASO.suspeitos.map((s, i) => (
              <button key={s.id} onClick={() => setCulpado(s.id)} aria-pressed={culpado === s.id}
                className={`rounded-sm border-2 px-3 py-2 text-left font-dossie ${culpado === s.id ? 'border-redjohn bg-papel' : 'border-tinta/20'}`}>
                {mostrar ? s.nome : `Suspeito ${i + 1}`}
              </button>
            ))}
          </div>
          <label className="mt-6 block font-titulo text-lg font-bold" htmlFor="pin">PIN de 4 dígitos</label>
          <input id="pin" type="password" inputMode="numeric" maxLength={4} value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="mt-2 w-40 rounded-sm bg-papel px-4 py-3 text-center text-2xl tracking-[0.5em] text-tinta outline-none focus:ring-4 focus:ring-ouro" />
        </div>
      )}

      <div className="mt-8 flex items-center gap-4">
        <button disabled={!valido}
          onClick={() => salvar(modo === 'juri' ? { modo, culpado: null, pin: null } : { modo, culpado, pin })}
          className="min-h-12 rounded-sm bg-couro px-8 py-3 font-titulo text-xl text-papel disabled:opacity-40">
          Abrir a sala
        </button>
        {cancelar && <button className="font-dossie underline" onClick={cancelar}>Voltar</button>}
      </div>
    </Moldura>
  )
}

function Moldura({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <main className="fundo-couro grid min-h-dvh place-items-center p-6">
      <section className="papel-arquivo w-full max-w-3xl rounded-sm p-8">
        <h1 className="mb-6 font-titulo text-4xl font-extrabold">{titulo}</h1>
        {children}
      </section>
    </main>
  )
}
