import { LegionStateMachineTargets } from 'base-types'
import {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} from 'minecraftlegion-statemachine'
import PlantFunction from '@/NestedStateModules/farmerJob/plantFunction'
import HarvestFunction from '@/NestedStateModules/farmerJob/harvestFunction'
import FindItemsAndPickup from '@/NestedStateModules/findItemsAndPickup'
import { Bot } from 'mineflayer'

function farmingTreesFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const start = new BehaviorIdle()
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  exit.x = 725
  exit.y = 113

  const selectTree = new BehaviorIdle()
  selectTree.stateName = 'Select Tree'
  selectTree.x = 325
  selectTree.y = 113

  const checkFarmingAreas = new BehaviorIdle()
  checkFarmingAreas.stateName = 'Next Area'
  checkFarmingAreas.x = 525
  checkFarmingAreas.y = 113

  const plant = PlantFunction(bot, targets)
  plant.stateName = 'Plant'
  plant.x = 725
  plant.y = 313

  const harvest = HarvestFunction(bot, targets)
  harvest.stateName = 'Harvest'
  harvest.x = 325
  harvest.y = 313

  const findItemsAndPickup = FindItemsAndPickup(bot, targets)
  findItemsAndPickup.stateName = 'Find Items'
  findItemsAndPickup.x = 525
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

    if (targets.farmerJob.plantArea === undefined) {
      throw new Error('Variable plantArea is not defined!')
    }

    targets.farmerJob.plantArea.layer.xStart = xCurrent
    targets.farmerJob.plantArea.layer.xEnd = xCurrent
    targets.farmerJob.plantArea.layer.zStart = zCurrent
    targets.farmerJob.plantArea.layer.zEnd = zCurrent
  }

  const transitions = [

    new StateTransition({
      parent: start,
      child: selectTree,
      onTransition: () => {
        if (targets.farmerJob.plantArea === undefined) {
          throw new Error('Variable plantArea is not defined!')
        }

        xStart = targets.farmerJob.plantArea.layer.xStart! < targets.farmerJob.plantArea.layer.xEnd! ? targets.farmerJob.plantArea.layer.xStart! : targets.farmerJob.plantArea.layer.xEnd!
        xEnd = targets.farmerJob.plantArea.layer.xStart! > targets.farmerJob.plantArea.layer.xEnd! ? targets.farmerJob.plantArea.layer.xStart! : targets.farmerJob.plantArea.layer.xEnd!
        zStart = targets.farmerJob.plantArea.layer.zStart! < targets.farmerJob.plantArea.layer.zEnd! ? targets.farmerJob.plantArea.layer.zStart! : targets.farmerJob.plantArea.layer.zEnd!
        zEnd = targets.farmerJob.plantArea.layer.zStart! > targets.farmerJob.plantArea.layer.zEnd! ? targets.farmerJob.plantArea.layer.zStart! : targets.farmerJob.plantArea.layer.zEnd!
        xCurrent = xStart
        zCurrent = zStart
        finished = false

        targets.farmerJob.plantArea.layer.xStart = xCurrent
        targets.farmerJob.plantArea.layer.xEnd = xCurrent
        targets.farmerJob.plantArea.layer.zStart = zCurrent
        targets.farmerJob.plantArea.layer.zEnd = zCurrent
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
