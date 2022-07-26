const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorDepositItemChest = require('@BehaviorModules/BehaviorDepositItemChest')
const BehaviorMoveTo = require('@BehaviorModules/BehaviorMoveTo')

function goAndDeposit (bot, targets) {
  const start = new BehaviorIdle()
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  exit.x = 125
  exit.y = 413

  const goChest = new BehaviorMoveTo(bot, targets)
  goChest.stateName = 'Move To Chest'
  goChest.x = 125
  goChest.y = 213
  goChest.movements = targets.movements

  const depositItemChest = new BehaviorDepositItemChest(bot, targets)
  depositItemChest.stateName = 'Deposit Items'
  depositItemChest.x = 125
  depositItemChest.y = 313

  const transitions = [
    new StateTransition({
      parent: start,
      child: goChest,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: goChest,
      child: depositItemChest,
      shouldTransition: () => (goChest.isFinished() || goChest.distanceToTarget() < 3) && !bot.pathfinder.isMining()
    }),

    new StateTransition({
      parent: depositItemChest,
      child: exit,
      shouldTransition: () => depositItemChest.isFinished()
    })
  ]

  const goAndDeposit = new NestedStateMachine(transitions, start, exit)
  goAndDeposit.stateName = 'Go Chests and Deposit'
  return goAndDeposit
}

module.exports = goAndDeposit
