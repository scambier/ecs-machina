import { System } from '../system'
import { World } from '../world'
import { entityA, entityB, subComponentA, subComponentB, SubSystemA, SubSystemB } from './stubs'

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

    it('adds the entity to the world if needed', () => {
      // Arrange
      const a = 'someEntity'

      // Act
      world.addComponent(a, { _type: 'cmp' })

      // Assert
      expect(world.getComponents(a)).toEqual([{ _type: 'cmp' }])
    })
  })

  describe('removeComponent()', () => {
    it('removes the component from its linked entity', () => {
      // Arrange
      const a = world.createEntity()
      const cmp = world.addComponent(a, { _type: 'cmp' })

      // Act
      world.removeComponent(a, cmp)

      // Assert
      expect(world.getComponents(a)).toEqual([])
    })

    it('shows a warning if the object does not exist', () => {
      // Arrange
      const a = world.createEntity()
      world.addComponent(a, { _type: 'cmp' })
      let logs = ''
      console['warn'] = jest.fn(output => logs = output)

      // Act
      world.removeComponent(a, { _type: 'foo' })

      // Assert
      expect(logs).toContain('This component does not exist')
    })

    it('shows another log if a different component of the same type exist', () => {
      // Arrange
      const a = world.createEntity()
      world.addComponent(a, { _type: 'cmp' })
      let logs = ''
      console['warn'] = jest.fn(output => logs += output)

      // Act
      world.removeComponent(a, { _type: 'cmp' })

      // Assert
      expect(logs).toContain('This component does not exist')
      expect(logs).toContain('Another component with _type "cmp" exists')
    })
  })

  describe('getComponents()', () => {
    it('returns components for an entity', () => {
      // Arrange
      const ent1 = world.createEntity()
      const ent2 = world.createEntity()
      world.addComponent(ent1, { _type: 'a' })
      world.addComponent(ent1, { _type: 'b' })
      world.addComponent(ent2, { _type: 'a' })

      // Assert
      expect(world.getComponents(ent1)).toEqual([{ _type: 'a' }, { _type: 'b' }])
      expect(world.getComponents(ent2)).toEqual([{ _type: 'a' }])
    })
  })

  describe('registerSystem()', () => {
    it('registers the system into the workd', () => {
      // Act
      world.registerSystem(new SubSystemA())

      // Assert
      expect(world.getSystem(SubSystemA)).toBeTruthy()
    })
  })

  describe('removeSystem()', () => {

  })

  describe('getSystems()', () => {

  })

  describe('getSystem()', () => {

  })

})
