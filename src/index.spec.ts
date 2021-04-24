import { Component, World } from './index'

describe('Entities', () => {
  let world: World
  beforeEach(() => {
    world = new World()
  })

  it('Creates an entity', () => {
    const entity = world.addEntity()
    expect(entity).toEqual('ent_1')
  })
})

describe('Components', () => {
  const Position = Component()
  const Velocity = Component()
})