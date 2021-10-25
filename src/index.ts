export type Entity = number
export type ComponentData<T = any> = T extends ComponentFactory
  ? never
  : { [K in keyof T]: T[K] }
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

let componentFactoryId = -1

/**
 * An abstract Component Factory, used to define a new type of Component.<br>
 * This pattern is inspired by https://github.com/jesstelford/pecs
 * @returns The Component Factory
 */
export function Component<T>(defaultData?: Partial<T>): ComponentFactory<T> {
  const cmpKey: ComponentId = ++componentFactoryId

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

export class World {
  private entityCounter = -1
  private entities: Array<ComponentData[]> = new Array(5000)
  private queryCache: Record<
    number,
    { types: ComponentId[]; entities: Entity[] }
  > = {}

  private addToCache(entity: Entity, factoryIds: ComponentId[]) {
    for (const key in this.queryCache) {
      if (
        this.queryCache[key].types.every(
          (item) =>
            factoryIds.indexOf(item) > -1 &&
            this.queryCache[key].entities.indexOf(entity) === -1
        )
      ) {
        this.queryCache[key].entities.push(entity)
      }
    }
  }

  private removeFromCache(entity: Entity, factoryId?: ComponentId) {
    for (const key in this.queryCache) {
      const idx = this.queryCache[key].entities.indexOf(entity)
      if (idx > -1) {
        if (factoryId) {
          if (this.queryCache[key].types.indexOf(factoryId) > -1) {
            this.queryCache[key].entities.splice(idx, 1)
          }
        } else {
          this.queryCache[key].entities.splice(idx, 1)
        }
      }
    }
  }

  public spawn(...components: ComponentData[]): Entity {
    const entity = ++this.entityCounter
    this.entities[entity] = []
    this.addComponents(entity, ...components)
    return entity
  }

  public destroy(entity: Entity): void {
    ;(this.entities[entity] as any) = undefined // Not a real delete, so we won't reuse this index
    this.removeFromCache(entity)
  }

  public addComponents(entity: Entity, ...newComponents: ComponentData[]) {
    if (!this.entities[entity])
      throw new Error(`Entity ${entity} does not exist`)

    const registered = Object.keys(this.entities[entity]).map(
      (k) => this.entities[entity][Number(k)]
    )
    const components = [...newComponents, ...registered]
    const types = getTypes([...components] as { _type: ComponentId }[])
    this.addToCache(entity, types)
    for (const cmp of components) {
      this.entities[entity][cmp._type] = typeof cmp === "function" ? cmp() : cmp
    }
  }

  public removeComponents(entity: Entity, ...components: ComponentFactory[]) {
    for (const cmp of components) {
      delete this.entities[entity][cmp._type]
      this.removeFromCache(entity, cmp._type)
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
    return (this.entities[entity][factory._type] as ComponentData<T>) ?? null
  }

  public hasComponents<T extends ReadonlyArray<ComponentFactory>>(
    entity: Entity,
    ...factories: T
  ): boolean {
    for (const f of factories) {
      if (!this.getComponent(entity, f)) return false
    }
    return true
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
    const cmps = new Array(factories.length) as (ComponentData | null)[]
    for (let i = 0; i < factories.length; ++i) {
      cmps[i] = this.getComponent(entity, factories[i])
    }
    return cmps as any
  }

  public getEntity(
    entity: Entity
  ): Record<ComponentId, ComponentData<any>> | null {
    return this.entities[entity]
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
      data[i] = [e, ...this.getComponentsArr(e, factories)]
    }
    return data as Array<
      [Entity, ...{ [K in keyof T]: ComponentFactoryContent<T[K]> }]
    >
  }

  public getEntities<T extends ReadonlyArray<ComponentFactory>>(
    factories: T
  ): Entity[] {
    const types = getTypes(factories)
    const cacheKey = hashCode(types)

    if (this.queryCache[cacheKey]) {
      return this.queryCache[cacheKey].entities
    } else {
      const entities = []
      let a = -1
      for (let e = 0; e <= this.entityCounter; ++e) {
        if (types.every((type) => !!this.entities[e]?.[type])) {
          entities[++a] = e
        }
      }
      this.queryCache[cacheKey] = { entities, types }
      return entities
    }
  }
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

function getTypes(items: ReadonlyArray<{ _type: ComponentId }>): ComponentId[] {
  const l = items.length
  const data: ComponentId[] = new Array(l)
  for (let i = 0; i < l; ++i) {
    data[i] = items[i]._type
  }
  return data
}

function hashCode(values: number[]) {
  let result = 1
  const l = values.length
  for (let i = 0; i < l; ++i) {
    const elem = values[i]
    result = 31 * result + elem
  }
  return result
}
