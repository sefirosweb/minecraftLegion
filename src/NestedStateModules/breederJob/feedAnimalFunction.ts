import {
  StateTransition,
  BehaviorIdle,
  BehaviorFollowEntity,
  NestedStateMachine
} from 'mineflayer-statemachine'

import BehaviorEquip from '@/BehaviorModules/BehaviorEquip'
import BehaviorInteractEntity from '@/BehaviorModules/BehaviorInteractEntity'
import animalType from '@/modules/animalType'
import { Bot, LegionStateMachineTargets } from '@/types'
import mcDataLoader from 'minecraft-data'

function feedAnimalFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const mcData = mcDataLoader(bot.version)

  const start = new BehaviorIdle()
  start.stateName = 'Start'
  //@ts-ignore
  start.x = 125
  //@ts-ignore
  start.y = 113

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  //@ts-ignore
  exit.x = 350
  //@ts-ignore
  exit.y = 313

  const equip = new BehaviorEquip(bot, targets)
  equip.stateName = 'Equip'
  equip.x = 350
  equip.y = 113

  const interactEntity = new BehaviorInteractEntity(bot, targets)
  interactEntity.stateName = 'Interact'
  interactEntity.x = 575
  interactEntity.y = 313

  //@ts-ignore
  const followAnimal = new BehaviorFollowEntity(bot, targets)
  followAnimal.stateName = 'Follow Animal'
  //@ts-ignore
  followAnimal.x = 575
  //@ts-ignore
  followAnimal.y = 113
  //@ts-ignore
  followAnimal.movements = targets.movements

  const transitions = [
    new StateTransition({
      parent: start,
      child: equip,
      onTransition: () => {
        const feedEntity = targets.breederJob.feedEntity
        const validFoods = animalType[feedEntity.name ?? ''].foods
        const validFood = bot.inventory.items().find(item => validFoods.includes(item.name))
        if (validFood) {
          targets.item = mcData.itemsByName[validFood.name]
        } else {
          targets.item = null
        }
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: equip,
      child: followAnimal,
      onTransition: () => {
        targets.entity = targets.breederJob.feedEntity
      },
      shouldTransition: () => equip.isFinished() && equip.isWasEquipped()
    }),

    new StateTransition({
      parent: equip,
      child: exit,
      shouldTransition: () => equip.isFinished() && !equip.isWasEquipped()
    }),

    new StateTransition({
      parent: followAnimal,
      child: exit,
      onTransition: () => {
        const animalId = targets.breederJob.breededAnimals.findIndex(b => {
          return b.id === targets.breederJob.feedEntity?.id
        })
        if (animalId >= 0) {
          targets.breederJob.breededAnimals.splice(animalId, 1)
        }
      },
      shouldTransition: () => {
        return !targets.entity || !targets.entity.isValid
      }
    }),

    new StateTransition({
      parent: followAnimal,
      child: interactEntity,
      onTransition: () => {
        targets.interactEntity = targets.breederJob.feedEntity
      },
      shouldTransition: () => targets.entity !== undefined && followAnimal.distanceToTarget() < 2 && targets.entity.isValid
    }),

    new StateTransition({
      parent: interactEntity,
      child: exit,
      onTransition: () => {
        const animalId = targets.breederJob.breededAnimals.findIndex(b => {
          return b.id === targets.breederJob.feedEntity?.id
        })

        if (animalId >= 0) {
          targets.breederJob.breededAnimals[animalId].breededDate = Date.now()
        }

        targets.interactEntity = undefined
      },
      shouldTransition: () => interactEntity.isFinished()
    })

  ]

  const nestedState = new NestedStateMachine(transitions, start, exit)
  nestedState.stateName = 'feedAnimalFunction'
  return nestedState
}

export default feedAnimalFunction
