# World

[API documentation](https://scambier.github.io/ecs-machina/api/classes/world.html)

The World is the database of all Entities, Components and Systems. It is also the main interface to create and update all these objects.

:::tip TIP
Please refer to the [Installation & Setup](./installation) guide to know how to create the World.
:::

## Entities

### Create an Entity

`world.createEntity()` generates a new incremented id, and saves it inside the world.

```ts
const newEntity = world.createEntity() // newEntity = '1'
const otherEntity = world.createEntity() // otherEntity = '2'
```

#### Manually register an Entity

```ts
const customEntity: string = new guid()
world.registerEntity(customEntity)
```

:::warning
You cannot register the same entity twice.
:::

### Destroy an Entity

Destroying an Entity from the World will automatically destroy it from all its linked Systems.

```ts
world.destroyEntity(myEntity)
```

### Retrieve and find Entities

Retrieve the list of all Entities (as ids):

```ts
const entities: Entity[] = world.getEntities()
```

It can also sometimes be handy to filter Entities from a list of components:

```ts
import { BombComponent, ActiveComponent } from './components'
const entities: Entity[] = world.findEntities([BombComponent, ActiveComponent])
```

### Get the Components linked to an Entity

```ts
const assemblage: Assemblage = world.getComponents(myEntity)
```

:::tip TIP
Learn more about [Assemblages](./assemblage).
:::

### Add a Component to an Entity

Entities are nothing without attached Component. Adding a Component to an Entity will automatically add this Entity to all relevant Systems (if any).

```ts
const entityA = world.createEntity()
const entityB = world.createEntity()
const originalComponent = { /* ... */ }

const addedComponentA = world.addComponent(entityA, originalComponent)
const addedComponentB = world.addComponent(entityB, originalComponent)

// The returned components are deep copies of the original
assert(originalComponent !== addedComponentA)
assert(originalComponent !== addedComponentB)
assert(addedComponentA !== addedComponentB)
```

:::tip TIP
ECS-Machina will always make a deep copy of the Component _before_ linking it to an Entity. This allows you to reuse the "same" original Component's values for multiple Entities, without sharing the same object.
:::

### Remove a Component from an Entity

```ts
const originalComponent = { /* ... */ }
const addedComponent = world.addComponent(myEntity, originalComponent)
world.removeComponent(myEntity, addedComponent)
```

:::warning
Take note, from this example, that the removed component is `addedComponent` (and **not** `originalComponent`)
:::

## Systems

### Register a System

You _must_ register Systems inside your World. An unregistered System simply won't update. Once registered, your new System will automatically link itself to all relevant Entities.

```ts
const mySystem = new MySystem()
world.registerSystem(mySystem)
```

:::warning
You can only register one (1) instance of each System.
:::

### Remove a System

Removing a System will halt its update process. You can always re-register a previously removed System

```ts
world.removeSystem(mySystem)
```

### Get Systems

```ts
// Get all registered Systems
const allSystems: System[] = world.getSystems()

// Get the System instance corresponding to a System subclass
const mySystem = world.getSystem<MySystem>(MySystem)
```
