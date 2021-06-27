const botWebsocket = require('@modules/botWebsocket')
const { shuffle } = require('@modules/utils')
const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('@BehaviorModules/BehaviorLoadConfig')

function farmingFunction (bot, targets) {
  const { harvestMode, plants } = require('@modules/plantType')
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'
  loadConfig.x = 325
  loadConfig.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'
  exit.x = 325
  exit.y = 613

  const checkFarmingAreas = new BehaviorIdle(targets)
  checkFarmingAreas.stateName = 'Check Area'
  checkFarmingAreas.x = 325
  checkFarmingAreas.y = 450

  const nextArea = new BehaviorIdle(targets)
  nextArea.stateName = 'Next Area'
  nextArea.x = 325
  nextArea.y = 250

  const farmingPlantsFunction = require('@NestedStateModules/farmingPlantsFunction')(bot, targets)
  farmingPlantsFunction.stateName = 'Farm Plants'
  farmingPlantsFunction.x = 125
  farmingPlantsFunction.y = 350

  const farmingTreesFunction = require('@NestedStateModules/farmingTreesFunction')(bot, targets)
  farmingTreesFunction.stateName = 'Farm Trees'
  farmingTreesFunction.x = 525
  farmingTreesFunction.y = 350

  let plantArea = []
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
      shouldTransition: () => plants[plantArea[plantAreaIndex].plant] === undefined ||
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
        targets.plantArea = plantArea[plantAreaIndex]
      },
      shouldTransition: () =>
        (
          plants[plantArea[plantAreaIndex].plant].type === 'normal' ||
          plants[plantArea[plantAreaIndex].plant].type === 'melon' ||
          plants[plantArea[plantAreaIndex].plant].type === 'sweet_berries'
        ) && bot.inventory.items().length < 33
    }),
    /** END Plants **/

    /** Trees **/
    new StateTransition({
      parent: checkFarmingAreas,
      child: farmingTreesFunction,
      onTransition: () => {
        targets.plantArea = plantArea[plantAreaIndex]
      },
      shouldTransition: () => plants[plantArea[plantAreaIndex].plant].type === 'tree' && bot.inventory.items().length < 33
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
