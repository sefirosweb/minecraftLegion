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

function minerJobFunction (bot, targets) {
  const enter = new BehaviorIdle(targets)
  enter.stateName = 'Enter'

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'exit'

  const test = new BehaviorIdle(targets)
  test.stateName = 'test'

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'

  const currentLayer = new BehaviorMinerCurrentLayer(bot, targets)
  currentLayer.stateName = 'Check next Layer'

  const isLavaOrWater = new BehaviorIdle(bot, targets)
  isLavaOrWater.stateName = 'Check water and lava'

  const currentBlock = new BehaviorMinerCurrentBlock(bot, targets)
  currentBlock.stateName = 'Check next block'

  const mineBlock = new BehaviorDigBlock(bot, targets)
  mineBlock.stateName = 'Mine Block'

  const moveToBlock = new BehaviorMoveTo(bot, targets)
  moveToBlock.stateName = 'Move To Block'

  const minerChecks = new BehaviorMinerChecks(bot, targets)
  minerChecks.stateName = 'Check Inventory'

  const transitions = [
    new StateTransition({
      parent: enter,
      child: loadConfig,
      name: 'enter -> loadConfig',
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
      child: currentBlock,
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
      child: currentBlock,
      name: 'Continue Mining',
      shouldTransition: () => minerChecks.isFinished() && minerChecks.getIsReady()
    }),

    new StateTransition({
      parent: minerChecks,
      child: exit,
      name: 'Continue Mining',
      shouldTransition: () => minerChecks.isFinished() && !minerChecks.getIsReady()
    })

  ]

  const minerJobFunction = new NestedStateMachine(transitions, enter, exit)
  minerJobFunction.stateName = 'Mining'
  return minerJobFunction
}

module.exports = minerJobFunction
