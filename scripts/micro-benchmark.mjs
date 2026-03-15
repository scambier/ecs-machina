import { performance } from 'node:perf_hooks'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

let ecs
try {
  ecs = require('../dist/index.js')
}
catch {
  throw new Error('Cannot find dist/index.js. Use `pnpm build`.')
}

const { World, Component } = ecs

function makeRng(seed = 1337) {
  let state = seed >>> 0
  return function next() {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

function benchmark(label, fn, iterations, warmup = 10) {
  for (let i = 0; i < warmup; i++) fn(i)
  const start = performance.now()
  for (let i = 0; i < iterations; i++) fn(i)
  const totalMs = performance.now() - start
  return {
    metric: label,
    iterations,
    totalMs,
    avgMs: totalMs / iterations,
    opsPerSec: iterations / (totalMs / 1000),
  }
}

function buildWorld(entityCount = 12000) {
  const world = new World()
  const Position = Component({ x: 0, y: 0 })
  const Velocity = Component({ dx: 0, dy: 0 })
  const Health = Component({ hp: 100 })
  const Team = Component({ id: 0 })
  const Tag = Component()

  const rng = makeRng(42)
  const entities = new Array(entityCount)
  for (let i = 0; i < entityCount; i++) {
    const components = [Position({ x: i, y: i })]
    if (rng() < 0.75) components.push(Velocity({ dx: 1, dy: 1 }))
    if (rng() < 0.65) components.push(Health({ hp: 80 + (i % 20) }))
    if (rng() < 0.55) components.push(Team({ id: i % 4 }))
    if (rng() < 0.50) components.push(Tag())
    entities[i] = world.spawn(...components)
  }

  return { world, Position, Velocity, Health, Team, Tag, entities }
}

const setup = buildWorld()
const { world, Position, Velocity, Health, Team, entities } = setup

const queryFactories = [Position, Velocity, Health, Team]

const baselineQuery = world.query(queryFactories)
if (baselineQuery.length === 0) {
  throw new Error('Dataset invalide: la query de référence ne retourne aucune entité.')
}

const queryHot = benchmark('query hot-cache (ms)', () => {
  world.query(queryFactories)
}, 250)

let rotatingEntityIndex = 0
const setAndQuery = benchmark('setComponents + query (ms)', () => {
  const entity = entities[rotatingEntityIndex]
  rotatingEntityIndex = (rotatingEntityIndex + 1) % entities.length
  world.setComponents(entity, Position({ x: rotatingEntityIndex, y: rotatingEntityIndex + 1 }))
  world.query(queryFactories)
}, 200)

const queryCount = benchmark('query count only (ops/s)', () => {
  const rows = world.query(queryFactories)
  if (rows.length < 0) throw new Error('Impossible')
}, 250)

console.table([
  {
    metric: queryHot.metric,
    avgMs: queryHot.avgMs.toFixed(3),
    totalMs: queryHot.totalMs.toFixed(1),
    opsPerSec: queryHot.opsPerSec.toFixed(0),
    note: `${baselineQuery.length} entities matched`,
  },
  {
    metric: setAndQuery.metric,
    avgMs: setAndQuery.avgMs.toFixed(3),
    totalMs: setAndQuery.totalMs.toFixed(1),
    opsPerSec: setAndQuery.opsPerSec.toFixed(0),
    note: 'cache invalidation path',
  },
  {
    metric: queryCount.metric,
    avgMs: queryCount.avgMs.toFixed(3),
    totalMs: queryCount.totalMs.toFixed(1),
    opsPerSec: queryCount.opsPerSec.toFixed(0),
    note: 'read throughput',
  },
])
