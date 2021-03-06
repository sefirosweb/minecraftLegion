const Vec3 = require('Vec3')

const {
  StateTransition,
  BehaviorIdle,
  BehaviorMoveTo,
  NestedStateMachine
} = require('mineflayer-statemachine')
const BehaviorLoadConfig = require('./../BehaviorModules/BehaviorLoadConfig')
const BehaviorDigBlock = require('./../BehaviorModules/BehaviorDigBlock')
const mineflayerPathfinder = require('mineflayer-pathfinder')
let movements

function harvestFunction (bot, targets) {
  const mcData = require('minecraft-data')(bot.version)
  movements = new mineflayerPathfinder.Movements(bot, mcData)

  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'
  loadConfig.x = 325
  loadConfig.y = 113

  const goPlant = new BehaviorMoveTo(bot, targets)
  goPlant.stateName = 'Go Plant'
  goPlant.movements = movements
  goPlant.x = 725
  goPlant.y = 313

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'
  exit.x = 125
  exit.y = 313

  const checkArea = new BehaviorIdle(targets)
  checkArea.stateName = 'Check Area for Harvest'
  checkArea.x = 525
  checkArea.y = 113

  const checkHarvest = new BehaviorIdle(targets)
  checkHarvest.stateName = 'Exsist Any Plant To Harvest'
  checkHarvest.x = 525
  checkHarvest.y = 313

  const harvestPlant = new BehaviorDigBlock(bot, targets)
  harvestPlant.stateName = 'Harvest Plant'
  harvestPlant.x = 725
  harvestPlant.y = 113

  let harvestIsFinished = false

  function checkPlantAge () {
    const block = getPlantBlock()

    if (block === undefined) {
      harvestIsFinished = true
      return
    }
    targets.digBlock = block
    harvestIsFinished = false
  }

  const plantType = require('../modules/plantType')

  function getPlantBlock () {
    const xStart = targets.plantArea.xStart < targets.plantArea.xEnd ? targets.plantArea.xStart : targets.plantArea.xEnd
    const xEnd = targets.plantArea.xStart > targets.plantArea.xEnd ? targets.plantArea.xStart : targets.plantArea.xEnd
    const zStart = targets.plantArea.zStart < targets.plantArea.zEnd ? targets.plantArea.zStart : targets.plantArea.zEnd
    const zEnd = targets.plantArea.zStart > targets.plantArea.zEnd ? targets.plantArea.zStart : targets.plantArea.zEnd
    const yLayer = targets.plantArea.yLayer + 1
    const plant = targets.plantArea.plant

    if (plantType[plant].type === 'normal') {
      for (let xCurrent = xStart; xCurrent <= xEnd; xCurrent++) {
        for (let zCurrent = zStart; zCurrent <= zEnd; zCurrent++) {
          const block = bot.blockAt(new Vec3(xCurrent, yLayer, zCurrent), true)
          if (block.name.includes(plant) && block.metadata === plantType[plant].age) {
            targets.position = new Vec3(block.position.x, yLayer, block.position.z)
            return block
          }
        }
      }
    }

    if (plantType[plant].type === 'melon') {
      for (let xCurrent = xStart - 1; xCurrent <= xEnd + 1; xCurrent++) {
        for (let zCurrent = zStart - 1; zCurrent <= zEnd + 1; zCurrent++) {
          const block = bot.blockAt(new Vec3(xCurrent, yLayer, zCurrent), true)
          if (block.name === plant) {
            targets.position = new Vec3(block.position.x, yLayer, block.position.z)
            return block
          }
        }
      }
    }

    if (plantType[plant].type === 'tree') {
      for (let xCurrent = xStart - 2; xCurrent <= xEnd + 2; xCurrent++) {
        for (let zCurrent = zStart - 2; zCurrent <= zEnd + 2; zCurrent++) {
          for (let yCurrent = yLayer; yCurrent <= yLayer + 5; yCurrent++) {
            const block = bot.blockAt(new Vec3(xCurrent, yCurrent, zCurrent), true)
            if (block.name.includes('log') || block.name.includes('leaves')) {
              targets.position = new Vec3(block.position.x, yLayer, block.position.z)
              return block
            }
          }
        }
      }
    }

    return undefined
  }

  const transitions = [

    new StateTransition({
      parent: start,
      child: loadConfig,
      onTransition: () => {
        console.log(targets.plantArea.plant)
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: loadConfig,
      child: checkArea,
      onTransition: () => {
        movements.allowSprinting = loadConfig.getAllowSprinting(bot.username)
        movements.canDig = loadConfig.getCanDig(bot.username)
        harvestIsFinished = false
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkArea,
      child: checkHarvest,
      onTransition: () => {
        checkPlantAge()
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkHarvest,
      child: exit,
      shouldTransition: () => harvestIsFinished
    }),

    new StateTransition({
      parent: checkHarvest,
      child: goPlant,
      shouldTransition: () => !harvestIsFinished
    }),

    new StateTransition({
      parent: goPlant,
      child: harvestPlant,
      onTransition: () => {
        targets.position = targets.digBlock.position.clone()
      },
      shouldTransition: () => bot.canDigBlock(targets.digBlock) && !bot.pathfinder.isMining()
    }),

    new StateTransition({
      parent: harvestPlant,
      child: checkArea,
      shouldTransition: () => harvestPlant.isFinished()
    })
  ]

  const harvestFunction = new NestedStateMachine(transitions, start, exit)
  harvestFunction.stateName = 'harvestFunction'
  return harvestFunction
}

module.exports = harvestFunction
