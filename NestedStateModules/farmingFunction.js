const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

function farmingFunction (bot, targets) {
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'
  exit.x = 575
  exit.y = 263

  const transitions = [

    new StateTransition({
      parent: start,
      child: exit,
      name: 'start',
      onTransition: () => {
        console.log('xxx')
      },
      shouldTransition: () => true
    })

  ]

  const farmingFunction = new NestedStateMachine(transitions, start, exit)
  farmingFunction.stateName = 'farmingFunction'
  return farmingFunction
}

module.exports = farmingFunction
