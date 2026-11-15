import { useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { canalDaSala, supabase } from './cliente'
import { LIMITE_JOGADORES, type EstadoSala, type Jogador, type MsgEntrar } from '../jogo/tipos'

const chaveEstado = (sala: string) => `mentalista:host:${sala}`

function carregar(sala: string): Jogador[] {
  try {
    return JSON.parse(localStorage.getItem(chaveEstado(sala)) ?? '[]') as Jogador[]
  } catch {
    return []
  }
}

/** O host é a autoridade: decide quem entra e transmite o estado da sala. */
export function useSalaHost(sala: string) {
  const [jogadores, setJogadores] = useState<Jogador[]>(() => carregar(sala))
  const ref = useRef(jogadores)
  const canalRef = useRef<RealtimeChannel | null>(null)

  const atualizar = (lista: Jogador[]) => {
    ref.current = lista
    setJogadores(lista)
    try {
      localStorage.setItem(chaveEstado(sala), JSON.stringify(lista.map((j) => ({ ...j, online: false }))))
    } catch {
      /* sem armazenamento */
    }
    const estado: EstadoSala = {
      jogadores: lista,
      avataresEmUso: lista.map((j) => j.avatar),
      cheia: lista.length >= LIMITE_JOGADORES,
    }
    void canalRef.current?.send({ type: 'broadcast', event: 'sala', payload: estado })
  }

  useEffect(() => {
    if (!supabase) return
    const canal = supabase.channel(canalDaSala(sala), { config: { presence: { key: 'host' } } })
    canalRef.current = canal

    canal
      .on('broadcast', { event: 'entrar' }, ({ payload }) => {
        const msg = payload as MsgEntrar
        const lista = ref.current
        const existente = lista.find((j) => j.playerId === msg.playerId)
        if (existente) {
          // Reconexão: devolve a mesma vaga, avatar e pontos.
          atualizar(lista.map((j) => (j.playerId === msg.playerId ? { ...j, online: true } : j)))
          return
        }
        if (lista.length >= LIMITE_JOGADORES) {
          void canal.send({ type: 'broadcast', event: 'recusa', payload: { playerId: msg.playerId, motivo: 'cheia' } })
          return
        }
        if (lista.some((j) => j.avatar === msg.avatar)) {
          void canal.send({ type: 'broadcast', event: 'recusa', payload: { playerId: msg.playerId, motivo: 'avatar' } })
          return
        }
        atualizar([...lista, { ...msg, nome: msg.nome.trim().slice(0, 16), pontos: 0, online: true }])
      })
      .on('broadcast', { event: 'pedirSala' }, () => atualizar(ref.current))
      .on('presence', { event: 'sync' }, () => {
        const online = new Set(Object.keys(canal.presenceState()))
        const lista = ref.current
        if (lista.some((j) => j.online !== online.has(j.playerId)))
          atualizar(lista.map((j) => ({ ...j, online: online.has(j.playerId) })))
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          void canal.track({ papel: 'host' })
          atualizar(ref.current)
        }
      })

    return () => {
      canalRef.current = null
      void supabase?.removeChannel(canal)
    }

  }, [sala])

  const remover = (playerId: string) => atualizar(ref.current.filter((j) => j.playerId !== playerId))

  return { jogadores, conectado: !!supabase, remover }
}
