import { Bot, LegionStateMachineTargets } from '@/types'
import {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} from 'mineflayer-statemachine'
import PlantFunction from '@/NestedStateModules/farmerJob/plantFunction'
import HarvestFunction from '@/NestedStateModules/farmerJob/harvestFunction'
import FindItemsAndPickup from '@/NestedStateModules/findItemsAndPickup'

function farmingTreesFunction(bot: Bot, targets: LegionStateMachineTargets) {
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

  const selectTree = new BehaviorIdle()
  selectTree.stateName = 'Select Tree'
  //@ts-ignore
  selectTree.x = 325
  //@ts-ignore
  selectTree.y = 113

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

  let xStart: number, xEnd: number, xCurrent: number, zStart: number, zEnd: number, zCurrent: number, finished: boolean

  const nextTree = () => {
    xCurrent += 2
    if (xCurrent > xEnd) {
      xCurrent = xStart
      zCurrent += 2
    }

    if (zCurrent > zEnd) {
      finished = true
    }

    targets.farmerJob.plantArea.xStart = xCurrent
    targets.farmerJob.plantArea.xEnd = xCurrent
    targets.farmerJob.plantArea.zStart = zCurrent
    targets.farmerJob.plantArea.zEnd = zCurrent
  }

  const transitions = [

    new StateTransition({
      parent: start,
      child: selectTree,
      onTransition: () => {
        xStart = targets.farmerJob.plantArea.xStart! < targets.farmerJob.plantArea.xEnd! ? targets.farmerJob.plantArea.xStart! : targets.farmerJob.plantArea.xEnd!
        xEnd = targets.farmerJob.plantArea.xStart! > targets.farmerJob.plantArea.xEnd! ? targets.farmerJob.plantArea.xStart! : targets.farmerJob.plantArea.xEnd!
        zStart = targets.farmerJob.plantArea.zStart! < targets.farmerJob.plantArea.zEnd! ? targets.farmerJob.plantArea.zStart! : targets.farmerJob.plantArea.zEnd!
        zEnd = targets.farmerJob.plantArea.zStart! > targets.farmerJob.plantArea.zEnd! ? targets.farmerJob.plantArea.zStart! : targets.farmerJob.plantArea.zEnd!
        xCurrent = xStart
        zCurrent = zStart
        finished = false

        targets.farmerJob.plantArea.xStart = xCurrent
        targets.farmerJob.plantArea.xEnd = xCurrent
        targets.farmerJob.plantArea.zStart = zCurrent
        targets.farmerJob.plantArea.zEnd = zCurrent
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: selectTree,
      child: exit,
      shouldTransition: () => finished || bot.inventory.items().length >= 33
    }),

    new StateTransition({
      parent: selectTree,
      child: harvest,
      shouldTransition: () => !finished && bot.inventory.items().length < 33
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
      child: selectTree,
      onTransition: () => {
        nextTree()
      },
      shouldTransition: () => plant.isFinished()
    })

  ]

  const nestedState = new NestedStateMachine(transitions, start, exit)
  nestedState.stateName = 'farmingTreesFunction'
  return nestedState
}

export default farmingTreesFunction
