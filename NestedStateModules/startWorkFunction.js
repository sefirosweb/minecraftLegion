const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('@BehaviorModules/BehaviorLoadConfig')

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

  const guardJob = require('@NestedStateModules/guardJobFunction')(bot, targets)
  guardJob.x = 525
  guardJob.y = 313

  const archerJob = require('@NestedStateModules/archerJob/archerJobFunction')(bot, targets)
  archerJob.x = 525
  archerJob.y = 113

  const farmerJob = require('@NestedStateModules/farmerJobFunction')(bot, targets)
  farmerJob.x = 325
  farmerJob.y = 350

  const breederJob = require('@NestedStateModules/breederJob/breederJobFunction')(bot, targets)
  breederJob.x = 135
  breederJob.y = 320

  const minerJob = require('@NestedStateModules/minerJobFunction')(bot, targets)
  minerJob.x = 325
  minerJob.y = 50

  const sorterJob = require('@NestedStateModules/sorterJob/sorterJobFunction')(bot, targets)
  sorterJob.x = 535
  sorterJob.y = 213

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
        targets.config = loadConfig.getAllConfig()
        targets.movements.allowSprinting = targets.config.allowSprinting
        targets.movements.canDig = targets.config.canDig
        targets.movements.blocksToAvoid.delete(mcData.blocksByName.wheat.id)
        targets.movements.blocksToAvoid.add(mcData.blocksByName.sweet_berry_bush.id)
        targets.movements.blocksCantBreak.add(mcData.blocksByName.sweet_berry_bush.id)
        targets.movements.blocksCantBreak.add(mcData.blocksByName.cactus.id)
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: loadedConfig,
      child: guardJob,
      onTransition: () => {
        targets.guardJob = {}
      },
      shouldTransition: () => loadConfig.getJob() === 'guard'
    }),

    new StateTransition({
      parent: loadedConfig,
      child: archerJob,
      onTransition: () => {
        targets.archerJob = {}
      },
      shouldTransition: () => loadConfig.getJob() === 'archer'
    }),

    new StateTransition({
      parent: loadedConfig,
      child: farmerJob,
      onTransition: () => {
        targets.farmerJob = {}
      },
      shouldTransition: () => loadConfig.getJob() === 'farmer'
    }),

    new StateTransition({
      parent: loadedConfig,
      child: breederJob,
      onTransition: () => {
        targets.breederJob = {}
      },
      shouldTransition: () => loadConfig.getJob() === 'breeder'
    }),

    new StateTransition({
      parent: loadedConfig,
      child: minerJob,
      onTransition: () => {
        targets.minerJob = {}
      },
      shouldTransition: () => loadConfig.getJob() === 'miner'
    }),

    new StateTransition({
      parent: loadedConfig,
      child: sorterJob,
      onTransition: () => {
        targets.sorterJob = {}
      },
      shouldTransition: () => loadConfig.getJob() === 'sorter'
    })

  ]

  const startWorkFunction = new NestedStateMachine(transitions, start)
  startWorkFunction.stateName = 'Start Work'
  return startWorkFunction
}

module.exports = startWorkFunction
