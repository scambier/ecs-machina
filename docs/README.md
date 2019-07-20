# ECS-Machina

> A TypeScript Entity-Component-System Library

ECS-Machina is a library that helps you implement the "[Entity-Component-System](https://twitter.com/mikegeig/status/1070005894132449283)" pattern in your games.

## Installation

Follow the [Installation Guide](./guides/installation)

## Usage

Refer to the several other [Guides](./guides) on how to use ECS-Machina.

## World

The [`World`](./guides/world) class instance is used to create entities, bind them with components, and register systems. It is like a database holding references for all of these objects, and is responsible of updating them.

## Entities

[**Entities**](./guides/entity) are simple auto-incremented ids, saved as strings.

## Components

[**Components**](./guides/component) are the data of your game, and are aggregated around Entities

## Systems

Each system can affect entities that own one or several specific components. For example, the "MovementSystem" will iterate through entities owning the "BoxComponent" (size and position) and the "RigidBodyComponent" (velocity)

Systems are classes that extend [`System`](./guides/system). They have several callback methods that are called automatically during the system's lifetime. See the

### Example

```ts
class MovementSystem extends System {

  /**
   * This explicitely tells our System that it needs to iterate
   * on entities owning the components BoxComponent and RigidBodyComponent
   */
  public requiredComponents = [RigidBodyComponent, BoxComponent]

  /**
   * This is called at each tick, for each relevant entity
   */
  public updateEntity(ec: EntityComponent): void {
    console.log(`Updating entity ${ec.entity}`)

    const delta = getDeltaTimeForYourGame()

    // Since we know that our entityComponent owns the required components,
    // we can easily find them with type gards,
    // and use the non-null assertion operator (!)
    const tiled = ec.components.find(isBoxComponent)!
    const body = ec.components.find(isRigidBodyComponent)!

    tiled.x += body.vel.x * delta
    tiled.y += body.vel.y * delta
  }
}
```
