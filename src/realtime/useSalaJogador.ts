import { useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { canalDaSala, obterPlayerId, supabase } from './cliente'
import type { EstadoSala, MsgRecusa } from '../jogo/tipos'

export type StatusJogador = 'conectando' | 'escolhendo' | 'enviando' | 'dentro' | 'cheia' | 'avatarEmUso' | 'semServidor'

export function useSalaJogador(sala: string) {
  const [playerId] = useState(obterPlayerId)
  const [estado, setEstado] = useState<EstadoSala | null>(null)
  const [status, setStatus] = useState<StatusJogador>(supabase ? 'conectando' : 'semServidor')
  const canalRef = useRef<RealtimeChannel | null>(null)

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
      .on('broadcast', { event: 'recusa' }, ({ payload }) => {
        const r = payload as MsgRecusa
        if (r.playerId === playerId) setStatus(r.motivo === 'cheia' ? 'cheia' : 'avatarEmUso')
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

  const entrar = (nome: string, avatar: string) => {
    setStatus('enviando')
    void canalRef.current?.send({ type: 'broadcast', event: 'entrar', payload: { playerId, nome, avatar } })
  }

  const eu = estado?.jogadores.find((j) => j.playerId === playerId) ?? null
  return { playerId, estado, status, entrar, eu, tentarDeNovo: () => setStatus('escolhendo') }
}
