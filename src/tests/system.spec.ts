import { World } from '../world'
import { entityA, entityB, subComponentA, subComponentB, SubSystemA } from './stubs'

describe('System', () => {
  let systemA: SubSystemA
  let world: World

  beforeEach(() => {
    world = new World()

    world.registerEntity(entityA)
    world.registerComponent(entityA, subComponentA)
    world.registerEntity(entityB)
    world.registerComponent(entityB, subComponentB)

    systemA = new SubSystemA()
    world.registerSystem(systemA)
  })

  describe('.world', () => {
    it('should throw an error if the System is already bound to a World', () => {
      expect(() => {
        systemA.world = world
      }).toThrow()
    })
  })

  describe('AddEntity()', () => {
    it('triggers the addedEntity callback', () => {
      // Arrange
      systemA.addedEntity = jest.fn()
      // Act
      systemA.addEntity(entityA)
      // Assert
      expect(systemA.addedEntity).toHaveBeenCalled()
    })

    it('throws en error when adding an incorrect entity', () => {
      // Act & Assert
      expect(() => { systemA.addEntity(entityB) }).toThrow()
    })
  })

  describe('getComponents()', () => {
    it('gets the components for a given entity', () => {
      // Arrange
      systemA.addEntity(entityA)
      // Assert
      expect(systemA.getComponents(entityA)).toContainEqual(subComponentA)
    })
  })

  describe('getEntities()', () => {
    it('gets the entities for the system', () => {
      // Arrange
      systemA.addEntity(entityA)
      // Assert
      expect(systemA.getEntities()).toContain(entityA)
    })
  })

  describe('getEntityComponents()', () => {
    it('should add the entity to the system', () => {
      // Arrange
      systemA.addEntity(entityA)
      // Act
      const ec = systemA.getEntityComponents()
      // Assert
      expect(ec.has(entityA)).toBeTruthy()
      expect(ec.get(entityA)).toContainEqual(subComponentA)
    })

    it('should NOT add the entity to the system', () => {
      // Act & Assert
      expect(() => {
        systemA.addEntity(entityB)
      }).toThrow()
    })
  })

  describe('rebuildEntities()', () => {
    it('clears the entities hash', () => {
      // Arrange
      const ec = { [entityA]: [subComponentA] }

      // Act
      systemA.rebuildEntities(ec)

      // Assert
      expect(systemA.getEntityComponents().get(entityA)).toEqual([subComponentA])
    })

    it('rebuilds the entities hash', () => {
      // Arrange
      const ec = { [entityA]: [subComponentB] } // Invalid object for the system

      // Act
      systemA.rebuildEntities(ec)

      // Assert
      expect(systemA.getEntityComponents()).toEqual(new Map())
    })
  })

  describe('deleteEntity()', () => {
    it('deletes entities', () => {
      // Arrange
      systemA.addEntity(entityA)

      // Act
      systemA.deleteEntity(entityA)

      // Assert
      expect(systemA.getEntities()).toEqual([])
    })
  })

  describe('hasEntity', () => {
    it('returns if a System owns an Entity', () => {
      expect(systemA.hasEntity(entityA)).toBeTruthy()
      world.destroyEntity(entityA)
      expect(systemA.hasEntity(entityA)).toBeFalsy()
    })
  })

  describe('draw()', () => {
    it('calls beforeDraw() and afterDraw()', () => {
      // Arrange
      // @ts-ignore
      systemA.beforeDraw = jest.fn()
      // @ts-ignore
      systemA.afterDraw = jest.fn()

      // Act
      systemA.draw()

      // Assert
      // @ts-ignore
      expect(systemA.beforeDraw).toBeCalled()
      // @ts-ignore
      expect(systemA.afterDraw).toBeCalled()
    })

    it('calls drawEntity() for each Entity', () => {
      // Arrange
      // @ts-ignore
      systemA.drawEntity = jest.fn()

      // Act
      systemA.draw()

      // Assert
      // @ts-ignore
      expect(systemA.drawEntity).toBeCalledTimes(1)
    })
  })

})
