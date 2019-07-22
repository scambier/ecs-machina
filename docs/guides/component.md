# Component

Components are the data of your game. They are "blocks" of related fields, on which the Systems will act. They are simple JavaScript objects that must implement the `BaseComponent` interface. This interface makes sure that all your Components have a `_type` property.

## The `_type`'s role

Components are simple JavaScript objects, which allow us to easily de/serialize them from/to JSON. But since Components are nothing more than objects (not class instances), ECS Machina uses the `_type` property to differentiate them.

## Define a Component

Efficiently declaring a Component can be done with those three elements:

- The interface, extending `BaseComponent`
- The `_type` value (a unique string)
- The type guard function

Example:

```ts
import { BaseComponent } from 'ecs-machina'

/**
 * The interface extends BaseComponent, so it implicitely has the `_type` attribute
 */
export interface BoxComponent extends BaseComponent {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Take advantage of declaration merging to define the `_type` value
 */
export const BoxComponent = 'BoxComponent'

/**
 * Type guard for BoxComponent
 */
export function isBoxComponent(cmp: BaseComponent): cmp is BoxComponent {
  return cmp._type === BoxComponent
}
```

:::tip TIP
Noticed how the `interface` and the `const` both have the same name (`BoxComponent`)?

It's a unique feature from TypeScript called "[Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)", that allows us to interchangeably use the same "name" as a value or a type, depending on the context.
:::

:::tip TIP
Even though the type guard is not really required, it can be quite useful. For example:

```ts
const componentsList: BaseComponent[] = [/**/]
const component = componentsList.find(isBoxComponent)
// component is automatically typed as `BoxComponent | undefined`
```

:::

## Create a Component

Since Components are simple objects, you just need to adhere to your previously declared interface.

```ts
import { BoxComponent } from './BoxComponent'

const tiled: BoxComponent = {
  _type: BoxComponent,
  x: 0,
  y: 0,
  width: 10,
  height: 10
}
```
