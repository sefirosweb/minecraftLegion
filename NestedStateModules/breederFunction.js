const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('@BehaviorModules/BehaviorLoadConfig')
const animalType = require('@modules/animalType')
const animalTypes = Object.keys(animalType)

function breederFunction (bot, targets) {
  targets.breededAnimals = []

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

  const feedAnimal = require('@NestedStateModules/feedAnimalFunction')(bot, targets)
  feedAnimal.stateName = 'Feed'
  feedAnimal.x = 325
  feedAnimal.y = 413

  const getAnimalsToBeFeed = () => {
    const animalsToFeed = []
    let xStart, xEnd, zStart, zEnd, yStart, yEnd

    targets.farmAreas.forEach(area => {
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
          const animalId = targets.breededAnimals.findIndex(b => {
            return b.id === entity.id
          })

          if (animalId >= 0) {
            if (
              !targets.breededAnimals[animalId].breededDate ||
              Date.now() - targets.breededAnimals[animalId].breededDate > targets.farmAnimal.seconds * 1000
            ) {
              animalsToFeed.push(targets.breededAnimals[animalId])
            }
          } else {
            targets.breededAnimals.push(entity)
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
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: loadConfig,
      child: checkFarmAreas,
      onTransition: () => {
        targets.farmAnimal = loadConfig.getFarmAnimal()
        targets.farmAreas = loadConfig.getFarmAreas()
        targets.animalsToBeFeed = getAnimalsToBeFeed()
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkFarmAreas,
      child: feedAnimal,
      onTransition: () => {
        targets.feedEntity = targets.animalsToBeFeed.shift()
      },
      shouldTransition: () => targets.animalsToBeFeed.length > 0
    }),

    new StateTransition({
      parent: checkFarmAreas,
      child: exit,
      shouldTransition: () => targets.animalsToBeFeed.length === 0
    }),

    new StateTransition({
      parent: feedAnimal,
      child: exit,
      shouldTransition: () => feedAnimal.isFinished() && targets.animalsToBeFeed.length === 0
    }),

    new StateTransition({
      parent: feedAnimal,
      child: feedAnimal,
      onTransition: () => {
        targets.feedEntity = targets.animalsToBeFeed.shift()
      },
      shouldTransition: () => {
        return feedAnimal.isFinished() && targets.animalsToBeFeed.length > 0
      }
    })

  ]

  const breederFunction = new NestedStateMachine(transitions, start, exit)
  breederFunction.stateName = 'breederFunction'
  return breederFunction
}

module.exports = breederFunction
