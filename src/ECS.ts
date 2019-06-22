import { cloneDeep, pull } from 'lodash'
import { Assemblage, BaseComponent, ECSEntity } from './interfaces'
import { System } from './system'
import { arrayContainsArray } from './utils'

const log = require('debug')('ECS-Machina')

export class ECS {

  // TODO: set private?
  public static entities: {
    [entity: string]: BaseComponent[]
  } = {}

  /**
   * Creates an entity (a unique id) and adds it to the ECS database
   */
  public static createEntity(): ECSEntity {
    const entity = (++this.counter).toString()
    this.addEntity(entity)
    return entity
  }

  /**
   * Destroys an entity and its components from the ECS database
   */
  public static destroyEntity(entity: ECSEntity): void {
    // Remove entity references from ECS
    delete this.entities[entity]

    // Remove entity references from concerned systems
    for (const system of this.systems) {
      system.deleteEntity(entity)
    }
  }

  /**
   * Manually adds an entity to the ECS database.
   * If the entity is already in the database, it is ignored.
   */
  public static addEntity(entity: ECSEntity): void {
    if (this.entities[entity]) {
      console.error(`The entity ${entity} has already been added`)
    }
    else {
      this.entities[entity] = []
    }
  }

  /**
   * Links a component to an entity. If a component of the same type has already
   * been added, the properties of the new one will overwrite the original's.
   * The method makes a deep copy of the original component before adding it, and returns this copy.
   */
  public static addComponent(entity: ECSEntity, component: BaseComponent): BaseComponent {
    // Create the entity if it doesn't exist yet
    if (!this.entities[entity]) {
      this.entities[entity] = []
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
    for (const system of ECS.systems) {
      if (arrayContainsArray(this.entities[entity].map(o => o._type), system.requiredComponents)) {
        system.addEntity(entity, this.entities[entity])
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
  public static removeComponent(entity: ECSEntity, component: BaseComponent): void {
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
   * Returns the array of entities
   */
  public static getEntities(): ECSEntity[] {
    return Object.keys(this.entities)
  }

  /**
   * Returns an array of entities that own the required components
   */
  public static findEntities(componentTypes: string[]): ECSEntity[] {
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
   * Returns the components for a given entity
   */
  public static getComponents(entity: ECSEntity): Assemblage {
    return this.entities[entity]
  }

  /**
   * Registers a system instance in the ECS database.
   * You can only register one (1) instance of each System's subclass
   */
  public static addSystem(system: System): void {
    for (const sys of this.systems) {
      if (sys.constructor.name === system.constructor.name) {
        console.error(`There is already a registered instance of ${system.constructor.name}`)
        return
      }
    }
    this.systems.push(system)
    log(`Registered System ${system.constructor.name}`)

    // Add all concerned entities to this system
    system.refreshEntities()
  }

  /**
   * Removed a system from the ECS database
   */
  public static removeSystem(system: System): void {
    pull(this.systems, system)
  }

  /**
   * Returns the systems' list
   */
  public static getSystems(): System[] {
    return this.systems
  }

  /**
   * Returns a specific system instance from its class
   *
   * @param systemClass
   */
  public static getSystem<T extends System>(systemClass: typeof System): T {
    return this.getSystems().find(o => o instanceof systemClass) as T
  }

  private static systems: System[] = []

  private static counter = 0
}
