import { test } from 'node:test'
import assert from 'node:assert/strict'
import { aplicar, bonusSequencia, pontosEscolha, pontosOrdenar } from '../src/jogo/pontuacao.ts'

test('acerto instantâneo vale 1300, no limite vale 1000', () => {
  assert.equal(pontosEscolha({ acertou: true, tempoGastoMs: 0, tempoTotalMs: 24000 }), 1300)
  assert.equal(pontosEscolha({ acertou: true, tempoGastoMs: 24000, tempoTotalMs: 24000 }), 1000)
  assert.equal(pontosEscolha({ acertou: true, tempoGastoMs: 12000, tempoTotalMs: 24000 }), 1150)
})

test('erro sem aposta vale 0', () => {
  assert.equal(pontosEscolha({ acertou: false, tempoGastoMs: 1, tempoTotalMs: 10 }), 0)
})

test('sequência: +100 por acerto seguido, até +500', () => {
  assert.deepEqual([1, 2, 3, 6, 10].map(bonusSequencia), [0, 100, 200, 500, 500])
  assert.equal(pontosEscolha({ acertou: true, tempoGastoMs: 10, tempoTotalMs: 10, acertosSeguidos: 3 }), 1200)
})

test('aposta de Jane multiplica o acerto e pune o erro', () => {
  assert.equal(pontosEscolha({ acertou: true, tempoGastoMs: 10, tempoTotalMs: 10, aposta: 3 }), 3000)
  assert.equal(pontosEscolha({ acertou: false, tempoGastoMs: 0, tempoTotalMs: 10, aposta: 2 }), -500)
  assert.equal(pontosEscolha({ acertou: false, tempoGastoMs: 0, tempoTotalMs: 10, aposta: 3 }), -1000)
})

test('placar nunca fica negativo', () => {
  assert.equal(aplicar(300, -1000), 0)
  assert.equal(aplicar(300, 200), 500)
})

test('ordenar dá 250 por cartão no lugar', () => {
  assert.equal(pontosOrdenar([2, 0, 3, 1], [2, 0, 3, 1]), 1000)
  assert.equal(pontosOrdenar([2, 0, 1, 3], [2, 0, 3, 1]), 500)
})
