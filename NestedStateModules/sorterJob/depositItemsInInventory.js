const {
  StateTransition,
  BehaviorIdle,
  BehaviorMoveTo,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorDepositItemChest = require('@BehaviorModules/BehaviorDepositItemChest')

function depositItemsInInventory (bot, targets) {
  const { findChests } = require('@modules/inventoryModule')(bot)

  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const nextChest = new BehaviorIdle(targets)
  nextChest.stateName = 'Next Chest'
  nextChest.x = 125
  nextChest.y = 213

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'
  exit.x = 325
  exit.y = 213

  const goChest = new BehaviorMoveTo(bot, targets)
  goChest.stateName = 'Move To Chest'
  goChest.x = 325
  goChest.y = 313
  goChest.movements = targets.movements

  const depositChest = new BehaviorDepositItemChest(bot, targets)
  depositChest.stateName = 'Deposit Items In chest'
  depositChest.x = 125
  depositChest.y = 313

  let chestsFound
  let currentChest

  const transitions = [

    new StateTransition({
      parent: start,
      child: nextChest,
      onTransition: () => {
        chestsFound = findChests({
          count: 9999,
          maxDistance: 40
        })
        currentChest = chestsFound.shift()
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: nextChest,
      child: goChest,
      onTransition: () => {
        targets.position = currentChest.position
      },
      shouldTransition: () => bot.inventory.items().length > 0
    }),

    new StateTransition({
      parent: goChest,
      child: depositChest,
      onTransition: () => {
        targets.items = bot.inventory.items().map(i => {
          return {
            type: i.type,
            quantity: i.count
          }
        })
      },
      shouldTransition: () => goChest.isFinished() && !bot.pathfinder.isMining()
    }),

    new StateTransition({
      parent: depositChest,
      child: nextChest,
      onTransition: () => {
        currentChest = chestsFound.shift()
      },
      shouldTransition: () => depositChest.isFinished() && chestsFound.length > 0
    }),

    new StateTransition({
      parent: nextChest,
      child: exit,
      shouldTransition: () => bot.inventory.items().length === 0
    })

  ]

  const depositItemsInInventory = new NestedStateMachine(transitions, start, exit)
  depositItemsInInventory.stateName = 'depositItemsInInventory'
  return depositItemsInInventory
}

module.exports = depositItemsInInventory
