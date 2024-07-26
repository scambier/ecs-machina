import {
  Component,
  ComponentFactory,
  Entity,
  intersection,
  World,
} from './index'

describe('The World', () => {
  let world: World
  let Position: ComponentFactory<{ x: number, y: number }>
  let Velocity: ComponentFactory<{ dx: number, dy: number }>
  let IsFlag: ComponentFactory
  let Tag: ComponentFactory
  beforeEach(() => {
    world = new World()
    Position = Component({ x: 5, y: 6 })
    Velocity = Component<{ dx: number, dy: number }>()
    IsFlag = Component()
    Tag = Component()
  })

  describe('spawn', () => {
    it('creates an entity', () => {
      const entity = world.spawn()
      expect(entity).toEqual(0)
    })
  })

  describe('destroy', () => {
    it('removes an entity from the world', () => {
      const entityA = world.spawn(Tag())
      expect(world.getComponent(entityA, Tag)).toBeTruthy()

      world.destroy(entityA)
      expect(world.getComponent(entityA, Tag)).toBeNull()
    })
  })

  describe('hasComponent', () => {
    it('returns wether an entity has a component', () => {
      const entityA = world.spawn(Position)
      expect(world.getComponent(entityA, Position)).toBeTruthy()
      expect(world.getComponent(entityA, Velocity)).toBeFalsy()
    })
  })

  describe('query', () => {
    it('fetches a single component', () => {
      const pos = Position()
      const entity = world.spawn(pos)
      const result = world.query([Position])[0]

      expect(entity).toEqual(result[0])
      expect(pos).toEqual(result[1])
    })

    it('fetches multiple components', () => {
      const pos = Position()
      const velocity = Velocity()
      const entity = world.spawn(pos, velocity)
      const result = world.query([Velocity, Position])[0]

      expect(entity).toEqual(result[0])
      expect(velocity).toEqual(result[1])
      expect(pos).toEqual(result[2])
    })

    it('fetches multiple components in a different order', () => {
      const pos = Position()
      const velocity = Velocity()
      const flag = IsFlag()
      const entity = world.spawn(pos, velocity, flag)
      const resultA = world.query([Position, IsFlag, Velocity])[0]

      expect(entity).toEqual(resultA[0])
      expect(pos).toEqual(resultA[1])
      expect(flag).toEqual(resultA[2])
      expect(velocity).toEqual(resultA[3])

      // In a different order

      const resultB = world.query([IsFlag, Velocity, Position])[0]
      expect(entity).toEqual(resultB[0])
      expect(flag).toEqual(resultB[1])
      expect(velocity).toEqual(resultB[2])
      expect(pos).toEqual(resultB[3])
    })

    it('fetches components after the entity has been modified', () => {
      const pos = Position()
      const velocity = Velocity()

      const entity = world.spawn(pos)
      const result = world.query([Position])[0]
      expect(pos).toEqual(result[1])

      // Add components
      world.addComponents(entity, velocity)
      world.addComponents(entity, Tag())
      const result2 = world.query([Position, Tag, Velocity])[0]
      expect(pos).toEqual(result2[1])
      expect(velocity).toEqual(result2[3])

      // Remove components
      world.removeComponents(entity, Velocity, Tag)
      const result3 = world.query([Position, Tag, Velocity])
      expect(result3.length).toBe(0)

      const result4 = world.query([Position])[0]
      expect(result4[1]).toEqual(pos)
    })
  })
})

describe('Components', () => {
  let world: World
  let Position: ComponentFactory<{ x: number, y: number }>
  let Velocity: ComponentFactory<{ dx: number, dy: number }>

  beforeEach(() => {
    world = new World()
    Position = Component({ x: 5, y: 6 })
    Velocity = Component<{ dx: number, dy: number }>()
  })

  it('have default values', () => {
    const entity = world.spawn(Position())
    expect(world.getComponent(entity, Position)!.x).toEqual(5)
    expect(world.getComponent(entity, Position)!.y).toEqual(6)
  })

  it('can be added as factories', () => {
    const entity = world.spawn(Position)
    expect(world.getComponent(entity, Position)!.x).toEqual(5)
    expect(world.getComponent(entity, Position)!.y).toEqual(6)
  })

  it('can be simple tags with no attributes', () => {
    const Tag = Component()
    const a = world.spawn(Tag())
    const b = world.spawn()

    expect(world.getComponent(a, Tag)).not.toBeNull()
    expect(world.getComponent(b, Tag)).toBeNull()
  })

  it('can be added to an existing entity', () => {
    const entity = world.spawn()
    world.addComponents(entity, Position({ x: 12, y: 21 }))

    const position = world.getComponent(entity, Position)!
    expect(position.x).toEqual(12)
    expect(position.y).toEqual(21)

    world.addComponents(entity, Velocity({ dx: 2, dy: 3 }))
    const velocity = world.getComponent(entity, Velocity)!
    expect(velocity.dx).toEqual(2)
    expect(velocity.dy).toEqual(3)
  })

  it('returns their own key when displayed as strings', () => {
    const OtherComponent = Component()
    expect(Position._type).not.toEqual(Velocity._type)
    expect(Velocity._type).not.toEqual(OtherComponent._type)
  })

  it('can be modified in queries', () => {
    const entity = world.spawn(
      Position({ x: 0, y: 0 }),
      Velocity({ dx: 1, dy: 2 })
    )

    for (const [, pos, vel] of world.query([Position, Velocity])) {
      pos.x += vel.dx
      pos.y += vel.dy
    }

    const pos = world.getComponent(entity, Position)!

    expect(pos.x).toEqual(1)
    expect(pos.y).toEqual(2)
  })
})

describe('The cache system', () => {
  let world: World
  let Position: ComponentFactory<{ x: number, y: number }>
  let Velocity: ComponentFactory<{ dx: number, dy: number }>

  let entityA: Entity
  beforeEach(() => {
    world = new World()
    Position = Component<{ x: number, y: number }>()
    Velocity = Component<{ dx: number, dy: number }>()
    entityA = world.spawn(Position({ x: 1, y: 1 }))
    world.spawn(Velocity({ dx: 1, dy: 1 }))
  })

  it('is used when calling twice the same query', () => {
    world.query([Position])
    const [e] = world.query([Position])[0]
    expect(e).toEqual(entityA)
  })
})

describe('intersection', () => {
  it('works', () => {
    expect(intersection([1, 2, 3], [3, 4, 5])).toEqual([3])
    expect(intersection([1, 2, 3], [1, 2, 3])).toEqual([1, 2, 3])
    expect(intersection([1, 2, 3, 4], [0, 2, 3, 5])).toEqual([2, 3])
  })
})

describe('getComponents', () => {
  it('works', () => {
    const world = new World()
    const Position = Component<{ x: number, y: number }>()
    const Velocity = Component<{ dx: number, dy: number }>()
    const entity = world.spawn(Position({ x: 1, y: 2 }), Velocity({ dx: 3, dy: 4 }))

    const [e, pos, vel] = world.getComponents(entity, [Position, Velocity])
    expect(e).toEqual(entity)
    expect(pos!.x).toEqual(1)
    expect(pos!.y).toEqual(2)
    expect(vel!.dx).toEqual(3)
    expect(vel!.dy).toEqual(4)
  })
})
