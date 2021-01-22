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

function minerJobFunction (bot, targets) {
  const placeBlocks = ['air', 'cave_air', 'lava', 'wawter']
  // const air = ['air', 'cave_air']
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

  const mineBlock = new BehaviorDigBlock(bot, targets)
  mineBlock.stateName = 'Mine Block'
  mineBlock.x = 1025
  mineBlock.y = 563

  const moveToBlock1 = new BehaviorMoveTo(bot, targets)
  moveToBlock1.stateName = 'Move To Block 1'
  moveToBlock1.x = 1025
  moveToBlock1.y = 313

  const moveToBlock2 = new BehaviorMoveTo(bot, targets)
  moveToBlock2.stateName = 'Move To Block 2'
  moveToBlock2.x = 325
  moveToBlock2.y = 450

  const moveToBlock3 = new BehaviorMoveTo(bot, targets)
  moveToBlock3.stateName = 'Move To Blockk 3'
  moveToBlock3.x = 725
  moveToBlock3.y = 613

  const placeBlock1 = new BehaviorCustomPlaceBlock(bot, targets)
  placeBlock1.stateName = 'Place Block 1'
  placeBlock1.x = 325
  placeBlock1.y = 315

  const placeBlock2 = new BehaviorCustomPlaceBlock(bot, targets)
  placeBlock2.stateName = 'Place Block 2'
  placeBlock2.x = 725
  placeBlock2.y = 513

  const minerChecks = new BehaviorMinerChecks(bot, targets)
  minerChecks.stateName = 'Miner Check'
  minerChecks.x = 325
  minerChecks.y = 613

  const checkLayer = new BehaviorMinerCheckLayer(bot, targets)
  checkLayer.stateName = 'Check Layer Lava & Water'
  checkLayer.x = 525
  checkLayer.y = 313

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
      name: 'nextLayer -> finished',
      shouldTransition: () => nextLayer.isFinished()
    }),

    new StateTransition({
      parent: nextLayer,
      child: checkLayer,
      name: 'nextLayer -> checkLavaWater',
      onTransition: () => checkLayer.setMinerCords(nextLayer.getCurrentLayerCoords()),
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkLayer,
      child: eatFood,
      name: 'checkLavaWater -> currentBlock',
      onTransition: () => currentBlock.setMinerCords(nextLayer.getCurrentLayerCoords()),
      shouldTransition: () => checkLayer.isFinished() || !bot.inventory.items().find(item => blockForPlace.includes(item.name))
    }),

    new StateTransition({
      parent: checkLayer,
      child: moveToBlock2,
      name: 'checkLavaWater -> moveToBlock2',
      shouldTransition: () => {
        const item = bot.inventory.items().find(item => blockForPlace.includes(item.name))
        if (checkLayer.getFoundLavaOrWater() && item) {
          targets.item = item
          console.log(item)
          return true
        }
        return false
      }
    }),

    new StateTransition({
      parent: moveToBlock2,
      child: placeBlock1,
      name: 'checkLavaWater -> moveToBlock2',
      onTransition: () => {
        targets.position = targets.position.offset(0, -1, 0)
      },
      shouldTransition: () => {
        const block = bot.blockAt(targets.position)
        return moveToBlock2.distanceToTarget() < 2 && bot.canSeeBlock(block)
      }
    }),

    new StateTransition({
      parent: placeBlock1,
      child: checkLayer,
      name: 'Item placed',
      shouldTransition: () => placeBlock1.isFinished()
    }),

    new StateTransition({
      parent: placeBlock1,
      child: checkLayer,
      name: 'Item not found',
      shouldTransition: () => placeBlock1.isItemNotFound()
    }),

    new StateTransition({
      parent: currentBlock,
      child: findInteractPosition,
      name: 'Check is Air',
      onTransition: () => {
        targets.previousPosition = targets.position
      },
      shouldTransition: () => currentBlock.isFinished()
    }),

    new StateTransition({
      parent: findInteractPosition,
      child: moveToBlock1,
      name: 'Check is Air',
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: currentBlock,
      child: nextLayer,
      name: 'Finished chunk',
      shouldTransition: () => currentBlock.getLayerIsFinished()
    }),

    new StateTransition({
      parent: moveToBlock1,
      child: mineBlock,
      name: 'Move To Block 1',
      onTransition: () => {
        targets.position = targets.previousPosition
      },
      shouldTransition: () => moveToBlock1.distanceToTarget() < 3
    }),

    new StateTransition({
      parent: mineBlock,
      child: placeBlock2,
      name: 'Go Next Block',
      shouldTransition: () => {
        const block = bot.blockAt(targets.position.offset(0, -1, 0))
        const item = bot.inventory.items().find(item => blockForPlace.includes(item.name))
        if (mineBlock.isFinished() && placeBlocks.includes(block.name) && item) {
          targets.item = item
          targets.position = targets.position.offset(0, -1, 0)
          return true
        }

        return false
      }
    }),

    new StateTransition({
      parent: mineBlock,
      child: moveToBlock3,
      name: 'Go Next Block',
      shouldTransition: () => {
        const block = bot.blockAt(targets.position.offset(0, -1, 0))
        return mineBlock.isFinished() && (!placeBlocks.includes(block.name) || !bot.inventory.items().find(item => blockForPlace.includes(item.name)))
      }
    }),

    new StateTransition({
      parent: placeBlock2,
      child: moveToBlock3,
      name: 'Placed block',
      onTransition: () => {
        targets.position = targets.position.offset(0, 1, 0)
      },
      shouldTransition: () => placeBlock2.isFinished()
    }),

    new StateTransition({
      parent: placeBlock2,
      child: moveToBlock3,
      name: 'Item not found for place block',
      onTransition: () => {
        targets.position = targets.position.offset(0, 1, 0)
      },
      shouldTransition: () => placeBlock2.isItemNotFound()
    }),

    new StateTransition({
      parent: moveToBlock3,
      child: minerChecks,
      name: 'moveToBlock3 -> minerChecks',
      shouldTransition: () => moveToBlock3.isFinished()
    }),

    new StateTransition({
      parent: minerChecks,
      child: eatFood,
      name: 'Continue Mining',
      shouldTransition: () => minerChecks.isFinished() && minerChecks.getIsReady()
    }),

    new StateTransition({
      parent: eatFood,
      child: currentBlock,
      name: 'Continue Mining',
      shouldTransition: () => eatFood.isFinished()
    }),

    new StateTransition({
      parent: minerChecks,
      child: exit,
      name: 'Continue Mining',
      shouldTransition: () => minerChecks.isFinished() && !minerChecks.getIsReady()
    })

  ]

  const minerJobFunction = new NestedStateMachine(transitions, start, exit)
  minerJobFunction.stateName = 'Mining'
  return minerJobFunction
}

module.exports = minerJobFunction
