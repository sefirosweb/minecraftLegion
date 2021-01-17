const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('./../BehaviorModules/BehaviorLoadConfig')

function startWorkFunction (bot, targets) {
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const guardJob = require('./guardJobFunction')(bot, targets)
  guardJob.x = 525
  guardJob.y = 313

  const archerJob = require('./archerJobFunction')(bot, targets)
  archerJob.x = 525
  archerJob.y = 113

  const farmerJob = require('./farmerJobFunction')(bot, targets)
  farmerJob.x = 325
  farmerJob.y = 350

  const minerJob = require('./minerJobFunction')(bot, targets)
  minerJob.x = 325
  minerJob.y = 50

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'
  loadConfig.x = 325
  loadConfig.y = 213

  const transitions = [
    new StateTransition({
      parent: start,
      child: loadConfig,
      name: 'start -> loadConfig',
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
    }),

    new StateTransition({
      parent: loadConfig,
      child: minerJob,
      name: 'loadConfig -> minerJob',
      shouldTransition: () => loadConfig.getJob() === 'miner'
    })

  ]

  const startWorkFunction = new NestedStateMachine(transitions, start)
  startWorkFunction.stateName = 'Select Job'
  return startWorkFunction
}

module.exports = startWorkFunction
