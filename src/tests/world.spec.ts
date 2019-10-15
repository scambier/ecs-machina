import { System } from '../system'
import { World } from '../world'
import { subComponentA, SubSystemA, SubSystemB } from './stubs'
import { BaseComponent } from '../interfaces'

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
      expect(() => { world.registerEntity(a) }).toThrow()
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

  describe('findEntitiesByComponents()', () => {
    it('finds entities', () => {
      // Arrange
      const a = world.createEntity()
      const b = world.createEntity()
      world.registerComponent(b, { _type: 'cmp' })

      // Act
      const components = world.findEntitiesByComponents(['cmp'])

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
      world.registerComponent(entity, subComponentA)

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
      world.registerComponent(a, { _type: 'cmp' })

      // Assert
      expect(world.getComponents(a)).toEqual([{ _type: 'cmp' }])
    })

    it('updates a component if it\'s already added', () => {
      // Arrange
      const a = world.createEntity()
      interface FooCmp extends BaseComponent {
        foo: string
      }

      // Act
      world.registerComponent(a, { _type: 'cmp', foo: 'bar' } as FooCmp)
      world.registerComponent(a, { _type: 'cmp', foo: 'bar2' } as FooCmp)

      // Assert
      const cmp = world.getComponents(a)[0] as FooCmp
      expect(cmp.foo).toBe('bar2')
    })

    it('links entities to systems if new components match', () => {
      // Arrange
      const a = world.createEntity()
      const system = new SubSystemA()
      system.requiredComponents = ['cmp']
      world.registerSystem(system)

      // Act
      world.registerComponent(a, { _type: 'cmp' })

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
      world.registerComponent(a, { _type: 'cmp' })

      // Assert
      expect(system.getEntities()).toEqual([])
    })

    it('adds the entity to the world if needed', () => {
      // Arrange
      const a = 'someEntity'

      // Act
      world.registerComponent(a, { _type: 'cmp' })

      // Assert
      expect(world.getComponents(a)).toEqual([{ _type: 'cmp' }])
    })
  })

  describe('removeComponent()', () => {
    it('removes the component from its linked entity', () => {
      // Arrange
      const a = world.createEntity()
      const cmp = world.registerComponent(a, { _type: 'cmp' })

      // Act
      world.removeComponent(a, cmp)

      // Assert
      expect(world.getComponents(a)).toEqual([])
    })

    it('shows a warning if the object does not exist', () => {
      // Arrange
      const a = world.createEntity()
      world.registerComponent(a, { _type: 'cmp' })
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
      world.registerComponent(a, { _type: 'cmp' })
      let logs = ''
      console['warn'] = jest.fn(output => logs += output)

      // Act
      world.removeComponent(a, { _type: 'cmp' })

      // Assert
      expect(logs).toContain('This component does not exist')
      expect(logs).toContain('Another component with _type "cmp" exists')
    })

    it('loops through systems to remove related entities', () => {
      // Arrange
      const a = world.createEntity()
      const b = world.createEntity()

      const cmpA = world.registerComponent(a, { _type: 'cmp1' })
      world.registerComponent(a, { _type: 'cmp2' })
      const cmp2 = world.registerComponent(b, { _type: 'cmp2' })

      const systemA = new SubSystemA()
      systemA.requiredComponents = ['cmp1']
      world.registerSystem(systemA)

      const systemB = new SubSystemB()
      systemB.requiredComponents = ['cmp2']
      world.registerSystem(systemB)

      // Act
      world.removeComponent(a, cmpA)

      // Assert
      expect(systemA.getEntities()).toEqual([])
      expect(systemB.getEntities()).toEqual([a, b])

      // Act
      world.removeComponent(b, cmp2)

      // Assert
      expect(systemB.getEntities()).toEqual([a])
    })
  })

  describe('removeComponentByType', () => {
    it('removes a component by its type', () => {
      // Arrange
      const a = world.createEntity()
      world.registerComponent(a, { _type: 'cmp' })

      // Act
      world.removeComponentByType(a, 'cmp')

      // Assert
      expect(world.getComponents(a)).toEqual([])
    })

    it('does nothing if the component is not linked to the entity', () => {
      // Arrange
      const a = world.createEntity()
      world.registerComponent(a, { _type: 'cmp' })

      // Act
      world.removeComponentByType(a, 'foo')

      // Assert
      expect(world.getComponents(a)).toEqual([{ _type: 'cmp' }])
    })
  })

  describe('getComponents()', () => {
    it('returns components for an entity', () => {
      // Arrange
      const ent1 = world.createEntity()
      const ent2 = world.createEntity()
      world.registerComponent(ent1, { _type: 'a' })
      world.registerComponent(ent1, { _type: 'b' })
      world.registerComponent(ent2, { _type: 'a' })

      // Assert
      expect(world.getComponents(ent1)).toEqual([{ _type: 'a' }, { _type: 'b' }])
      expect(world.getComponents(ent2)).toEqual([{ _type: 'a' }])
    })

    it('throws an error if the entity does not exist', () => {
      // Assert
      expect(() => {
        world.getComponents('unknown')
      }).toThrow()
    })
  })

  describe('registerSystem()', () => {
    it('registers the system into the workd', () => {
      // Act
      world.registerSystem(new SubSystemA())

      // Assert
      expect(world.getSystem(SubSystemA)).toBeTruthy()
    })

    it('throws if a system of the same class is registered twice', () => {
      // Arrange
      world.registerSystem(new SubSystemA())

      // Assert
      expect(() => {
        world.registerSystem(new SubSystemA())
      }).toThrow()
    })
  })

  describe('removeSystem()', () => {
    it('removes a system from the world', () => {
      // Arrange
      const system = new SubSystemA()
      world.registerSystem(system)

      // Act
      world.removeSystem(system)

      // Assert
      expect(world.getSystems()).toEqual([])
    })
  })

  describe('getSystems()', () => {
    it('returns registered systems', () => {
      // Arrange
      const systemA = new SubSystemA()
      const systemB = new SubSystemB()
      world.registerSystem(systemA)
      world.registerSystem(systemB)

      // Assert
      expect(world.getSystems()).toEqual([systemA, systemB])
    })
  })

  describe('getSystem()', () => {
    it('returns a system from its class', () => {
      // Arrange
      const systemA = new SubSystemA()
      const systemB = new SubSystemB()
      world.registerSystem(systemA)
      world.registerSystem(systemB)

      // Assert
      expect(world.getSystem(SubSystemB)).toBe(systemB)
    })
  })

})
