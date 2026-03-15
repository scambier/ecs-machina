/* eslint-disable */
export type Entity = number
export type ComponentData<T = any> = T extends ComponentFactory
  ? { _cmpId: ComponentId }
  : { [K in keyof T]: T[K] } & { _cmpId: ComponentId }
export type Inner<X> = X extends ComponentFactory<infer I> ? I : never

type ComponentId = number
type ComponentFactoryContent<T> = T extends ComponentFactory<infer U> ? U : T

const uniqueNames = new Set<string>()

/**
 * The Component Factory, used to generate components of the same type
 */
export type ComponentFactory<T = any> = {
  (data?: Partial<T>): ComponentData<T>
  _cmpId: ComponentId
  _cmpName: string
}

let componentFactoryId = 0
/**
 * Creates a new component factory
 *
 * @example const Position = world.Component({ x: 0, y: 0 })
 * @param defaultData Optional default data for the component
 * @returns
 */
export function Component<T extends Dict>(
  cmpName: string,
  defaultData: T
): ComponentFactory<T> {
  if (uniqueNames.has(cmpName)) {
    console && console.warn && console.warn(`Component name "${cmpName}" is already used`)
  }
  uniqueNames.add(cmpName)

  const cmpKey: ComponentId = ++componentFactoryId

  const fn: ComponentFactory<T> = function (data = {} as any) {
    const copy = mergeDeep(isObject(data) ? {} : [], defaultData, data)
    ;(copy as any)._cmpId = cmpKey
    ;(copy as any)._cmpName = cmpName
    return copy as ComponentData<T>
  }
  fn._cmpId = cmpKey
  fn._cmpName = cmpName
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
  public spawn(components: ComponentData[] = []): Entity {
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
    const data = this.data

    const typesToClean = []
    for (let cmp of components) {
      cmp = typeof cmp === 'function' ? (cmp as any)() : cmp
      if (!data.has(cmp._cmpId)) data.set(cmp._cmpId, new Map())

      // If the entity doesn't have the component,
      // add it and flag it for cache clean
      if (!this.hasComponent(entity, cmp)) {
        typesToClean.push(cmp._cmpId)
        data.get(cmp._cmpId)!.set(entity, cmp)
        continue
      }

      // If the entity already has the component,
      // update its fields (and don't bust the cache)
      const og = data.get(cmp._cmpId)?.get(entity)
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
      types[i] = components[i]._cmpId
    }
    this.cleanCache(types)
    for (const cmp of components) {
      data.get(cmp._cmpId)?.delete(entity)
    }
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
    return this.data.get(factory._cmpId)?.get(entity) as ComponentData<T>
  }

  public queryComponent<T>(
    entity: Entity,
    factory: ComponentFactory<T>
  ): ComponentData<T> | undefined {
    return this.getComponent(entity, factory)
  }

  public hasComponent(entity: Entity, factory: { _cmpId: number }): boolean {
    return !!this.data.get(factory._cmpId)?.has(entity)
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
  ): [
    Entity,
    ...{ [K in keyof TFactories]: ComponentFactoryContent<TFactories[K]> | undefined },
  ] {
    const l = factories.length
    const cmps = []
    cmps[0] = entity
    for (let i = 0; i < l; ++i) {
      cmps[i + 1] = this.getComponent(entity, factories[i])
    }
    return cmps as [
      Entity,
      ...{ [K in keyof TFactories]: ComponentFactoryContent<TFactories[K]> | undefined },
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
    const cmps = []
    cmps[0] = entity
    for (let i = 0; i < l; ++i) {
      cmps[i + 1] = this.getComponent(entity, factories[i])
    }
    return cmps as [
      Entity,
      ...{ [K in keyof TFactories]: ComponentFactoryContent<TFactories[K]> },
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
  ): Array<
    [Entity, ...{ [K in keyof TFactories]: ComponentFactoryContent<TFactories[K]> }]
  > {
    let cacheKey = 0
    const prime = 31 // Small prime for hashing

    // Compute the cache key
    for (let i = 0; i < factories.length; i++) {
      cacheKey = cacheKey * prime + factories[i]._cmpId
    }

    let data = this.queryCache.get(cacheKey) as
      | Array<
          [Entity, ...{ [K in keyof TFactories]: ComponentFactoryContent<TFactories[K]> }]
        >
      | undefined

    // Query not cached
    if (!data) {
      // 1) Get the entities (ids) that have all queried factories
      const entities = this.getEntities(factories)

      // 2) Get the queried components from their factories
      const l = entities.length
      data = []
      for (let i = 0; i < l; ++i) {
        const e = entities[i]
        data[i] = [e, ...this.getComponentsArrUnsafe(e, factories)] as [
          Entity,
          ...{ [K in keyof TFactories]: ComponentFactoryContent<TFactories[K]> },
        ]
      }

      // Update reverse mapping only when a cache entry is created
      const componentToCacheKeys = this.componentToCacheKeys
      for (let i = 0; i < factories.length; i++) {
        const factory = factories[i]
        const cache = componentToCacheKeys.get(factory._cmpId)
        if (!cache) {
          componentToCacheKeys.set(factory._cmpId, new Set([cacheKey]))
        } else {
          cache.add(cacheKey)
        }
      }

      this.queryCache.set(cacheKey, data)
    }

    if (this.deactivated.size === 0) {
      return data
    }

    const filtered: Array<
      [Entity, ...{ [K in keyof TFactories]: ComponentFactoryContent<TFactories[K]> }]
    > = []
    for (let i = 0; i < data.length; i++) {
      const entry = data[i]
      if (!this.deactivated.has(entry[0])) {
        filtered.push(entry)
      }
    }

    return filtered
  }

  /**
   * Returns the ids of the entities that have all the queried components
   * @param factories
   * @returns
   */
  public getEntities<T extends ReadonlyArray<ComponentFactory>>(factories: T): Entity[] {
    const l = factories.length
    if (l === 0) {
      return []
    }

    const maps = [] as Map<Entity, ComponentData>[]
    let smallestMap: Map<Entity, ComponentData> | null = null

    for (let i = 0; i < l; ++i) {
      const componentDataByType = this.data.get(factories[i]._cmpId)
      if (!componentDataByType) {
        return []
      }

      maps[i] = componentDataByType
      if (!smallestMap || componentDataByType.size < smallestMap.size) {
        smallestMap = componentDataByType
      }
    }

    if (!smallestMap || smallestMap.size === 0) {
      return []
    }

    const entitiesIds: number[] = []
    for (const entity of smallestMap.keys()) {
      let hasAllComponents = true

      for (let i = 0; i < l; ++i) {
        const componentMap = maps[i]
        if (componentMap === smallestMap) {
          continue
        }

        if (!componentMap.has(entity)) {
          hasAllComponents = false
          break
        }
      }

      if (hasAllComponents) {
        entitiesIds.push(entity)
      }
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
  ): { [K in keyof T]: ComponentData<ComponentFactoryContent<T[K]>> } {
    const l = factories.length
    const cmps = [] as ComponentData[]
    const data = this.data
    for (let i = 0; i < l; ++i) {
      cmps[i] = data.get(factories[i]._cmpId)!.get(entity)!
    }
    return cmps as any
  }
}

// #region Utils

interface Dict {
  [key: string]: any
}

function isLuaRuntime(): boolean {
  return typeof (globalThis as { type?: unknown }).type === 'function'
}

function getRuntimeType(value: unknown): string {
  return typeof value
}

function isTable(item: unknown): item is object & Dict {
  if (item === null) {
    return false
  }

  const itemType = getRuntimeType(item)
  return itemType === 'object'
}

function isArrayLikeTable(item: unknown): item is unknown[] {
  if (!isLuaRuntime() && Array.isArray(item)) {
    return true
  }

  if (!isTable(item)) {
    return false
  }

  let hasAnyKey = false
  for (const key in item) {
    hasAnyKey = true
    const numericKey = Number(key as unknown)
    if (Number.isNaN(numericKey) || numericKey !== (key as unknown as number)) {
      return false
    }
  }

  if (!hasAnyKey) {
    return false
  }

  return hasAnyKey
}

function isObject(item: unknown): item is object & Dict {
  return isTable(item) && !isArrayLikeTable(item)
}

export function mergeDeep(target: Dict, ...sources: Dict[]) {
  const targetIsObject = isObject(target)
  const targetIsArrayLike = isArrayLikeTable(target)

  for (let i = 0; i < sources.length; i++) {
    const source = sources[i]
    if (!source) {
      continue
    }

    if (targetIsObject && isObject(source)) {
      for (const key in source) {
        const sourceValue = source[key]

        if (isObject(sourceValue)) {
          const targetValue = target[key]
          const nextTarget = isObject(targetValue) ? targetValue : {}
          target[key] = nextTarget
          mergeDeep(nextTarget, sourceValue)
        } else if (isArrayLikeTable(sourceValue)) {
          target[key] = [...sourceValue]
        } else {
          target[key] = sourceValue
        }
      }
    } else if (targetIsArrayLike && isArrayLikeTable(source)) {
      for (let j = 0; j < source.length; j++) {
        target.push(source[j])
      }
    }
  }

  return target
}

// #endregion Utils
