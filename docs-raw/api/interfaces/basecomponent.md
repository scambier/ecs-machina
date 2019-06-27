> ## [ECS-Machina documentation](../README.md)

[Globals](../globals.md) / [BaseComponent](basecomponent.md) /

# Interface: BaseComponent

The interface for all components.<br/>
It requires a `_type` attribute for typeguarding

## Hierarchy

* **BaseComponent**

### Index

#### Properties

* [_type](basecomponent.md#_type)

## Properties

###  _type

● **_type**: *symbol*

*Defined in [interfaces.ts:10](https://github.com/scambier/ecs-machina/blob/c7c4a98/src/interfaces.ts#L10)*

Type guard attribute.<br/>
This value <i>must</i> be set to a unique string for each IComponent sub-type (hint: use a Symbol)

___