import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type Canal, canalDaSala, supabase } from './cliente'
import { CASO } from '../dados/caso'
import { montarRoteiro, perguntaDoPasso, type Passo } from '../jogo/maquinaEstados'
import { aplicar, pontosEscolha } from '../jogo/pontuacao'
import {
  LIMITE_JOGADORES,
  type EstadoSala,
  type FasePublica,
  type Jogador,
  type MsgEntrar,
  type MsgResponder,
} from '../jogo/tipos'

export type Resposta = { opcao: number; recebidaEm: number }
export type JogadorHost = Jogador & { acertosSeguidos: number; ultimoGanho: number }

type Salvo = {
  jogadores: JogadorHost[]
  indice: number
  destravaEm: number
  fimEm: number
  respostas: Record<string, Resposta>
  publica: FasePublica
}

const chave = (sala: string) => `mentalista:host:${sala}`
const inicial = (): Salvo => ({ jogadores: [], indice: 0, destravaEm: 0, fimEm: 0, respostas: {}, publica: { fase: 'LOBBY' } })

function carregar(sala: string): Salvo {
  try {
    const s = JSON.parse(localStorage.getItem(chave(sala)) ?? 'null') as Salvo | null
    return s ? { ...inicial(), ...s, jogadores: s.jogadores.map((j) => ({ ...j, online: false })) } : inicial()
  } catch {
    return inicial()
  }
}

/** O host é a autoridade: guarda o gabarito, mede o tempo, calcula os pontos e avança as fases. */
export function useSalaHost(sala: string) {
  const roteiro = useMemo(() => montarRoteiro(CASO), [])
  const [estado, setEstado] = useState<Salvo>(() => carregar(sala))
  const ref = useRef(estado)
  const canalRef = useRef<Canal | null>(null)

  const enviar = (event: string, payload: unknown) =>
    void canalRef.current?.send({ type: 'broadcast', event, payload })

  const transmitir = (s: Salvo) => {
    const publico: EstadoSala = {
      jogadores: s.jogadores.map(({ playerId, nome, avatar, pontos, online }) => ({ playerId, nome, avatar, pontos, online })),
      avataresEmUso: s.jogadores.map((j) => j.avatar),
      cheia: s.jogadores.length >= LIMITE_JOGADORES,
    }
    enviar('sala', publico)
    // `agora` é renovado a cada envio para o celular corrigir o relógio.
    enviar('fase', s.publica.fase === 'PERGUNTA' ? { ...s.publica, agora: Date.now() } : s.publica)
  }

  const salvar = useCallback(
    (s: Salvo) => {
      ref.current = s
      setEstado(s)
      try {
        localStorage.setItem(chave(sala), JSON.stringify(s))
      } catch {
        /* sem armazenamento */
      }
      transmitir(s)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sala],
  )

  /** Fecha a pergunta: calcula os pontos e monta a revelação. */
  const revelar = useCallback(
    (s: Salvo, passo: Extract<Passo, { pergunta: number }>): Salvo => {
      const p = perguntaDoPasso(CASO, passo)
      if (!p || (p.tipo !== 'escolha' && p.tipo !== 'memoria')) return s
      const total = s.fimEm - s.destravaEm
      const resultados: Record<string, { acertou: boolean; ganho: number }> = {}
      const jogadores = s.jogadores.map((j) => {
        const r = s.respostas[j.playerId]
        const acertou = r?.opcao === p.correta
        const acertosSeguidos = acertou ? j.acertosSeguidos + 1 : 0
        const variacao = r
          ? pontosEscolha({ acertou, tempoGastoMs: r.recebidaEm - s.destravaEm, tempoTotalMs: total, acertosSeguidos })
          : 0
        const pontos = aplicar(j.pontos, variacao)
        resultados[j.playerId] = { acertou, ganho: pontos - j.pontos }
        return { ...j, pontos, acertosSeguidos, ultimoGanho: pontos - j.pontos }
      })
      return { ...s, jogadores, publica: { fase: 'REVELACAO', perguntaId: p.id, correta: p.correta, deducao: p.deducao, resultados } }
    },
    [],
  )

  const irPara = useCallback(
    (indice: number) => {
      const s = ref.current
      const passo = roteiro[Math.min(indice, roteiro.length - 1)]
      let novo: Salvo = { ...s, indice }
      switch (passo.fase) {
        case 'LOBBY':
          novo.publica = { fase: 'LOBBY' }
          break
        case 'ABERTURA_RODADA': {
          const r = CASO.rodadas[passo.rodada]
          novo.publica = { fase: 'ABERTURA_RODADA', rodada: { id: r.id, titulo: r.titulo } }
          break
        }
        case 'PERGUNTA': {
          const p = perguntaDoPasso(CASO, passo)!
          if (p.tipo === 'acusacao') break
          const agora = Date.now()
          const memoria = p.tipo === 'memoria' ? p.mostrarPistasSeg * 1000 : 0
          const destravaEm = agora + memoria + p.travaSeg * 1000
          const fimEm = agora + memoria + p.tempoSeg * 1000
          novo = { ...novo, destravaEm, fimEm, respostas: {} }
          novo.publica = {
            fase: 'PERGUNTA',
            perguntaId: p.id,
            tipo: p.tipo,
            enunciado: p.enunciado,
            opcoes: p.opcoes,
            aposta: p.aposta,
            agora,
            destravaEm,
            fimEm,
          }
          break
        }
        case 'REVELACAO':
          novo = revelar(novo, passo)
          break
        case 'RANKING':
          novo.publica = { fase: 'RANKING' }
          break
        case 'PODIO':
          novo.publica = { fase: 'PODIO' }
          break
      }
      salvar(novo)
    },
    [roteiro, revelar, salvar],
  )

  const avancar = useCallback(() => irPara(ref.current.indice + 1), [irPara])

  // Fecha a pergunta quando o tempo acaba ou todos responderam.
  useEffect(() => {
    if (estado.publica.fase !== 'PERGUNTA') return
    const todos = estado.jogadores.length > 0 && estado.jogadores.every((j) => estado.respostas[j.playerId])
    if (todos) {
      avancar()
      return
    }
    const t = setTimeout(avancar, Math.max(0, estado.fimEm - Date.now()))
    return () => clearTimeout(t)
  }, [estado, avancar])

  useEffect(() => {
    if (!supabase) return
    const canal = supabase.channel(canalDaSala(sala), { config: { presence: { key: 'host' } } })
    canalRef.current = canal

    canal
      .on('broadcast', { event: 'entrar' }, ({ payload }) => {
        const msg = payload as MsgEntrar
        const s = ref.current
        if (s.jogadores.some((j) => j.playerId === msg.playerId)) {
          // Reconexão: devolve a mesma vaga, avatar e pontos.
          salvar({ ...s, jogadores: s.jogadores.map((j) => (j.playerId === msg.playerId ? { ...j, online: true } : j)) })
          return
        }
        const recusa = (motivo: string) => enviar('recusa', { playerId: msg.playerId, motivo })
        if (s.publica.fase !== 'LOBBY') return recusa('emAndamento')
        if (s.jogadores.length >= LIMITE_JOGADORES) return recusa('cheia')
        if (s.jogadores.some((j) => j.avatar === msg.avatar)) return recusa('avatar')
        const novo: JogadorHost = {
          ...msg,
          nome: msg.nome.trim().slice(0, 16),
          pontos: 0,
          online: true,
          acertosSeguidos: 0,
          ultimoGanho: 0,
        }
        salvar({ ...s, jogadores: [...s.jogadores, novo] })
      })
      .on('broadcast', { event: 'responder' }, ({ payload }) => {
        const msg = payload as MsgResponder
        const s = ref.current
        const recebidaEm = Date.now()
        if (s.publica.fase !== 'PERGUNTA' || s.publica.perguntaId !== msg.perguntaId) return
        if (!s.jogadores.some((j) => j.playerId === msg.playerId) || s.respostas[msg.playerId]) return
        if (recebidaEm < s.destravaEm || recebidaEm > s.fimEm + 500 || typeof msg.opcao !== 'number') return
        const novo = { ...s, respostas: { ...s.respostas, [msg.playerId]: { opcao: msg.opcao, recebidaEm } } }
        ref.current = novo
        setEstado(novo)
        enviar('recebida', { playerId: msg.playerId, perguntaId: msg.perguntaId })
      })
      .on('broadcast', { event: 'pedirSala' }, () => transmitir(ref.current))
      .on('presence', { event: 'sync' }, () => {
        const online = new Set(Object.keys(canal.presenceState()))
        const s = ref.current
        if (s.jogadores.some((j) => j.online !== online.has(j.playerId)))
          salvar({ ...s, jogadores: s.jogadores.map((j) => ({ ...j, online: online.has(j.playerId) })) })
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          void canal.track({ papel: 'host' })
          transmitir(ref.current)
        }
      })

    return () => {
      canalRef.current = null
      void supabase?.removeChannel(canal)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sala])

  const remover = (playerId: string) =>
    salvar({ ...ref.current, jogadores: ref.current.jogadores.filter((j) => j.playerId !== playerId) })

  const reiniciar = () => salvar({ ...inicial(), jogadores: ref.current.jogadores.map((j) => ({ ...j, pontos: 0, acertosSeguidos: 0, ultimoGanho: 0 })) })

  return {
    ...estado,
    passo: roteiro[estado.indice],
    proximaFase: roteiro[estado.indice + 1]?.fase,
    conectado: !!supabase,
    avancar,
    remover,
    reiniciar,
  }
}
