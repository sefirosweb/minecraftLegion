const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('@BehaviorModules/BehaviorLoadConfig')

function startWorkFunction(bot, targets) {
  const mcData = require('minecraft-data')(bot.version)
  const { getAllBlocksExceptLeafs } = require('@modules/movementModule')(bot, targets)

  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

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

  const farmerJob = require('@NestedStateModules/farmerJob/farmerJobFunction')(bot, targets)
  farmerJob.x = 325
  farmerJob.y = 350

  const breederJob = require('@NestedStateModules/breederJob/breederJobFunction')(bot, targets)
  breederJob.x = 135
  breederJob.y = 320

  const minerJob = require('@NestedStateModules/minerJob/minerJobFunction')(bot, targets)
  minerJob.x = 325
  minerJob.y = 50

  const sorterJob = require('@NestedStateModules/sorterJob/sorterJobFunction')(bot, targets)
  sorterJob.x = 535
  sorterJob.y = 213

  const crafterJobFunction = require('@NestedStateModules/crafterJob/crafterJobFunction')(bot, targets)
  // sorterJob.x = 535
  // sorterJob.y = 213

  const transitions = [
    new StateTransition({
      parent: start,
      child: loadedConfig,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: loadedConfig,
      child: guardJob,
      onTransition: () => {
        targets.guardJob = {}
      },
      shouldTransition: () => targets.config.job === 'guard'
    }),

    new StateTransition({
      parent: loadedConfig,
      child: archerJob,
      onTransition: () => {
        targets.archerJob = {}
      },
      shouldTransition: () => targets.config.job === 'archer'
    }),

    new StateTransition({
      parent: loadedConfig,
      child: farmerJob,
      onTransition: () => {
        targets.farmerJob = {}
        if (targets.movements.canDig === false) {
          const allBlocksExceptLeafs = getAllBlocksExceptLeafs()
          targets.movements.canDig = true
          targets.movements.blocksCantBreak = new Set([...targets.movements.blocksCantBreak, ...allBlocksExceptLeafs])
        }

      },
      shouldTransition: () => targets.config.job === 'farmer'
    }),

    new StateTransition({
      parent: loadedConfig,
      child: breederJob,
      onTransition: () => {
        targets.breederJob = {}
      },
      shouldTransition: () => targets.config.job === 'breeder'
    }),

    new StateTransition({
      parent: loadedConfig,
      child: minerJob,
      onTransition: () => {
        targets.minerJob = {}
        // Set place block sorting to easy to hardness
        targets.minerJob.blockForPlace = Object.values(mcData.blocksByName).filter(b => [
          "netherrack",
          "basalt",
          "blackstone",
          "stone",
          "cobblestone",
          "cobbled_deepslate",
          "dirt",
          "tuff",
          "andesite",
          "diorite",
          "granite",
          "sandstone",
        ].includes(b.name))
          .sort((a, b) => a.hardness - b.hardness)
          .map(b => b.name)
      },
      shouldTransition: () => targets.config.job === 'miner'
    }),

    new StateTransition({
      parent: loadedConfig,
      child: sorterJob,
      onTransition: () => {
        targets.sorterJob = {}
      },
      shouldTransition: () => targets.config.job === 'sorter'
    }),

    new StateTransition({
      parent: loadedConfig,
      child: crafterJobFunction,
      onTransition: () => {
        targets.crafterJob = {}
      },
      shouldTransition: () => targets.config.job === 'crafter'
    }),

  ]

  const startWorkFunction = new NestedStateMachine(transitions, start)
  startWorkFunction.stateName = 'startWorkFunction'
  return startWorkFunction
}

module.exports = startWorkFunction
