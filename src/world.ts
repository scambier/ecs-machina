import { cloneDeep, pull } from 'lodash-es'
import { BaseComponent, Entity } from './interfaces'
import { System } from './system'
import { arrayContainsArray } from './utils'

const log = require('debug')('ECS-Machina')

export class World {

  // TODO: make protected with getter
  public entities: {
    [entity in Entity]: BaseComponent[] // Why not [entity: Entity] ? https://github.com/microsoft/TypeScript/issues/1778#issuecomment-479986964
  } = {}

  protected systems: System[] = []

  protected entityIncrements = 0

  public update(): void {
    for (const system of this.getSystems()) {
      system.beforeUpdate()
      for (const [entity, components] of Object.entries(system.getEntityComponents())) {
        system.updateEntity(entity, components)
      }
      system.afterUpdate()
    }
  }

  /**
   * Creates AND registers a new Entity inside the World
   *
   * @returns The newly registered Entity
   */
  public createEntity(): Entity {
    const entity = (++this.entityIncrements).toString()
    return this.registerEntity(entity)
  }

  /**
   * Registers a new Entity inside the World
   *
   * @param entity
   * @returns The newly registered Entity
   */
  public registerEntity(entity: Entity): Entity {
    if (this.entities[entity]) {
      throw new Error(`The entity "${entity}" has already been registered`)
    }
    else {
      this.entities[entity] = []
    }
    return entity
  }

  /**
   * Returns the array of entities
   */
  public getEntities(): Entity[] {
    return Object.keys(this.entities)
  }

  /**
   * Returns an array of entities that own the required components
   */
  public findEntitiesByComponents(componentTypes: string[]): Entity[] {
    const result = []
    for (const [entity, components] of Object.entries(this.entities)) {
      const entityCmpTypes = components.map(o => o._type)
      if (arrayContainsArray(entityCmpTypes, componentTypes)) {
        result.push(entity)
      }
    }
    return result
  }

  /**
   * Destroys an entity and its components from the ECS database
   */
  public destroyEntity(entity: Entity): void {
    // Remove entity references from ECS
    delete this.entities[entity]

    // Remove entity references from concerned systems
    for (const system of this.systems) {
      system.deleteEntity(entity)
    }
  }

  /**
   * Links a component to an entity. If a component of the same type has already
   * been added, the properties of the new one will overwrite the original's.
   * The method makes a deep copy of the original component before adding it, and returns this copy.
   */
  public registerComponent(entity: Entity, component: BaseComponent): BaseComponent {
    // Create the entity if it doesn't exist yet
    if (!this.entities[entity]) {
      this.registerEntity(entity)
    }

    // Make a deep copy of the object
    component = cloneDeep(component)

    // If an entity of the same type has already been added,
    // update its properties
    const original = this.entities[entity].find(o => o._type === component._type)
    if (original) {
      pull(this.entities[entity], original)
      component = Object.assign(original, component)
    }

    this.entities[entity].push(component)

    // Link entity to system if requiredComponents match
    for (const system of this.systems) {
      if (system.canAddEntity(entity)) {
        system.addEntity(entity)
      }
    }

    return component
  }

  /**
   * Removes a component from an entity
   *
   * @param entity
   * @param component
   */
  public removeComponent(entity: Entity, component: BaseComponent): void {
    const components = this.getComponents(entity)
    if (components.indexOf(component) === -1) {
      const exists = components.find(o => o._type === component._type)
      console.warn(`This component does not exist on entity ${entity}. Is it the same object?`)
      if (exists) {
        console.warn(`Another component with _type "${component._type}" exists. Use world.removeComponentByType() to remove components by their _type value.`)
      }
      return
    }
    // Remove component from entityComponents
    pull(this.entities[entity], component)

    // Loop through systems to remove entity if needed
    for (const system of this.systems) {
      if (system.hasEntity(entity)) {
        // pull(system.entityComponents[entity], component)
        if (!arrayContainsArray(this.entities[entity].map(o => o._type), system.requiredComponents)) {
          system.deleteEntity(entity)
        }
      }
    }
  }

  /**
   * Removes a Component, from its `_type` value
   *
   * @param entity
   * @param type
   */
  public removeComponentByType(entity: Entity, type: string): void {
    const component = this.getComponents(entity).find(o => o._type === type)
    if (component) {
      return this.removeComponent(entity, component)
    }
  }

  /**
   * Returns the components for a given entity
   */
  public getComponents(entity: Entity): BaseComponent[] {
    if (!this.entities[entity]) { throw Error(`Unknown entity ${entity}`) }
    return this.entities[entity]
  }

  /**
   * Registers a system instance in the ECS database.
   * You can only register one (1) instance of each System's subclass
   */
  public registerSystem(system: System): void {
    for (const sys of this.systems) {
      if (sys.constructor.name === system.constructor.name) {
        throw new Error(`There is already a registered instance of ${system.constructor.name}`)
      }
    }
    // World owns Systems, and Systems reference World
    this.systems.push(system)
    system.world = this

    log(`Registered System ${system.constructor.name}`)

    // Add all concerned entities to this system
    system.rebuildEntities(this.entities)
  }

  /**
   * Remove a System from the ECS database.<br>
   * This destroys the link between a System and a World
   */
  public removeSystem(system: System): void {
    pull(this.systems, system)
  }

  /**
   * Returns the systems' list
   */
  public getSystems(): System[] {
    return this.systems
  }

  /**
   * Returns a specific system instance from its class
   *
   * @param systemClass
   */
  public getSystem<T extends System>(systemClass: typeof System): T {
    return this.getSystems().find(o => o instanceof systemClass) as T
  }
}
