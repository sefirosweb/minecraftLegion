import {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine,
  BehaviorFollowEntity
} from 'mineflayer-statemachine'

//@ts-ignore
import BehaviorAttack from '@BehaviorModules/BehaviorAttack'
//@ts-ignore
import BehaviorEquip from '@BehaviorModules/BehaviorEquip'
import { Bot, LegionStateMachineTargets } from '@/types'
const rangeSword = 3

function slaughterhouseFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const start = new BehaviorIdle()
  start.stateName = 'Start'
  //@ts-ignore
  start.x = 125
  //@ts-ignore
  start.y = 113

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  //@ts-ignore
  exit.x = 325
  //@ts-ignore
  exit.y = 413

  //@ts-ignore
  const followMob = new BehaviorFollowEntity(bot, targets)
  followMob.stateName = 'Follow Enemy'
  //@ts-ignore
  followMob.x = 325
  //@ts-ignore
  followMob.y = 263
  //@ts-ignore
  followMob.movements = targets.movements

  const attack = new BehaviorAttack(bot, targets)
  attack.stateName = 'Attack'
  attack.x = 525
  attack.y = 263

  const equip = new BehaviorEquip(bot, targets)
  equip.stateName = 'Equip'
  equip.x = 125
  equip.y = 263

  const checkWeapon = () => {
    let weapon

    weapon = bot.inventory.items().find(item => item.name.includes('axe'))
    if (weapon) {
      targets.item = weapon
      return
    }

    weapon = bot.inventory.items().find(item => item.name.includes('hoe'))
    if (weapon) {
      targets.item = weapon
      return
    }
    weapon = bot.inventory.items().find(item => item.name.includes('sword'))
    if (weapon) {
      targets.item = weapon
      return
    }

    targets.item = undefined
  }

  const removeAnimal = () => {
    const animalId = targets.breederJob.breededAnimals.findIndex(b => {
      return b.id === targets.entity?.id
    })
    if (animalId >= 0) {
      targets.breederJob.breededAnimals.splice(animalId, 1)
    }
  }

  const transitions = [
    new StateTransition({
      parent: start,
      child: equip,
      onTransition: () => {
        checkWeapon()
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: equip,
      child: exit,
      onTransition: () => {
        removeAnimal()
        targets.entity = undefined
      },
      shouldTransition: () => equip.isFinished() && !equip.isWasEquipped()
    }),

    new StateTransition({
      parent: equip,
      child: followMob,
      shouldTransition: () => equip.isFinished() && equip.isWasEquipped()
    }),

    new StateTransition({
      parent: followMob,
      child: attack,
      shouldTransition: () => targets.entity && followMob.distanceToTarget() < rangeSword && attack.nextAttack() && targets.entity.isValid
    }),

    new StateTransition({
      parent: attack,
      child: attack,
      shouldTransition: () => targets.entity && followMob.distanceToTarget() < rangeSword && attack.nextAttack() && targets.entity.isValid
    }),

    new StateTransition({
      parent: attack,
      child: followMob,
      shouldTransition: () => targets.entity !== undefined && followMob.distanceToTarget() >= rangeSword && targets.entity.isValid
    }),

    new StateTransition({
      parent: attack,
      child: exit,
      onTransition: () => {
        removeAnimal()
        targets.entity = undefined
      },
      shouldTransition: () => !targets.entity || targets.entity.isValid === false
    }),

    new StateTransition({
      parent: followMob,
      child: exit,
      onTransition: () => {
        removeAnimal()
        targets.entity = undefined
      },
      shouldTransition: () => !targets.entity || targets.entity.isValid === false
    })
  ]

  const slaughterhouseFunction = new NestedStateMachine(transitions, start, exit)
  slaughterhouseFunction.stateName = 'slaughterhouseFunction'
  return slaughterhouseFunction
}

module.exports = slaughterhouseFunction
