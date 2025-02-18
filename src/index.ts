import merge from 'lodash.merge'

export type Entity = number
export type ComponentData<T = any> = T extends ComponentFactory
  ? { _type: ComponentId }
  : { [K in keyof T]: T[K] } & { _type: ComponentId }
export type Inner<X> = X extends ComponentFactory<infer I> ? I : never

type ComponentId = number
type ComponentFactoryContent<T> = T extends ComponentFactory<infer U> ? U : T

/**
 * The Component Factory, used to generate components of the same type
 */
export type ComponentFactory<T = any> = {
  (data?: Partial<T>): ComponentData<T>
  _type: ComponentId
}

let componentFactoryId = 0
/**
 * Creates a new component factory
 *
 * @example const Position = world.Component({ x: 0, y: 0 })
 * @param defaultData Optional default data for the component
 * @returns
 */
export function Component<T>(defaultData?: Partial<T>): ComponentFactory<T> {
  const cmpKey: ComponentId = ++componentFactoryId

  const fn: ComponentFactory<T> = function (data = {} as any) {
    ;(data as any)._type = cmpKey
    const copy: any = {}
    merge(copy, defaultData, data)
    return copy
  }
  fn._type = cmpKey
  // fn.toString = () => {
  //   return fn._type.toString()
  // }
  return fn
}

export class World {
  private entityCounter = -1
  // private componentFactoryId = -1

  private data: Record<ComponentId, Record<Entity, ComponentData>> = {}
  private queryCache: Map<number, any> = new Map()
  private componentToCacheKeys: Map<ComponentId, Set<number>> = new Map()

  /**
   * Creates a new component factory
   *
   * @example const Position = world.Component({ x: 0, y: 0 })
   * @param defaultData Optional default data for the component
   * @returns
   */
  // public Component<T>(defaultData?: Partial<T>): ComponentFactory<T> {
  //   const cmpKey: ComponentId = Math.pow(2, ++this.componentFactoryId)
  //   this.data[cmpKey] = {}

  //   const fn: ComponentFactory<T> = function (data = {} as any) {
  //     ;(data as any)._type = cmpKey
  //     const copy = defaultData ? JSON.parse(JSON.stringify(defaultData)) : {}
  //     Object.assign(copy, data)
  //     return copy
  //   }
  //   fn._type = cmpKey
  //   fn.toString = () => {
  //     return fn._type.toString()
  //   }
  //   return fn
  // }

  /**
   * Creates a new entity with the given components
   * @param components
   * @returns
   */
  public spawn(...components: ComponentData[]): Entity {
    const entity = ++this.entityCounter
    // If the components are passed as an array, flatten it
    if (components.length === 1 && Array.isArray(components[0])) {
      components = components[0]
    }
    this.setComponents(entity, ...components)
    return entity
  }

  /**
   * Removes an entity from the world
   * @param entity
   */
  public destroy(entity: Entity): void {
    for (const cmpId in this.data) {
      this.cleanCache([Number(cmpId)])
      delete this.data[cmpId][entity]
    }
  }

  /**
   * Adds or updates components. If a component already exists, it will be updated with the new data.
   * This method does not remove components that are not in the list.
   *
   * @example world.addComponents(entity, Position({ x: 0, y: 0 }), Velocity({ dx: 1, dy: 1 }))
   * @param entity
   * @param components
   */
  public setComponents(entity: Entity, ...components: ComponentData[]) {
    this.cleanCache(components.map(c => c._type))
    for (const cmp of components) {
      if (!this.data[cmp._type]) {
        this.data[cmp._type] = {}
      }
      this.data[cmp._type][entity] = typeof cmp === 'function' ? (cmp as any)() : cmp
    }
  }

  /**
   * Adds or updates components to an entity
   *
   * @deprecated Use {@link setComponents} instead
   */
  public addComponents(entity: Entity, ...newComponents: ComponentData[]) {
    this.setComponents(entity, ...newComponents)
  }

  /**
   * Removes components from an entity
   *
   * @example world.removeComponents(entity, Position, Velocity)
   * @param entity
   * @param components
   */
  public removeComponents(entity: Entity, ...components: ComponentFactory[]) {
    this.cleanCache(components.map(c => c._type))
    for (const cmp of components) {
      delete this.data[cmp._type][entity]
    }
  }

  /**
   * Returns a single component, or `null` if it doesn't exist
   *
   * @example world.getComponent(entity, Position)
   * @param entity
   * @param factory
   * @returns The component, or null
   */
  public getComponent<T>(
    entity: Entity,
    factory: ComponentFactory<T>
  ): ComponentData<T> | null {
    return (this.data[factory._type]?.[entity] as ComponentData<T>) ?? null
  }

  public hasComponent<T>(entity: Entity, factory: ComponentFactory<T>): boolean {
    return this.data[factory._type]?.[entity] !== undefined
  }

  /**
   * Returns several components of an entity.
   * If a component doesn't exist, it will be `null`
   *
   * @example world.getComponents(entity, [Position, Velocity])
   * @param entity
   * @param factories
   * @returns An array of [entity, component1, component2, ...]
   */
  public getComponents<const TFactories extends ReadonlyArray<ComponentFactory>>(
    entity: Entity,
    factories: TFactories
  ): [Entity, ...{ [K in keyof TFactories]: (ComponentFactoryContent<TFactories[K]> | null) }] {
    const l = factories.length
    const cmps = new Array(l)
    cmps[0] = entity
    for (let i = 0; i < l; ++i) {
      cmps[i + 1] = this.getComponent(entity, factories[i])
    }
    return cmps as [Entity, ...{ [K in keyof TFactories]: (ComponentFactoryContent<TFactories[K]> | null) }]
  }

  /**
   * Returns the entity id and its components.<br>
   * The query results are cached, and the cache is updated with added/removed entities/components
   *
   * @example world.queryArr([Position, Rendering])
   * @param factories
   * @returns
   */
  public query<const TFactories extends ReadonlyArray<ComponentFactory>>(
    factories: TFactories
  ): Array<[Entity, ...{ [K in keyof TFactories]: ComponentFactoryContent<TFactories[K]> }]> {
    let cacheKey = 0
    const prime = 31 // Small prime for hashing

    // Compute the cache key
    for (const factory of factories) {
      cacheKey = (cacheKey * prime) + factory._type
    }

    // Update the reverse mapping for cache cleaning
    for (const factory of factories) {
      if (!this.componentToCacheKeys.has(factory._type)) {
        this.componentToCacheKeys.set(factory._type, new Set())
      }
      this.componentToCacheKeys.get(factory._type)!.add(cacheKey)
    }

    if (this.queryCache.has(cacheKey)) {
      return [...this.queryCache.get(cacheKey)] as Array<
        [Entity, ...{ [K in keyof TFactories]: ComponentFactoryContent<TFactories[K]> }]
      >
    }

    // 1) Get the entities (ids) that have all queried factories
    const entities = this.getEntities(factories)

    // 2) Get the queried components from their factories
    const l = entities.length
    const data = new Array(l)
    for (let i = 0; i < l; ++i) {
      const e = entities[i]
      data[i] = [e, ...this.getComponentsArrUnsafe(e, factories)]
    }

    this.queryCache.set(cacheKey, data)
    return [...data] as Array<
      [Entity, ...{ [K in keyof TFactories]: ComponentFactoryContent<TFactories[K]> }]
    >
  }

  /**
   * Returns the ids of the entities that have all the queried components
   * @param factories
   * @returns
   */
  public getEntities<T extends ReadonlyArray<ComponentFactory>>(
    factories: T
  ): Entity[] {
    const arrOfKeys = []
    for (let i = 0; i < factories.length; ++i) {
      const componentDataByType = this.data[factories[i]._type]
      if (!componentDataByType) {
        return []
      }
      arrOfKeys.push(Object.keys(componentDataByType))
    }
    arrOfKeys.sort((a, b) => a.length - b.length)

    let entities = arrOfKeys[0].sort()
    for (let i = 1; i < arrOfKeys.length; ++i) {
      entities = intersection(entities, arrOfKeys[i].sort())
    }

    return entities.map(e => Number(e))
  }

  private cleanCache(factories: ComponentId[]) {
    for (const cmpId of factories) {
      if (this.componentToCacheKeys.has(cmpId)) {
        const cacheKeys = this.componentToCacheKeys.get(cmpId)!
        for (const key of cacheKeys) {
          this.queryCache.delete(key)
        }
        this.componentToCacheKeys.delete(cmpId)
      }
    }
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

/**
 * Fast intersection algorithm. Only works on sorted arrays.
 * @param array1
 * @param array2
 * @returns
 */
export function intersection<T>(array1: T[], array2: T[]): T[] {
  // Don't destroy the original arrays
  const a = array1.slice(0)
  const b = array2.slice(0)
  const result: T[] = []
  while (a.length > 0 && b.length > 0) {
    if (a[0] < b[0]) {
      a.shift()
    }
    else if (a[0] > b[0]) {
      b.shift()
    }
    else {
      result.push(a.shift() as T)
      b.shift()
    }
  }
  return result
}
