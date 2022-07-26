const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('@BehaviorModules/BehaviorLoadConfig')
const animalType = require('@modules/animalType')
const animalTypes = Object.keys(animalType)

function breederFunction (bot, targets) {
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
  exit.x = 525
  exit.y = 263

  const checkFarmAreas = new BehaviorIdle(targets)
  checkFarmAreas.stateName = 'Check Animals'
  checkFarmAreas.x = 325
  checkFarmAreas.y = 263

  const feedAnimal = require('@NestedStateModules/breederJob/feedAnimalFunction')(bot, targets)
  feedAnimal.stateName = 'Feed'
  feedAnimal.x = 325
  feedAnimal.y = 413

  const getAnimalsToBeFeed = () => {
    const animalsToFeed = []
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
          animalTypes.includes(entity.name) &&
          entity.position.x >= xStart && entity.position.x <= xEnd &&
          entity.position.y >= yStart && entity.position.y <= yEnd &&
          entity.position.z >= zStart && entity.position.z <= zEnd
        ) {
          const animalId = targets.breederJob.breededAnimals.findIndex(b => {
            return b.id === entity.id
          })

          if (animalId >= 0) {
            if (
              !targets.breederJob.breededAnimals[animalId].breededDate ||
              Date.now() - targets.breederJob.breededAnimals[animalId].breededDate > targets.breederJob.farmAnimal.seconds * 1000
            ) {
              animalsToFeed.push(targets.breederJob.breededAnimals[animalId])
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
