> ## [ECS-Machina documentation](../README.md)

[Globals](../globals.md) / [System](system.md) /

# Class: System

The base abstract class for all Systems

## Hierarchy

* **System**

### Index

#### Properties

* [requiredComponents](system.md#abstract-requiredcomponents)

#### Methods

* [addEntity](system.md#addentity)
* [addedEntity](system.md#addedentity)
* [afterDraw](system.md#afterdraw)
* [afterUpdate](system.md#afterupdate)
* [beforeDraw](system.md#beforedraw)
* [beforeUpdate](system.md#beforeupdate)
* [deleteEntity](system.md#deleteentity)
* [drawEntities](system.md#drawentities)
* [drawEntity](system.md#drawentity)
* [getComponents](system.md#getcomponents)
* [getEntities](system.md#getentities)
* [getEntityComponents](system.md#getentitycomponents)
* [hasEntity](system.md#hasentity)
* [refreshEntities](system.md#refreshentities)
* [updateEntity](system.md#updateentity)

## Properties

### `Abstract` requiredComponents

● **requiredComponents**: *symbol[]*

*Defined in [system.ts:13](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/system.ts#L13)*

The list of components (referenced by their `_type` attribute)
required by the system to

___

## Methods

###  addEntity

▸ **addEntity**(`entity`: [Entity](../globals.md#entity), `components`: [BaseComponent](../interfaces/basecomponent.md)[]): *void*

*Defined in [system.ts:60](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/system.ts#L60)*

Adds an entity and its components to the current hash

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`entity` | [Entity](../globals.md#entity) | - |
`components` | [BaseComponent](../interfaces/basecomponent.md)[] |   |

**Returns:** *void*

___

###  addedEntity

▸ **addedEntity**(`entity`: [Entity](../globals.md#entity)): *void*

*Defined in [system.ts:88](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/system.ts#L88)*

Called each time an entity is added

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`entity` | [Entity](../globals.md#entity) |   |

**Returns:** *void*

___

###  afterDraw

▸ **afterDraw**(): *void*

*Defined in [system.ts:138](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/system.ts#L138)*

Called after the entities draw loop

**Returns:** *void*

___

###  afterUpdate

▸ **afterUpdate**(): *void*

*Defined in [system.ts:105](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/system.ts#L105)*

Called after the entities update loop

**Returns:** *void*

___

###  beforeDraw

▸ **beforeDraw**(): *void*

*Defined in [system.ts:125](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/system.ts#L125)*

Called before the entities draw loop

**Returns:** *void*

___

###  beforeUpdate

▸ **beforeUpdate**(): *void*

*Defined in [system.ts:93](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/system.ts#L93)*

Called before the entities update loop

**Returns:** *void*

___

###  deleteEntity

▸ **deleteEntity**(`entity`: [Entity](../globals.md#entity)): *void*

*Defined in [system.ts:70](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/system.ts#L70)*

Deletes the entity from the hash

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`entity` | [Entity](../globals.md#entity) |   |

**Returns:** *void*

___

###  drawEntities

▸ **drawEntities**(`options`: object): *void*

*Defined in [system.ts:112](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/system.ts#L112)*

Calls [System.beforeDraw](system.md#beforedraw), then [System.drawEntity](system.md#drawentity), then [System.afterDraw](system.md#afterdraw)

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`options` | object |  {} |   |

**Returns:** *void*

___

###  drawEntity

▸ **drawEntity**(`entityComponent`: [EntityComponent](../globals.md#entitycomponent), `options`: object): *void*

*Defined in [system.ts:133](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/system.ts#L133)*

Called for each entity related to the System, after the update loop

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`entityComponent` | [EntityComponent](../globals.md#entitycomponent) | - | - |
`options` | object |  {} |   |

**Returns:** *void*

___

###  getComponents

▸ **getComponents**(`entity`: string): *[BaseComponent](../interfaces/basecomponent.md)[]*

*Defined in [system.ts:24](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/system.ts#L24)*

Returns the components array of an entity

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`entity` | string | The entity id  |

**Returns:** *[BaseComponent](../interfaces/basecomponent.md)[]*

___

###  getEntities

▸ **getEntities**(): *[Entity](../globals.md#entity)[]*

*Defined in [system.ts:31](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/system.ts#L31)*

Returns the list of entities for this system

**Returns:** *[Entity](../globals.md#entity)[]*

___

###  getEntityComponents

▸ **getEntityComponents**(): *object*

*Defined in [system.ts:38](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/system.ts#L38)*

Returns the hash of { entity: component[] }

**Returns:** *object*

● \[■&#x60; entity&#x60;: *string*\]: [BaseComponent](../interfaces/basecomponent.md)[]

___

###  hasEntity

▸ **hasEntity**(`entity`: [Entity](../globals.md#entity)): *boolean*

*Defined in [system.ts:77](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/system.ts#L77)*

Does the entity exists with the system

**Parameters:**

Name | Type |
------ | ------ |
`entity` | [Entity](../globals.md#entity) |

**Returns:** *boolean*

___

###  refreshEntities

▸ **refreshEntities**(`entities`: object): *void*

*Defined in [system.ts:45](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/system.ts#L45)*

Rebuilds the entities hash

**Parameters:**

Name | Type |
------ | ------ |
`entities` | object |

**Returns:** *void*

___

###  updateEntity

▸ **updateEntity**(`entityComponent`: [EntityComponent](../globals.md#entitycomponent)): *void*

*Defined in [system.ts:100](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/system.ts#L100)*

Called for each entity related to the System

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`entityComponent` | [EntityComponent](../globals.md#entitycomponent) |   |

**Returns:** *void*

___