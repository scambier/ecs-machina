> ## [ECS-Machina documentation](README.md)

[Globals](globals.md) /

# ECS-Machina documentation

### Index

#### Classes

* [System](classes/system.md)
* [World](classes/world.md)

#### Interfaces

* [BaseComponent](interfaces/basecomponent.md)

#### Type aliases

* [Assemblage](globals.md#assemblage)
* [ComponentType](globals.md#componenttype)
* [Entity](globals.md#entity)
* [EntityComponent](globals.md#entitycomponent)

#### Functions

* [arrayContainsArray](globals.md#arraycontainsarray)

## Type aliases

###  Assemblage

Ƭ **Assemblage**: *`ReadonlyArray<BaseComponent>`*

*Defined in [interfaces.ts:25](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/interfaces.ts#L25)*

___

###  ComponentType

Ƭ **ComponentType**: *symbol*

*Defined in [interfaces.ts:13](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/interfaces.ts#L13)*

___

###  Entity

Ƭ **Entity**: *string*

*Defined in [interfaces.ts:18](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/interfaces.ts#L18)*

A simple alias to quickly find Entity uses with your IDE

___

###  EntityComponent

Ƭ **EntityComponent**: *object*

*Defined in [interfaces.ts:20](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/interfaces.ts#L20)*

#### Type declaration:

___

## Functions

###  arrayContainsArray

▸ **arrayContainsArray**<**T**>(`superset`: `T`[], `subset`: `T`[]): *boolean*

*Defined in [utils.ts:5](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/utils.ts#L5)*

Returns TRUE if the first specified array contains all elements
from the second one. FALSE otherwise.

**Type parameters:**

■` T`

**Parameters:**

Name | Type |
------ | ------ |
`superset` | `T`[] |
`subset` | `T`[] |

**Returns:** *boolean*

___