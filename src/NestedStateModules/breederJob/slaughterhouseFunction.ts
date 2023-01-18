import { LegionStateMachineTargets } from '@/types'
import { Bot } from 'mineflayer'
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
  //@ts-ignore
  start.x = 125
  //@ts-ignore
  start.y = 113

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  //@ts-ignore
  exit.x = 525
  //@ts-ignore
  exit.y = 113

  const check = new BehaviorIdle()
  check.stateName = 'Check'
  //@ts-ignore
  check.x = 325
  //@ts-ignore
  check.y = 113

  const slaughter = SlaughterFunction(bot, targets)
  slaughter.stateName = 'Slaughter'
  //@ts-ignore
  slaughter.x = 325
  //@ts-ignore
  slaughter.y = 263

  let animalsToKill: Array<Entity>

  const getSpareAnimals = () => {
    const spareAnimals: Array<Entity> = []
    let spare
    Object.keys(targets.breederJob.farmAnimal).forEach(animalName => {

      //@ts-ignore
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

  const nestedState = new NestedStateMachine(transitions, start, exit)
  nestedState.stateName = 'slaughterhouseFunction'
  return nestedState
}

export default slaughterhouseFunction
