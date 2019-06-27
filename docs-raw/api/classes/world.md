> ## [ECS-Machina documentation](../README.md)

[Globals](../globals.md) / [World](world.md) /

# Class: World

## Hierarchy

* **World**

### Index

#### Properties

* [entities](world.md#entities)

#### Methods

* [addComponent](world.md#addcomponent)
* [createEntity](world.md#createentity)
* [destroyEntity](world.md#destroyentity)
* [findEntities](world.md#findentities)
* [getComponents](world.md#getcomponents)
* [getEntities](world.md#getentities)
* [getSystem](world.md#getsystem)
* [getSystems](world.md#getsystems)
* [registerEntity](world.md#registerentity)
* [registerSystem](world.md#registersystem)
* [removeComponent](world.md#removecomponent)
* [removeSystem](world.md#removesystem)
* [update](world.md#update)

## Properties

###  entities

● **entities**: *object*

*Defined in [world.ts:11](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/world.ts#L11)*

#### Type declaration:

___

## Methods

###  addComponent

▸ **addComponent**(`entity`: [Entity](../globals.md#entity), `component`: [BaseComponent](../interfaces/basecomponent.md)): *[BaseComponent](../interfaces/basecomponent.md)*

*Defined in [world.ts:90](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/world.ts#L90)*

Links a component to an entity. If a component of the same type has already
been added, the properties of the new one will overwrite the original's.
The method makes a deep copy of the original component before adding it, and returns this copy.

**Parameters:**

Name | Type |
------ | ------ |
`entity` | [Entity](../globals.md#entity) |
`component` | [BaseComponent](../interfaces/basecomponent.md) |

**Returns:** *[BaseComponent](../interfaces/basecomponent.md)*

___

###  createEntity

▸ **createEntity**(): *[Entity](../globals.md#entity)*

*Defined in [world.ts:32](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/world.ts#L32)*

Creates an entity (a unique id) and adds it to the ECS database

**Returns:** *[Entity](../globals.md#entity)*

___

###  destroyEntity

▸ **destroyEntity**(`entity`: [Entity](../globals.md#entity)): *void*

*Defined in [world.ts:41](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/world.ts#L41)*

Destroys an entity and its components from the ECS database

**Parameters:**

Name | Type |
------ | ------ |
`entity` | [Entity](../globals.md#entity) |

**Returns:** *void*

___

###  findEntities

▸ **findEntities**(`componentTypes`: symbol[]): *[Entity](../globals.md#entity)[]*

*Defined in [world.ts:74](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/world.ts#L74)*

Returns an array of entities that own the required components

**Parameters:**

Name | Type |
------ | ------ |
`componentTypes` | symbol[] |

**Returns:** *[Entity](../globals.md#entity)[]*

___

###  getComponents

▸ **getComponents**(`entity`: [Entity](../globals.md#entity)): *[Assemblage](../globals.md#assemblage)*

*Defined in [world.ts:143](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/world.ts#L143)*

Returns the components for a given entity

**Parameters:**

Name | Type |
------ | ------ |
`entity` | [Entity](../globals.md#entity) |

**Returns:** *[Assemblage](../globals.md#assemblage)*

___

###  getEntities

▸ **getEntities**(): *[Entity](../globals.md#entity)[]*

*Defined in [world.ts:67](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/world.ts#L67)*

Returns the array of entities

**Returns:** *[Entity](../globals.md#entity)[]*

___

###  getSystem

▸ **getSystem**<**T**>(`systemClass`: [System](system.md)): *`T`*

*Defined in [world.ts:184](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/world.ts#L184)*

Returns a specific system instance from its class

**Type parameters:**

■` T`: *[System](system.md)*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`systemClass` | [System](system.md) |   |

**Returns:** *`T`*

___

###  getSystems

▸ **getSystems**(): *[System](system.md)[]*

*Defined in [world.ts:175](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/world.ts#L175)*

Returns the systems' list

**Returns:** *[System](system.md)[]*

___

###  registerEntity

▸ **registerEntity**(`entity`: [Entity](../globals.md#entity)): *void*

*Defined in [world.ts:55](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/world.ts#L55)*

Manually registers an entity to the ECS database.
If the entity is already in the database, it is ignored.

**Parameters:**

Name | Type |
------ | ------ |
`entity` | [Entity](../globals.md#entity) |

**Returns:** *void*

___

###  registerSystem

▸ **registerSystem**(`system`: [System](system.md)): *void*

*Defined in [world.ts:151](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/world.ts#L151)*

Registers a system instance in the ECS database.
You can only register one (1) instance of each System's subclass

**Parameters:**

Name | Type |
------ | ------ |
`system` | [System](system.md) |

**Returns:** *void*

___

###  removeComponent

▸ **removeComponent**(`entity`: [Entity](../globals.md#entity), `component`: [BaseComponent](../interfaces/basecomponent.md)): *void*

*Defined in [world.ts:125](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/world.ts#L125)*

Removes a component from an entity

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`entity` | [Entity](../globals.md#entity) | - |
`component` | [BaseComponent](../interfaces/basecomponent.md) |   |

**Returns:** *void*

___

###  removeSystem

▸ **removeSystem**(`system`: [System](system.md)): *void*

*Defined in [world.ts:168](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/world.ts#L168)*

Removed a system from the ECS database

**Parameters:**

Name | Type |
------ | ------ |
`system` | [System](system.md) |

**Returns:** *void*

___

###  update

▸ **update**(): *void*

*Defined in [world.ts:19](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/world.ts#L19)*

**Returns:** *void*

___