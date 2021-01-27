const vec3 = require('vec3')

const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine,
  BehaviorMoveTo,
  BehaviorFindInteractPosition
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('./../BehaviorModules/BehaviorLoadConfig')
const BehaviorMinerCurrentLayer = require('./../BehaviorModules/BehaviorMinerCurrentLayer')
const BehaviorMinerCurrentBlock = require('./../BehaviorModules/BehaviorMinerCurrentBlock')
const BehaviorDigBlock = require('./../BehaviorModules/BehaviorDigBlock')
const BehaviorMinerChecks = require('./../BehaviorModules/BehaviorMinerChecks')
const BehaviorEatFood = require('./../BehaviorModules/BehaviorEatFood')
const BehaviorMinerCheckLayer = require('./../BehaviorModules/BehaviorMinerCheckLayer')
const BehaviorCustomPlaceBlock = require('./../BehaviorModules/BehaviorCustomPlaceBlock ')
// let isDigging = false
function minerJobFunction (bot, targets) {
  const placeBlocks = ['air', 'cave_air', 'lava', 'water']
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

  const findInteractPosition = new BehaviorFindInteractPosition(bot, targets)
  findInteractPosition.x = 925
  findInteractPosition.y = 113

  const mineBlock1 = new BehaviorDigBlock(bot, targets)
  mineBlock1.stateName = 'Mine Block 1'
  mineBlock1.x = 1025
  mineBlock1.y = 563

  const mineBlock2 = new BehaviorDigBlock(bot, targets)
  mineBlock2.stateName = 'Mine Block 2'
  mineBlock2.x = 325
  mineBlock2.y = 500

  const moveToBlock1 = new BehaviorMoveTo(bot, targets)
  moveToBlock1.stateName = 'Move To Block 1'
  moveToBlock1.x = 1025
  moveToBlock1.y = 313

  const moveToBlock2 = new BehaviorMoveTo(bot, targets)
  moveToBlock2.stateName = 'Move To Block 2'
  moveToBlock2.x = 525
  moveToBlock2.y = 363

  const moveToBlock3 = new BehaviorMoveTo(bot, targets)
  moveToBlock3.stateName = 'Move To Blockk 3'
  moveToBlock3.x = 725
  moveToBlock3.y = 613

  const placeBlock1 = new BehaviorCustomPlaceBlock(bot, targets)
  placeBlock1.stateName = 'Place Block 1'
  placeBlock1.x = 325
  placeBlock1.y = 300

  const placeBlock2 = new BehaviorCustomPlaceBlock(bot, targets)
  placeBlock2.stateName = 'Place Block 2'
  placeBlock2.x = 725
  placeBlock2.y = 513

  const placeBlock3 = new BehaviorCustomPlaceBlock(bot, targets)
  placeBlock3.stateName = 'Place Block 3'
  placeBlock3.x = 325
  placeBlock3.y = 400

  const minerChecks = new BehaviorMinerChecks(bot, targets)
  minerChecks.stateName = 'Miner Check'
  minerChecks.x = 325
  minerChecks.y = 613

  const checkLayer = new BehaviorMinerCheckLayer(bot, targets)
  checkLayer.stateName = 'Check Layer Lava & Water'
  checkLayer.x = 525
  checkLayer.y = 213

  const validFood = ['cooked_chicken']
  const eatFood = new BehaviorEatFood(bot, targets, validFood)
  eatFood.stateName = 'Eat Food'
  eatFood.x = 725
  eatFood.y = 313

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
        nextLayer.setMinerCords(loadConfig.getMiner())
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
      onTransition: () => checkLayer.setMinerCords(nextLayer.getCurrentLayerCoords()),
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
      child: moveToBlock2,
      name: 'checkLayer -> moveToBlock2',
      onTransition: () => {
        targets.position = targets.position.offset(0, 1, 0)
      },
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
      parent: moveToBlock2,
      child: mineBlock2,
      name: 'If up block is solid',
      shouldTransition: () => {
        const block = bot.blockAt(targets.mineBlock)
        /* old version
                if (bot.pathfinder.isMining() & isDigging === false) {
                  isDigging = true

                  bot.on('diggingAborted', () => {
                    isDigging = false
                  })

                  bot.on('diggingCompleted', () => {
                    isDigging = false
                  })
                }

                if (isDigging === false && !bot.pathfinder.isMining()) {
                  bot.removeAllListeners('diggingAborted')
                  bot.removeAllListeners('diggingCompleted')
                  return true
                }

                */
        if (bot.canDigBlock(block) && !placeBlocks.includes(block.name)) {
          bot.pathfinder.setGoal(null)
          return !bot.pathfinder.isMining()
        }
      }
    }),

    new StateTransition({
      parent: mineBlock2,
      child: placeBlock3,
      name: 'mineBlock2 -> placeBlock3',
      onTransition: () => {
        targets.position = targets.position.offset(0, -1, 0)
      },
      shouldTransition: () => mineBlock2.isFinished()
    }),

    new StateTransition({
      parent: placeBlock3,
      child: placeBlock1,
      name: 'placeBlock3 -> placeBlock1',
      onTransition: () => {
        targets.position = targets.position.offset(0, 1, 0)
      },
      shouldTransition: () => placeBlock3.isFinished() || placeBlock3.isItemNotFound() || placeBlock3.isCantPlaceBlock()
    }),

    new StateTransition({
      parent: moveToBlock2,
      child: placeBlock1,
      name: 'if block is liquid',
      onTransition: () => {
        targets.position = targets.position.offset(0, -1, 0)
      },
      shouldTransition: () => {
        const block = bot.blockAt(targets.position)
        return moveToBlock2.distanceToTarget() < 2 && bot.canSeeBlock(block) && placeBlocks.includes(block.name)
      }
    }),

    new StateTransition({
      parent: placeBlock1,
      child: checkLayer,
      name: 'placeBlock1 -> checkLayer',
      shouldTransition: () => placeBlock1.isFinished() || placeBlock1.isItemNotFound() || placeBlock1.isCantPlaceBlock()
    }),

    new StateTransition({
      parent: currentBlock,
      child: moveToBlock1,
      name: 'currentBlock -> moveToBlock1',
      onTransition: () => {
        targets.mineBlock = targets.position.clone()
        if (nextLayer.minerCords.tunel === 'horizontally') { // Move to base of block
          targets.position.y = parseInt(checkLayer.minerCords.yStart)
        }
      },
      shouldTransition: () => currentBlock.isFinished()
    }),

    /*
    new StateTransition({
      parent: currentBlock,
      child: findInteractPosition,
      name: 'currentBlock -> findInteractPosition',
      onTransition: () => {
        targets.previousPosition = targets.position
      },
      shouldTransition: () => currentBlock.isFinished()
    }),

    new StateTransition({
      parent: findInteractPosition,
      child: moveToBlock1,
      name: 'findInteractPosition -> moveToBlock1',
      shouldTransition: () => true
    }),
    */

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
        targets.position = targets.mineBlock
      },
      shouldTransition: () => {
        const block = bot.blockAt(targets.mineBlock)
        if (bot.canDigBlock(block)) {
          /* OLD VERSION
                    if (bot.pathfinder.isMining() & isDigging === false) {
                      isDigging = true

                      bot.on('diggingAborted', () => {
                        isDigging = false
                      })

                      bot.on('diggingCompleted', () => {
                        isDigging = false
                      })
                    }

                    if (isDigging === false && !bot.pathfinder.isMining()) {
                      bot.removeAllListeners('diggingAborted')
                      bot.removeAllListeners('diggingCompleted')
                      return true
                    }
              */
          bot.pathfinder.setGoal(null)
          return !bot.pathfinder.isMining()
        }
      }

    }),

    new StateTransition({
      parent: mineBlock1,
      child: placeBlock2,
      name: 'If down is liquid & Tunel is vertically',
      shouldTransition: () => {
        const block = bot.blockAt(targets.position.offset(0, -1, 0))
        const item = bot.inventory.items().find(item => blockForPlace.includes(item.name))
        if (mineBlock1.isFinished() && placeBlocks.includes(block.name) && item && nextLayer.minerCords.tunel === 'vertically') {
          targets.item = item
          targets.position = targets.position.offset(0, -1, 0)
          return true
        }

        return false
      }
    }),

    new StateTransition({
      parent: mineBlock1,
      child: moveToBlock3,
      name: 'If down is solid',
      shouldTransition: () => {
        const block = bot.blockAt(targets.position.offset(0, -1, 0))
        return mineBlock1.isFinished() && (!placeBlocks.includes(block.name) || !bot.inventory.items().find(item => blockForPlace.includes(item.name)) || nextLayer.minerCords.tunel === 'horizontally')
      }
    }),

    new StateTransition({
      parent: placeBlock2,
      child: moveToBlock3,
      name: 'placeBlock2 -> moveToBlock3',
      onTransition: () => {
        targets.position = targets.position.offset(0, 1, 0)
      },
      shouldTransition: () => placeBlock2.isFinished() || placeBlock2.isItemNotFound() || placeBlock2.isCantPlaceBlock()
    }),

    new StateTransition({
      parent: moveToBlock3,
      child: minerChecks,
      name: 'moveToBlock3 -> minerChecks',
      shouldTransition: () => {
        if (nextLayer.minerCords.tunel === 'horizontally') {
          return true
        }
        return moveToBlock3.isFinished()
      }
    }),

    new StateTransition({
      parent: minerChecks,
      child: eatFood,
      name: 'moveToBlock3 -> eatFood',
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

  const minerJobFunction = new NestedStateMachine(transitions, start, exit)
  minerJobFunction.stateName = 'Mining'
  return minerJobFunction
}

module.exports = minerJobFunction
