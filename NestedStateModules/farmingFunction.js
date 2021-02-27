const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('./../BehaviorModules/BehaviorLoadConfig')

function farmingFunction (bot, targets) {
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
  exit.x = 725
  exit.y = 113

  const checkFarmingAreas = new BehaviorIdle(targets)
  checkFarmingAreas.stateName = 'Next Area'
  checkFarmingAreas.x = 525
  checkFarmingAreas.y = 113

  const plant = require('./plantFunction')(bot, targets)
  plant.stateName = 'Plant'
  plant.x = 625
  plant.y = 313

  const harvest = require('./harvestFunction')(bot, targets)
  harvest.stateName = 'Harvest'
  harvest.x = 425
  harvest.y = 313

  let plantArea = []
  let plantAreaIndex = 0

  const transitions = [

    new StateTransition({
      parent: start,
      child: loadConfig,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkFarmingAreas,
      child: exit,
      name: 'All areas checked',
      shouldTransition: () => plantAreaIndex === (plantArea.length)
    }),

    new StateTransition({
      parent: loadConfig,
      child: checkFarmingAreas,
      onTransition: () => {
        plantAreaIndex = 0
        plantArea = loadConfig.getPlantAreas()
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkFarmingAreas,
      child: harvest,
      onTransition: () => {
        targets.plantArea = plantArea[plantAreaIndex]
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: harvest,
      child: plant,
      shouldTransition: () => harvest.isFinished()
    }),

    new StateTransition({
      parent: plant,
      child: checkFarmingAreas,
      onTransition: () => plantAreaIndex++,
      shouldTransition: () => plant.isFinished()
    })

  ]

  const farmingFunction = new NestedStateMachine(transitions, start, exit)
  farmingFunction.stateName = 'farmingFunction'
  return farmingFunction
}

module.exports = farmingFunction
