import {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine,
  BehaviorFollowEntity
} from 'mineflayer-statemachine'

import { Bot } from '@/types'
import { LegionStateMachineTargets } from '@/types/index'
import mcDataLoader from 'minecraft-data'
import { DefaultBlockForPlace, Jobs } from '@/types/defaultTypes'

function startWorkFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const mcData = mcDataLoader(bot.version)
  const { getAllBlocksExceptLeafs } = require('@modules/movementModule')(bot, targets)

  // @ts-ignore
  const start = new BehaviorFollowEntity(bot, targets)
  start.stateName = 'Start'

  const loadedConfig = new BehaviorIdle()
  loadedConfig.stateName = 'Loaded Config'
  // @ts-ignore
  loadedConfig.x = 325
  // @ts-ignore
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
      shouldTransition: () => targets.config.job === Jobs.guard
    }),

    new StateTransition({
      parent: loadedConfig,
      child: archerJob,
      onTransition: () => {
        targets.archerJob = {}
      },
      shouldTransition: () => targets.config.job === Jobs.archer
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
      shouldTransition: () => targets.config.job === Jobs.farmer
    }),

    new StateTransition({
      parent: loadedConfig,
      child: breederJob,
      onTransition: () => {
        targets.breederJob = {}
      },
      shouldTransition: () => targets.config.job === Jobs.breeder
    }),

    new StateTransition({
      parent: loadedConfig,
      child: minerJob,
      onTransition: () => {
        console.log(DefaultBlockForPlace)
        console.log(Object.values(DefaultBlockForPlace))
        const blockForPlace = Object.values(mcData.blocksByName)
          .filter(b => Object.values(DefaultBlockForPlace).includes(b.name))
          .filter(a => a.hardness !== null)
          .sort((a, b) => a.hardness! - b.hardness!)
          .map(b => b.name)

        targets.minerJob = {
          blockForPlace
        }

      },
      shouldTransition: () => targets.config.job === Jobs.miner
    }),

    new StateTransition({
      parent: loadedConfig,
      child: sorterJob,
      onTransition: () => {
        targets.sorterJob = {}
      },
      shouldTransition: () => targets.config.job === Jobs.sorter
    }),

    new StateTransition({
      parent: loadedConfig,
      child: crafterJobFunction,
      onTransition: () => {
        targets.crafterJob = {}
      },
      shouldTransition: () => targets.config.job === Jobs.crafter
    }),

  ]

  const startWorkFunction = new NestedStateMachine(transitions, start)
  startWorkFunction.stateName = 'startWorkFunction'
  return startWorkFunction
}

module.exports = startWorkFunction
