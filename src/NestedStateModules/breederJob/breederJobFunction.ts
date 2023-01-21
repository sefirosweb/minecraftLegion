import { StateTransition, BehaviorIdle, NestedStateMachine } from 'mineflayer-statemachine'
import BehaviorEatFood from '@/BehaviorModules/BehaviorEatFood'
import { Bot, LegionStateMachineTargets } from '@/types'
import getClosestEnemy from '@/modules/getClosestEnemy'
import GetReadyFunction from '@/NestedStateModules/getReady/getReadyFunction'
import BreederFunction from '@/NestedStateModules/breederJob/breederFunction'
import SlaughterhouseFunction from '@/NestedStateModules/breederJob/slaughterhouseFunction'
import CombatStrategyFunction from '@/NestedStateModules/combat/combatStrategyFunction'
import FindItemsAndPickup from '@/NestedStateModules/findItemsAndPickup'

function breederJobFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const start = new BehaviorIdle()
  start.stateName = 'Start'
  //@ts-ignore
  start.x = 125
  //@ts-ignore
  start.y = 113

  const getReady = GetReadyFunction(bot, targets)
  getReady.stateName = 'Get Ready'
  //@ts-ignore
  getReady.x = 125
  //@ts-ignore
  getReady.y = 213

  const breeder = BreederFunction(bot, targets)
  breeder.stateName = 'Breeder'
  //@ts-ignore
  breeder.x = 525
  //@ts-ignore
  breeder.y = 313

  const slaughterhouse = SlaughterhouseFunction(bot, targets)
  slaughterhouse.stateName = 'Slaughterhouse'
  //@ts-ignore
  slaughterhouse.x = 525
  //@ts-ignore
  slaughterhouse.y = 213

  const eatFood = new BehaviorEatFood(bot, targets)
  eatFood.stateName = 'Eat Food'
  eatFood.x = 125
  eatFood.y = 413

  const getClosestMob = getClosestEnemy(bot, targets)
  const combatStrategy = CombatStrategyFunction(bot, targets)
  //@ts-ignore
  combatStrategy.x = 525
  //@ts-ignore
  combatStrategy.y = 413

  const findItemsAndPickup = FindItemsAndPickup(bot, targets)
  findItemsAndPickup.stateName = 'Find Items'
  //@ts-ignore
  findItemsAndPickup.x = 325
  //@ts-ignore
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
