const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

function sortChestFunction (bot, targets) {
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'
  exit.x = 225
  exit.y = 413

  const transitions = [
    new StateTransition({
      parent: start,
      child: exit,
      shouldTransition: () => false
    })
  ]

  const sortChestFunction = new NestedStateMachine(transitions, start)
  sortChestFunction.stateName = 'sortChestFunction'
  return sortChestFunction
}

module.exports = sortChestFunction
