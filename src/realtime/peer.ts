import Peer, { type DataConnection } from 'peerjs'
import type { Canal, Realtime } from './cliente'

// Tempo real sem servidor próprio: o host abre um "peer" com id fixo da sala
// e cada celular se conecta direto a ele (WebRTC). O PeerJS só faz a apresentação.
// Para usar outro servidor de sinalização: VITE_PEER_HOST, VITE_PEER_PORT, VITE_PEER_PATH, VITE_PEER_SECURE.

type Msg = { event: string; payload?: unknown; chave?: string }
type Ouvinte = (m: { payload: unknown }) => void

const env = import.meta.env
const opcoesServidor = env.VITE_PEER_HOST
  ? {
      host: env.VITE_PEER_HOST as string,
      port: Number(env.VITE_PEER_PORT ?? 443),
      path: (env.VITE_PEER_PATH as string) ?? '/',
      secure: env.VITE_PEER_SECURE !== 'false',
    }
  : {}

const idDoHost = (nome: string) => `mentalista-caso047-${nome.replace(/\W/g, '-')}`

export function realtimePeer(): Realtime {
  return {
    channel(nome, opts) {
      const souHost = opts.config.presence.key === 'host'
      const chaveMinha = opts.config.presence.key
      const ouvintes = new Map<string, Ouvinte[]>()
      const sync: (() => void)[] = []
      const conexoes = new Map<DataConnection, string | null>() // conexão → chave de presença
      let peer: Peer | null = null
      let paraHost: DataConnection | null = null
      let fechado = false
      let aoConectar: ((s: string) => void) | undefined
      let tentativa: ReturnType<typeof setTimeout> | undefined

      const entregar = (m: Msg) => ouvintes.get(m.event)?.forEach((f) => f({ payload: m.payload }))
      const avisarPresenca = () => sync.forEach((f) => f())
      const depois = (fn: () => void, ms: number) => {
        clearTimeout(tentativa)
        if (!fechado) tentativa = setTimeout(fn, ms)
      }

      const iniciarHost = () => {
        peer = new Peer(idDoHost(nome), opcoesServidor)
        peer.on('open', () => aoConectar?.('SUBSCRIBED'))
        peer.on('connection', (c) => {
          conexoes.set(c, null)
          c.on('data', (d) => {
            const m = d as Msg
            if (m.event === '__presenca') {
              conexoes.set(c, m.chave ?? null)
              avisarPresenca()
              return
            }
            entregar(m)
          })
          const sair = () => {
            conexoes.delete(c)
            avisarPresenca()
          }
          c.on('close', sair)
          c.on('error', sair)
        })
        // Ao recarregar a página, o id antigo pode demorar a ser liberado.
        peer.on('error', (e) => {
          if (e.type === 'unavailable-id' || e.type === 'network' || e.type === 'server-error') {
            peer?.destroy()
            depois(iniciarHost, 2500)
          }
        })
        peer.on('disconnected', () => !fechado && peer?.reconnect())
      }

      const conectarAoHost = () => {
        if (!peer || peer.destroyed || fechado) return
        const c = peer.connect(idDoHost(nome), { reliable: true })
        c.on('open', () => {
          paraHost = c
          c.send({ event: '__presenca', chave: chaveMinha })
          aoConectar?.('SUBSCRIBED')
        })
        c.on('data', (d) => entregar(d as Msg))
        const caiu = () => {
          if (paraHost === c) paraHost = null
          depois(conectarAoHost, 2000)
        }
        c.on('close', caiu)
        c.on('error', caiu)
      }

      const iniciarJogador = () => {
        peer = new Peer(opcoesServidor)
        peer.on('open', conectarAoHost)
        // Host ainda não abriu a sala (ou caiu): tenta de novo.
        peer.on('error', (e) => {
          if (e.type === 'peer-unavailable') depois(conectarAoHost, 2000)
          else if (e.type === 'network' || e.type === 'server-error') {
            peer?.destroy()
            depois(iniciarJogador, 2500)
          }
        })
        peer.on('disconnected', () => !fechado && peer?.reconnect())
        // Celular voltou do bloqueio de tela: reconecta na hora.
        document.addEventListener('visibilitychange', voltou)
      }
      const voltou = () => {
        if (document.visibilityState === 'visible' && !paraHost?.open) depois(conectarAoHost, 100)
      }

      const canal: Canal & { fechar(): void } = {
        on(tipo: string, filtro: { event: string }, cb: Ouvinte) {
          if (tipo === 'presence') sync.push(cb as () => void)
          else ouvintes.set(filtro.event, [...(ouvintes.get(filtro.event) ?? []), cb])
          return canal
        },
        subscribe(cb) {
          aoConectar = cb
          if (souHost) iniciarHost()
          else iniciarJogador()
          return canal
        },
        async send(m) {
          const msg: Msg = { event: m.event, payload: m.payload }
          if (souHost) {
            for (const c of conexoes.keys()) if (c.open) c.send(msg)
          } else if (paraHost?.open) paraHost.send(msg)
          return 'ok'
        },
        async track() {
          return 'ok'
        },
        presenceState() {
          const chaves = souHost ? [...conexoes.values()].filter((k): k is string => !!k) : []
          return Object.fromEntries([chaveMinha, ...chaves].map((k) => [k, [{}]]))
        },
        fechar() {
          fechado = true
          clearTimeout(tentativa)
          document.removeEventListener('visibilitychange', voltou)
          peer?.destroy()
        },
      } as Canal & { fechar(): void }
      return canal
    },
    removeChannel(c) {
      ;(c as Canal & { fechar(): void }).fechar()
    },
  }
}
