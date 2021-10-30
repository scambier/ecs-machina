export type Entity = number
export type ComponentData<T = any> = T extends ComponentFactory
  ? never
  : { [K in keyof T]: T[K] } & { _type: ComponentId }
export type Inner<X> = X extends ComponentFactory<infer I> ? I : never

type ComponentId = number
type ComponentFactoryContent<T> = T extends ComponentFactory<infer U> ? U : T

/**
 * The Component Factory, used to generate components of the same type
 */
export type ComponentFactory<T = any> = {
  (data?: T): ComponentData<T>
  _type: ComponentId
}

export class World {
  private entityCounter = 0
  private componentFactoryId = 0

  private data: Record<ComponentId, Record<Entity, ComponentData>> = {}

  public Component<T>(defaultData?: Partial<T>): ComponentFactory<T> {
    const cmpKey: ComponentId = ++this.componentFactoryId
    this.data[cmpKey] = {}

    const fn: ComponentFactory<T> = function (data = {} as any) {
      ;(data as any)._type = cmpKey
      const copy = defaultData ? JSON.parse(JSON.stringify(defaultData)) : {}
      assign(copy, data)
      return copy
    }
    fn._type = cmpKey
    fn.toString = () => {
      return fn._type.toString()
    }
    return fn
  }

  public spawn(...components: ComponentData[]): Entity {
    const entity = ++this.entityCounter
    this.addComponents(entity, ...components)
    return entity
  }

  public destroy(entity: Entity): void {
    for (const cmpId in this.data) {
      delete this.data[cmpId][entity]
    }
  }

  public addComponents(entity: Entity, ...newComponents: ComponentData[]) {
    for (const cmp of newComponents) {
      this.data[cmp._type][entity] = cmp
    }
  }

  public removeComponents(entity: Entity, ...components: ComponentFactory[]) {
    for (const cmp of components) {
      delete this.data[cmp._type][entity]
    }
  }

  /**
   * Returns a single component, or `null` if it doesn't exist
   * @param entity
   * @param factory
   * @returns The component, or null
   */
  public getComponent<T>(
    entity: Entity,
    factory: ComponentFactory<T>
  ): ComponentData<T> | null {
    return (this.data[factory._type][entity] as ComponentData<T>) ?? null
  }

  /**
   * Returns several components of an entity.
   *
   * @example world.getComponents(entity, Position, Velocity)
   * @param entity
   * @param factories
   * @returns A sorted array of components
   */
  public getComponents<T extends ReadonlyArray<ComponentFactory>>(
    entity: Entity,
    ...factories: T
  ): { [K in keyof T]: ComponentData<ComponentFactoryContent<T[K]>> | null } {
    return this.getComponentsArr(entity, factories)
  }

  /**
   * Like `getComponents()`, but accepts an array of components instead of a rest parameter.
   * Prefer this method for performances.
   *
   * @example world.getComponentsArr(entity, [Position, Velocity] as const)
   * @param entity
   * @param factories
   * @returns A sorted array of components
   */
  public getComponentsArr<T extends ReadonlyArray<ComponentFactory>>(
    entity: Entity,
    factories: T
  ): { [K in keyof T]: ComponentData<ComponentFactoryContent<T[K]>> | null } {
    const l = factories.length
    const cmps = new Array(l) as (ComponentData | null)[]
    for (let i = 0; i < l; ++i) {
      cmps[i] = this.getComponent(entity, factories[i])
    }
    return cmps as any
  }

  /**
   * Returns the entity id and its entities.<br>
   * The query results are cached, and the cache is updated with added/removed entities/components
   *
   * @example for (const [entity, pos, vel] of world.query(Position, Velocity)) {}
   * @param factories A list of Component factories, as a rest parameter
   * @returns An array of entities with their queried components
   */
  public query<T extends ReadonlyArray<ComponentFactory>>(
    ...factories: T
  ): Array<[Entity, ...{ [K in keyof T]: ComponentFactoryContent<T[K]> }]> {
    // 1) Get the entities (ids) that have all queried factories
    const entities = this.getEntities(factories)

    // 2) Get the queried components from their factories
    const l = entities.length
    const data = new Array(l)
    for (let i = 0; i < l; ++i) {
      const e = entities[i]
      data[i] = [e, ...this.getComponentsArrUnsafe(e, factories)]
    }

    return data as Array<
      [Entity, ...{ [K in keyof T]: ComponentFactoryContent<T[K]> }]
    >
  }

  public getEntities<T extends ReadonlyArray<ComponentFactory>>(
    factories: T
  ): Entity[] {
    let entities = Object.keys(this.data[factories[0]._type])
    const l = factories.length
    for (let i = 1; i < l; ++i) {
      entities = intersection(
        entities,
        Object.keys(this.data[factories[i]._type])
      )
    }

    return entities.map((e) => Number(e))
  }

  private getComponentsArrUnsafe<T extends ReadonlyArray<ComponentFactory>>(
    entity: Entity,
    factories: T
  ): { [K in keyof T]: ComponentData<ComponentFactoryContent<T[K]>> | null } {
    const l = factories.length
    const cmps = new Array(l) as (ComponentData | null)[]
    for (let i = 0; i < l; ++i) {
      cmps[i] = this.data[factories[i]._type][entity]
    }
    return cmps as any
  }
}

function intersection<T>(array1: T[], array2: T[]): T[] {
  return array1.filter((value) => array2.indexOf(value) > -1)
}

/**
 * Object.assign polyfill for ES5 compatibility
 *
 * @param dest
 * @param source
 * @returns
 */
function assign<T, U>(dest: T, source: U): T & U {
  if ((Object as any).assign) return (Object as any).assign(dest, source)
  Object.keys(source as any).forEach(
    (i) => ((dest as any)[i] = (source as any)[i])
  )
  return dest as T & U
}
