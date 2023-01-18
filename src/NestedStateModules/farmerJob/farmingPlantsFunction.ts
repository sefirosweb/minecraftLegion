import { Bot, LegionStateMachineTargets } from '@/types'
import {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} from 'mineflayer-statemachine'
import PlantFunction from '@/NestedStateModules/farmerJob/plantFunction'
import HarvestFunction from '@/NestedStateModules/farmerJob/harvestFunction'
import FindItemsAndPickup from '@/NestedStateModules/findItemsAndPickup'

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

  const plant = PlantFunction(bot, targets)
  plant.stateName = 'Plant'
  //@ts-ignore
  plant.x = 725
  //@ts-ignore
  plant.y = 313

  const harvest = HarvestFunction(bot, targets)
  harvest.stateName = 'Harvest'
  //@ts-ignore
  harvest.x = 325
  //@ts-ignore
  harvest.y = 313

  const findItemsAndPickup = FindItemsAndPickup(bot, targets)
  findItemsAndPickup.stateName = 'Find Items'
  //@ts-ignore
  findItemsAndPickup.x = 525
  //@ts-ignore
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

  const nestedState = new NestedStateMachine(transitions, start, exit)
  nestedState.stateName = 'farmingPlantsFunction'
  return nestedState
}

export default farmingPlantsFunction
