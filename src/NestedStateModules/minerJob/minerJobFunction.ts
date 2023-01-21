import { Bot, LegionStateMachineTargets } from '@/types'
import { StateTransition, NestedStateMachine } from 'mineflayer-statemachine'
import BehaviorEatFood from '@/BehaviorModules/BehaviorEatFood'
import getClosestEnemy from '@/modules/getClosestEnemy'
import GetReadyFunction from '@/NestedStateModules/getReady/getReadyFunction'
import MiningFunction from '@/NestedStateModules/minerJob/miningFunction'
import CombatStrategyFunction from '@/NestedStateModules/combat/combatStrategyFunction'

export default (bot: Bot, targets: LegionStateMachineTargets) => {
  const getReady = GetReadyFunction(bot, targets)
  getReady.stateName = 'Get Ready'
  //@ts-ignore
  getReady.x = 125
  //@ts-ignore
  getReady.y = 113

  const eatFood = new BehaviorEatFood(bot, targets)
  eatFood.stateName = 'Eat Food'
  eatFood.x = 325
  eatFood.y = 113

  const miningFunction = MiningFunction(bot, targets)
  //@ts-ignore
  miningFunction.x = 125
  //@ts-ignore
  miningFunction.y = 213

  const combatStrategy = CombatStrategyFunction(bot, targets)
  //@ts-ignore
  combatStrategy.x = 325
  //@ts-ignore
  combatStrategy.y = 213

  const getClosestMob = getClosestEnemy(bot, targets)

  const transitions = [
    new StateTransition({
      parent: getReady,
      child: eatFood,
      shouldTransition: () => getReady.isFinished()
    }),

    new StateTransition({
      parent: eatFood,
      child: miningFunction,
      shouldTransition: () => eatFood.isFinished()
    }),

    new StateTransition({
      parent: miningFunction,
      child: getReady,
      shouldTransition: () => miningFunction.isFinished()
    }),

    new StateTransition({
      parent: miningFunction,
      child: combatStrategy,
      name: 'miningFunction -> try getClosestMob',
      onTransition: () => {
        bot.pathfinder.setGoal(null)
      },
      shouldTransition: () => {
        getClosestMob.check()
        return targets.entity !== undefined && targets.entity.isEnemy === true
      }
    }),

    new StateTransition({
      parent: combatStrategy,
      child: eatFood,
      name: 'Mob is dead',
      shouldTransition: () => combatStrategy.isFinished()
    })

  ]

  const nestedState = new NestedStateMachine(transitions, getReady)
  nestedState.stateName = 'Miner Job'
  return nestedState
}