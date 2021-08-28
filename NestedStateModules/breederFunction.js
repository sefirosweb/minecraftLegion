const botWebsocket = require('@modules/botWebsocket')
const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('@BehaviorModules/BehaviorLoadConfig')

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
  exit.x = 325
  exit.y = 613

  const checkFarmAreas = new BehaviorIdle(targets)
  checkFarmAreas.stateName = 'Check Animals'
  checkFarmAreas.x = 12
  checkFarmAreas.y = 11

  const feedAnimal = require('@NestedStateModules/feedAnimalFunction')(bot, targets)
  feedAnimal.x = 325
  feedAnimal.y = 213

  const getAnimalsToBeFeed = () => {
    console.log(targets.farmAnimal)
    console.log(targets.farmAreas)

    const area = targets.farmAreas[0]

    const xStart = area.xStart > area.xEnd ? area.xEnd : area.xStart
    const xEnd = area.xStart > area.xEnd ? area.xStart : area.xEnd
    const zStart = area.zStart > area.zEnd ? area.zEnd : area.zStart
    const zEnd = area.zStart > area.zEnd ? area.zStart : area.zEnd
    const yStart = area.yLayer - 1
    const yEnd = area.yLayer + 1

    const animalsToFeed = []

    for (const entityName of Object.keys(bot.entities)) {
      const entity = bot.entities[entityName]
      if (entity === bot.entity) { continue }
      if (
        ['cow', 'sheep'].includes(entity.name) &&
        entity.position.x >= xStart && entity.position.x <= xEnd &&
        entity.position.y >= yStart && entity.position.y <= yEnd &&
        entity.position.z >= zStart && entity.position.z <= zEnd
      ) {
        const animalBreeded = targets.breededAnimals.findIndex(b => {
          return b.id === entity.id
        })

        if (animalBreeded >= 0) {
          if (
            !entity.breededDate ||
            Date.now() - entity.breededDate > 10000
          ) {
            targets.breededAnimals[animalBreeded] = entity
            animalsToFeed.push(entity)
          }
        } else {
          targets.breededAnimals.push(entity)
          animalsToFeed.push(entity)
        }
      }
    }

    console.log(animalsToFeed)
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
        console.log('total animals', targets.animalsToBeFeed.length)
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkFarmAreas,
      child: feedAnimal,
      onTransition: () => {
        targets.entity = targets.animalsToBeFeed.shift()
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
        targets.entity = targets.animalsToBeFeed.shift()
      },
      shouldTransition: () => feedAnimal.isFinished() && targets.animalsToBeFeed.length > 0
    })

  ]

  const breederFunction = new NestedStateMachine(transitions, start, exit)
  breederFunction.stateName = 'breederFunction'
  return breederFunction
}

module.exports = breederFunction
