const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine,
  BehaviorMoveTo,
  BehaviorMineBlock
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('./../BehaviorModules/BehaviorLoadConfig')
const BehaviorGetBlockInfo = require('./../BehaviorModules/BehaviorGetBlockInfo')
const BehaviorMinerCurrentLayer = require('./../BehaviorModules/BehaviorMinerCurrentLayer')
const BehaviorMinerCurrentBlock = require('./../BehaviorModules/BehaviorMinerCurrentBlock')

const lavaOrWaterBlock = ['water', 'lava']
const airBlock = ['air']

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

  const isAir = new BehaviorGetBlockInfo(bot, targets, airBlock)
  isAir.stateName = 'Check Is Air'

  const currentBlock = new BehaviorMinerCurrentBlock(bot, targets)
  currentBlock.stateName = 'Check next block'

  const mineBlock = new BehaviorMineBlock(bot, targets)
  mineBlock.stateName = 'Mine Block'

  const moveToBlock = new BehaviorMoveTo(bot, targets)
  moveToBlock.stateName = 'Move To Block'

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
      child: isAir,
      name: 'Check is Air',
      onTransition: () => {
        isAir.setPosition(currentBlock.getCurrentBlock())
      },
      shouldTransition: () => !currentBlock.isFinished()
    }),

    new StateTransition({
      parent: currentBlock,
      child: currentLayer,
      name: 'Finished chunk',
      shouldTransition: () => currentBlock.isFinished()
    }),

    new StateTransition({
      parent: isAir,
      child: currentBlock,
      name: 'Is Air, go next',
      shouldTransition: () => isAir.getIsValidBlockType()
    }),

    new StateTransition({
      parent: isAir,
      child: moveToBlock,
      name: 'Is Solid Block',
      onTransition: () => {
        console.log('current target: ', targets.position)
      },
      shouldTransition: () => !isAir.getIsValidBlockType()
    }),

    new StateTransition({
      parent: moveToBlock, // This is a "Move To Block" label
      child: mineBlock,
      name: 'Move To Block',
      shouldTransition: () => moveToBlock.distanceToTarget() < 3
    }),

    new StateTransition({
      parent: mineBlock, // This is a "Mine Block" label
      child: currentBlock,
      name: 'Go Next Block',
      shouldTransition: () => mineBlock.isFinished
    })

  ]

  const minerJobFunction = new NestedStateMachine(transitions, enter, exit)
  minerJobFunction.stateName = 'Mining'
  return minerJobFunction
}

module.exports = minerJobFunction
