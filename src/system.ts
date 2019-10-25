import { BaseComponent, Entity } from './interfaces'
import { arrayContainsArray, hashToMap } from './utils'
import { World } from './world'

/**
 * The base abstract class for all Systems
 */
export abstract class System {

  /**
   * The list of Components (the Components' `_type` value) used by the System
   * to know what entities belong to it
   */
  public abstract requiredComponents: string[]

  /**
   * Hash of { entity: component[] }
   * TODO: use a Map type?
   */
  // protected entityComponents: { [entity: string]: BaseComponent[] } = {}
  protected entityComponents: Map<Entity, BaseComponent[]> = new Map()

  private _world!: World
  public get world(): World {
    return this._world
  }
  public set world(v: World) {
    if (this._world) { throw Error('Cannot reassign a System to a different World') }
    this._world = v
  }

  /**
   * Returns the components array of an entity
   *
   * @param entity The entity id
   */
  public getComponents(entity: string): BaseComponent[] {
    return this.entityComponents.get(entity)!
  }

  /**
   *  Returns the list of entities for this system
   */
  public getEntities(): Entity[] {
    return Array.from(this.entityComponents.keys())
  }

  /**
   * Returns the hash of { entity: component[] }
   */
  public getEntityComponents(): Map<Entity, BaseComponent[]> {
    return this.entityComponents
  }

  /**
   * Rebuilds the entities hash
   */
  public rebuildEntities(entities: Map<Entity, BaseComponent[]> | { [entity in Entity]: BaseComponent[] }): void {

    // Convert Object to Map
    if (!(entities instanceof Map)) {
      entities = hashToMap(entities)
    }

    this.entityComponents.clear()

    entities.forEach((components, entity) => {
      if (arrayContainsArray(components.map(o => o._type), this.requiredComponents)) {
        this.entityComponents.set(entity, components)
      }
    })

  }

  /**
   * Adds an entity and its components to the current hash.<br>
   * You should not call this method
   *
   * @param entity
   */
  public addEntity(entity: Entity): void {
    const components = this.world.getComponents(entity)
    if (!this.canAddEntity(entity)) {
      throw new Error('Components list incompatible with this system')
    }
    this.entityComponents.set(entity, components)
    this.addedEntity(entity, components)
  }

  /**
   * Deletes the entity from the hash
   *
   * @param entity
   */
  public deleteEntity(entity: Entity): void {
    this.entityComponents.delete(entity)
  }

  /**
   * Does the entity exists with the system
   */
  public hasEntity(entity: Entity): boolean {
    return this.entityComponents.has(entity)
  }

  /**
   * Returns if this system is compatible with the components
   * @param entity
   * @param components
   */
  public canAddEntity(entity: Entity): boolean {
    const components = this.world.getComponents(entity)
    return arrayContainsArray(components.map(o => o._type), this.requiredComponents)
  }

  //#region Callbacks

  /**
   * Called each time an entity is added
   *
   * @param entity
   */
  public addedEntity(entity: Entity, components: BaseComponent[]): void { }

  /**
   * Called before the entities update loop
   */
  public beforeUpdate(): void { }

  /**
   * Called for each entity related to the System
   *
   * @param entity - The entity ID
   * @param components - Its array of components
   */
  public updateEntity(entity: string, components: BaseComponent[]): void { }

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

    this.entityComponents.forEach((components, entity) => {
      this.drawEntity(entity, components, options)
    })

    this.afterDraw()
  }

  /**
   * Called before the entities draw loop
   */
  protected beforeDraw(): void { }

  /**
   * Called for each entity related to the System, after the update loop
   *
   * @param entity - The entity ID
   * @param components - Its array of components
   * @param options - An object to pass your own data
   */
  protected drawEntity(entity: string, components: BaseComponent[], options = {}): void { }

  /**
   * Called after the entities draw loop
   */
  protected afterDraw(): void { }

  //#endregion Callbacks

}
