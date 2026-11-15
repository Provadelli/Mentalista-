import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSalaJogador } from '../realtime/useSalaJogador'
import Acusar from './Acusar'
import Aguardando from './Aguardando'
import Entrar from './Entrar'
import Ficha from './Ficha'
import Fim from './Fim'
import Responder from './Responder'
import Resultado from './Resultado'
import Tutorial, { CHAVE_TUTORIAL } from './Tutorial'

const tutorialVisto = () => {
  try {
    return localStorage.getItem(CHAVE_TUTORIAL) === '1'
  } catch {
    return false
  }
}

export default function Jogador() {
  const [params] = useSearchParams()
  const sala = params.get('sala') ?? ''
  const j = useSalaJogador(sala)
  const { eu, fase, posicao, ficha } = j
  const [tutorial, setTutorial] = useState(() => !tutorialVisto())
  const [reaberta, setReaberta] = useState(false)
  const [fichaVista, setFichaVista] = useState<string | null>(null)
  // Ao receber a ficha pela primeira vez, ela abre sozinha.
  const verFicha = !!ficha && (reaberta || fichaVista !== ficha.nome)
  const fecharFicha = () => {
    setFichaVista(ficha?.nome ?? null)
    setReaberta(false)
  }

  // Mantém a tela acesa durante a partida.
  useEffect(() => {
    if (!eu || !('wakeLock' in navigator)) return
    let trava: WakeLockSentinel | null = null
    const pedir = () => navigator.wakeLock.request('screen').then((t) => (trava = t)).catch(() => {})
    pedir()
    const voltar = () => document.visibilityState === 'visible' && pedir()
    document.addEventListener('visibilitychange', voltar)
    return () => {
      document.removeEventListener('visibilitychange', voltar)
      void trava?.release()
    }
  }, [eu])

  if (!eu) return <Entrar sala={sala} estado={j.estado} status={j.status} entrar={j.entrar} tentarDeNovo={j.tentarDeNovo} />
  if (tutorial) return <Tutorial fechar={() => setTutorial(false)} />

  const tela = (() => {
    switch (fase.fase) {
      case 'PERGUNTA':
        return <Responder key={fase.perguntaId} fase={fase} desvio={j.desvio} minhaResposta={j.minhaResposta} responder={j.responder} />
      case 'REVELACAO':
        return <Resultado eu={eu} posicao={posicao} resultado={fase.resultados[j.playerId]} />
      case 'ACUSACAO':
        return <Acusar fase={fase} desvio={j.desvio} enviada={j.minhaResposta} acusar={j.acusar} />
      case 'VEREDITO': {
        const r = fase.resultados[j.playerId]
        const titulo = fase.modo === 'fechado' ? (r?.acertou ? 'Você desmascarou o culpado!' : 'O culpado escapou de você') : 'O júri decidiu'
        return <Resultado eu={eu} posicao={posicao} resultado={r} titulo={titulo} />
      }
      case 'PODIO':
        return <Fim eu={eu} posicao={posicao} />
      case 'ABERTURA_RODADA':
        return <Aguardando eu={eu} posicao={posicao} texto={`Rodada ${fase.rodada.id}: ${fase.rodada.titulo}. Olhe para a TV.`} />
      default:
        return <Aguardando eu={eu} posicao={posicao} texto="Olhe para a TV." />
    }
  })()

  return (
    <>
      {tela}
      {ficha && fase.fase !== 'PERGUNTA' && fase.fase !== 'ACUSACAO' && (
        <button onClick={() => setReaberta(true)}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 min-h-12 -translate-x-1/2 rounded-sm bg-manila px-5 py-2 font-titulo text-tinta shadow-lg">
          Ver minha ficha
        </button>
      )}
      {verFicha && ficha && <Ficha ficha={ficha} fechar={fecharFicha} />}
    </>
  )
}
