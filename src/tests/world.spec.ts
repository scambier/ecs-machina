import { System } from '../system'
import { World } from '../world'
import { entityA, entityB, subComponentA, subComponentB, SubSystemA } from './stubs'

describe('World', () => {
  let world: World
  let systemMock: System

  beforeEach(() => {
    world = new World()
    systemMock = {
      rebuildEntities: jest.fn(),
      beforeUpdate: jest.fn(),
      afterUpdate: jest.fn(),
      updateEntity: jest.fn(),
      getEntityComponents: jest.fn().mockReturnValue({ '1': [], '2': [] })
    } as unknown as System
  })

  describe('update()', () => {
    it('calls beforeUpdate & afterUpdate', () => {
      // Arrange
      world.registerSystem(systemMock)

      // Act
      world.update()

      // Assert
      expect(systemMock.beforeUpdate).toBeCalled()
      expect(systemMock.afterUpdate).toBeCalled()
    })

    it('calls updateEntity() for each entity', () => {
      // Arrange
      world.registerSystem(systemMock)

      // Act
      world.update()

      // Assert
      expect(systemMock.updateEntity).toBeCalledTimes(2)
    })

  })

  describe('createEntity()', () => {
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

  describe('addEntity()', () => {
    it('throws when an entity is registered twice', () => {
      // Arrange
      const a = world.createEntity()

      // Assert
      expect(() => { world.addEntity(a) }).toThrow()
    })
  })

  describe('getEntities()', () => {
    it('returns the entities list', () => {
      // Arrange
      const a = world.createEntity()
      const b = world.createEntity()

      // Assert
      expect(world.getEntities()).toEqual([a, b])
    })
  })

  describe('findEntities()', () => {
    it('finds entities', () => {
      // Arrange
      const a = world.createEntity()
      const b = world.createEntity()
      world.addComponent(b, { _type: 'cmp' })

      // Act
      const components = world.findEntities(['cmp'])

      // Assert
      expect(components).toEqual([b])
    })
  })

  describe('destroyEntity()', () => {
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

  describe('addComponent()', () => {
    it('links a component with an entity', () => {
      // Arrange
      const a = world.createEntity()

      // Act
      world.addComponent(a, { _type: 'cmp' })

      // Assert
      expect(world.getComponents(a)).toEqual([{ _type: 'cmp' }])
    })

    it('updates a component if it\'s already added', () => {
      // Arrange
      const a = world.createEntity()

      // Act
      world.addComponent(a, { _type: 'cmp', foo: 'bar' })
      world.addComponent(a, { _type: 'cmp', foo: 'bar2' })

      // Assert
      const cmp = world.getComponents(a)[0]
      expect(cmp.foo).toBe('bar2')
    })

    it('links entities to systems if new components match', () => {
      // Arrange
      const a = world.createEntity()
      const system = new SubSystemA()
      system.requiredComponents = ['cmp']
      world.registerSystem(system)

      // Act
      world.addComponent(a, { _type: 'cmp' })

      // Assert
      expect(system.getEntities()).toEqual([a])
    })

    it('does not link entities to systems if new components don\'t match', () => {
      // Arrange
      const a = world.createEntity()
      const system = new SubSystemA()
      system.requiredComponents = ['nope']
      world.registerSystem(system)

      // Act
      world.addComponent(a, { _type: 'cmp' })

      // Assert
      expect(system.getEntities()).toEqual([])
    })
  })

  describe('removeComponent()', () => {

  })

  describe('getComponents()', () => {

  })

  describe('registerSystem()', () => {

  })

  describe('removeSystem()', () => {

  })

  describe('getSystems()', () => {

  })

  describe('getSystem()', () => {

  })

})
