import { useParams } from 'react-router-dom'
import { CASO } from '../dados/caso'
import { perguntaDoPasso } from '../jogo/maquinaEstados'
import { useSalaHost } from '../realtime/useSalaHost'
import AberturaRodada from './AberturaRodada'
import Lobby from './Lobby'
import Pergunta from './Pergunta'
import Podio from './Podio'
import Ranking from './Ranking'
import Revelacao from './Revelacao'

export default function Partida() {
  const { sala = '' } = useParams()
  const h = useSalaHost(sala)
  const { passo } = h

  switch (passo.fase) {
    case 'LOBBY':
      return <Lobby sala={sala} jogadores={h.jogadores} conectado={h.conectado} remover={h.remover} comecar={h.avancar} />
    case 'ABERTURA_RODADA':
      return <AberturaRodada rodada={CASO.rodadas[passo.rodada]} avancar={h.avancar} />
    case 'PODIO':
      return <Podio jogadores={h.jogadores} reiniciar={h.reiniciar} />
  }

  const rodada = CASO.rodadas[passo.rodada]
  const pergunta = perguntaDoPasso(CASO, passo)
  if (!pergunta || (pergunta.tipo !== 'escolha' && pergunta.tipo !== 'memoria')) return null

  if (passo.fase === 'PERGUNTA')
    return (
      <Pergunta
        rodada={rodada}
        pergunta={pergunta}
        numero={passo.pergunta + 1}
        destravaEm={h.destravaEm}
        fimEm={h.fimEm}
        responderam={Object.keys(h.respostas).length}
        total={h.jogadores.length}
      />
    )

  if (passo.fase === 'REVELACAO') {
    const contagem = pergunta.opcoes.map((_, i) => Object.values(h.respostas).filter((r) => r.opcao === i).length)
    return <Revelacao pergunta={pergunta} contagem={contagem} avancar={h.avancar} />
  }

  const rotulo = h.proximaFase === 'PERGUNTA' ? 'Próxima pergunta' : h.proximaFase === 'PODIO' ? 'Ver o pódio' : 'Próxima rodada'
  return <Ranking jogadores={h.jogadores} avancar={h.avancar} rotulo={rotulo} />
}
