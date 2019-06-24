/**
 * The interface for all components.<br/>
 * It requires a `_type` attribute for typeguarding
 */
export interface BaseComponent {
  /**
   * Type guard attribute.<br/>
   * This value <i>must</i> be set to a unique string for each IComponent sub-type (hint: use a Symbol)
   */
  _type: symbol
}

export type ComponentType = symbol

/**
 * A simple alias to quickly find Entity uses with your IDE
 */
export type Entity = string

export type EntityComponent<T extends BaseComponent = BaseComponent> = {
  entity: Entity,
  components: T[]
}

export type Assemblage = ReadonlyArray<BaseComponent>
