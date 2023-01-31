import { Bot, LegionStateMachineTargets } from '@/types'
import {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} from 'mineflayer-statemachine'
import { Entity } from 'prismarine-entity'
import SlaughterFunction from '@/NestedStateModules/breederJob/slaughterFunction'

function slaughterhouseFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const start = new BehaviorIdle()
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  exit.x = 525
  exit.y = 113

  const check = new BehaviorIdle()
  check.stateName = 'Check'
  check.x = 325
  check.y = 113

  const slaughter = SlaughterFunction(bot, targets)
  slaughter.stateName = 'Slaughter'
  slaughter.x = 325
  slaughter.y = 263

  let animalsToKill: Array<Entity>

  const getSpareAnimals = () => {
    const spareAnimals: Array<Entity> = []
    let spare
    Object.entries(targets.breederJob.farmAnimal).forEach((entry) => {
      const [animalName, animalQuantity] = entry
      spare = targets.breederJob.breededAnimals.filter(e => {
        //@ts-ignore e.metadata[16] ==> is a baby
        return e.name === animalName && e.metadata[16] === false
      })

      if (spare.length > animalQuantity) {
        const currentEntities = Object.values(bot.entities).map(e => e.uuid)
        const realSpare = spare.filter((e) => currentEntities.includes(e.uuid))

        if (realSpare.length > animalQuantity) {
          const missingEntities = spare.filter((e) => !currentEntities.includes(e.uuid)).map(e => e.uuid)
          if (missingEntities.length > 0) {
            targets.breederJob.breededAnimals = targets.breederJob.breededAnimals.filter(e => !missingEntities.includes(e.uuid))
          }

          realSpare.splice(realSpare.length - animalQuantity, realSpare.length)
          spareAnimals.push(...realSpare)
        }
      }

    })

    return spareAnimals
  }

  const transitions = [
    new StateTransition({
      parent: start,
      child: check,
      onTransition: () => {
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

  const nestedState = new NestedStateMachine(transitions, start, exit)
  nestedState.stateName = 'slaughterhouseFunction'
  return nestedState
}

export default slaughterhouseFunction
