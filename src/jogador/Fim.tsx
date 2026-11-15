import type { Jogador } from '../jogo/tipos'
import Tela from './Tela'

export default function Fim({ eu, posicao }: { eu: Jogador; posicao: number }) {
  return (
    <Tela className="text-center">
      <div className="grid flex-1 place-items-center">
        <div>
          <p className="font-dossie text-manila">Caso encerrado</p>
          <p className="mt-2 font-titulo text-6xl font-extrabold text-ouro">{posicao}º</p>
          <p className="mt-2 font-titulo text-2xl">{eu.pontos} pontos</p>
          <p className="mt-8 font-dossie text-manila">Para jogar de novo, aguarde o host reabrir o caso.</p>
        </div>
      </div>
    </Tela>
  )
}
