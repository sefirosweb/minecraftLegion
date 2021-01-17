const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine,
  BehaviorMoveTo,
  BehaviorPlaceBlock
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('./../BehaviorModules/BehaviorLoadConfig')
const BehaviorMinerCurrentLayer = require('./../BehaviorModules/BehaviorMinerCurrentLayer')
const BehaviorMinerCurrentBlock = require('./../BehaviorModules/BehaviorMinerCurrentBlock')
const BehaviorDigBlock = require('./../BehaviorModules/BehaviorDigBlock')
const BehaviorMinerChecks = require('./../BehaviorModules/BehaviorMinerChecks')
const BehaviorEatFood = require('./../BehaviorModules/BehaviorEatFood')
const BehaviorMinerCheckLayer = require('./../BehaviorModules/BehaviorMinerCheckLayer')

function minerJobFunction (bot, targets) {
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

  const mineBlock = new BehaviorDigBlock(bot, targets)
  mineBlock.stateName = 'Mine Block'
  mineBlock.x = 825
  mineBlock.y = 613

  const moveToBlock1 = new BehaviorMoveTo(bot, targets)
  moveToBlock1.stateName = 'Move To Block 1'
  moveToBlock1.x = 925
  moveToBlock1.y = 313

  const moveToBlock2 = new BehaviorMoveTo(bot, targets)
  moveToBlock2.stateName = 'Move To Block 2'
  moveToBlock2.x = 325
  moveToBlock2.y = 450

  const placeBlock = new BehaviorPlaceBlock(bot, targets)
  placeBlock.stateName = 'Place Block'
  placeBlock.x = 325
  placeBlock.y = 315

  const minerChecks = new BehaviorMinerChecks(bot, targets)
  minerChecks.stateName = 'Check Inventory'
  minerChecks.x = 325
  minerChecks.y = 613

  const checkLayer = new BehaviorMinerCheckLayer(bot, targets)
  checkLayer.stateName = 'Check Lava & Water'
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
      onTransition: () => {
        checkLayer.setMinerCords(nextLayer.getCurrentLayerCoords())
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkLayer,
      child: moveToBlock2,
      name: 'checkLavaWater -> moveToBlock2',
      shouldTransition: () => checkLayer.getFoundLavaOrWater()
    }),

    new StateTransition({
      parent: moveToBlock2,
      child: placeBlock,
      name: 'checkLavaWater -> moveToBlock2',
      shouldTransition: () => moveToBlock2.distanceToTarget() < 2
    }),

    new StateTransition({
      parent: placeBlock,
      child: checkLayer,
      name: 'checkLavaWater -> moveToBlock2',
      shouldTransition: () => placeBlock.isFinished
    }),

    new StateTransition({
      parent: checkLayer,
      child: eatFood,
      name: 'checkLavaWater -> currentBlock',
      onTransition: () => {
        currentBlock.setMinerCords(nextLayer.getCurrentLayerCoords())
      },
      shouldTransition: () => checkLayer.isFinished()
    }),

    new StateTransition({
      parent: currentBlock,
      child: moveToBlock1,
      name: 'Check is Air',
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
      child: mineBlock,
      name: 'Move To Block 1',
      shouldTransition: () => moveToBlock1.distanceToTarget() < 3
    }),

    new StateTransition({
      parent: mineBlock,
      child: minerChecks,
      name: 'Go Next Block',
      shouldTransition: () => mineBlock.isFinished()
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
