export type Entity = number
export type ComponentData<T = any> = T extends ComponentFactory
  ? never
  : { [K in keyof T]: T[K] } /* & { _type: string }*/
export type Inner<X> = X extends ComponentFactory<infer I> ? I : never

/**
 * The Component Factory, used to generate components of the same type
 */
export type ComponentFactory<T = any> = {
  (data?: T): ComponentData<T>
  _type: string
}

type ComponentId = string
type ComponentFactoryContent<T> = T extends ComponentFactory<infer U> ? U : T

let componentFactoryId = 0

/**
 * An abstract Component Factory, used to define a new type of Component.<br>
 * This pattern is inspired by https://github.com/jesstelford/pecs
 * @returns The Component Factory
 */
export function Component<T>(defaultData?: Partial<T>): ComponentFactory<T> {
  const cmpKey: ComponentId = (++componentFactoryId).toString()

  const fn: ComponentFactory<T> = function (data = {} as any) {
    const cmp = { _type: cmpKey }
    const copy = JSON.parse(JSON.stringify(defaultData ?? {}))
    assign(data, cmp)
    assign(copy, data)
    return copy
  }
  fn._type = cmpKey
  fn.toString = () => {
    return fn._type
  }
  return fn
}

function getTypes(items: ReadonlyArray<{ _type: string }>): string[] {
  const data: string[] = []
  for (const item of items) {
    data.push(item._type)
  }
  return data.sort()
}

export class World {
  private entityCounter = 0
  private entities: Record<string, ComponentData>[] = []
  private queryCache: Record<string, Entity[]> = {}

  private addToCache(entity: Entity, factoryIds: string[]) {
    for (const key in this.queryCache) {
      if (
        key
          .split("|")
          .every(
            (item) =>
              factoryIds.indexOf(item) > -1 &&
              this.queryCache[key].indexOf(entity) === -1
          )
      ) {
        this.queryCache[key].push(entity)
      }
    }
  }

  private removeFromCache(entity: Entity, factoryId?: string) {
    for (const key in this.queryCache) {
      const idx = this.queryCache[key].indexOf(entity)
      if (idx > -1) {
        if (factoryId) {
          if (key.indexOf(factoryId) > -1) {
            this.queryCache[key].splice(idx, 1)
          }
        } else {
          this.queryCache[key].splice(idx, 1)
        }
      }
    }
  }

  public spawn(...components: ComponentData[]): Entity {
    const entity = ++this.entityCounter
    this.entities[entity] = {}
    this.addComponents(entity, ...components)
    return entity
  }

  public destroy(entity: Entity): void {
    ;(this.entities[entity] as any) = undefined // Not a real delete, so we won't reuse this index
    this.removeFromCache(entity)
  }

  public addComponents(entity: Entity, ...newComponents: ComponentData[]) {
    const registered = Object.keys(this.entities[entity]).map(
      (k) => this.entities[entity][k]
    )
    const components = [...newComponents, ...registered]
    const types = getTypes([...components] as { _type: string }[])
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
    const cmps = [] as (ComponentData | null)[]
    for (const f of factories) {
      cmps.push(this.getComponent(entity, f))
    }
    return cmps as any
  }

  public getEntity(entity: Entity): Record<string, ComponentData<any>> | null {
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
    const data = []
    for (const e of entities) {
      data.push([e, ...this.getComponentsArr(e, factories)])
    }
    return data as Array<
      [Entity, ...{ [K in keyof T]: ComponentFactoryContent<T[K]> }]
    >
  }

  public getEntities<T extends ReadonlyArray<ComponentFactory>>(
    factories: T
  ): Entity[] {
    const types = getTypes([...factories])
    const cacheKey = types.join("|")
    let entities: Entity[] = []

    if (this.queryCache[cacheKey]?.length >= 0)
      entities = this.queryCache[cacheKey]
    else {
      entities = Object.keys(this.entities)
        .filter((entity) => {
          return types.every((type) =>
            this.entities[Number(entity)].hasOwnProperty(type)
          )
        })
        .map((e) => Number(e))
      this.queryCache[cacheKey] = entities
    }

    return entities
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
