import { System } from '../system'
import { World } from '../world'
import { entityA, entityB, subComponentA, subComponentB, SubSystemA } from './stubs'

describe('World', () => {
  let world: World

  beforeEach(() => {
    world = new World()
  })

  describe('createEntity', () => {
    it('increments the entity id', () => {
      // Act
      const a = world.createEntity()
      const b = world.createEntity()

      // Assert
      expect(a).toEqual('1')
      expect(b).toEqual('2')
    })

    it('registers the new Entity', () => {
      // Act
      const entity = world.createEntity()

      // Assert
      expect(world.getEntities()).toEqual([entity])
    })

  })

  describe('destroyEntity', () => {
    it('removes the entity from the world', () => {
      // Arrange
      const entity = world.createEntity()

      // Act
      world.destroyEntity(entity)

      // Assert
      expect(world.getEntities()).toEqual([])
    })

    it('removes the Entity from linked Systems', () => {
      // Arrange
      const entity = world.createEntity()
      world.addComponent(entity, subComponentA)

      const system = new SubSystemA()
      world.registerSystem(system)

      // Act
      world.destroyEntity(entity)

      // Assert
      expect(system.getEntities()).toEqual([])
    })
  })
})
