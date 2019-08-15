# Installation & Setup

## Installation

`npm install ecs-machina`

## Setup

ECS-Machina, by itself, does not do much. As its main goal is to manage your Entities through Systems and Components, you must integrate it into your game or engine.

### Create the World

The [`World`](./world) instance is the central point of ECS-Machina. It manages and maintains references to Entities, Components and Systems.

::: tip
The code snippets given in example are, of course, non functional. How exactly you will integrate ECS-Machina inside your game depends of your engine.
:::

```ts
import { World } from 'ecs-machina'

class MyGame {
  constructor() {
    this.world = new World()
  }
}

```

### Update the World

Now that your World is created, you need to keep it updated in your game loop. The World will update all the registered Systems, that will in turn update all their relevant Components.

How you will do this depends of course of your engine.

```ts
class MyGame {

  // This method is automatically called by your engine, 60 times per second
  update() {
    this.world.update()
  }
}
```

### Draw the World

Please refer to the [Systems guide](./system#draw-loop) on how to draw with your Systems.
