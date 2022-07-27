import {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} from 'mineflayer-statemachine'

//@ts-ignore
import BehaviorLoadConfig from '@BehaviorModules/BehaviorLoadConfig'
//@ts-ignore
import animalType from '@modules/animalType'
import { Bot, LegionStateMachineTargets } from '@/types'
import { Entity } from 'prismarine-entity'
const animalTypes = Object.keys(animalType)

function breederFunction(bot: Bot, targets: LegionStateMachineTargets) {
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
  exit.x = 525
  //@ts-ignore
  exit.y = 263

  const checkFarmAreas = new BehaviorIdle()
  checkFarmAreas.stateName = 'Check Animals'
  //@ts-ignore
  checkFarmAreas.x = 325
  //@ts-ignore
  checkFarmAreas.y = 263

  const feedAnimal = require('@NestedStateModules/breederJob/feedAnimalFunction')(bot, targets)
  feedAnimal.stateName = 'Feed'
  feedAnimal.x = 325
  feedAnimal.y = 413

  const getAnimalsToBeFeed = () => {
    const animalsToFeed: Array<Entity> = []
    let xStart, xEnd, zStart, zEnd, yStart, yEnd

    targets.breederJob.farmAreas.forEach(area => {
      xStart = area.xStart > area.xEnd ? area.xEnd : area.xStart
      xEnd = area.xStart > area.xEnd ? area.xStart : area.xEnd
      zStart = area.zStart > area.zEnd ? area.zEnd : area.zStart
      zEnd = area.zStart > area.zEnd ? area.zStart : area.zEnd
      yStart = area.yLayer - 1
      yEnd = area.yLayer + 1

      for (const entityName of Object.keys(bot.entities)) {
        const entity = bot.entities[entityName]
        if (entity === bot.entity) { continue }
        if (
          entity.name &&
          animalTypes.includes(entity.name) &&
          entity.position.x >= xStart && entity.position.x <= xEnd &&
          entity.position.y >= yStart && entity.position.y <= yEnd &&
          entity.position.z >= zStart && entity.position.z <= zEnd
        ) {
          const animalId = targets.breederJob.breededAnimals.findIndex(b => {
            return b.id === entity.id
          })

          if (animalId !== undefined && animalId >= 0) {
            if (
              !targets.breederJob.breededAnimals[animalId].breededDate ||
              (
                targets.breederJob &&
                Date.now() - (targets.breederJob.breededAnimals[animalId].breededDate ?? 0) > targets.breederJob.farmAnimal.seconds * 1000
              )
            ) {
              if (targets.breederJob) {
                animalsToFeed.push(targets.breederJob.breededAnimals[animalId])
              }
            }
          } else {
            targets.breederJob.breededAnimals.push(entity)
            animalsToFeed.push(entity)
          }
        }
      }
    })
    return animalsToFeed
  }

  const transitions = [
    new StateTransition({
      parent: start,
      child: loadConfig,
      onTransition: () => {
        targets.breederJob.breededAnimals = []
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: loadConfig,
      child: checkFarmAreas,
      onTransition: () => {
        targets.breederJob.farmAnimal = loadConfig.getFarmAnimal()
        targets.breederJob.farmAreas = loadConfig.getFarmAreas()
        targets.breederJob.animalsToBeFeed = getAnimalsToBeFeed()
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkFarmAreas,
      child: feedAnimal,
      onTransition: () => {
        targets.breederJob.feedEntity = targets.breederJob.animalsToBeFeed.shift()
      },
      shouldTransition: () => targets.breederJob.animalsToBeFeed.length > 0
    }),

    new StateTransition({
      parent: checkFarmAreas,
      child: exit,
      shouldTransition: () => targets.breederJob.animalsToBeFeed.length === 0
    }),

    new StateTransition({
      parent: feedAnimal,
      child: exit,
      shouldTransition: () => feedAnimal.isFinished() && targets.breederJob.animalsToBeFeed.length === 0
    }),

    new StateTransition({
      parent: feedAnimal,
      child: feedAnimal,
      onTransition: () => {
        targets.breederJob.feedEntity = targets.breederJob.animalsToBeFeed.shift()
      },
      shouldTransition: () => {
        return feedAnimal.isFinished() && targets.breederJob.animalsToBeFeed.length > 0
      }
    })

  ]

  const breederFunction = new NestedStateMachine(transitions, start, exit)
  breederFunction.stateName = 'breederFunction'
  return breederFunction
}

module.exports = breederFunction
