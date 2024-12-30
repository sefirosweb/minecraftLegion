import { StateTransition, BehaviorIdle, NestedStateMachine, BehaviorFollowEntity } from 'minecraftlegion-statemachine'
import { DefaultBlockForPlace, Jobs, LegionStateMachineTargets } from 'base-types'
import { movementModule } from '@/modules'
import GuardJob from '@/NestedStateModules/guardJob/init'
import ArcherJob from '@/NestedStateModules/archerJob/init'
import FarmerJob from '@/NestedStateModules/farmerJob/init'
import BreederJob from '@/NestedStateModules/breederJob/init'
import MinerJob from '@/NestedStateModules/minerJob/init'
import SorterJob from '@/NestedStateModules/sorterJob/init'
import CrafterJobFunction from '@/NestedStateModules/crafterJob/init'
import { Bot } from 'mineflayer'

function startWorkFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const { getAllBlocksExceptLeafs } = movementModule(bot, targets)

  const start = new BehaviorFollowEntity(bot, targets)
  start.stateName = 'Start'

  const loadedConfig = new BehaviorIdle()
  loadedConfig.stateName = 'Loaded Config'
  loadedConfig.x = 325
  loadedConfig.y = 213

  const guardJob = GuardJob(bot, targets)
  guardJob.x = 525
  guardJob.y = 313

  const archerJob = ArcherJob(bot, targets)
  archerJob.x = 525
  archerJob.y = 113

  const farmerJob = FarmerJob(bot, targets)
  farmerJob.x = 325
  farmerJob.y = 350

  const breederJob = BreederJob(bot, targets)
  breederJob.x = 135
  breederJob.y = 320

  const minerJob = MinerJob(bot, targets)
  minerJob.x = 325
  minerJob.y = 50

  const sorterJob = SorterJob(bot, targets)
  sorterJob.x = 535
  sorterJob.y = 213

  const crafterJobFunction = CrafterJobFunction(bot, targets)

  const transitions = [
    new StateTransition({
      parent: start,
      child: loadedConfig,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: loadedConfig,
      child: guardJob,
      shouldTransition: () => bot.config.job === Jobs.guard
    }),

    new StateTransition({
      parent: loadedConfig,
      child: archerJob,
      shouldTransition: () => bot.config.job === Jobs.archer
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
      shouldTransition: () => bot.config.job === Jobs.farmer
    }),

    new StateTransition({
      parent: loadedConfig,
      child: breederJob,
      shouldTransition: () => bot.config.job === Jobs.breeder
    }),

    new StateTransition({
      parent: loadedConfig,
      child: minerJob,
      onTransition: () => {
        const blockForPlace = Object.values(bot.mcData.blocksByName)
          .filter(b => Object.keys(DefaultBlockForPlace).includes(b.name))
          .filter(a => a.hardness !== null)
          .sort((a, b) => a.hardness! - b.hardness!)
          .map(b => b.name)

        targets.minerJob.blockForPlace = blockForPlace

      },
      shouldTransition: () => bot.config.job === Jobs.miner
    }),

    new StateTransition({
      parent: loadedConfig,
      child: sorterJob,
      shouldTransition: () => bot.config.job === Jobs.sorter
    }),

    new StateTransition({
      parent: loadedConfig,
      child: crafterJobFunction,
      shouldTransition: () => bot.config.job === Jobs.crafter
    }),

  ]

  const nestedState = new NestedStateMachine(transitions, start)
  nestedState.stateName = 'startWorkFunction'
  return nestedState
}

export default startWorkFunction
