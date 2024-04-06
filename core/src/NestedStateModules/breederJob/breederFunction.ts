import { StateTransition, BehaviorIdle, NestedStateMachine } from 'mineflayer-statemachine'
import FeedAnimalFunction from '@/NestedStateModules/breederJob/feedAnimalFunction'
import { BehaviorLoadConfig } from '@/BehaviorModules'
import { Entity } from 'prismarine-entity'
import { Bot } from 'mineflayer'
import { LegionStateMachineTargets, animals } from 'base-types'
const animalTypes = Object.keys(animals)

function breederFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const start = new BehaviorIdle()
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'
  loadConfig.x = 325
  loadConfig.y = 113

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  exit.x = 525
  exit.y = 263

  const checkFarmAreas = new BehaviorIdle()
  checkFarmAreas.stateName = 'Check Animals'
  checkFarmAreas.x = 325
  checkFarmAreas.y = 263

  const feedAnimal = FeedAnimalFunction(bot, targets)
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
      yStart = area.yLayer - 5
      yEnd = area.yLayer + 5

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

          // @ts-ignore
          if (entity.metadata[16] === true) { // is a baby
            continue
          }

          const animalId = targets.breederJob.breededAnimals.findIndex(b => {
            return b.id === entity.id
          })

          if (animalId === -1) {
            targets.breederJob.breededAnimals.push(entity)
            animalsToFeed.push(entity)
            continue
          }

          const animalToFeed = targets.breederJob.breededAnimals[animalId]

          if (!animalToFeed.breededDate) {
            animalsToFeed.push(animalToFeed)
            continue
          }

          if (Date.now() - (animalToFeed.breededDate ?? 0) > targets.breederJob.farmAnimalSeconds * 1000) {
            animalsToFeed.push(targets.breederJob.breededAnimals[animalId])
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
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: loadConfig,
      child: checkFarmAreas,
      onTransition: () => {
        targets.breederJob.farmAnimal = structuredClone(bot.config.farmAnimal)
        targets.breederJob.farmAreas = structuredClone(bot.config.farmAreas)
        targets.breederJob.farmAnimalSeconds = bot.config.farmAnimalSeconds
        targets.breederJob.animalsToBeFeed = getAnimalsToBeFeed()
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkFarmAreas,
      child: feedAnimal,
      onTransition: () => {
        targets.breederJob.feedEntity = targets.breederJob.animalsToBeFeed.shift() as Entity
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
        targets.breederJob.feedEntity = targets.breederJob.animalsToBeFeed.shift() as Entity
      },
      shouldTransition: () => {
        return feedAnimal.isFinished() && targets.breederJob.animalsToBeFeed.length > 0
      }
    })

  ]

  const nestedState = new NestedStateMachine(transitions, start, exit)
  nestedState.stateName = 'breederFunction'
  return nestedState
}

export default breederFunction
