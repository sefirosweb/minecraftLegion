import { Bot, LegionStateMachineTargets } from '@/types'
import {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} from 'mineflayer-statemachine'

function farmingPlantsFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const start = new BehaviorIdle()
  start.stateName = 'Start'
  //@ts-ignore
  start.x = 125
  //@ts-ignore
  start.y = 113

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  //@ts-ignore
  exit.x = 725
  //@ts-ignore
  exit.y = 113

  const checkFarmingAreas = new BehaviorIdle()
  checkFarmingAreas.stateName = 'Next Area'
  //@ts-ignore
  checkFarmingAreas.x = 525
  //@ts-ignore
  checkFarmingAreas.y = 113

  const plant = require('@NestedStateModules/farmerJob/plantFunction')(bot, targets)
  plant.stateName = 'Plant'
  plant.x = 725
  plant.y = 313

  const harvest = require('@NestedStateModules/farmerJob/harvestFunction')(bot, targets)
  harvest.stateName = 'Harvest'
  harvest.x = 325
  harvest.y = 313

  const findItemsAndPickup = require('@NestedStateModules/findItemsAndPickup')(bot, targets)
  findItemsAndPickup.stateName = 'Find Items'
  findItemsAndPickup.x = 525
  findItemsAndPickup.y = 313

  const transitions = [

    new StateTransition({
      parent: start,
      child: harvest,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: harvest,
      child: findItemsAndPickup,
      shouldTransition: () => harvest.isFinished()
    }),

    new StateTransition({
      parent: findItemsAndPickup,
      child: plant,
      shouldTransition: () => findItemsAndPickup.isFinished()
    }),

    new StateTransition({
      parent: plant,
      child: exit,
      shouldTransition: () => plant.isFinished()
    })

  ]

  const farmingPlantsFunction = new NestedStateMachine(transitions, start, exit)
  farmingPlantsFunction.stateName = 'farmingPlantsFunction'
  return farmingPlantsFunction
}

module.exports = farmingPlantsFunction