const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('./../BehaviorModules/BehaviorLoadConfig')

function minerJobFunction (bot, targets) {
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'

  const transitions = [
    new StateTransition({
      parent: start,
      child: loadConfig,
      name: 'start -> loadConfig',
      shouldTransition: () => true
    })

  ]

  const minerJobFunction = new NestedStateMachine(transitions, start)
  minerJobFunction.stateName = 'Miner Job'
  return minerJobFunction
}

module.exports = minerJobFunction
