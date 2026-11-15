import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Subconjunto do RealtimeChannel do Supabase que o jogo usa. */
export type Canal = {
  on(tipo: 'broadcast', filtro: { event: string }, cb: (m: { payload: unknown }) => void): Canal
  on(tipo: 'presence', filtro: { event: 'sync' }, cb: () => void): Canal
  subscribe(cb?: (status: string) => void): Canal
  send(m: { type: 'broadcast'; event: string; payload: unknown }): Promise<unknown>
  track(estado: Record<string, unknown>): Promise<unknown>
  presenceState(): Record<string, unknown>
}

type Realtime = { channel(nome: string, opts: { config: { presence: { key: string } } }): Canal; removeChannel(c: Canal): unknown }

const supabaseReal = url && chave ? createClient(url, chave) : null

/**
 * Sem Supabase configurado, em desenvolvimento, usa BroadcastChannel:
 * permite jogar entre abas do mesmo navegador (host numa aba, jogadores em outras).
 */
function realtimeLocal(): Realtime {
  return {
    channel(nome, opts) {
      const bc = new BroadcastChannel(nome)
      const chaveMinha = opts.config.presence.key
      const ouvintes = new Map<string, ((m: { payload: unknown }) => void)[]>()
      const sync: (() => void)[] = []
      const presentes = new Map<string, number>()
      let batida: ReturnType<typeof setInterval> | undefined
      let fechado = false
      const postar = (m: unknown) => {
        if (!fechado) bc.postMessage(m)
      }
      const atualizarPresenca = () => {
        const agora = Date.now()
        for (const [k, t] of presentes) if (agora - t > 4000) presentes.delete(k)
        sync.forEach((f) => f())
      }
      bc.onmessage = (ev: MessageEvent<{ event: string; payload: unknown; chave?: string }>) => {
        if (ev.data.event === '__presenca') {
          const novo = !presentes.has(ev.data.chave!)
          presentes.set(ev.data.chave!, Date.now())
          if (novo) atualizarPresenca()
          return
        }
        ouvintes.get(ev.data.event)?.forEach((f) => f({ payload: ev.data.payload }))
      }
      const canal: Canal & { fechar(): void } = {
        on(tipo: string, filtro: { event: string }, cb: (m: { payload: unknown }) => void) {
          if (tipo === 'presence') sync.push(cb as () => void)
          else ouvintes.set(filtro.event, [...(ouvintes.get(filtro.event) ?? []), cb])
          return canal
        },
        subscribe(cb) {
          setTimeout(() => cb?.('SUBSCRIBED'), 0)
          return canal
        },
        async send(m) {
          postar({ event: m.event, payload: m.payload })
          return 'ok'
        },
        async track() {
          const pulsar = () => {
            postar({ event: '__presenca', chave: chaveMinha })
            atualizarPresenca()
          }
          presentes.set(chaveMinha, Date.now())
          pulsar()
          clearInterval(batida)
          batida = setInterval(pulsar, 1500)
          return 'ok'
        },
        presenceState: () => Object.fromEntries([...presentes.keys()].map((k) => [k, [{}]])),
        fechar() {
          fechado = true
          clearInterval(batida)
          bc.close()
        },
      } as Canal & { fechar(): void }
      return canal
    },
    removeChannel(c) {
      ;(c as Canal & { fechar(): void }).fechar()
    },
  }
}

export const supabase: Realtime | null =
  (supabaseReal as unknown as Realtime | null) ??
  (import.meta.env.DEV && typeof BroadcastChannel !== 'undefined' ? realtimeLocal() : null)

export const modoLocal = !supabaseReal && !!supabase

export const canalDaSala = (sala: string) => `sala:${sala}`

/** playerId estável neste aparelho, para reconexão. */
export function obterPlayerId(): string {
  const chaveLocal = 'mentalista:playerId'
  // No modo local cada aba é um jogador, então o id fica na sessão da aba.
  const armazenamento = modoLocal ? sessionStorage : localStorage
  try {
    const salvo = armazenamento.getItem(chaveLocal)
    if (salvo) return salvo
    const novo = crypto.randomUUID()
    armazenamento.setItem(chaveLocal, novo)
    return novo
  } catch {
    return crypto.randomUUID()
  }
}
