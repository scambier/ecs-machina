/**
 * The interface for all components.
 * It forces a `_type` attribute for typeguarding
 */
export interface BaseComponent {
  /**
   * Type guard attribute.<br/>
   * This value <i>must</i> be set to a unique string for each IComponent sub-type
   */
  _type: string
}

export type ECSEntity = string

export type EntityComponent<T extends BaseComponent = BaseComponent> = {
  entity: ECSEntity,
  components: T[]
}

export type Assemblage = ReadonlyArray<BaseComponent>
