const Vec3 = require('vec3')
const {
  StateTransition,
  NestedStateMachine,
  BehaviorIdle,
  BehaviorEquipItem
} = require('mineflayer-statemachine')
const BehaviorCustomPlaceBlock = require('@BehaviorModules/BehaviorCustomPlaceBlock')
const BehaviorFertilize = require('@BehaviorModules/BehaviorFertilize')
const BehaviorMoveTo = require('@BehaviorModules/BehaviorMoveTo')
const BehaviorCraft = require('@BehaviorModules/BehaviorCraft')

function plantFunction (bot, targets) {
  const { harvestMode, plants } = require('@modules/plantType')
  const blocksForPlant = ['dirt', 'coarse_dirt', 'grass_block', 'farmland']
  const blockAir = ['air', 'cave_air']

  let plantIsFinished = false
  let blockToPlant

  function checkBlockToPlant () {
    blockToPlant = getBlockCanPlant()

    if (blockToPlant === undefined) {
      plantIsFinished = true
      return
    }

    targets.item = bot.inventory.items().find(item => plants[targets.plantArea.plant].seed === item.name)
    if (!targets.item && ['melon', 'pumpkin'].includes(targets.plantArea.plant)) {
      const ingredient = bot.inventory.items().find(item => plants[targets.plantArea.plant].craftedBy === item.name)
      if (ingredient) {
        targets.craftItem = {
          name: plants[targets.plantArea.plant].seed
        }
      }
    }

    targets.position = blockToPlant.position.offset(0, 1, 0)
    targets.block = blockToPlant
  }

  function getBlockCanPlant () {
    const xStart = targets.plantArea.xStart < targets.plantArea.xEnd ? targets.plantArea.xStart : targets.plantArea.xEnd
    const xEnd = targets.plantArea.xStart > targets.plantArea.xEnd ? targets.plantArea.xStart : targets.plantArea.xEnd
    const zStart = targets.plantArea.zStart < targets.plantArea.zEnd ? targets.plantArea.zStart : targets.plantArea.zEnd
    const zEnd = targets.plantArea.zStart > targets.plantArea.zEnd ? targets.plantArea.zStart : targets.plantArea.zEnd
    const yLayer = targets.plantArea.yLayer
    const plant = targets.plantArea.plant
    const type = plants[plant].type

    if (type === 'normal') {
      for (let xCurrent = xStart; xCurrent <= xEnd; xCurrent++) {
        for (let zCurrent = zStart; zCurrent <= zEnd; zCurrent++) {
          const block = bot.blockAt(new Vec3(xCurrent, yLayer, zCurrent))
          if (block && blocksForPlant.includes(block.name)) {
            const upBlock = bot.blockAt(new Vec3(xCurrent, yLayer + 1, zCurrent))
            if (blockAir.includes(upBlock.name)) {
              return block
            }
          }
        }
      }
    }

    if (type === 'melon' || type === 'sweet_berries') {
      for (let xCurrent = xStart; xCurrent <= xEnd; xCurrent += 2) {
        let line = 0
        for (let zCurrent = zStart; zCurrent <= zEnd; zCurrent++) {
          line++
          if (type === 'sweet_berries' && line % 5 === 0) {
            continue
          }
          const block = bot.blockAt(new Vec3(xCurrent, yLayer, zCurrent))
          if (block && blocksForPlant.includes(block.name)) {
            const upBlock = bot.blockAt(new Vec3(xCurrent, yLayer + 1, zCurrent))
            if (blockAir.includes(upBlock.name)) {
              return block
            }
          }
        }
      }
    }

    if (type === 'tree') {
      for (let xCurrent = xStart; xCurrent <= xEnd; xCurrent += 2) {
        for (let zCurrent = zStart; zCurrent <= zEnd; zCurrent += 2) {
          const block = bot.blockAt(new Vec3(xCurrent, yLayer, zCurrent))
          if (block && blocksForPlant.includes(block.name)) {
            const upBlock = bot.blockAt(new Vec3(xCurrent, yLayer + 1, zCurrent))
            if (blockAir.includes(upBlock.name)) {
              return block
            }
          }
        }
      }
    }

    return undefined
  }

  const start = new BehaviorIdle()
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  exit.x = 125
  exit.y = 313

  const goPlant = new BehaviorMoveTo(bot, targets, 10000)
  goPlant.stateName = 'Go Plant'
  goPlant.movements = targets.movements
  goPlant.x = 525
  goPlant.y = 313

  const checkArea = new BehaviorIdle()
  checkArea.stateName = 'Check Area for Plant'
  checkArea.x = 325
  checkArea.y = 113

  const checkPlant = new BehaviorIdle()
  checkPlant.stateName = 'Exsist Any Position To Plant'
  checkPlant.x = 320
  checkPlant.y = 313

  const placePlant = new BehaviorCustomPlaceBlock(bot, targets, false)
  placePlant.stateName = 'Place Plant'
  placePlant.x = 625
  placePlant.y = 113

  const equipHoe = new BehaviorEquipItem(bot, targets)
  equipHoe.stateName = 'Equip Hoe'
  equipHoe.x = 525
  equipHoe.y = 513

  const fertilize = new BehaviorFertilize(bot, targets)
  fertilize.stateName = 'Fertilize'
  fertilize.x = 750
  fertilize.y = 313

  const craftItem = new BehaviorCraft(bot, targets)
  craftItem.stateName = 'Craft Item'
  craftItem.x = 425
  craftItem.y = 513

  const transitions = [

    new StateTransition({
      parent: start,
      child: checkArea,
      onTransition: () => {
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
      child: craftItem,
      shouldTransition: () => !plantIsFinished && targets.craftItem
    }),

    new StateTransition({
      parent: checkPlant,
      child: exit,
      shouldTransition: () => plantIsFinished || targets.item === undefined
    }),

    new StateTransition({
      parent: checkPlant,
      child: goPlant,
      shouldTransition: () => !plantIsFinished
    }),

    new StateTransition({
      parent: craftItem,
      child: goPlant,
      shouldTransition: () => {
        return craftItem.isFinished() && craftItem.isSuccess()
      }
    }),

    new StateTransition({
      parent: craftItem,
      child: checkPlant,
      shouldTransition: () => {
        return craftItem.isFinished() && !craftItem.isSuccess()
      }
    }),

    new StateTransition({
      parent: goPlant,
      child: placePlant,
      shouldTransition: () => goPlant.distanceToTarget() < 3 &&
        (
          blockToPlant.name === 'farmland' ||
          plants[targets.plantArea.plant].type === 'tree' ||
          plants[targets.plantArea.plant].type === 'sweet_berries'
        )
    }),

    new StateTransition({
      parent: goPlant,
      child: fertilize,
      onTransition: () => {
        targets.position = targets.position.offset(0, -1, 0)
      },
      shouldTransition: () => goPlant.distanceToTarget() < 3 &&
        blockToPlant.name !== 'farmland' &&
        plants[targets.plantArea.plant].type !== 'tree' &&
        plants[targets.plantArea.plant].type !== 'sweet_berries'
    }),

    new StateTransition({
      parent: fertilize,
      child: placePlant,
      onTransition: () => {
        targets.position = targets.position.offset(0, 1, 0)
      },
      shouldTransition: () => fertilize.isFinished() && fertilize.isSuccess()
    }),

    new StateTransition({
      parent: fertilize,
      child: checkArea,
      shouldTransition: () => fertilize.isFinished() && !fertilize.isSuccess()
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
