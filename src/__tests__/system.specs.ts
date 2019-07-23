import { BaseComponent } from '../interfaces'
import { System } from '../system'

// Component
interface SubComponent extends BaseComponent { }
const SubComponent = 'subComponent'
function isSubComponent(o: BaseComponent): o is SubComponent {
  return o._type === SubComponent
}
const subComponent: SubComponent = {
  _type: SubComponent
}

// System
class SubSystem extends System {
  public requiredComponents = [SubComponent]
}

// Entity
const entity = 'someEntity'

describe('System', () => {
  let system: SubSystem

  beforeEach(() => {
    system = new SubSystem()
  })

  describe('Adding an entity', () => {
    it('triggers the addedEntity callback', () => {
      // Arrange
      system.addedEntity = jest.fn()
      // Act
      system.addEntity(entity, [subComponent])
      // Assert
      expect(system.addedEntity).toHaveBeenCalled()
    })
  })

})
