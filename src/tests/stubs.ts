import { BaseComponent } from '../interfaces'
import { System } from '../system'

// Component A
export interface SubComponentA extends BaseComponent { }
export const SubComponentA = 'subComponentA'
export const subComponentA: SubComponentA = {
  _type: SubComponentA
}

// Component B
export interface SubComponentB extends BaseComponent { }
export const SubComponentB = 'subComponentB'
export const subComponentB: SubComponentB = {
  _type: SubComponentB
}

// Systems
export class SubSystemA extends System {
  public requiredComponents = [SubComponentA]
}

export class SubSystemB extends System {
  public requiredComponents = [SubComponentB]
}

// Entities
export const entityA = 'A'
export const entityB = 'B'
