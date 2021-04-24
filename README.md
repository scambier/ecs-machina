[![Build Status](https://travis-ci.com/scambier/ecs-machina.svg?branch=master)](https://travis-ci.com/scambier/ecs-machina)
[![Coverage Status](https://coveralls.io/repos/github/scambier/ecs-machina/badge.svg?branch=master)](https://coveralls.io/github/scambier/ecs-machina?branch=master)
[![dependencies Status](https://david-dm.org/scambier/ecs-machina/status.svg)](https://david-dm.org/scambier/ecs-machina)
[![Maintainability](https://api.codeclimate.com/v1/badges/f9de2e47eb25a55a1503/maintainability)](https://codeclimate.com/github/scambier/ecs-machina/maintainability)

# ECS-Machina

> A TypeScript Entity-Component-System Library

## Installation

`npm install ecs-machina`

## Documentation

ECS-Machina is first and foremost a TypeScript library; it's meant to be used in TypeScript projects to take full advantage of its typing system.

### World

```ts
// Create a world to hold your entities and components
const world = new World();
```

### Components

```ts
/*
 * You must first declare your Components
 */

// With explicit types
const Position = Component<{ x: number; y: number }>();

// With default values, and implied types
const Velocity = Component({ dx: 0, dy: 0 }); 

// You can also declare "tag" Components that have no attributes
const IsMonster = Component(); 
```

### Entities

```ts
/*
 * Add Entities to your World
 */

// Without any component
const entityA = world.addEntity();

// With one or several components
const entityB = world.addEntity(
  Position({ x: 10, y: 25 }),
  Velocity({ x: 0, y: 1 })
);

// With the default values
const entityB = world.addEntity(Position(), Velocity());
```

### Queries & Systems

```ts
// A System is a simple function that takes the world as a parameter
function movementSystem(world: World) {
  const entities = world.query(Position, Velocity)
  for (const [e, pos, vel] of entities) {
    console.log(`Moving entity ${e}`)

    // Component instances are correctly typed for efficient auto-completion
    pos.x += vel.dx 
    pos.y += vel.dy
  }
}

function attackSystem(world: World){
  /* ... */
}

// Call `runSystems` to execute Systems within your World context
world.runSystems(movementSystem, attackSystem)
```

## Philosophy and goals

### TypeScript First

Games built with an ECS engine have a lot of different components and systems. Strong typings (and efficient autocompletion) is an essential feature to not get lost in your own code.

### Code reusability

We have a strong decoupling between the World, the Components, and the Systems. The goal is to let you write code that you can truly reuse throughout your projects.

### Fast systems

The `world.query()` function has an efficient and transparent caching system, to provide the fastest iteration speed possible.

The trade-off is that adding/removing/updating entity is relatively slower, because the cache will be updated in real-time.

### Strong unit tests

This is a work-in-progress (as ECS-Machina itself is under development), but we aim for 100% of code coverage.