import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type Canal, canalDaSala, supabase } from './cliente'
import { CASO } from '../dados/caso'
import { acusacaoDoCaso, montarRoteiro, perguntaDoPasso, type Passo } from '../jogo/maquinaEstados'
import { aplicar, pontosEscolha, pontosOrdenar } from '../jogo/pontuacao'
import { sortearFichas } from '../jogo/sorteio'
import { apurar, pontuarAcusacao } from '../jogo/veredito'
import {
  LIMITE_JOGADORES,
  type Aposta,
  type EstadoSala,
  type FasePublica,
  type Jogador,
  type ModoFinal,
  type MsgAcusar,
  type MsgEntrar,
  type MsgFicha,
  type MsgResponder,
  type Resultado,
} from '../jogo/tipos'

export type Resposta = { opcao?: number; ordem?: number[]; aposta: Aposta; recebidaEm: number }
export type JogadorHost = Jogador & { acertosSeguidos: number; ultimoGanho: number }
export type Config = { modo: ModoFinal; culpado: string | null; pin: string | null }

type Salvo = {
  config: Config | null
  jogadores: JogadorHost[]
  indice: number
  destravaEm: number
  fimEm: number
  respostas: Record<string, Resposta>
  fichas: Record<string, MsgFicha>
  acusacoes: Record<string, MsgAcusar>
  publica: FasePublica
}

const chave = (sala: string) => `mentalista:host:${sala}`
const inicial = (config: Config | null = null): Salvo => ({
  config,
  jogadores: [],
  indice: 0,
  destravaEm: 0,
  fimEm: 0,
  respostas: {},
  fichas: {},
  acusacoes: {},
  publica: { fase: 'LOBBY' },
})

function carregar(sala: string): Salvo {
  try {
    const s = JSON.parse(localStorage.getItem(chave(sala)) ?? 'null') as Salvo | null
    return s ? { ...inicial(), ...s, jogadores: s.jogadores.map((j) => ({ ...j, online: false })) } : inicial()
  } catch {
    return inicial()
  }
}

const APOSTA_ERRO_OK = (a: unknown): a is Aposta => a === 1 || a === 2 || a === 3

/** O host é a autoridade: guarda o gabarito, mede o tempo, calcula os pontos e avança as fases. */
export function useSalaHost(sala: string) {
  const roteiro = useMemo(() => montarRoteiro(CASO), [])
  const [estado, setEstado] = useState<Salvo>(() => carregar(sala))
  const ref = useRef(estado)
  const canalRef = useRef<Canal | null>(null)

  const enviar = (event: string, payload: unknown) => void canalRef.current?.send({ type: 'broadcast', event, payload })

  const transmitir = (s: Salvo) => {
    const publico: EstadoSala = {
      jogadores: s.jogadores.map(({ playerId, nome, avatar, pontos, online }) => ({ playerId, nome, avatar, pontos, online })),
      avataresEmUso: s.jogadores.map((j) => j.avatar),
      cheia: s.jogadores.length >= LIMITE_JOGADORES,
    }
    enviar('sala', publico)
    // `agora` é renovado a cada envio para o celular corrigir o relógio.
    const p = s.publica
    enviar('fase', p.fase === 'PERGUNTA' || p.fase === 'ACUSACAO' ? { ...p, agora: Date.now() } : p)
  }

  const enviarFichas = (s: Salvo) => Object.values(s.fichas).forEach((f) => enviar('ficha', f))

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
  const revelar = (s: Salvo, passo: Extract<Passo, { pergunta: number }>): Salvo => {
    const p = perguntaDoPasso(CASO, passo)
    if (!p || p.tipo === 'acusacao') return s
    const total = s.fimEm - s.destravaEm
    const resultados: Record<string, Resultado> = {}
    const jogadores = s.jogadores.map((j) => {
      const r = s.respostas[j.playerId]
      let variacao = 0
      let acertou = false
      let detalhe: string | undefined
      if (p.tipo === 'ordenar') {
        variacao = r?.ordem ? pontosOrdenar(r.ordem, p.ordemCorreta) : 0
        acertou = variacao === p.ordemCorreta.length * 250
        detalhe = `${variacao / 250} de ${p.ordemCorreta.length} cartões no lugar`
      } else {
        acertou = r?.opcao === p.correta
        const seguidos = acertou ? j.acertosSeguidos + 1 : 0
        if (r) {
          variacao = pontosEscolha({
            acertou,
            tempoGastoMs: r.recebidaEm - s.destravaEm,
            tempoTotalMs: total,
            aposta: p.aposta ? r.aposta : 1,
            acertosSeguidos: seguidos,
          })
          if (p.aposta && r.aposta > 1) detalhe = `Aposta ${r.aposta}x`
        }
      }
      const pontos = aplicar(j.pontos, variacao)
      const ganho = pontos - j.pontos
      resultados[j.playerId] = { acertou, ganho, detalhe }
      return { ...j, pontos, acertosSeguidos: acertou ? j.acertosSeguidos + 1 : 0, ultimoGanho: ganho }
    })
    return {
      ...s,
      jogadores,
      publica: {
        fase: 'REVELACAO',
        perguntaId: p.id,
        tipo: p.tipo,
        correta: p.tipo === 'ordenar' ? null : p.correta,
        ordemCorreta: p.tipo === 'ordenar' ? p.ordemCorreta : null,
        deducao: p.deducao,
        resultados,
      },
    }
  }

  const julgar = (s: Salvo): Salvo => {
    const modo = s.config?.modo ?? 'juri'
    const lista = Object.values(s.acusacoes)
    const { votos, maisVotados } = apurar(lista)
    const acusados = modo === 'fechado' && s.config?.culpado ? [s.config.culpado] : maisVotados
    const resultados: Record<string, Resultado> = {}
    const jogadores = s.jogadores.map((j) => {
      const r = pontuarAcusacao(modo, s.acusacoes[j.playerId], acusados, CASO.evidencias)
      const pontos = aplicar(j.pontos, r.ganho)
      resultados[j.playerId] = { ...r, ganho: pontos - j.pontos }
      return { ...j, pontos, ultimoGanho: pontos - j.pontos }
    })
    return { ...s, jogadores, publica: { fase: 'VEREDITO', modo, acusados, votos, resultados } }
  }

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
          if (!Object.keys(s.fichas).length) novo.fichas = sortearFichas(CASO, s.jogadores.map((j) => j.playerId))
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
          novo.publica = { fase: 'PERGUNTA', perguntaId: p.id, tipo: p.tipo, enunciado: p.enunciado, opcoes: p.opcoes, aposta: p.aposta, agora, destravaEm, fimEm }
          break
        }
        case 'REVELACAO':
          novo = revelar(novo, passo)
          break
        case 'RANKING':
          novo.publica = { fase: 'RANKING' }
          break
        case 'ACUSACAO': {
          const agora = Date.now()
          const fimEm = agora + (acusacaoDoCaso(CASO)?.tempoSeg ?? 90) * 1000
          novo = { ...novo, fimEm, acusacoes: {} }
          novo.publica = {
            fase: 'ACUSACAO',
            suspeitos: CASO.suspeitos.map(({ id, nome, papel }) => ({ id, nome, papel })),
            motivos: CASO.motivos,
            evidencias: CASO.evidencias.map(({ id, titulo }) => ({ id, titulo })),
            agora,
            fimEm,
          }
          break
        }
        case 'VEREDITO':
          novo = julgar(novo)
          break
        case 'PODIO':
          novo.publica = { fase: 'PODIO' }
          break
      }
      salvar(novo)
      if (passo.fase === 'ABERTURA_RODADA') enviarFichas(novo)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roteiro, salvar],
  )

  const avancar = useCallback(() => irPara(ref.current.indice + 1), [irPara])

  // Fecha a pergunta / acusação quando o tempo acaba ou todos responderam.
  useEffect(() => {
    const f = estado.publica.fase
    if (f !== 'PERGUNTA' && f !== 'ACUSACAO') return
    const mapa = f === 'PERGUNTA' ? estado.respostas : estado.acusacoes
    const todos = estado.jogadores.length > 0 && estado.jogadores.every((j) => mapa[j.playerId])
    if (todos) {
      const t = setTimeout(avancar, 600)
      return () => clearTimeout(t)
    }
    const t = setTimeout(avancar, Math.max(0, estado.fimEm - Date.now()) + 300)
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
          // Reconexão: devolve a mesma vaga, avatar, ficha e pontos.
          salvar({ ...s, jogadores: s.jogadores.map((j) => (j.playerId === msg.playerId ? { ...j, online: true } : j)) })
          if (s.fichas[msg.playerId]) enviar('ficha', s.fichas[msg.playerId])
          return
        }
        const recusa = (motivo: string) => enviar('recusa', { playerId: msg.playerId, motivo })
        if (s.publica.fase !== 'LOBBY') return recusa('emAndamento')
        if (s.jogadores.length >= LIMITE_JOGADORES) return recusa('cheia')
        if (s.jogadores.some((j) => j.avatar === msg.avatar)) return recusa('avatar')
        const novo: JogadorHost = { ...msg, nome: String(msg.nome).trim().slice(0, 16), pontos: 0, online: true, acertosSeguidos: 0, ultimoGanho: 0 }
        salvar({ ...s, jogadores: [...s.jogadores, novo] })
      })
      .on('broadcast', { event: 'responder' }, ({ payload }) => {
        const msg = payload as MsgResponder
        const s = ref.current
        const recebidaEm = Date.now()
        if (s.publica.fase !== 'PERGUNTA' || s.publica.perguntaId !== msg.perguntaId) return
        if (!s.jogadores.some((j) => j.playerId === msg.playerId) || s.respostas[msg.playerId]) return
        if (recebidaEm < s.destravaEm || recebidaEm > s.fimEm + 500) return
        const n = s.publica.opcoes.length
        const ordemValida = Array.isArray(msg.ordem) && msg.ordem.length === n && new Set(msg.ordem).size === n
        const opcaoValida = typeof msg.opcao === 'number' && msg.opcao >= 0 && msg.opcao < n
        if (s.publica.tipo === 'ordenar' ? !ordemValida : !opcaoValida) return
        const resp: Resposta = { opcao: msg.opcao, ordem: msg.ordem, aposta: APOSTA_ERRO_OK(msg.aposta) ? msg.aposta : 1, recebidaEm }
        const novo = { ...s, respostas: { ...s.respostas, [msg.playerId]: resp } }
        ref.current = novo
        setEstado(novo)
        enviar('recebida', { playerId: msg.playerId, perguntaId: msg.perguntaId })
      })
      .on('broadcast', { event: 'acusar' }, ({ payload }) => {
        const msg = payload as MsgAcusar
        const s = ref.current
        if (s.publica.fase !== 'ACUSACAO' || s.acusacoes[msg.playerId]) return
        if (!s.jogadores.some((j) => j.playerId === msg.playerId)) return
        if (!CASO.suspeitos.some((x) => x.id === msg.culpado)) return
        const provas = [...new Set(msg.provas)].filter((id) => CASO.evidencias.some((e) => e.id === id)).slice(0, 3)
        const novo = { ...s, acusacoes: { ...s.acusacoes, [msg.playerId]: { ...msg, provas } } }
        ref.current = novo
        setEstado(novo)
        enviar('recebida', { playerId: msg.playerId, perguntaId: 'acusacao' })
      })
      .on('broadcast', { event: 'pedirSala' }, () => {
        transmitir(ref.current)
        enviarFichas(ref.current)
      })
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
          enviarFichas(ref.current)
        }
      })

    return () => {
      canalRef.current = null
      void supabase?.removeChannel(canal)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sala])

  const remover = (playerId: string) => salvar({ ...ref.current, jogadores: ref.current.jogadores.filter((j) => j.playerId !== playerId) })

  const configurar = (config: Config) => salvar({ ...ref.current, config })

  const reiniciar = () =>
    salvar({
      ...inicial(ref.current.config),
      jogadores: ref.current.jogadores.map((j) => ({ ...j, pontos: 0, acertosSeguidos: 0, ultimoGanho: 0 })),
    })

  return {
    ...estado,
    passo: roteiro[estado.indice],
    proximaFase: roteiro[estado.indice + 1]?.fase,
    conectado: !!supabase,
    avancar,
    remover,
    configurar,
    reiniciar,
  }
}
