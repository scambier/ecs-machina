import { World } from '../world'
import { entityA, entityB, subComponentA, subComponentB, SubSystemA } from './stubs'

describe('System', () => {
  let system: SubSystemA
  let world: World

  beforeEach(() => {
    world = new World()

    world.createEntity(entityA)
    world.addComponent(entityA, subComponentA)
    world.createEntity(entityB)
    world.addComponent(entityB, subComponentB)

    system = new SubSystemA()
    world.registerSystem(system)
  })

  describe('AddEntity()', () => {
    it('triggers the addedEntity callback', () => {
      // Arrange
      system.addedEntity = jest.fn()
      // Act
      system.addEntity(entityA)
      // Assert
      expect(system.addedEntity).toHaveBeenCalled()
    })

    it('throws en error when adding an incorrect entity', () => {
      // Act & Assert
      expect(() => { system.addEntity(entityB) }).toThrow()
    })
  })

  describe('getComponents()', () => {
    it('gets the components for a given entity', () => {
      // Arrange
      system.addEntity(entityA)
      // Assert
      expect(system.getComponents(entityA)).toContainEqual(subComponentA)
    })
  })

  describe('getEntities()', () => {
    it('gets the entities for the system', () => {
      // Arrange
      system.addEntity(entityA)
      // Assert
      expect(system.getEntities()).toContain(entityA)
    })
  })

  describe('getEntityComponents()', () => {
    it('should add the entity to the system', () => {
      // Arrange
      system.addEntity(entityA)
      // Act
      const ec = system.getEntityComponents()
      // Assert
      expect(ec).toHaveProperty(entityA)
      expect(ec[entityA]).toContainEqual(subComponentA)
    })

    it('should NOT add the entity to the system', () => {
      // Arrange
      system.addEntity(entityA)
      // Act
      const ec = system.getEntityComponents()
      // Assert
      expect(ec).toHaveProperty(entityA)
      expect(ec[entityA]).toContainEqual(subComponentA)
    })
  })

  describe('rebuildEntities()', () => {
    it('clears the entities hash', () => {
      // Arrange
      const ec = { [entityA]: [subComponentA] }
      // Act
      system.rebuildEntities(ec)
      // Assert
      expect(system.getEntityComponents()).toEqual(ec)
    })

    it('rebuilds the entities hash', () => {
      // Arrange
      const ec = { [entityA]: [subComponentB] }
      // Act
      system.rebuildEntities(ec)
      // Assert
      expect(system.getEntityComponents()).toEqual({})
    })
  })

  describe('deleteEntity()', () => {
    it('deletes entities', () => {
      // Arrange
      system.addEntity(entityA)

      // Act
      system.deleteEntity(entityA)

      // Assert
      expect(system.getEntities()).toEqual([])
    })
  })

})
