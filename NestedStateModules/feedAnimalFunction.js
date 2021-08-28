const botWebsocket = require('@modules/botWebsocket')
const {
  StateTransition,
  BehaviorIdle,
  BehaviorFollowEntity,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('@BehaviorModules/BehaviorLoadConfig')
const BehaviorEquip = require('@BehaviorModules/BehaviorEquip')

function feedAnimalFunction (bot, targets) {
  targets.breededAnimals = []
  const mcData = require('minecraft-data')(bot.version)

  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'
  loadConfig.x = 325
  loadConfig.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'
  exit.x = 325
  exit.y = 613

  const equip = new BehaviorEquip(bot, targets)
  equip.stateName = 'Equip'
  equip.x = 11
  equip.y = 11

  const followAnimal = new BehaviorFollowEntity(bot, targets)
  followAnimal.stateName = 'Follow Animal'
  followAnimal.x = 100
  followAnimal.y = 100

  const transitions = [
    new StateTransition({
      parent: start,
      child: equip,
      onTransition: () => {
        // Select item to give food
        targets.item = mcData.itemsByName.wheat
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: equip,
      child: followAnimal,
      shouldTransition: () => equip.isFinished() && equip.isWasEquipped()
    }),

    new StateTransition({
      parent: equip,
      child: exit,
      shouldTransition: () => equip.isFinished() && !equip.isWasEquipped()
    }),

    new StateTransition({
      parent: followAnimal,
      child: exit,
      shouldTransition: () => !targets.entity || !targets.entity.isValid
    }),

    new StateTransition({
      parent: followAnimal,
      child: exit,
      shouldTransition: () => targets.entity && followAnimal.distanceToTarget() < 2 && targets.entity.isValid
    })

  ]

  const feedAnimalFunction = new NestedStateMachine(transitions, start, exit)
  feedAnimalFunction.stateName = 'feedAnimalFunction'
  return feedAnimalFunction
}

module.exports = feedAnimalFunction
