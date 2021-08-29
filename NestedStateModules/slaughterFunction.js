const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine,
  BehaviorFollowEntity
} = require('mineflayer-statemachine')

const BehaviorAttack = require('@BehaviorModules/BehaviorAttack')
const BehaviorEquip = require('@BehaviorModules/BehaviorEquip')
const rangeSword = 3

function slaughterhouseFunction (bot, targets) {
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'
  exit.x = 325
  exit.y = 413

  const followMob = new BehaviorFollowEntity(bot, targets)
  followMob.stateName = 'Follow Enemy'
  followMob.x = 325
  followMob.y = 263

  const attack = new BehaviorAttack(bot, targets)
  attack.stateName = 'Attack'
  attack.x = 525
  attack.y = 263

  const equip = new BehaviorEquip(bot, targets)
  equip.stateName = 'Equip'
  equip.x = 125
  equip.y = 263

  const checkWeapon = () => {
    let weapon = bot.inventory.items().find(item => item.name.includes('sword'))
    if (weapon) {
      targets.item = weapon
      return
    }

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

    targets.item = undefined
  }

  const transitions = [
    new StateTransition({
      parent: start,
      child: equip,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: equip,
      child: exit,
      onTransition: () => {
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
      onTransition: () => {
        checkWeapon()
      },
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
      shouldTransition: () => targets.entity && followMob.distanceToTarget() >= rangeSword && targets.entity.isValid
    }),

    new StateTransition({
      parent: attack,
      child: exit,
      shouldTransition: () => !targets.entity || targets.entity.isValid === false
    }),

    new StateTransition({
      parent: followMob,
      child: exit,
      onTransition: () => {
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
