const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('./../BehaviorModules/BehaviorLoadConfig')

function startWorkFunction (bot, targets) {
  const mcData = require('minecraft-data')(bot.version)

  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'
  loadConfig.x = 125
  loadConfig.y = 213

  const loadedConfig = new BehaviorIdle(targets)
  loadedConfig.stateName = 'Loaded Config'
  loadedConfig.x = 325
  loadedConfig.y = 213

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

  const transitions = [
    new StateTransition({
      parent: start,
      child: loadConfig,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: loadConfig,
      child: loadedConfig,
      onTransition: () => {
        targets.movements.allowSprinting = loadConfig.getAllowSprinting(bot.username)
        targets.movements.canDig = loadConfig.getCanDig(bot.username)
        targets.movements.blocksToAvoid.delete(mcData.blocksByName.wheat.id)
        targets.movements.blocksToAvoid.add(mcData.blocksByName.sweet_berry_bush.id)
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: loadedConfig,
      child: guardJob,
      shouldTransition: () => loadConfig.getJob() === 'guard'
    }),

    new StateTransition({
      parent: loadedConfig,
      child: archerJob,
      shouldTransition: () => loadConfig.getJob() === 'archer'
    }),

    new StateTransition({
      parent: loadedConfig,
      child: farmerJob,
      shouldTransition: () => loadConfig.getJob() === 'farmer'
    }),

    new StateTransition({
      parent: loadedConfig,
      child: minerJob,
      shouldTransition: () => loadConfig.getJob() === 'miner'
    })

  ]

  const startWorkFunction = new NestedStateMachine(transitions, start)
  startWorkFunction.stateName = 'Select Job'
  return startWorkFunction
}

module.exports = startWorkFunction
