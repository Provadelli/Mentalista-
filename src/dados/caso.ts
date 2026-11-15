// Importar só nas rotas do host: contém o gabarito.
import dados from './caso047.json'
import type { Caso } from '../jogo/tipos'

export const CASO = dados as Caso
