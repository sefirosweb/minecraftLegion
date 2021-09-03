const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

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

  const goAndDeposit = require('@NestedStateModules/goAndDeposit')(bot, targets)
  goAndDeposit.stateName = 'Deposit Items In chest'
  goAndDeposit.x = 125
  goAndDeposit.y = 313

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
      child: goAndDeposit,
      onTransition: () => {
        targets.position = currentChest.position
        targets.items = bot.inventory.items().map(i => {
          return {
            type: i.type,
            quantity: i.count
          }
        })
      },
      shouldTransition: () => bot.inventory.items().length > 0
    }),

    new StateTransition({
      parent: goAndDeposit,
      child: nextChest,
      shouldTransition: () => goAndDeposit.isFinished() && chestsFound.length > 0
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
