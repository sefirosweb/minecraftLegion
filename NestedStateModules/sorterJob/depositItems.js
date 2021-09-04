const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

function depositItems (bot, targets) {
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'
  exit.x = 325
  exit.y = 313

  const startCheckNextChest = new BehaviorIdle(targets)
  startCheckNextChest.stateName = 'Start Check Next Chest'
  startCheckNextChest.x = 125
  startCheckNextChest.y = 263

  const goAndDeposit = require('@NestedStateModules/goAndDeposit')(bot, targets)
  goAndDeposit.stateName = 'Go chest and Deposit'
  goAndDeposit.x = 125
  goAndDeposit.y = 413

  let pendingTransaction
  const findChests = () => {
    pendingTransaction = []
    targets.chests.forEach((chest, chestIndex) => {
      const items = targets.sorterJob.transactions.filter(c => c.toChest === chestIndex)
      if (items.length > 0) {
        pendingTransaction.push({
          chest,
          items
        })
      }
    })
  }

  const transitions = [

    new StateTransition({
      parent: start,
      child: startCheckNextChest,
      onTransition: () => {
        findChests()
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: startCheckNextChest,
      child: goAndDeposit,
      onTransition: () => {
        const currentChest = pendingTransaction.shift()
        targets.position = currentChest.chest.position
        targets.items = currentChest.items
      },
      shouldTransition: () => pendingTransaction.length > 0
    }),

    new StateTransition({
      parent: goAndDeposit,
      child: startCheckNextChest,
      shouldTransition: () => goAndDeposit.isFinished() && pendingTransaction.length > 0
    }),

    new StateTransition({
      parent: goAndDeposit,
      child: exit,
      shouldTransition: () => goAndDeposit.isFinished() && pendingTransaction.length === 0
    }),

    new StateTransition({
      parent: startCheckNextChest,
      child: exit,
      shouldTransition: () => pendingTransaction.length === 0
    })
  ]

  const depositItems = new NestedStateMachine(transitions, start, exit)
  depositItems.stateName = 'depositItems'
  return depositItems
}

module.exports = depositItems
