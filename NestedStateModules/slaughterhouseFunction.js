const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

function slaughterhouseFunction (bot, targets) {
  targets.breededAnimals = []

  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'
  exit.x = 525
  exit.y = 113

  const check = new BehaviorIdle(targets)
  check.stateName = 'Check'
  check.x = 325
  check.y = 113

  const slaughter = require('@NestedStateModules/slaughterFunction')(bot, targets)
  slaughter.stateName = 'Slaughter'
  slaughter.x = 325
  slaughter.y = 263

  let cows, sheeps

  const getSpareAnimals = () => {
    cows = targets.breededAnimals.filter(e => {
      return e.name === 'cow'
    })

    sheeps = targets.breededAnimals.filter(e => {
      return e.name === 'sheep'
    })
  }

  const transitions = [
    new StateTransition({
      parent: start,
      child: check,
      onTransition: () => {
        getSpareAnimals()
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: check,
      child: slaughter,
      onTransition: () => {
        if (cows.length > targets.farmAnimal.cow) {
          targets.entity = cows.shift()
        } else {
          if (sheeps.length > targets.farmAnimal.sheep) {
            targets.entity = sheeps.shift()
          }
        }
      },
      shouldTransition: () => cows.length > targets.farmAnimal.cow || sheeps.length > targets.farmAnimal.sheep
    }),

    new StateTransition({
      parent: slaughter,
      child: check,
      shouldTransition: () => slaughter.isFinished()
    }),

    new StateTransition({
      parent: check,
      child: exit,
      shouldTransition: () => cows.length <= targets.farmAnimal.cow && sheeps.length <= targets.farmAnimal.sheep
    })
  ]

  const slaughterhouseFunction = new NestedStateMachine(transitions, start, exit)
  slaughterhouseFunction.stateName = 'slaughterhouseFunction'
  return slaughterhouseFunction
}

module.exports = slaughterhouseFunction
