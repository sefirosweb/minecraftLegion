const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

function farmingPlantsFunction (bot, targets) {
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

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
  plant.x = 725
  plant.y = 313

  const harvest = require('./harvestFunction')(bot, targets)
  harvest.stateName = 'Harvest'
  harvest.x = 325
  harvest.y = 313

  const findItemsAndPickup = require('./findItemsAndPickup')(bot, targets)
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
