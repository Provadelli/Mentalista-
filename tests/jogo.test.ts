import { test } from 'node:test'
import assert from 'node:assert/strict'
import caso from '../src/dados/caso047.json' with { type: 'json' }
import { sortearFichas } from '../src/jogo/sorteio.ts'
import { apurar, pontuarAcusacao } from '../src/jogo/veredito.ts'
import { montarRoteiro } from '../src/jogo/maquinaEstados.ts'
import type { Caso } from '../src/jogo/tipos.ts'

const C = caso as Caso

test('com 7 jogadores: 6 suspeitos e 1 apoio, sem repetir', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
  const f = sortearFichas(C, ids)
  const v = Object.values(f)
  assert.equal(v.length, 7)
  assert.equal(v.filter((x) => x.tipo === 'suspeito').length, 6)
  assert.equal(new Set(v.map((x) => x.nome)).size, 7)
})

test('com 3 jogadores, todos são suspeitos', () => {
  const v = Object.values(sortearFichas(C, ['a', 'b', 'c']))
  assert.ok(v.every((x) => x.tipo === 'suspeito'))
})

test('roteiro tem 12 perguntas, acusação, veredito e pódio', () => {
  const r = montarRoteiro(C)
  assert.equal(r.filter((p) => p.fase === 'PERGUNTA').length, 12)
  assert.deepEqual(r.slice(-3).map((p) => p.fase), ['ACUSACAO', 'VEREDITO', 'PODIO'])
})

test('apuração e empate', () => {
  const ac = (culpado: string) => ({ playerId: culpado + Math.random(), culpado, motivo: 0, provas: [] })
  assert.deepEqual(apurar([ac('rafael'), ac('rafael'), ac('miguel')]).maisVotados, ['rafael'])
  assert.deepEqual(apurar([ac('rafael'), ac('miguel')]).maisVotados.sort(), ['miguel', 'rafael'])
})

test('caso fechado: 2000 pelo culpado', () => {
  const a = { playerId: 'x', culpado: 'clara', motivo: 1, provas: ['A1', 'B2', 'C4'] }
  assert.equal(pontuarAcusacao('fechado', a, ['clara'], C.evidencias).ganho, 2000)
  assert.equal(pontuarAcusacao('fechado', a, ['tomas'], C.evidencias).ganho, 0)
})

test('júri: 300 por prova que pesa contra o acusado', () => {
  const a = { playerId: 'x', culpado: 'rafael', motivo: 0, provas: ['B2', 'C4', 'A1'] }
  assert.equal(pontuarAcusacao('juri', a, ['rafael'], C.evidencias).ganho, 600)
})
