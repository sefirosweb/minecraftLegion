const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('./../BehaviorModules/BehaviorLoadConfig')

function startWorkFunction (bot, targets) {
  const enter = new BehaviorIdle(targets)
  enter.stateName = 'Enter'

  const guardJob = require('./guardJobFunction')(bot, targets)
  const archerJob = require('./archerJobFunction')(bot, targets)
  const farmerJob = require('./farmerJobFunction')(bot, targets)
  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'

  const transitions = [
    new StateTransition({
      parent: enter,
      child: loadConfig,
      name: 'enter -> loadConfig',
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: loadConfig,
      child: guardJob,
      name: 'loadConfig -> guardJob',
      shouldTransition: () => loadConfig.getJob() === 'guard'
    }),

    new StateTransition({
      parent: loadConfig,
      child: archerJob,
      name: 'loadConfig -> archerJob',
      shouldTransition: () => loadConfig.getJob() === 'archer'
    }),

    new StateTransition({
      parent: loadConfig,
      child: farmerJob,
      name: 'loadConfig -> farmerJob',
      shouldTransition: () => loadConfig.getJob() === 'farmer'
    })

  ]

  const startWorkFunction = new NestedStateMachine(transitions, enter)
  startWorkFunction.stateName = 'startWorkFunction'
  return startWorkFunction
}

module.exports = startWorkFunction
