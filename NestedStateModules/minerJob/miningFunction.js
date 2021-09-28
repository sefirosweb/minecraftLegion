const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('@BehaviorModules/BehaviorLoadConfig')
const BehaviorMinerCheckLayer = require('@BehaviorModules/BehaviorMinerCheckLayer')
const BehaviorMinerCurrentLayer = require('@BehaviorModules/BehaviorMinerCurrentLayer')
const BehaviorMinerCurrentBlock = require('@BehaviorModules/BehaviorMinerCurrentBlock')
const BehaviorDigBlock = require('@BehaviorModules/BehaviorDigBlock')
const BehaviorMinerChecks = require('@BehaviorModules/BehaviorMinerChecks')
const BehaviorEatFood = require('@BehaviorModules/BehaviorEatFood')
const BehaviorMoveTo = require('@BehaviorModules/BehaviorMoveTo')
const BehaviorCustomPlaceBlock = require('@BehaviorModules/BehaviorCustomPlaceBlock')

const mineflayerPathfinder = require('mineflayer-pathfinder')

const movingWhile = (bot, nextCurrentLayer) => {
  const mcData = require('minecraft-data')(bot.version)
  const movements = new mineflayerPathfinder.Movements(bot, mcData)

  let x, y, z

  if (bot.entity.position.x < nextCurrentLayer.xStart) {
    x = nextCurrentLayer.xStart
  } else if (bot.entity.position.x > nextCurrentLayer.xEnd) {
    x = nextCurrentLayer.xEnd
  } else {
    x = bot.entity.position.x
  }

  if (bot.entity.position.y < nextCurrentLayer.yStart) {
    y = nextCurrentLayer.yStart
  } else if (bot.entity.position.y > nextCurrentLayer.yEnd) {
    y = nextCurrentLayer.yEnd
  } else {
    y = bot.entity.position.y
  }

  if (bot.entity.position.z < nextCurrentLayer.zStart) {
    z = nextCurrentLayer.zStart
  } else if (bot.entity.position.z > nextCurrentLayer.zEnd) {
    z = nextCurrentLayer.zEnd
  } else {
    z = bot.entity.position.z
  }

  const pathfinder = bot.pathfinder
  const goal = new mineflayerPathfinder.goals.GoalBlock(x, y, z)
  pathfinder.setMovements(movements)
  pathfinder.setGoal(goal)
}

function miningFunction (bot, targets) {
  const { getNewPositionForPlaceBlock } = require('@modules/placeBlockModule')(bot)
  const { calculateSideToPlaceBlock } = require('@modules/minerModule')(bot, targets)

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
  exit.x = 125
  exit.y = 313

  const nextLayer = new BehaviorMinerCurrentLayer(bot, targets)
  nextLayer.stateName = 'Next Layer'
  nextLayer.x = 525
  nextLayer.y = 113

  const currentBlock = new BehaviorMinerCurrentBlock(bot, targets)
  currentBlock.stateName = 'Check next block'
  currentBlock.x = 725
  currentBlock.y = 113

  const digBlock = new BehaviorDigBlock(bot, targets)
  digBlock.stateName = 'Dig Block'
  digBlock.x = 1025
  digBlock.y = 563

  const moveToBlock = new BehaviorMoveTo(bot, targets)
  moveToBlock.stateName = 'Move To Block'
  moveToBlock.x = 1025
  moveToBlock.y = 313
  moveToBlock.movements = targets.movements

  const minerChecks = new BehaviorMinerChecks(bot, targets)
  minerChecks.stateName = 'Miner Check'
  minerChecks.x = 325
  minerChecks.y = 563

  const checkLayer = new BehaviorMinerCheckLayer(bot, targets)
  checkLayer.stateName = 'Check Layer Lava & Water'
  checkLayer.x = 525
  checkLayer.y = 213

  const eatFood = new BehaviorEatFood(bot, targets)
  eatFood.stateName = 'Eat Food'
  eatFood.x = 725
  eatFood.y = 363

  const fillBlocks = require('@NestedStateModules/minerJob/fillFunction')(bot, targets)
  fillBlocks.x = 350
  fillBlocks.y = 313

  const findItemsAndPickup = require('@NestedStateModules/findItemsAndPickup')(bot, targets)
  findItemsAndPickup.stateName = 'Find Items'
  findItemsAndPickup.x = 525
  findItemsAndPickup.y = 363

  const checkPendingSides = new BehaviorIdle(targets)
  checkPendingSides.stateName = 'Check Pending Sides'
  checkPendingSides.x = 650
  checkPendingSides.y = 563

  const harvestPlant = new BehaviorDigBlock(bot, targets)
  harvestPlant.stateName = 'Harvest Plant'
  harvestPlant.x = 525
  harvestPlant.y = 713

  const placeBlock = new BehaviorCustomPlaceBlock(bot, targets)
  placeBlock.stateName = 'Place Block'
  placeBlock.x = 725
  placeBlock.y = 713

  let sidesToPlaceBlock, currentSideToPlaceBlock

  const transitions = [
    new StateTransition({
      parent: start,
      child: loadConfig,
      name: 'start -> loadConfig',
      onTransition: () => {
        targets.minerJob.blockForPlace = ['stone', 'cobblestone', 'dirt', 'andesite', 'diorite', 'granite']
        targets.minerJob.nextLayer = nextLayer

        const yStart = parseInt(targets.config.minerCords.yStart) > parseInt(targets.config.minerCords.yEnd) ? parseInt(targets.config.minerCords.yEnd) : parseInt(targets.config.minerCords.yStart)
        const yEnd = parseInt(targets.config.minerCords.yStart) > parseInt(targets.config.minerCords.yEnd) ? parseInt(targets.config.minerCords.yStart) : parseInt(targets.config.minerCords.yEnd)

        const xStart = parseInt(targets.config.minerCords.xStart) > parseInt(targets.config.minerCords.xEnd) ? parseInt(targets.config.minerCords.xEnd) : parseInt(targets.config.minerCords.xStart)
        const xEnd = parseInt(targets.config.minerCords.xStart) > parseInt(targets.config.minerCords.xEnd) ? parseInt(targets.config.minerCords.xStart) : parseInt(targets.config.minerCords.xEnd)

        const zStart = parseInt(targets.config.minerCords.zStart) > parseInt(targets.config.minerCords.zEnd) ? parseInt(targets.config.minerCords.zEnd) : parseInt(targets.config.minerCords.zStart)
        const zEnd = parseInt(targets.config.minerCords.zStart) > parseInt(targets.config.minerCords.zEnd) ? parseInt(targets.config.minerCords.zStart) : parseInt(targets.config.minerCords.zEnd)

        targets.minerJob.original = {
          xStart,
          xEnd,
          yStart,
          yEnd,
          zStart,
          zEnd
        }
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: loadConfig,
      child: nextLayer,
      name: 'loadConfig -> nextLayer',
      onTransition: () => {
        targets.entity = undefined
        nextLayer.setMinerCords(loadConfig.getMinerCords())
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: nextLayer,
      child: exit,
      name: 'Mining finished',
      shouldTransition: () => nextLayer.isFinished()
    }),

    new StateTransition({
      parent: nextLayer,
      child: checkLayer,
      name: 'nextLayer -> checkLayer',
      onTransition: () => {
        const nextCurrentLayer = nextLayer.getCurrentLayerCoords()
        movingWhile(bot, nextCurrentLayer)
        checkLayer.setMinerCords(nextCurrentLayer)
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkLayer,
      child: findItemsAndPickup,
      onTransition: () => currentBlock.setMinerCords(nextLayer.getCurrentLayerCoords()),
      shouldTransition: () => checkLayer.isFinished() || !bot.inventory.items().find(item => targets.minerJob.blockForPlace.includes(item.name))
    }),

    new StateTransition({
      parent: findItemsAndPickup,
      child: eatFood,
      shouldTransition: () => findItemsAndPickup.isFinished()
    }),

    new StateTransition({
      parent: checkLayer,
      child: fillBlocks,
      name: 'checkLayer -> fillBlocks',
      shouldTransition: () => {
        const item = bot.inventory.items().find(item => targets.minerJob.blockForPlace.includes(item.name))
        if (checkLayer.getFoundLavaOrWater() && item) {
          targets.item = item
          return true
        }
        return false
      }
    }),

    new StateTransition({
      parent: fillBlocks,
      child: checkLayer,
      name: 'Finished fill block',
      shouldTransition: () => fillBlocks.isFinished()
    }),

    new StateTransition({
      parent: currentBlock,
      child: moveToBlock,
      name: 'currentBlock -> moveToBlock',
      onTransition: () => {
        targets.minerJob.mineBlock = targets.position.clone()
        if (nextLayer.minerCords.tunel === 'horizontally') { // Move to base of block
          targets.position.y = parseInt(checkLayer.minerCords.yStart)
        }
      },
      shouldTransition: () => currentBlock.isFinished()
    }),

    new StateTransition({
      parent: currentBlock,
      child: nextLayer,
      name: 'Finished chunk',
      shouldTransition: () => currentBlock.getLayerIsFinished()
    }),

    new StateTransition({
      parent: moveToBlock,
      child: digBlock,
      onTransition: () => {
        targets.position = targets.minerJob.mineBlock
        sidesToPlaceBlock = calculateSideToPlaceBlock(targets.minerJob.mineBlock.clone())
      },
      shouldTransition: () => (moveToBlock.isFinished() || moveToBlock.distanceToTarget() < 3) && !bot.pathfinder.isMining()
    }),

    new StateTransition({
      parent: digBlock,
      child: checkPendingSides,
      shouldTransition: () => digBlock.isFinished()
    }),

    new StateTransition({
      parent: checkPendingSides,
      child: harvestPlant,
      onTransition: () => {
        currentSideToPlaceBlock = sidesToPlaceBlock.shift()
        targets.position = currentSideToPlaceBlock
      },
      shouldTransition: () => sidesToPlaceBlock.length > 0 && bot.inventory.items().find(item => targets.minerJob.blockForPlace.includes(item.name))
    }),

    new StateTransition({
      parent: checkPendingSides,
      child: minerChecks,
      shouldTransition: () => sidesToPlaceBlock.length === 0 || !bot.inventory.items().find(item => targets.minerJob.blockForPlace.includes(item.name))
    }),

    new StateTransition({
      parent: harvestPlant,
      child: placeBlock,
      onTransition: () => {
        targets.item = bot.inventory.items().find(item => targets.minerJob.blockForPlace.includes(item.name))
        const { newPosition, blockOffset } = getNewPositionForPlaceBlock(currentSideToPlaceBlock)
        targets.position = newPosition
        placeBlock.setOffset(blockOffset)
      },
      shouldTransition: () => harvestPlant.isFinished() || !['kelp_plant'].includes(bot.blockAt(targets.position).name)
    }),

    new StateTransition({
      parent: placeBlock,
      child: checkPendingSides,
      shouldTransition: () => placeBlock.isFinished() || placeBlock.isItemNotFound() || placeBlock.isCantPlaceBlock()
    }),

    new StateTransition({
      parent: minerChecks,
      child: eatFood,
      shouldTransition: () => minerChecks.isFinished() && minerChecks.getIsReady()
    }),

    new StateTransition({
      parent: eatFood,
      child: currentBlock,
      shouldTransition: () => eatFood.isFinished()
    }),

    new StateTransition({
      parent: minerChecks,
      child: exit,
      name: 'No pickaxes or shovel in inventory',
      shouldTransition: () => minerChecks.isFinished() && !minerChecks.getIsReady()
    })

  ]

  const miningFunction = new NestedStateMachine(transitions, start, exit)
  miningFunction.stateName = 'Mining'
  return miningFunction
}

module.exports = miningFunction
