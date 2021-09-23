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
const BehaviorCustomPlaceBlock = require('@BehaviorModules/BehaviorCustomPlaceBlock')
const BehaviorMoveTo = require('@BehaviorModules/BehaviorMoveTo')

const mineflayerPathfinder = require('mineflayer-pathfinder')
const vec3 = require('vec3')

// TODO pending double check
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

let blockOffset

function miningFunction (bot, targets) {
  const { getOffsetPlaceBlock } = require('@modules/placeBlockModule')(bot)
  const placeBlocks = require('@modules/placeBlockModule')(bot).blocksCanBeReplaced
  const blockForPlace = ['stone', 'cobblestone', 'dirt', 'andesite', 'diorite', 'granite']

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

  const mineBlock1 = new BehaviorDigBlock(bot, targets)
  mineBlock1.stateName = 'Mine Block 1'
  mineBlock1.x = 1025
  mineBlock1.y = 563

  const moveToBlock1 = new BehaviorMoveTo(bot, targets)
  moveToBlock1.stateName = 'Move To Block 1'
  moveToBlock1.x = 1025
  moveToBlock1.y = 313
  moveToBlock1.movements = targets.movements

  const moveToBlock2 = new BehaviorMoveTo(bot, targets)
  moveToBlock2.stateName = 'Move To Block 2'
  moveToBlock2.x = 825
  moveToBlock2.y = 713
  moveToBlock2.movements = targets.movements

  const placeBlock = new BehaviorCustomPlaceBlock(bot, targets)
  placeBlock.stateName = 'Place Block'
  placeBlock.x = 1025
  placeBlock.y = 713

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
  eatFood.y = 313

  const fillBlocks = require('@NestedStateModules/minerJob/fillFunction')(bot, targets)
  fillBlocks.x = 350
  fillBlocks.y = 313

  const transitions = [
    new StateTransition({
      parent: start,
      child: loadConfig,
      name: 'start -> loadConfig',
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
      child: eatFood,
      name: 'checkLayer -> eatFood',
      onTransition: () => currentBlock.setMinerCords(nextLayer.getCurrentLayerCoords()),
      shouldTransition: () => checkLayer.isFinished() || !bot.inventory.items().find(item => blockForPlace.includes(item.name))
    }),

    new StateTransition({
      parent: checkLayer,
      child: fillBlocks,
      name: 'checkLayer -> fillBlocks',
      shouldTransition: () => {
        const item = bot.inventory.items().find(item => blockForPlace.includes(item.name))
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
      child: moveToBlock1,
      name: 'currentBlock -> moveToBlock1',
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
      parent: moveToBlock1,
      child: mineBlock1,
      name: 'moveToBlock1 -> mineBlock1',
      onTransition: () => {
        targets.position = targets.minerJob.mineBlock
      },
      shouldTransition: () => {
        const block = bot.blockAt(targets.minerJob.mineBlock)
        if (bot.canDigBlock(block)) {
          bot.pathfinder.setGoal(null)
          return !bot.pathfinder.isMining()
        }
      }
    }),

    new StateTransition({
      parent: mineBlock1,
      child: placeBlock,
      name: '[Vertically] If down is liquid',
      shouldTransition: () => {
        const block = bot.blockAt(targets.position.offset(0, -1, 0))
        const item = bot.inventory.items().find(item => blockForPlace.includes(item.name))
        if (mineBlock1.isFinished() && placeBlocks.includes(block.name) && item && nextLayer.minerCords.tunel === 'vertically') {
          targets.item = item
          targets.position = targets.position.offset(0, -1, 0)
          blockOffset = getOffsetPlaceBlock(bot.blockAt(targets.position))
          targets.position = targets.position.add(blockOffset)

          blockOffset = {
            x: blockOffset.x * -1,
            y: blockOffset.y * -1,
            z: blockOffset.z * -1
          }

          placeBlock.setOffset(blockOffset)
          return true
        }

        return false
      }
    }),

    new StateTransition({
      parent: mineBlock1,
      child: minerChecks,
      name: '[Horizontally] Continue',
      shouldTransition: () => {
        return mineBlock1.isFinished() && nextLayer.minerCords.tunel === 'horizontally'
      }
    }),

    new StateTransition({
      parent: mineBlock1,
      child: moveToBlock2,
      name: '[Vertically] If down is solid',
      shouldTransition: () => {
        const block = bot.blockAt(targets.position.offset(0, -1, 0))
        return mineBlock1.isFinished() && nextLayer.minerCords.tunel === 'vertically' &&
          (
            !placeBlocks.includes(block.name) ||
            !bot.inventory.items().find(item => blockForPlace.includes(item.name))
          )
      }
    }),

    new StateTransition({
      parent: placeBlock,
      child: moveToBlock2,
      name: 'placeBlock -> moveToBlock2',
      onTransition: () => {
        targets.position.add(blockOffset).add(vec3(0, 1, 0))
      },
      shouldTransition: () => placeBlock.isFinished() || placeBlock.isItemNotFound() || placeBlock.isCantPlaceBlock()
    }),

    new StateTransition({
      parent: moveToBlock2,
      child: minerChecks,
      name: 'moveToBlock2 -> minerChecks',
      shouldTransition: () => {
        if (nextLayer.minerCords.tunel === 'horizontally') {
          return true
        }
        return (moveToBlock2.isFinished() || moveToBlock2.distanceToTarget() < 3)
      }
    }),

    new StateTransition({
      parent: minerChecks,
      child: eatFood,
      name: 'moveToBlock2 -> eatFood',
      shouldTransition: () => minerChecks.isFinished() && minerChecks.getIsReady()
    }),

    new StateTransition({
      parent: eatFood,
      child: currentBlock,
      name: 'eatFood -> currentBlock',
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
