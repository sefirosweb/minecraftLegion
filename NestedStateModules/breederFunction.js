const botWebsocket = require('@modules/botWebsocket')
const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('@BehaviorModules/BehaviorLoadConfig')

function breederFunction (bot, targets) {
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'
  loadConfig.x = 325
  loadConfig.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'
  exit.x = 325
  exit.y = 613

  const transitions = [
    new StateTransition({
      parent: start,
      child: loadConfig,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: loadConfig,
      child: exit,
      onTransition: () => {
      },
      shouldTransition: () => true
    })

  ]

  const breederFunction = new NestedStateMachine(transitions, start, exit)
  breederFunction.stateName = 'breederFunction'
  return breederFunction
}

module.exports = breederFunction
