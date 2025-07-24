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
    const copy = mergeDeep(isObject(data) ? {} : [], defaultData, data)
    ;(copy as any)._type = cmpKey
    return copy as ComponentData<T>
  }
  fn._type = cmpKey
  return fn
}

export class World {
  private entityCounter = -1
  // private componentFactoryId = -1

  private data = new Map<ComponentId, Map<Entity, ComponentData>>()
  private deactivated = new Set<Entity>()
  private queryCache: Map<number, any> = new Map()
  private componentToCacheKeys: Map<ComponentId, Set<number>> = new Map()

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
    const data = this.data
    for (const item of data) {
      this.cleanCache([Number(item[0])])
      item[1].delete(entity)
    }
  }

  public deactivate(entity: Entity): void {
    this.deactivated.add(entity)
  }

  public reactivate(entity: Entity): void {
    this.deactivated.delete(entity)
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
    const types = []
    const data = this.data
    for (let i = 0; i < components.length; i++) {
      types[i] = components[i]._type
    }

    const typesToClean = []
    for (let cmp of components) {
      cmp = typeof cmp === 'function' ? (cmp as any)() : cmp
      if (!data.has(cmp._type)) data.set(cmp._type, new Map())

      // If the entity doesn't have the component,
      // add it and flag it for cache clean
      if (!this.hasComponent(entity, cmp)) {
        typesToClean.push(cmp._type)
        data.get(cmp._type)!.set(entity, cmp)
        continue
      }

      // If the entity already has the component,
      // update its fields (and don't bust the cache)
      const og = data.get(cmp._type)?.get(entity)
      if (og) {
        mergeDeep(og, cmp)
      }
    }

    this.cleanCache(typesToClean)
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
    const types = []
    const data = this.data
    for (let i = 0; i < components.length; i++) {
      types[i] = components[i]._type
    }
    this.cleanCache(types)
    for (const cmp of components) {
      data.get(cmp._type)?.delete(entity)
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
  public queryComponent<T>(entity: Entity, factory: ComponentFactory<T>): ComponentData<T> | null {
    return (this.data.get(factory._type)?.get(entity) as ComponentData<T>) ?? null
  }

  /**
   * Returns a single component from an entity.
   * Doesn't check if the component exists.
   *
   * @example world.getComponent(entity, Position)
   * @param entity
   * @param factory
   * @returns The component, or null
   */
  public getComponent<T>(entity: Entity, factory: ComponentFactory<T>): ComponentData<T> {
    return (this.data.get(factory._type)?.get(entity) as ComponentData<T>)
  }

  public hasComponent(entity: Entity, factory: { _type: number }): boolean {
    return !!this.data.get(factory._type)?.has(entity)
  }

  /**
   * Returns several components of an entity.
   * If a component doesn't exist, it will be `null`
   *
   * @example world.queryComponents(entity, [Position, Velocity])
   * @param entity
   * @param factories
   * @returns An array of [entity, component1, component2, ...]
   */
  public queryComponents<const TFactories extends ReadonlyArray<ComponentFactory>>(
    entity: Entity,
    factories: TFactories
  ): [Entity, ...{ [K in keyof TFactories]: ComponentFactoryContent<TFactories[K]> | null }] {
    const l = factories.length
    const cmps = Array.from({ length: l })
    cmps[0] = entity
    for (let i = 0; i < l; ++i) {
      cmps[i + 1] = this.getComponent(entity, factories[i])
    }
    return cmps as [
      Entity,
      ...{ [K in keyof TFactories]: ComponentFactoryContent<TFactories[K]> | null }
    ]
  }

  /**
   * Returns several components of an entity.
   * Doesn't check if any of the components exist
   *
   * @example world.queryComponents(entity, [Position, Velocity])
   * @param entity
   * @param factories
   * @returns An array of [entity, component1, component2, ...]
   */
  public getComponents<const TFactories extends ReadonlyArray<ComponentFactory>>(
    entity: Entity,
    factories: TFactories
  ): [Entity, ...{ [K in keyof TFactories]: ComponentFactoryContent<TFactories[K]> }] {
    const l = factories.length
    const cmps = Array.from({ length: l })
    cmps[0] = entity
    for (let i = 0; i < l; ++i) {
      cmps[i + 1] = this.getComponent(entity, factories[i])
    }
    return cmps as [
      Entity,
      ...{ [K in keyof TFactories]: ComponentFactoryContent<TFactories[K]> }
    ]
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
    for (let i = 0; i < factories.length; i++) {
      cacheKey = cacheKey * prime + factories[i]._type
    }

    // Update the reverse mapping for cache cleaning
    const componentToCacheKeys = this.componentToCacheKeys
    for (let i = 0; i < factories.length; i++) {
      const factory = factories[i]
      const cache = componentToCacheKeys.get(factory._type)
      if (!cache) {
        componentToCacheKeys.set(factory._type, new Set([cacheKey]))
      }
      else {
        cache.add(cacheKey)
      }
    }

    let data: Array<unknown>

    // Query cached
    if (this.queryCache.has(cacheKey)) {
      data = [...this.queryCache.get(cacheKey)] as Array<
        [Entity, ...{ [K in keyof TFactories]: ComponentFactoryContent<TFactories[K]> }]
      >
    }

    // Query not cached
    else {
      // 1) Get the entities (ids) that have all queried factories
      const entities = this.getEntities(factories)

      // 2) Get the queried components from their factories
      const l = entities.length
      data = new Array(l)
      for (let i = 0; i < l; ++i) {
        const e = entities[i]
        data[i] = [e, ...this.getComponentsArrUnsafe(e, factories)]
      }

      this.queryCache.set(cacheKey, data)
    }

    return (
      [...data] as Array<
        [Entity, ...{ [K in keyof TFactories]: ComponentFactoryContent<TFactories[K]> }]
      >
    ).filter(o => !this.deactivated.has(o[0]))
  }

  /**
   * Returns the ids of the entities that have all the queried components
   * @param factories
   * @returns
   */
  public getEntities<T extends ReadonlyArray<ComponentFactory>>(factories: T): Entity[] {
    const arrOfKeys: number[][] = []
    for (let i = 0; i < factories.length; ++i) {
      const componentDataByType = this.data.get(factories[i]._type)
      if (!componentDataByType) {
        return []
      }
      arrOfKeys.push([...componentDataByType.keys()])
    }
    arrOfKeys.sort((a, b) => a.length - b.length)

    let entities = arrOfKeys[0]
    for (let i = 1; i < arrOfKeys.length; ++i) {
      entities = memoizedIntersection(entities, arrOfKeys[i])
    }

    const entitiesIds: number[] = []
    for (let i = 0; i < entities.length; i++) {
      entitiesIds[i] = Number(entities[i])
    }

    return entitiesIds
  }

  private cleanCache(factories: ComponentId[]) {
    const queryCache = this.queryCache
    const componentToCacheKeys = this.componentToCacheKeys
    for (let i = 0; i < factories.length; i++) {
      const cmpId = factories[i]
      if (componentToCacheKeys.has(cmpId)) {
        const cacheKeys = componentToCacheKeys.get(cmpId)!
        for (const key of cacheKeys) {
          queryCache.delete(key)
        }
        componentToCacheKeys.delete(cmpId)
      }
    }
  }

  private getComponentsArrUnsafe<T extends ReadonlyArray<ComponentFactory>>(
    entity: Entity,
    factories: T
  ): { [K in keyof T]: ComponentData<ComponentFactoryContent<T[K]>> | null } {
    const l = factories.length
    const cmps = new Array(l) as (ComponentData | null)[]
    const data = this.data
    for (let i = 0; i < l; ++i) {
      cmps[i] = data.get(factories[i]._type)!.get(entity)!
    }
    return cmps as any
  }
}

// #region Utils

/**
 * Fast intersection algorithm. Only works on sorted arrays.
 * @param array1
 * @param array2
 * @returns
 */
export function intersection(array1: number[], array2: number[]): number[] {
  array1.sort()
  array2.sort()
  // Don't destroy the original arrays
  const a = array1.slice(0).sort((x, y) => x - y)
  const b = array2.slice(0).sort((x, y) => x - y)
  const result: number[] = []
  while (a.length > 0 && b.length > 0) {
    if (a[0] < b[0]) {
      a.shift()
    }
    else if (a[0] > b[0]) {
      b.shift()
    }
    else {
      result.push(a.shift()!)
      b.shift()
    }
  }
  return result
}

const memoizedIntersection = memoize(intersection)

interface Mergeable {
  [key: string]: any
}

function isObject(item: unknown): item is object & Mergeable {
  return !!item && typeof item === 'object' && !Array.isArray(item)
}

export function mergeDeep(target: Mergeable, ...sources: (Mergeable | undefined)[]) {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (isObject(source[key])) {
          if (!target[key]) {
            Object.assign(target, { [key]: {} })
          }
          else {
            target[key] = Object.assign({}, target[key])
          }
          mergeDeep(target[key], source[key])
        }
        else if (Array.isArray(source[key])) {
          target[key] = [...source[key]]
        }
        else {
          target[key] = source[key]
        }
      }
    }
  }
  else if (Array.isArray(target) && Array.isArray(source)) {
    target.push(...source)
  }

  return mergeDeep(target, ...sources)
}

function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, any>()
  return ((...args: any[]) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    else {
      const result = fn(...args)
      cache.set(key, result)
      return result
    }
  }) as T
}

// #endregion Utils
