# System

[API documentation](../api/classes/system.html)

Systems are where you write the logic of your game, to read (& write) your components, and act accordingly.

## Create a System

```ts
import { isRigidBodyComponent, isTiledComponent, RigidBodyComponent, TiledComponent } from '../components'
import { EntityComponent, System } from 'ecs-machina'
import { ig } from '../ig'
const log = require('debug')('squared:movingSystem')

export class MovingSystem extends System {

  // This property tells our System which Entities to update.
  // In this case, it will update all Entities that
  // own a RigidBodyComponent AND a TiledComponent
  public requiredComponents = [RigidBodyComponent, TiledComponent]

  /**
   * Updates the tiledComponent's coordinates
   * according to rigidBodyComponent's velocity
   */
  public updateEntity(ec: EntityComponent): void {
    const delta = ig.game.deltaTime
    const tiled = ec.components.find(isTiledComponent)!
    const body = ec.components.find(isRigidBodyComponent)!

    tiled.x += body.vel.x * delta
    tiled.y += body.vel.y * delta
  }
}
```

## Update loop

Systems updates are automatically called within the `world.update()` method, in the same order they were [registered](./world#register-a-system). You don't need to call them manually.

### Update methods

Three methods are called during the update loop:

- `beforeUpdate()`, at the beginning of each update
- `updateEntity(entityComponent: EntityComponent)`, for each Entity linked to your System
- `afterUpdate()`, once that all Entities have been updated

## Draw loop

Once your Components have been updated, you still have to draw them on screen. ECS Machina being as agnostic as possible, you'll have to do a bit of work to tell it how to draw in *your* game.

### Draw methods

Each system has a `draw(options = {})` method that you must call yourself. This `draw()` method will in turn call back three other methods, similar to those of the update loop:

- `beforeDraw()`
- `drawEntity(entityComponent: EntityComponent, options = {})`
- `afterDraw()`

As an example, here's roughly how it works in [Squared](https://github.com/scambier/squared-engine):

```ts
class MyGame {

  draw() {
    this.clearScreen()

    // Loop through layers
    for (const layer of this.level.layers) {

      // Draw the layer's background
      layer.draw()

      // Draw entities for the current layer
      for (const system of ig.world.getSystems()) {
        system.draw({ layerName: layer.name })
      }
    }

    // Draw entities without layer
    for (const system of ig.world.getSystems()) {
      system.draw()
    }
  }
}
```

And here's the `debugSystem.drawEntity()` implementation (it draws a red square around the Entity):

```ts
import { EntityComponent, System } from 'ecs-machina'
import { DebugComponent, isDebugComponent, isTiledComponent, TiledComponent } from '../components'
import { ig } from '../ig'

export class DebugSystem extends System {
  public requiredComponents = [DebugComponent, TiledComponent]

  public drawEntity(ec: EntityComponent): void {
    const debug = ec.components.find(isDebugComponent)!
    const tiled = ec.components.find(isTiledComponent)!
    const scale = ig.game.scale

    const ctx = ig.game.ctx
    const adj = 0
    ctx.globalAlpha = 1
    ctx.strokeStyle = debug.borderColor ? debug.borderColor : 'red'
    ctx.lineWidth = debug.borderWidth || 1
    ctx.strokeRect(
      ig.game.getDrawPos(Math.round(tiled.x) - ig.game.screen.x) + adj,
      ig.game.getDrawPos(Math.round(tiled.y) - ig.game.screen.y) + adj,
      tiled.width * scale - adj * 2,
      tiled.height * scale - adj * 2
    )
  }
}
```
