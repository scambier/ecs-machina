import { Component, World } from './index'



describe('The World', () => {

  const Position = Component({ x: 5, y: 6 })
  const Velocity = Component<{ dx: number, dy: number }>()

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

  describe('query', () => {
    it('fetches a single component', () => {
      const pos = Position()
      const entity = world.addEntity(pos)
      const result = world.query(Position)[0]

      expect(entity).toEqual(result[0])
      expect(pos).toEqual(result[1])
    })

    it('fetches multiple components', () => {
      const pos = Position()
      const velocity = Velocity()
      const entity = world.addEntity(pos, velocity)
      const result = world.query(Velocity, Position)[0]

      expect(entity).toEqual(result[0])
      expect(velocity).toEqual(result[1])
      expect(pos).toEqual(result[2])
    })

    it('fetches multiple components in a different order', () => {
      const pos = Position()
      const velocity = Velocity()
      const entity = world.addEntity(pos, velocity)
      const result = world.query(Position, Velocity)[0]

      expect(entity).toEqual(result[0])
      expect(pos).toEqual(result[1])
      expect(velocity).toEqual(result[2])
    })
  })
})

describe('Components', () => {
  const Position = Component({ x: 5, y: 6 })
  const Velocity = Component<{ dx: number, dy: number }>()

  let world: World
  beforeEach(() => {
    world = new World()
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

  it('can be simple tags with no attributes', () => {
    const Tag = Component()
    const a = world.addEntity(Tag())
    const b = world.addEntity()

    expect(world.getComponent(a, Tag)).not.toBeNull()
    expect(world.getComponent(b, Tag)).toBeNull()
  })

  it('can be added to an existing entity', () => {
    const entity = world.addEntity()
    world.addComponents(entity, Position({ x: 12, y: 21 }))

    const position = world.getComponent(entity, Position)!
    expect(position.x).toEqual(12)
    expect(position.y).toEqual(21)
  })
})