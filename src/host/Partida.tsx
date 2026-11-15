import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { CASO } from '../dados/caso'
import { perguntaDoPasso } from '../jogo/maquinaEstados'
import { useSalaHost } from '../realtime/useSalaHost'
import AberturaRodada from './AberturaRodada'
import Acusacao from './Acusacao'
import BotaoSom from './BotaoSom'
import Configuracao from './Configuracao'
import Lobby from './Lobby'
import Pergunta from './Pergunta'
import Podio from './Podio'
import Ranking from './Ranking'
import Revelacao from './Revelacao'
import Veredito from './Veredito'

export default function Partida() {
  return (
    <>
      <Tela />
      <BotaoSom />
    </>
  )
}

function Tela() {
  const { sala = '' } = useParams()
  const h = useSalaHost(sala)
  const [editando, setEditando] = useState(false)
  const { passo } = h

  if (passo.fase === 'LOBBY' && (!h.config || editando))
    return (
      <Configuracao
        atual={h.config}
        salvar={(c) => {
          h.configurar(c)
          setEditando(false)
        }}
        cancelar={h.config ? () => setEditando(false) : undefined}
      />
    )

  switch (passo.fase) {
    case 'LOBBY':
      return (
        <Lobby sala={sala} jogadores={h.jogadores} conectado={h.conectado} remover={h.remover} comecar={h.avancar}
          modo={h.config!.modo} configurar={() => setEditando(true)} />
      )
    case 'ABERTURA_RODADA':
      return <AberturaRodada rodada={CASO.rodadas[passo.rodada]} avancar={h.avancar} />
    case 'ACUSACAO':
      return <Acusacao fimEm={h.fimEm} acusaram={Object.keys(h.acusacoes).length} total={h.jogadores.length} />
    case 'VEREDITO':
      return h.publica.fase === 'VEREDITO' ? <Veredito v={h.publica} acusacoes={h.acusacoes} jogadores={h.jogadores} avancar={h.avancar} /> : null
    case 'PODIO':
      return <Podio jogadores={h.jogadores} reiniciar={h.reiniciar} />
  }

  const rodada = CASO.rodadas[passo.rodada]
  const pergunta = perguntaDoPasso(CASO, passo)
  if (!pergunta || pergunta.tipo === 'acusacao') return null
  const numero = rodada.perguntas.indexOf(pergunta) + 1

  if (passo.fase === 'PERGUNTA')
    return (
      <Pergunta rodada={rodada} pergunta={pergunta} numero={numero} destravaEm={h.destravaEm} fimEm={h.fimEm}
        responderam={Object.keys(h.respostas).length} total={h.jogadores.length} />
    )

  if (passo.fase === 'REVELACAO') {
    const respostas = Object.values(h.respostas)
    const contagem =
      pergunta.tipo === 'ordenar'
        ? pergunta.ordemCorreta.map((v, pos) => respostas.filter((r) => r.ordem?.[pos] === v).length)
        : pergunta.opcoes.map((_, i) => respostas.filter((r) => r.opcao === i).length)
    return <Revelacao pergunta={pergunta} contagem={contagem} avancar={h.avancar} />
  }

  const rotulo =
    h.proximaFase === 'PERGUNTA' ? 'Próxima pergunta' : h.proximaFase === 'ACUSACAO' ? 'A acusação' : 'Próxima rodada'
  return <Ranking jogadores={h.jogadores} avancar={h.avancar} rotulo={rotulo} />
}
