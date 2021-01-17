const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine,
  BehaviorMoveTo
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('./../BehaviorModules/BehaviorLoadConfig')
const BehaviorMinerCurrentLayer = require('./../BehaviorModules/BehaviorMinerCurrentLayer')
const BehaviorMinerCurrentBlock = require('./../BehaviorModules/BehaviorMinerCurrentBlock')
const BehaviorDigBlock = require('./../BehaviorModules/BehaviorDigBlock')
const BehaviorMinerChecks = require('./../BehaviorModules/BehaviorMinerChecks')
const BehaviorEatFood = require('./../BehaviorModules/BehaviorEatFood')

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
  exit.x = 325
  exit.y = 313

  const currentLayer = new BehaviorMinerCurrentLayer(bot, targets)
  currentLayer.stateName = 'Check next Layer'
  currentLayer.x = 525
  currentLayer.y = 113

  const isLavaOrWater = new BehaviorIdle(bot, targets)
  isLavaOrWater.stateName = 'Check water and lava'
  isLavaOrWater.x = 525
  isLavaOrWater.y = 313

  const currentBlock = new BehaviorMinerCurrentBlock(bot, targets)
  currentBlock.stateName = 'Check next block'
  currentBlock.x = 725
  currentBlock.y = 113

  const mineBlock = new BehaviorDigBlock(bot, targets)
  mineBlock.stateName = 'Mine Block'
  mineBlock.x = 825
  mineBlock.y = 513

  const moveToBlock = new BehaviorMoveTo(bot, targets)
  moveToBlock.stateName = 'Move To Block'
  moveToBlock.x = 925
  moveToBlock.y = 313

  const minerChecks = new BehaviorMinerChecks(bot, targets)
  minerChecks.stateName = 'Check Inventory'
  minerChecks.x = 525
  minerChecks.y = 513

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
      child: currentLayer,
      name: 'loadConfig -> currentLayer',
      onTransition: () => {
        targets.entity = undefined
        currentLayer.setMinerCords(loadConfig.getMiner())
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: currentLayer,
      child: exit,
      name: 'currentLayer -> finished',
      shouldTransition: () => currentLayer.isFinished()
    }),

    new StateTransition({
      parent: currentLayer,
      child: isLavaOrWater,
      name: 'currentLayer -> checkLavaWater',
      // onTransition: () => {},
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: isLavaOrWater,
      child: eatFood,
      name: 'checkLavaWater -> currentBlock',
      onTransition: () => {
        currentBlock.setMinerCords(currentLayer.getCurrentLayerCoords())
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: currentBlock,
      child: moveToBlock,
      name: 'Check is Air',
      shouldTransition: () => currentBlock.isFinished()
    }),

    new StateTransition({
      parent: currentBlock,
      child: currentLayer,
      name: 'Finished chunk',
      shouldTransition: () => currentBlock.getLayerIsFinished()
    }),

    new StateTransition({
      parent: moveToBlock,
      child: mineBlock,
      name: 'Move To Block',
      shouldTransition: () => moveToBlock.distanceToTarget() < 3
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
