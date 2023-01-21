import { StateTransition, BehaviorIdle, NestedStateMachine, BehaviorFollowEntity } from 'mineflayer-statemachine'

import { Bot } from '@/types'
import { LegionStateMachineTargets } from '@/types/index'
import mcDataLoader from 'minecraft-data'
import { DefaultBlockForPlace, Jobs } from '@/types/defaultTypes'
import movementModule from '@/modules/movementModule'
import GuardJob from '@/NestedStateModules/guardJob/guardJobFunction'
import ArcherJob from '@/NestedStateModules/archerJob/archerJobFunction'
import FarmerJob from '@/NestedStateModules/farmerJob/farmerJobFunction'
import BreederJob from '@/NestedStateModules/breederJob/breederJobFunction'
import MinerJob from '@/NestedStateModules/minerJob/minerJobFunction'
import SorterJob from '@/NestedStateModules/sorterJob/sorterJobFunction'
import CrafterJobFunction from '@/NestedStateModules/crafterJob/crafterJobFunction'

function startWorkFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const mcData = mcDataLoader(bot.version)
  const { getAllBlocksExceptLeafs } = movementModule(bot, targets)

  // @ts-ignore
  const start = new BehaviorFollowEntity(bot, targets)
  start.stateName = 'Start'

  const loadedConfig = new BehaviorIdle()
  loadedConfig.stateName = 'Loaded Config'
  // @ts-ignore
  loadedConfig.x = 325
  // @ts-ignore
  loadedConfig.y = 213

  const guardJob = GuardJob(bot, targets)
  // @ts-ignore
  guardJob.x = 525
  // @ts-ignore
  guardJob.y = 313

  const archerJob = ArcherJob(bot, targets)
  // @ts-ignore
  archerJob.x = 525
  // @ts-ignore
  archerJob.y = 113

  const farmerJob = FarmerJob(bot, targets)
  // @ts-ignore
  farmerJob.x = 325
  // @ts-ignore
  farmerJob.y = 350

  const breederJob = BreederJob(bot, targets)
  // @ts-ignore
  breederJob.x = 135
  // @ts-ignore
  breederJob.y = 320

  const minerJob = MinerJob(bot, targets)
  // @ts-ignore
  minerJob.x = 325
  // @ts-ignore
  minerJob.y = 50

  const sorterJob = SorterJob(bot, targets)
  // @ts-ignore
  sorterJob.x = 535
  // @ts-ignore
  sorterJob.y = 213

  const crafterJobFunction = CrafterJobFunction(bot, targets)
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
      shouldTransition: () => targets.config.job === Jobs.guard
    }),

    new StateTransition({
      parent: loadedConfig,
      child: archerJob,
      shouldTransition: () => targets.config.job === Jobs.archer
    }),

    new StateTransition({
      parent: loadedConfig,
      child: farmerJob,
      onTransition: () => {
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
      shouldTransition: () => targets.config.job === Jobs.breeder
    }),

    new StateTransition({
      parent: loadedConfig,
      child: minerJob,
      onTransition: () => {
        const blockForPlace = Object.values(mcData.blocksByName)
          .filter(b => Object.keys(DefaultBlockForPlace).includes(b.name))
          .filter(a => a.hardness !== null)
          .sort((a, b) => a.hardness! - b.hardness!)
          .map(b => b.name)

        targets.minerJob.blockForPlace = blockForPlace

      },
      shouldTransition: () => targets.config.job === Jobs.miner
    }),

    new StateTransition({
      parent: loadedConfig,
      child: sorterJob,
      shouldTransition: () => targets.config.job === Jobs.sorter
    }),

    new StateTransition({
      parent: loadedConfig,
      child: crafterJobFunction,
      shouldTransition: () => targets.config.job === Jobs.crafter
    }),

  ]

  const nestedState = new NestedStateMachine(transitions, start)
  nestedState.stateName = 'startWorkFunction'
  return nestedState
}

export default startWorkFunction
