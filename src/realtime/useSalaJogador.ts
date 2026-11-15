import { useEffect, useRef, useState } from 'react'
import { type Canal, canalDaSala, obterPlayerId, supabase } from './cliente'
import type { EstadoSala, FasePublica, MsgRecusa, MsgResponder } from '../jogo/tipos'

export type StatusJogador =
  | 'conectando'
  | 'escolhendo'
  | 'enviando'
  | 'dentro'
  | 'cheia'
  | 'avatarEmUso'
  | 'emAndamento'
  | 'semServidor'

const MOTIVOS: Record<MsgRecusa['motivo'], StatusJogador> = { cheia: 'cheia', avatar: 'avatarEmUso', emAndamento: 'emAndamento' }

export function useSalaJogador(sala: string) {
  const [playerId] = useState(obterPlayerId)
  const [estado, setEstado] = useState<EstadoSala | null>(null)
  const [fase, setFase] = useState<FasePublica>({ fase: 'LOBBY' })
  /** Diferença entre o relógio do host e o deste aparelho. */
  const [desvio, setDesvio] = useState(0)
  const [minhaResposta, setMinhaResposta] = useState<{ perguntaId: string; opcao: number; confirmada: boolean } | null>(null)
  const [status, setStatus] = useState<StatusJogador>(supabase ? 'conectando' : 'semServidor')
  const canalRef = useRef<Canal | null>(null)

  useEffect(() => {
    if (!supabase || !sala) return
    const canal = supabase.channel(canalDaSala(sala), { config: { presence: { key: playerId } } })
    canalRef.current = canal

    canal
      .on('broadcast', { event: 'sala' }, ({ payload }) => {
        const e = payload as EstadoSala
        setEstado(e)
        const dentro = e.jogadores.some((j) => j.playerId === playerId)
        setStatus((s) => (dentro ? 'dentro' : s === 'conectando' || s === 'dentro' ? 'escolhendo' : s))
      })
      .on('broadcast', { event: 'fase' }, ({ payload }) => {
        const f = payload as FasePublica
        if (f.fase === 'PERGUNTA') setDesvio(f.agora - Date.now())
        setFase(f)
      })
      .on('broadcast', { event: 'recebida' }, ({ payload }) => {
        const r = payload as { playerId: string; perguntaId: string }
        if (r.playerId === playerId) setMinhaResposta((m) => (m && m.perguntaId === r.perguntaId ? { ...m, confirmada: true } : m))
      })
      .on('broadcast', { event: 'recusa' }, ({ payload }) => {
        const r = payload as MsgRecusa
        if (r.playerId === playerId) setStatus(MOTIVOS[r.motivo])
      })
      .subscribe((s) => {
        if (s === 'SUBSCRIBED') {
          void canal.track({ papel: 'jogador' })
          void canal.send({ type: 'broadcast', event: 'pedirSala', payload: {} })
        }
      })

    return () => {
      canalRef.current = null
      void supabase?.removeChannel(canal)
    }
  }, [sala, playerId])

  const enviar = (event: string, payload: unknown) =>
    void canalRef.current?.send({ type: 'broadcast', event, payload })

  const entrar = (nome: string, avatar: string) => {
    setStatus('enviando')
    enviar('entrar', { playerId, nome, avatar })
  }

  const responder = (opcao: number) => {
    if (fase.fase !== 'PERGUNTA') return
    setMinhaResposta({ perguntaId: fase.perguntaId, opcao, confirmada: false })
    const msg: MsgResponder = { playerId, perguntaId: fase.perguntaId, opcao }
    enviar('responder', msg)
  }

  const eu = estado?.jogadores.find((j) => j.playerId === playerId) ?? null
  const posicao = eu && estado ? [...estado.jogadores].sort((a, b) => b.pontos - a.pontos).findIndex((j) => j.playerId === playerId) + 1 : 0

  return {
    playerId,
    estado,
    fase,
    desvio,
    status,
    eu,
    posicao,
    minhaResposta,
    entrar,
    responder,
    tentarDeNovo: () => setStatus('escolhendo'),
  }
}
