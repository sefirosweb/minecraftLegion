const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('./../BehaviorModules/BehaviorLoadConfig')

function minerJobFunction (bot, targets) {
  const enter = new BehaviorIdle(targets)
  enter.stateName = 'Enter'

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'

  const transitions = [
    new StateTransition({
      parent: enter,
      child: loadConfig,
      name: 'enter -> loadConfig',
      shouldTransition: () => true
    })

  ]

  const minerJobFunction = new NestedStateMachine(transitions, enter)
  minerJobFunction.stateName = 'Miner Job'
  return minerJobFunction
}

module.exports = minerJobFunction
