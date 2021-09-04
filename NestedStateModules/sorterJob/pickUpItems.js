const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

function pickUpItems (bot, targets) {
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'
  exit.x = 125
  exit.y = 413

  const startCheckNextChest = new BehaviorIdle(targets)
  startCheckNextChest.stateName = 'Start Check Next Chest'
  startCheckNextChest.x = 525
  startCheckNextChest.y = 113

  const checkNextChest = new BehaviorIdle(targets)
  checkNextChest.stateName = 'Check Next Chest'
  checkNextChest.x = 525
  checkNextChest.y = 413

  const goAndWithdraw = require('@NestedStateModules/goAndWithdraw')(bot, targets)
  goAndWithdraw.stateName = 'Go chest and Withdraw'
  goAndWithdraw.x = 1
  goAndWithdraw.y = 1

  let pendingTransaction
  const findChests = () => {
    pendingTransaction = []
    targets.chests.forEach((chest, chestIndex) => {
      const items = targets.sorterJob.transactions.filter(c => c.fromChest === chestIndex)
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
      child: goAndWithdraw,
      onTransition: () => {
        const currentChest = pendingTransaction.shift()
        targets.position = currentChest.chest.position
        targets.items = currentChest.items
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: goAndWithdraw,
      child: startCheckNextChest,
      shouldTransition: () => goAndWithdraw.isFinished() && pendingTransaction.length > 0
    }),

    new StateTransition({
      parent: goAndWithdraw,
      child: exit,
      shouldTransition: () => goAndWithdraw.isFinished() && pendingTransaction.length === 0
    })
  ]

  const pickUpItems = new NestedStateMachine(transitions, start, exit)
  pickUpItems.stateName = 'pickUpItems'
  return pickUpItems
}

module.exports = pickUpItems
