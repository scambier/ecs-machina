export type Entity = number
export type ComponentData<T = any> = T extends ComponentFactory
  ? never
  : { [K in keyof T]: T[K] } /*& { _type: ComponentId }*/
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
  private entityCounter = -1
  private componentFactoryId = -1

  private data: Record<ComponentId, Record<Entity, ComponentData>> = {}
  private queryCache: Record<string, any> = {}

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

  private cleanCache(factories: ComponentId[]) {
    // log('clean ' + factories)
    for (const cmpId of factories) {
      for (const key in this.queryCache) {
        const split = key.split('-')
        if (split.indexOf(cmpId.toString()) > -1) {
          // log('bust cache for ' + key)
          delete this.queryCache[key]
        }
      }
    }
  }

  public spawn(...components: ComponentData[]): Entity {
    const entity = ++this.entityCounter
    this.addComponents(entity, ...components)
    return entity
  }

  public destroy(entity: Entity): void {
    // log('destroy')
    for (const cmpId in this.data) {
      this.cleanCache([Number(cmpId)])
      delete this.data[cmpId][entity]
    }
  }

  public addComponents(entity: Entity, ...newComponents: ComponentData[]) {
    // log('addcmp')
    this.cleanCache(newComponents.map(c => c._type))
    for (let cmp of newComponents) {
      this.data[cmp._type][entity] = typeof cmp === 'function' ? cmp() : cmp
    }
  }

  public removeComponents(entity: Entity, ...components: ComponentFactory[]) {
    // log('remove')
    this.cleanCache(components.map(c => c._type))
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
   * @example world.getComponents(entity, [Position, Velocity])
   * @param entity
   * @param factories
   * @returns A sorted array of components
   */
  public getComponents<const T extends ReadonlyArray<ComponentFactory>>(
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
   * @example world.queryArr([Position, Rendering] as const)
   * @param factories
   * @returns
   */
  public query<const T extends ReadonlyArray<ComponentFactory>>(
    factories: T
  ): Array<[Entity, ...{ [K in keyof T]: ComponentFactoryContent<T[K]> }]> {
    const cacheKey = factories.map(f => f._type).join('-')
    const cache = this.queryCache[cacheKey]
    if (cache)
      return cache as Array<
        [Entity, ...{ [K in keyof T]: ComponentFactoryContent<T[K]> }]
      >

    // 1) Get the entities (ids) that have all queried factories
    const entities = this.getEntities(factories)

    // 2) Get the queried components from their factories
    const l = entities.length
    const data = new Array(l)
    for (let i = 0; i < l; ++i) {
      const e = entities[i]
      data[i] = [e, ...this.getComponentsArrUnsafe(e, factories)]
    }

    this.queryCache[cacheKey] = data
    return data as Array<
      [Entity, ...{ [K in keyof T]: ComponentFactoryContent<T[K]> }]
    >
  }

  public getEntities<T extends ReadonlyArray<ComponentFactory>>(
    factories: T
  ): Entity[] {
    const arrOfKeys = []
    let l = factories.length
    for (let i = 0; i < l; ++i) {
      arrOfKeys.push(Object.keys(this.data[factories[i]._type]))
    }
    arrOfKeys.sort((a, b) => a.length - b.length)

    let entities = arrOfKeys[0].sort()
    l = arrOfKeys.length
    for (let i = 1; i < l; ++i) {
      entities = intersection(entities.sort(), arrOfKeys[i].sort())
    }

    return entities.map(e => Number(e))
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
 * Fast iteration algorithm. Only works on sorted arrays.
 * @param array1
 * @param array2
 * @returns
 */
export function intersection<T>(array1: T[], array2: T[]): T[] {
  // Don't destroy the original arrays
  const a = array1.slice(0).sort()
  const b = array2.slice(0).sort()
  const result: T[] = []
  let aLast = a.length - 1
  let bLast = b.length - 1
  while (aLast >= 0 && bLast >= 0) {
    if (a[aLast] > b[bLast]) {
      a.pop()
      --aLast
    } else if (a[aLast] < b[bLast]) {
      b.pop()
      --bLast
    } /* they're equal */ else {
      result.push(a.pop()!)
      b.pop()
      --aLast
      --bLast
    }
  }
  return result
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
    i => ((dest as any)[i] = (source as any)[i])
  )
  return dest as T & U
}
