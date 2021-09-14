const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

function slaughterhouseFunction (bot, targets) {
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

  const slaughter = require('@NestedStateModules/breederJob/slaughterFunction')(bot, targets)
  slaughter.stateName = 'Slaughter'
  slaughter.x = 325
  slaughter.y = 263

  let animalsToKill

  const getSpareAnimals = () => {
    const spareAnimals = []
    let spare
    Object.keys(targets.breederJob.farmAnimal).forEach(animalName => {
      const animalQuantity = targets.breederJob.farmAnimal[animalName]
      spare = targets.breederJob.breededAnimals.filter(e => {
        return e.name === animalName
      })
      if (spare.length > animalQuantity) {
        spare.splice(0, animalQuantity)
        spareAnimals.push(...spare)
      }
    })

    return spareAnimals
  }

  const transitions = [
    new StateTransition({
      parent: start,
      child: check,
      onTransition: () => {
        targets.breederJob.breededAnimals = []
        animalsToKill = getSpareAnimals()
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: check,
      child: slaughter,
      onTransition: () => {
        targets.entity = animalsToKill.shift()
      },
      shouldTransition: () => animalsToKill.length > 0
    }),

    new StateTransition({
      parent: check,
      child: exit,
      shouldTransition: () => animalsToKill.length === 0
    }),

    new StateTransition({
      parent: slaughter,
      child: slaughter,
      onTransition: () => {
        targets.entity = animalsToKill.shift()
      },
      shouldTransition: () => slaughter.isFinished() && animalsToKill.length > 0
    }),

    new StateTransition({
      parent: slaughter,
      child: exit,
      shouldTransition: () => slaughter.isFinished() && animalsToKill.length === 0
    })
  ]

  const slaughterhouseFunction = new NestedStateMachine(transitions, start, exit)
  slaughterhouseFunction.stateName = 'slaughterhouseFunction'
  return slaughterhouseFunction
}

module.exports = slaughterhouseFunction
