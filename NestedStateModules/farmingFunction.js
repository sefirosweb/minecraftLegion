const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

function farmingFunction (bot, targets) {
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'
  exit.x = 125
  exit.y = 313

  const checkFarmingAreas = new BehaviorIdle(targets)
  checkFarmingAreas.stateName = 'Check Farming Area'
  checkFarmingAreas.x = 325
  checkFarmingAreas.y = 113

  const harvest = new BehaviorIdle(targets)
  harvest.stateName = 'Harvest'
  harvest.x = 525
  harvest.y = 113

  const plant = new BehaviorIdle(targets)
  plant.stateName = 'Plant'
  plant.x = 513
  plant.y = 313

  const transitions = [

    new StateTransition({
      parent: start,
      child: checkFarmingAreas,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkFarmingAreas,
      child: harvest,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: harvest,
      child: plant,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: plant,
      child: exit,
      shouldTransition: () => true
    })

  ]

  const farmingFunction = new NestedStateMachine(transitions, start, exit)
  farmingFunction.stateName = 'farmingFunction'
  return farmingFunction
}

module.exports = farmingFunction
