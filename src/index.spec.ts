import { Component, World } from "./index"

describe("The World", () => {
  const Position = Component({ x: 5, y: 6 })
  const Velocity = Component<{ dx: number; dy: number }>()
  const Tag = Component()

  let world: World
  beforeEach(() => {
    world = new World()
  })

  describe("addEntity", () => {
    it("creates an entity", () => {
      const entity = world.addEntity()
      expect(entity).toEqual("1")
    })
  })

  describe("removeEntity", () => {
    it("removes an entity from the world", () => {
      const entityA = world.addEntity()
      const entityB = world.addEntity()
      expect(world.getEntity(entityA)).toEqual({})
      expect(world.getEntity(entityB)).toEqual({})
      world.removeEntity(entityA)
      expect(world.getEntity(entityA)).toEqual(undefined)
    })
  })

  describe("hasComponent", () => {
    it("returns wether an entity has a component", () => {
      const entityA = world.addEntity(Position)
      expect(world.hasComponents(entityA, Position)).toBeTruthy()
      expect(world.hasComponents(entityA, Velocity)).toBeFalsy()
    })
  })

  describe("query", () => {
    it("fetches a single component", () => {
      const pos = Position()
      const entity = world.addEntity(pos)
      const result = world.query(Position)[0]

      expect(entity).toEqual(result[0])
      expect(pos).toEqual(result[1])
    })

    it("fetches multiple components", () => {
      const pos = Position()
      const velocity = Velocity()
      const entity = world.addEntity(pos, velocity)
      const result = world.query(Velocity, Position)[0]

      expect(entity).toEqual(result[0])
      expect(velocity).toEqual(result[1])
      expect(pos).toEqual(result[2])
    })

    it("fetches multiple components in a different order", () => {
      const pos = Position()
      const velocity = Velocity()
      const entity = world.addEntity(pos, velocity)
      const result = world.query(Position, Velocity)[0]

      expect(entity).toEqual(result[0])
      expect(pos).toEqual(result[1])
      expect(velocity).toEqual(result[2])
    })

    it("fetches components after the entity has been modified", () => {
      const pos = Position()
      const velocity = Velocity()

      const entity = world.addEntity(pos)
      const result = world.query(Position)[0]
      expect(pos).toEqual(result[1])

      world.addComponents(entity, velocity)
      world.addComponents(entity, Tag())
      const result2 = world.query(Position, Tag, Velocity)[0]
      expect(pos).toEqual(result2[1])
      expect(velocity).toEqual(result2[3])
    })
  })
})

describe("Components", () => {
  const Position = Component({ x: 5, y: 6 })
  const Velocity = Component<{ dx: number; dy: number }>()

  let world: World
  beforeEach(() => {
    world = new World()
  })

  it("have default values", () => {
    const entity = world.addEntity(Position())
    expect(world.getComponent(entity, Position)!.x).toEqual(5)
    expect(world.getComponent(entity, Position)!.y).toEqual(6)
  })

  it("can be added as factories", () => {
    const entity = world.addEntity(Position)
    expect(world.getComponent(entity, Position)!.x).toEqual(5)
    expect(world.getComponent(entity, Position)!.y).toEqual(6)
  })

  it("can be simple tags with no attributes", () => {
    const Tag = Component()
    const a = world.addEntity(Tag())
    const b = world.addEntity()

    expect(world.getComponent(a, Tag)).not.toBeNull()
    expect(world.getComponent(b, Tag)).toBeNull()
  })

  it("can be added to an existing entity", () => {
    const entity = world.addEntity()
    world.addComponents(entity, Position({ x: 12, y: 21 }))

    const position = world.getComponent(entity, Position)!
    expect(position.x).toEqual(12)
    expect(position.y).toEqual(21)

    world.addComponents(entity, Velocity({ dx: 2, dy: 3 }))
    const velocity = world.getComponent(entity, Velocity)!
    expect(velocity.dx).toEqual(2)
    expect(velocity.dy).toEqual(3)
  })

  it("return their own key when displayed as strings", () => {
    expect(Position.toString()).toEqual("4")
  })
})
