import {
  StateTransition,
  NestedStateMachine
} from 'mineflayer-statemachine'

//@ts-ignore
import BehaviorEatFood from '@BehaviorModules/BehaviorEatFood'
import { Bot, LegionStateMachineTargets } from '@/types'

function minerJobFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const getReady = require('@NestedStateModules/getReady/getReadyFunction')(bot, targets)
  getReady.stateName = 'Get Ready'
  getReady.x = 125
  getReady.y = 113

  const eatFood = new BehaviorEatFood(bot, targets)
  eatFood.stateName = 'Eat Food'
  eatFood.x = 325
  eatFood.y = 113

  const miningFunction = require('@NestedStateModules/minerJob/miningFunction')(bot, targets)
  miningFunction.x = 125
  miningFunction.y = 213

  const combatStrategy = require('@NestedStateModules/combat/combatStrategyFunction')(bot, targets)
  combatStrategy.x = 325
  combatStrategy.y = 213

  const getClosestMob = require('@modules/getClosestEnemy')(bot, targets)

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

  const minerJobFunction = new NestedStateMachine(transitions, getReady)
  minerJobFunction.stateName = 'Miner Job'
  return minerJobFunction
}

module.exports = minerJobFunction
