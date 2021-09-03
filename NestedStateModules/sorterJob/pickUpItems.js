const {
  StateTransition,
  BehaviorIdle,
  BehaviorMoveTo,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorTransactionBetweenInventoryChest = require('@BehaviorModules/sorterJob/BehaviorTransactionBetweenInventoryChest')

function pickUpItems (bot, targets) {
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'
  exit.x = 225
  exit.y = 413

  const goChest = new BehaviorMoveTo(bot, targets)
  goChest.stateName = 'Move To Block'
  goChest.x = 525
  goChest.y = 113
  goChest.movements = targets.movements

  const startCheckNextChest = new BehaviorIdle(targets)
  startCheckNextChest.stateName = 'Start Check Next Chest'

  const checkNextChest = new BehaviorIdle(targets)
  checkNextChest.stateName = 'Check Next Chest'

  const transactionBetweenInventoryChest = new BehaviorTransactionBetweenInventoryChest(bot, targets)
  transactionBetweenInventoryChest.stateName = 'Transaction Inventory Chest'

  let indexChest

  const checkNextTransactions = () => {
    indexChest++
    while (indexChest < targets.chests.length) {
      targets.sorterJob.nextTransactions = targets.sorterJob.transactions.filter(c => c.fromChest === indexChest)
      if (targets.sorterJob.nextTransactions.length > 0) {
        targets.position = targets.chests[indexChest].position
        return true
      }
    }
    targets.sorterJob.nextTransactions = []
    return false
  }

  const transitions = [

    new StateTransition({
      parent: start,
      child: startCheckNextChest,
      onTransition: () => {
        indexChest = -1
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: startCheckNextChest,
      child: checkNextChest,
      onTransition: () => checkNextTransactions(),
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkNextChest,
      child: goChest,
      shouldTransition: () => targets.sorterJob.nextTransactions.length > 0
    }),

    new StateTransition({
      parent: goChest,
      child: transactionBetweenInventoryChest,
      shouldTransition: () => goChest.isFinished() && !bot.pathfinder.isMining()
    }),

    new StateTransition({
      parent: transactionBetweenInventoryChest,
      child: startCheckNextChest,
      shouldTransition: () => transactionBetweenInventoryChest.isFinished()
    }),

    new StateTransition({
      parent: checkNextChest,
      child: exit,
      shouldTransition: () => false // targets.sorterJob.nextTransactions.length === 0
    })
  ]

  const pickUpItems = new NestedStateMachine(transitions, start)
  pickUpItems.stateName = 'pickUpItems'
  return pickUpItems
}

module.exports = pickUpItems
