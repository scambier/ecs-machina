import { Component, World } from './index'

describe('The World', () => {
  let world: World
  beforeEach(() => {
    world = new World()
  })

  describe('addEntity', () => {
    it('creates an entity', () => {
      const entity = world.addEntity()
      expect(entity).toEqual('1')
    })
  })

  describe('addComponents', () => {

  })
})

describe('Components', () => {
  const Position = Component({ x: 5, y: 6 })
  const Velocity = Component({ dx: 0, dy: 0 })

  let world: World
  beforeEach(() => {
    world = new World()
  })

  it('have default values', () => {
    const entity = world.addEntity(Position())
    expect(world.getComponent(entity, Position)!.x).toEqual(5)
    expect(world.getComponent(entity, Position)!.y).toEqual(6)
  })

  it('have default values', () => {
    const entity = world.addEntity(Position())
    expect(world.getComponent(entity, Position)!.x).toEqual(5)
    expect(world.getComponent(entity, Position)!.y).toEqual(6)
  })

  it('can be added as factories', () => {
    const entity = world.addEntity(Position)
    expect(world.getComponent(entity, Position)!.x).toEqual(5)
    expect(world.getComponent(entity, Position)!.y).toEqual(6)
  })

  it('can be added to an existing entity', () => {
    const entity = world.addEntity()
    world.addComponents(entity, Position({ x: 12, y: 21 }))

    const position = world.getComponent(entity, Position)!
    expect(position.x).toEqual(12)
    expect(position.y).toEqual(21)
  })
})