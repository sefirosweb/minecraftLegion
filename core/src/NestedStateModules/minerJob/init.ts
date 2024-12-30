import { LegionStateMachineTargets } from 'base-types'
import { StateTransition, NestedStateMachine } from 'minecraftlegion-statemachine'
import { BehaviorEatFood } from '@/BehaviorModules'
import { getClosestEnemy } from '@/modules'
import GetReadyFunction from '@/NestedStateModules/getReady/init'
import MiningFunction from '@/NestedStateModules/minerJob/miningFunction'
import CombatStrategyFunction from '@/NestedStateModules/combat/init'
import { Bot } from 'mineflayer'

export default (bot: Bot, targets: LegionStateMachineTargets) => {
  const getReady = GetReadyFunction(bot, targets)
  getReady.stateName = 'Get Ready'
  getReady.x = 125
  getReady.y = 113

  const eatFood = new BehaviorEatFood(bot, targets)
  eatFood.stateName = 'Eat Food'
  eatFood.x = 325
  eatFood.y = 113

  const miningFunction = MiningFunction(bot, targets)
  miningFunction.x = 125
  miningFunction.y = 213

  const combatStrategy = CombatStrategyFunction(bot, targets)
  combatStrategy.x = 325
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