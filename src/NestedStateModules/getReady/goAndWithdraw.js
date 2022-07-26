const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorWithdrawItemChest = require('@BehaviorModules/BehaviorWithdrawItemChest')
const BehaviorMoveTo = require('@BehaviorModules/BehaviorMoveTo')

function goAndWithdraw (bot, targets) {
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

  const withdrawItemChest = new BehaviorWithdrawItemChest(bot, targets)
  withdrawItemChest.stateName = 'Withdraw Items'
  withdrawItemChest.x = 125
  withdrawItemChest.y = 313

  const transitions = [
    new StateTransition({
      parent: start,
      child: goChest,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: goChest,
      child: withdrawItemChest,
      shouldTransition: () => (goChest.isFinished() || goChest.distanceToTarget() < 3) && !bot.pathfinder.isMining()
    }),

    new StateTransition({
      parent: withdrawItemChest,
      child: exit,
      shouldTransition: () => withdrawItemChest.isFinished()
    })
  ]

  const goAndWithdraw = new NestedStateMachine(transitions, start, exit)
  goAndWithdraw.stateName = 'Go Chests and Withdraw'
  return goAndWithdraw
}

module.exports = goAndWithdraw
