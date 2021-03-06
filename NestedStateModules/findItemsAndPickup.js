const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine,
  BehaviorMoveTo
} = require('mineflayer-statemachine')

const BehaviorFindItems = require('./../BehaviorModules/BehaviorFindItems')
const BehaviorLoadConfig = require('./../BehaviorModules/BehaviorLoadConfig')

const mineflayerPathfinder = require('mineflayer-pathfinder')
let movements

function findItemsAndPickup (bot, targets) {
  const mcData = require('minecraft-data')(bot.version)
  movements = new mineflayerPathfinder.Movements(bot, mcData)

  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'
  exit.x = 125
  exit.y = 313

  const findItem = new BehaviorFindItems(bot, targets)
  findItem.stateName = 'Find Items'
  findItem.x = 325
  findItem.y = 313

  const goToObject = new BehaviorMoveTo(bot, targets)
  goToObject.stateName = 'Pick up item'
  goToObject.x = 525
  goToObject.y = 313
  goToObject.movements = movements

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'
  loadConfig.x = 325
  loadConfig.y = 113

  const transitions = [

    new StateTransition({
      parent: start,
      child: loadConfig,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: loadConfig,
      child: findItem,
      name: 'loadConfig -> patrol',
      onTransition: () => {
        movements.allowSprinting = loadConfig.getAllowSprinting(bot.username)
        movements.canDig = loadConfig.getCanDig(bot.username)
        findItem.setPickUpItems(loadConfig.getPickUpItems())
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: findItem,
      child: goToObject,
      onTransition: () => {
        targets.position = targets.itemDrop.position.offset(0, 0.2, 0).clone()
      },
      shouldTransition: () => findItem.isFinished() && targets.itemDrop !== undefined
    }),

    new StateTransition({
      parent: findItem,
      child: exit,
      shouldTransition: () => findItem.isFinished() && targets.itemDrop === undefined
    }),

    new StateTransition({
      parent: goToObject,
      child: findItem,
      shouldTransition: () => {
        if (!goToObject.targets.itemDrop.isValid) {
          return true
        }

        if (targets.position.distanceTo(targets.itemDrop.position) > 1) {
          targets.position = targets.itemDrop.position.offset(0, 0.2, 0).clone()
          goToObject.restart()
        }

        if (findItem.checkInventorySpace() === 0) {
          return true
        }

        return false
      }
    })

  ]

  const findItemsAndPickup = new NestedStateMachine(transitions, start, exit)
  findItemsAndPickup.stateName = 'Find Items and pickup'
  return findItemsAndPickup
}

module.exports = findItemsAndPickup
