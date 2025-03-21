[![Coverage Status](https://coveralls.io/repos/github/scambier/ecs-machina/badge.svg?branch=master)](https://coveralls.io/github/scambier/ecs-machina?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/f9de2e47eb25a55a1503/maintainability)](https://codeclimate.com/github/scambier/ecs-machina/maintainability)

# ECS-Machina

> A zero-dependency TypeScript Entity-Component-System Library

ECS-Machina is a strongly typed ECS library. It was first built for use in TIC-80, so it can be drag-n-dropped into any TypeScript project.

It's also certainly not the fastest ECS library out there, but it's simple, easy to understand, and has no dependencies. It should be enough for most small projects.

## Installation

```
npm install ecs-machina
```

Or just drop `src/index.ts` into your TIC-80 project, and rename it to e.g. `ecs.ts`.
See [tic80-typescript](https://github.com/scambier/tic80-typescript) for more information on how to use TIC-80 with TypeScript.

## Documentation

### World

The World holds your components and entities. You use it to declare component factories, spawn entities, and add or remove components.

```ts
// Create a world to hold your entities and components
const world = new World()
```

### Components

Components in ECS-Machina must be created through Component Factories.

Component Factories are strongly typed constructors, and declared like `const Factory = Component<YourType>()`. Those factories are then used to create new components and to query the world.

```ts
// Create a strongly typed factory
const Position = Component<{ x: number; y: number }>()

// With default values
const Velocity = Component({ dx: 0, dy: 0 })

// You can also declare "tagging" factories that have no attributes
const IsMonster = Component()
```

Once a factory is declared, you use it to create a component

```ts
const position = Position({ x: 5, y: 10 })
```

> [!TIP]
> Once you have your World and Components, use code completion on `world.` to see all available methods to create/query/update/destroy entities and their components.

### Entities

Entities bind components together. By itself, an entity is nothing more than a reference id.

```ts
/*
 * Add Entities to your World
 */

// Without any component
const entityA = world.spawn()

// With one or several components
const entityB = world.spawn(
  Position({ x: 10, y: 25 }),
  Velocity({ x: 0, y: 1 })
)

// Or with the default values, if components provide them
const entityC = world.spawn(Position())
```

#### Add and remove components

```ts
world.setComponents(entity, Position({ x: 12, y: 21 }))
world.removeComponents(entity, Velocity, Tag)
```

### Queries & updates

Get components of a specific entity:

```ts
const [pos, vel] = world.getComponents(entity, [Position, Velocity])
```

Get all entities that match a set of components, and update those components:

```ts
const entities = world.query([Position, Velocity])
for (const [id, pos, vel] of entities) {
  // The entity id is always returned
  console.log(`Moving entity ${id}`)

  // Update the position
  pos.x += vel.dx
  pos.y += vel.dy
}
```

## Philosophy and goals

### TypeScript First

Games built with an ECS engine have a lot of different components and systems. Strong typings (and efficient autocompletion) is an essential feature to not get lost in your own code.

### Strong unit tests

This is a work-in-progress (as ECS-Machina itself is under development), but we aim for 100% of code coverage.

### Credits

This library was inspired by [PECS](https://github.com/jesstelford/pecs), a PICO-8 ECS library.
