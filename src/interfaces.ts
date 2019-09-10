/**
 * The interface for all components.<br/>
 * It requires a `_type` attribute for typeguarding
 */
export interface BaseComponent {
  /**
   * Type guard attribute.<br/>
   * This value <i>must</i> be set to a unique string for each IComponent sub-type
   */
  _type: string

  // [key: string]: any
}

/**
 * A simple alias to quickly find `Entity` uses with your IDE
 */
export type Entity = string

/**
 * A type containing an Entity and its Components
 */
export type EntityComponent = {
  entity: Entity,
  components: BaseComponent[]
}

