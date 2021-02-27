const Vec3 = require('Vec3')
const {
  StateTransition,
  BehaviorIdle,
  BehaviorMoveTo,
  NestedStateMachine
} = require('mineflayer-statemachine')
const BehaviorLoadConfig = require('./../BehaviorModules/BehaviorLoadConfig')
const BehaviorCustomPlaceBlock = require('./../BehaviorModules/BehaviorCustomPlaceBlock ')
const mineflayerPathfinder = require('mineflayer-pathfinder')
let movements

function plantFunction (bot, targets) {
  const blocksForPlant = ['dirt', 'grass_block', 'farmland']
  const blockAir = ['air', 'cave_air']
  const mcData = require('minecraft-data')(bot.version)
  movements = new mineflayerPathfinder.Movements(bot, mcData)

  let plantIsFinished = false

  function checkBlockToPlant () {
    const item = bot.inventory.items().find(item => targets.plantArea.plant === item.name)
    const block = getBlockCanPlant()

    if (block === undefined) {
      plantIsFinished = true
      return
    }

    targets.item = item
    targets.position = block.position
  }

  function getBlockCanPlant () {
    const xStart = targets.plantArea.xStart < targets.plantArea.xEnd ? targets.plantArea.xStart : targets.plantArea.xEnd
    const xEnd = targets.plantArea.xStart > targets.plantArea.xEnd ? targets.plantArea.xStart : targets.plantArea.xEnd
    const zStart = targets.plantArea.zStart < targets.plantArea.zEnd ? targets.plantArea.zStart : targets.plantArea.zEnd
    const zEnd = targets.plantArea.zStart > targets.plantArea.zEnd ? targets.plantArea.zStart : targets.plantArea.zEnd
    const yLayer = targets.plantArea.yLayer

    for (let xCurrent = xStart; xCurrent <= xEnd; xCurrent++) {
      for (let zCurrent = zStart; zCurrent <= zEnd; zCurrent++) {
        const block = bot.blockAt(new Vec3(xCurrent, yLayer, zCurrent))
        if (blocksForPlant.includes(block.name)) {
          const upBlock = bot.blockAt(new Vec3(xCurrent, yLayer + 1, zCurrent))
          if (blockAir.includes(upBlock.name)) {
            return upBlock
          }
        }
      }
    }

    return undefined
  }

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

  const goPlant = new BehaviorMoveTo(bot, targets)
  goPlant.stateName = 'Go Plant'
  goPlant.movements = movements

  const checkArea = new BehaviorIdle(targets)
  checkArea.stateName = 'Check Area for Plant'

  const checkPlant = new BehaviorIdle(targets)
  checkPlant.stateName = 'Exsist Any Position To Plant'

  const placePlant = new BehaviorCustomPlaceBlock(bot, targets)
  placePlant.name = 'Place Plant'

  const transitions = [

    new StateTransition({
      parent: start,
      child: loadConfig,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: loadConfig,
      child: checkArea,
      onTransition: () => {
        movements.allowSprinting = loadConfig.getAllowSprinting(bot.username)
        movements.canDig = loadConfig.getCanDig(bot.username)
        plantIsFinished = false
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkArea,
      child: checkPlant,
      onTransition: () => {
        checkBlockToPlant()
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkPlant,
      child: exit,
      shouldTransition: () => plantIsFinished
    }),

    new StateTransition({
      parent: checkPlant,
      child: goPlant,
      shouldTransition: () => !plantIsFinished
    }),

    new StateTransition({
      parent: goPlant,
      child: placePlant,
      shouldTransition: () => goPlant.isFinished()
    }),

    new StateTransition({
      parent: placePlant,
      child: checkArea,
      shouldTransition: () => placePlant.isFinished() || placePlant.isItemNotFound() || placePlant.isCantPlaceBlock()
    })

  ]

  const plantFunction = new NestedStateMachine(transitions, start, exit)
  plantFunction.stateName = 'plantFunction'
  return plantFunction
}

module.exports = plantFunction
