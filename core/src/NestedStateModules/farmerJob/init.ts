import { StateTransition, BehaviorIdle, NestedStateMachine } from 'mineflayer-statemachine'
import BehaviorEatFood from '@/BehaviorModules/BehaviorEatFood'
import { LegionStateMachineTargets } from 'base-types'
import getClosestEnemy from '@/modules/getClosestEnemy'
import GoChestsFunctions from '@/NestedStateModules/getReady/goChestsFunctions'
import FarmingFunction from '@/NestedStateModules/farmerJob/farmingFunction'
import GetReadyFunction from '@/NestedStateModules/getReady/init'
import CombatStrategyFunction from '@/NestedStateModules/combat/init'
import { Bot } from 'mineflayer'

export default (bot: Bot, targets: LegionStateMachineTargets) => {
  const getReady = GetReadyFunction(bot, targets)
  getReady.stateName = 'Get Ready'
  getReady.x = 125
  getReady.y = 213

  const goChests = GoChestsFunctions(bot, targets)
  goChests.x = 325
  goChests.y = 213

  const farming = FarmingFunction(bot, targets)
  farming.stateName = 'Farming'
  farming.x = 325
  farming.y = 313

  const eatFood = new BehaviorEatFood(bot, targets)
  eatFood.stateName = 'Eat Food'
  eatFood.x = 125
  eatFood.y = 413

  const getClosestMob = getClosestEnemy(bot, targets)
  const combatStrategy = CombatStrategyFunction(bot, targets)
  combatStrategy.x = 325
  combatStrategy.y = 413

  const transitions = [
    new StateTransition({
      parent: getReady,
      child: eatFood,
      shouldTransition: () => getReady.isFinished()
    }),

    new StateTransition({
      parent: eatFood,
      child: farming,
      shouldTransition: () => eatFood.isFinished()
    }),

    new StateTransition({
      parent: farming,
      child: goChests,
      shouldTransition: () => farming.isFinished()
    }),

    new StateTransition({
      parent: goChests,
      child: getReady,
      shouldTransition: () => goChests.isFinished()
    }),

    new StateTransition({
      parent: farming,
      child: combatStrategy,
      onTransition: () => bot.pathfinder.setGoal(null),
      shouldTransition: () => {
        getClosestMob.check()
        return targets.entity !== undefined && targets.entity.isEnemy === true
      }
    }),

    new StateTransition({
      parent: combatStrategy,
      child: eatFood,
      shouldTransition: () => combatStrategy.isFinished()
    })

  ]

  const nestedState = new NestedStateMachine(transitions, getReady)
  nestedState.stateName = 'Farmer Job'
  return nestedState
}