import { useSearchParams } from 'react-router-dom'
import { useSalaJogador } from '../realtime/useSalaJogador'
import Aguardando from './Aguardando'
import Entrar from './Entrar'
import Fim from './Fim'
import Responder from './Responder'
import Resultado from './Resultado'

export default function Jogador() {
  const [params] = useSearchParams()
  const sala = params.get('sala') ?? ''
  const j = useSalaJogador(sala)
  const { eu, fase, posicao } = j

  if (!eu) return <Entrar sala={sala} estado={j.estado} status={j.status} entrar={j.entrar} tentarDeNovo={j.tentarDeNovo} />

  switch (fase.fase) {
    case 'PERGUNTA':
      return <Responder fase={fase} desvio={j.desvio} minhaResposta={j.minhaResposta} responder={j.responder} />
    case 'REVELACAO':
      return <Resultado eu={eu} posicao={posicao} resultado={fase.resultados[j.playerId]} />
    case 'PODIO':
      return <Fim eu={eu} posicao={posicao} />
    case 'ABERTURA_RODADA':
      return <Aguardando eu={eu} posicao={posicao} texto={`Rodada ${fase.rodada.id}: ${fase.rodada.titulo}. Olhe para a TV.`} />
    default:
      return <Aguardando eu={eu} posicao={posicao} texto="Olhe para a TV." />
  }
}
