import { BaseComponent, Entity, EntityComponent } from './interfaces'
import { arrayContainsArray } from './utils'

/**
 * The base abstract class for all Systems
 */
export abstract class System {

  /**
   * The list of Components' (the `_type` Symbol) used by the System
   * to know what entities belong to it
   */
  public abstract requiredComponents: symbol[]

  /**
   * Hash of { entity: component[] }
   */
  protected entityComponents: { [entity: string]: BaseComponent[] } = {}

  /**
   * Returns the components array of an entity
   *
   * @param entity The entity id
   */
  public getComponents(entity: string): BaseComponent[] {
    return this.entityComponents[entity]
  }

  /**
   *  Returns the list of entities for this system
   */
  public getEntities(): Entity[] {
    return Object.keys(this.entityComponents)
  }

  /**
   * Returns the hash of { entity: component[] }
   */
  public getEntityComponents(): { [entity: string]: BaseComponent[] } {
    return this.entityComponents
  }

  /**
   * Rebuilds the entities hash
   */
  public refreshEntities(entities: { [entity in Entity]: BaseComponent[] }): void {
    this.entityComponents = {}
    for (const [entity, components] of Object.entries(entities)) {
      if (arrayContainsArray(components.map(o => o._type), this.requiredComponents)) {
        this.entityComponents[entity] = components
      }
    }
  }

  /**
   * Adds an entity and its components to the current hash
   *
   * @param entity
   * @param components
   */
  public addEntity(entity: Entity, components: BaseComponent[]): void {
    this.entityComponents[entity] = components
    this.addedEntity(entity)
  }

  /**
   * Deletes the entity from the hash
   *
   * @param entity
   */
  public deleteEntity(entity: Entity): void {
    delete this.entityComponents[entity]
  }

  /**
   * Does the entity exists with the system
   */
  public hasEntity(entity: Entity): boolean {
    return !!this.entityComponents[entity]
  }

  //#region Callbacks

  /**
   * Called each time an entity is added
   *
   * @param entity
   */
  public addedEntity(entity: Entity): void { }

  /**
   * Called before the entities update loop
   */
  public beforeUpdate(): void { }

  /**
   * Called for each entity related to the System
   *
   * @param entityComponent
   */
  public updateEntity(entityComponent: EntityComponent): void { }

  /**
   * Called after the entities update loop
   */
  public afterUpdate(): void { }

  /**
   * Calls [[System.beforeDraw]], then [[System.drawEntity]], then [[System.afterDraw]]
   *
   * @param options
   */
  public draw(options = {}): void {
    this.beforeDraw()

    for (const [entity, components] of Object.entries(this.entityComponents)) {
      this.drawEntity({ entity, components }, options)
    }

    this.afterDraw()
  }

  /**
   * Called before the entities draw loop
   */
  public beforeDraw(): void { }

  /**
   * Called for each entity related to the System, after the update loop
   *
   * @param entityComponent
   * @param options
   */
  public drawEntity(entityComponent: EntityComponent, options = {}): void { }

  /**
   * Called after the entities draw loop
   */
  public afterDraw(): void { }

  //#endregion Callbacks

}
