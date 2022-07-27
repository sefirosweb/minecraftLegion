import {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} from 'mineflayer-statemachine'

//@ts-ignore
import { shuffle } from '@modules/utils'
//@ts-ignore
import botWebsocket from '@modules/botWebsocket'
//@ts-ignore
import BehaviorLoadConfig from '@BehaviorModules/BehaviorLoadConfig'
import { Bot, LegionStateMachineTargets, PlantArea } from '@/types'

function farmingFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const { plants } = require('@modules/plantType')
  const start = new BehaviorIdle()
  start.stateName = 'Start'
  //@ts-ignore
  start.x = 125
  //@ts-ignore
  start.y = 113

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'
  loadConfig.x = 325
  loadConfig.y = 113

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  //@ts-ignore
  exit.x = 325
  //@ts-ignore
  exit.y = 613

  const checkFarmingAreas = new BehaviorIdle()
  checkFarmingAreas.stateName = 'Check Area'
  //@ts-ignore
  checkFarmingAreas.x = 325
  //@ts-ignore
  checkFarmingAreas.y = 450

  const nextArea = new BehaviorIdle()
  nextArea.stateName = 'Next Area'
  //@ts-ignore
  nextArea.x = 325
  //@ts-ignore
  nextArea.y = 250

  const farmingPlantsFunction = require('@NestedStateModules/farmerJob/farmingPlantsFunction')(bot, targets)
  farmingPlantsFunction.stateName = 'Farm Plants'
  farmingPlantsFunction.x = 125
  farmingPlantsFunction.y = 350

  const farmingTreesFunction = require('@NestedStateModules/farmerJob/farmingTreesFunction')(bot, targets)
  farmingTreesFunction.stateName = 'Farm Trees'
  farmingTreesFunction.x = 525
  farmingTreesFunction.y = 350

  let plantArea: Array<PlantArea> = []
  let plantAreaIndex = 0

  const transitions = [

    new StateTransition({
      parent: start,
      child: loadConfig,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: loadConfig,
      child: nextArea,
      onTransition: () => {
        plantAreaIndex = -1
        plantArea = loadConfig.getPlantAreas()
        const randomFarmArea = loadConfig.getRandomFarmArea()
        if (randomFarmArea) {
          shuffle(plantArea)
        }
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkFarmingAreas,
      child: exit,
      name: 'All areas checked',
      shouldTransition: () => plantAreaIndex === (plantArea.length) || bot.inventory.items().length >= 33
    }),

    new StateTransition({
      parent: nextArea,
      child: checkFarmingAreas,
      onTransition: () => {
        plantAreaIndex++
        if (plantArea[plantAreaIndex]) {
          botWebsocket.log(`Farming: ${plantArea[plantAreaIndex].plant}`)
        }
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkFarmingAreas,
      child: nextArea,
      onTransition: () => {
        botWebsocket.log('Plant is not valid! ' + plantArea[plantAreaIndex].plant)
      },
      // shouldTransition: () => !plantArea[plantAreaIndex].plant.includes(validPlants)
      shouldTransition: () => plants[plantArea[plantAreaIndex].plant!] === undefined ||
        !Number.isInteger(plantArea[plantAreaIndex].xStart) ||
        !Number.isInteger(plantArea[plantAreaIndex].xEnd) ||
        !Number.isInteger(plantArea[plantAreaIndex].yLayer) ||
        !Number.isInteger(plantArea[plantAreaIndex].zStart) ||
        !Number.isInteger(plantArea[plantAreaIndex].zEnd)
    }),

    /** Plants **/
    new StateTransition({
      parent: farmingPlantsFunction,
      child: nextArea,
      shouldTransition: () => farmingPlantsFunction.isFinished()
    }),
    new StateTransition({
      parent: checkFarmingAreas,
      child: farmingPlantsFunction,
      onTransition: () => {
        targets.farmerJob.plantArea = plantArea[plantAreaIndex]
      },
      shouldTransition: () => plantArea[plantAreaIndex].plant !== undefined && plants[plantArea[plantAreaIndex].plant!].harvestMode === 'massive' && bot.inventory.items().length < 33
    }),
    /** END Plants **/

    /** Trees **/
    new StateTransition({
      parent: checkFarmingAreas,
      child: farmingTreesFunction,
      onTransition: () => {
        targets.farmerJob.plantArea = plantArea[plantAreaIndex]
      },
      shouldTransition: () => plantArea[plantAreaIndex].plant !== undefined && plants[plantArea[plantAreaIndex].plant!].harvestMode === 'onebyone' && bot.inventory.items().length < 33
    }),
    new StateTransition({
      parent: farmingTreesFunction,
      child: nextArea,
      shouldTransition: () => farmingTreesFunction.isFinished()
    })
    /** END Trees **/

  ]

  const farmingFunction = new NestedStateMachine(transitions, start, exit)
  farmingFunction.stateName = 'farmingFunction'
  return farmingFunction
}

module.exports = farmingFunction
