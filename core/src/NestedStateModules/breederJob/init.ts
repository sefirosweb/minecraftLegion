import { StateTransition, BehaviorIdle, NestedStateMachine } from 'minecraftlegion-statemachine'
import { BehaviorEatFood } from '@/BehaviorModules'
import { LegionStateMachineTargets } from 'base-types'
import { getClosestEnemy } from '@/modules'
import GetReadyFunction from '@/NestedStateModules/getReady/init'
import BreederFunction from '@/NestedStateModules/breederJob/breederFunction'
import SlaughterhouseFunction from '@/NestedStateModules/breederJob/slaughterhouseFunction'
import CombatStrategyFunction from '@/NestedStateModules/combat/init'
import FindItemsAndPickup from '@/NestedStateModules/findItemsAndPickup'
import { Bot } from 'mineflayer'

function breederJobFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const start = new BehaviorIdle()
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const getReady = GetReadyFunction(bot, targets)
  getReady.stateName = 'Get Ready'
  getReady.x = 125
  getReady.y = 213

  const breeder = BreederFunction(bot, targets)
  breeder.stateName = 'Breeder'
  breeder.x = 525
  breeder.y = 313

  const slaughterhouse = SlaughterhouseFunction(bot, targets)
  slaughterhouse.stateName = 'Slaughterhouse'
  slaughterhouse.x = 525
  slaughterhouse.y = 213

  const eatFood = new BehaviorEatFood(bot, targets)
  eatFood.stateName = 'Eat Food'
  eatFood.x = 125
  eatFood.y = 413

  const getClosestMob = getClosestEnemy(bot, targets)
  const combatStrategy = CombatStrategyFunction(bot, targets)
  combatStrategy.x = 525
  combatStrategy.y = 413

  const findItemsAndPickup = FindItemsAndPickup(bot, targets)
  findItemsAndPickup.stateName = 'Find Items'
  findItemsAndPickup.x = 325
  findItemsAndPickup.y = 213

  const transitions = [
    new StateTransition({
      parent: start,
      child: getReady,
      onTransition: () => {
        targets.entity = undefined
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: getReady,
      child: eatFood,
      shouldTransition: () => getReady.isFinished()
    }),

    new StateTransition({
      parent: eatFood,
      child: breeder,
      shouldTransition: () => eatFood.isFinished()
    }),

    new StateTransition({
      parent: breeder,
      child: slaughterhouse,
      shouldTransition: () => breeder.isFinished()
    }),

    new StateTransition({
      parent: slaughterhouse,
      child: findItemsAndPickup,
      shouldTransition: () => slaughterhouse.isFinished()
    }),

    new StateTransition({
      parent: findItemsAndPickup,
      child: getReady,
      shouldTransition: () => findItemsAndPickup.isFinished()
    }),

    new StateTransition({
      parent: breeder,
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

  const nestedState = new NestedStateMachine(transitions, start)
  nestedState.stateName = 'Breeder Job'
  return nestedState
}

export default breederJobFunction
