# ECS-Machina

> A TypeScript Entity-Component-System Library

ECS-Machina is a library that helps you implement the "[Entity-Component-System](https://twitter.com/mikegeig/status/1070005894132449283)" pattern in your games.

## Installation

Follow the [Installation Guide](./guides/installation)

## Usage

Refer to the several other [Guides](./guides) on how to use ECS-Machina.

## World

The `World` class instance is used to create entities, bind them with components, and register systems. It is like a database holding references for all of these objects, and is responsible of updating them.

## Entities

Entities (`Entity`) are simple auto-incremented ids, saved as strings.

## Components

Components are plain old JavaScript objects, that must have a `_type` attribute. The `_type` is a Symbol discriminating the Component's type, and serves as a [type guard](https://basarat.gitbooks.io/typescript/docs/types/typeGuard.html#user-defined-type-guards).

### Writing the declaration of a Component

Efficiently declaring a Component can be done with those three elements:

- The interface, extending `BaseComponent`
- The `_type` value (a unique string)
- The type guard function

Example:

```ts
/**
 * The interface extends BaseComponent, so it implicitely has the `_type` attribute
 */
export interface TiledComponent extends BaseComponent {
  name?: string
  x: number
  y: number
  width: number
  height: number
}

/**
 * Take advantage of declaration merging to define the `_type` value
 */
export const TiledComponent = Symbol('TiledComponent')

/**
 * The type guard
 */
export function isTiledComponent(cmp: BaseComponent): cmp is TiledComponent {
  return cmp._type === TiledComponent
}

```

### Creating a Component

Since Components are simple objects, you just need to adhere to your previously declared interface.

```ts
import { TiledComponent } from './tiledComponent'

const tiled: TiledComponent = {
  _type: TiledComponent,
  name: 'enemy',
  x: 0,
  y: 0,
  width: 10,
  height: 10
}
```

## Systems

Each system can affect entities that own one or several specific components. For example, the "MovementSystem" will iterate through entities owning the "TiledComponent" (size and position) and the "RigidBodyComponent" (velocity)

Systems are classes that extend `System`. They have several callback methods that are called automatically during the system's lifetime. See the

### Example

```ts
class MovementSystem extends System {

  /**
   * This explicitely tells our System that it needs to iterate
   * on entities owning the components TiledComponent and RigidBodyComponent
   */
  public requiredComponents = [RigidBodyComponent, TiledComponent]

  /**
   * This is called at each tick, for each relevant entity
   */
  public updateEntity(ec: EntityComponent): void {
    console.log(`Updating entity ${ec.entity}`)

    const delta = getDeltaTimeForYourGame()

    // Since we know that our entityComponent owns the required components,
    // we can easily find them with type gards,
    // and use the non-null assertion operator (!)
    const tiled = ec.components.find(isTiledComponent)!
    const body = ec.components.find(isRigidBodyComponent)!

    tiled.x += body.vel.x * delta
    tiled.y += body.vel.y * delta
  }
}
```

## Using ECS-Machina in your project

[todo]