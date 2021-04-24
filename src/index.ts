export type Entity = string
export type ComponentData<T = any> = { [K in keyof T]: T[K] }/* & { _type: string }*/
export type Inner<X> = X extends ComponentFactory<infer I> ? I : never;

/**
 * The Component Factory, used to generate components of the same type
 */
export type ComponentFactory<T = any> = { (data: T): ComponentData<T>; _type: string }

type ComponentId = string
type ComponentFactoryContent<T> = T extends ComponentFactory<infer U> ? U : T

let componentFactoryId = 0

/**
 * An abstract Component Factory, used to define a new type of Component.<br>
 * This pattern is inspired by https://github.com/jesstelford/pecs
 * @returns The Component Factory
 */
export function Component<T>(defaultData?: Partial<T>): ComponentFactory<T> {
  const cmpKey: ComponentId = 'cmp_' + (++componentFactoryId).toString()

  const fn: ComponentFactory<T> = function(data) {
    const cmp = { _type: cmpKey };
    const copy = JSON.parse(JSON.stringify(defaultData ?? {}))
    Object.assign(data, cmp);
    Object.assign(copy, data);
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
  data.sort()
  return data.sort()
}

export class World {
  private entityCounter = 0
  private entities: Record<Entity, Record<string, ComponentData>> = {} // No Map in es5
  private queryCache: Record<string, Entity[]> = {}

  private addToCache(entity: Entity, factoryIds: string[]) {
    for (const key in this.queryCache) {
      if (key.split('|').every(item => factoryIds.indexOf(item) > -1 && this.queryCache[key].indexOf(entity) === -1)) {
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
        }
        else {
          this.queryCache[key].splice(idx, 1)
        }
      }
    }
  }

  public addEntity(...components: ComponentData[]): Entity {
    const entity = 'ent_' + (++this.entityCounter).toString()
    this.entities[entity] = {}
    this.addComponents(entity, ...components)
    return entity
  }

  public removeEntity(entity: Entity): void {
    delete this.entities[entity]
    this.removeFromCache(entity)
  }

  public addComponents(entity: Entity, ...newComponents: ComponentData[]) {
    const registered = Object.keys(this.entities[entity]).map(k => this.entities[entity][k])
    const components = [...newComponents, ...registered]
    const types = getTypes([...components] as { _type: string }[])
    this.addToCache(entity, types)
    for (const cmp of components) {
      this.entities[entity][cmp._type] = cmp
    }
  }

  public removeComponents(entity: Entity, ...components: { _type: string }[]) {
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
  public getComponent<T>(entity: Entity, factory: ComponentFactory<T>): ComponentData<T> | null {
    return this.entities[entity][factory._type] ?? null
  }

  public hasComponents<T extends ReadonlyArray<ComponentFactory>>(entity: Entity, ...factories: T): boolean {
    for (const f of factories) {
      if (!this.getComponent(entity, f)) return false
    }
    return true
  }

  /**
   * Returns several components of an entity
   * @param entity
   * @param factories
   * @returns An array of components
   */
  public getComponents<T extends ReadonlyArray<ComponentFactory>>(entity: Entity, ...factories: T): { [K in keyof T]: ComponentData<ComponentFactoryContent<T[K]>> } {
    const cmps = [] as ComponentData[]
    for (const f of factories) {
      cmps.push(this.getComponent(entity, f)!)
    }
    return cmps as any
  }

  public getEntity(entity: Entity): Record<string, ComponentData<any>> {
    return this.entities[entity]
  }

  /**
   * Returns the entity id and its entities.<br>
   * The query results are cached, and the cache is updated with added/removed entities/components
   * @param factories
   * @returns
   */
  public query<T extends ReadonlyArray<ComponentFactory>>(...factories: T): Array<[string, ...{ [K in keyof T]: ComponentFactoryContent<T[K]> }]> {
    // 1) Get the entities (ids) that have all queried factories
    const entities = this.getEntities(factories)

    // 2) Get the queried components from their factories
    const data = []
    for (const e of entities) {
      data.push([e, ...this.getComponents(e, ...factories)])
    }
    return data as Array<[string, ...{ [K in keyof T]: ComponentFactoryContent<T[K]> }]>
  }

  public getEntities<T extends ReadonlyArray<ComponentFactory>>(factories: T): Entity[] {
    const types = getTypes([...factories])
    const cacheKey = types.join('|')
    let entities: Entity[] = []

    if (this.queryCache[cacheKey]?.length >= 0) entities = this.queryCache[cacheKey]
    else {
      entities = Object.keys(this.entities).filter((entity) => {
        return types.every(type => this.entities[entity].hasOwnProperty(type))
      })
    }
    this.queryCache[cacheKey] = entities

    return entities
  }

  /**
   * Executes systems on this world
   * @param systems
   */
  public runSystems(...systems: Array<(world: World) => void>) {
    for (const system of systems) {
      system(this)
    }
  }

}
