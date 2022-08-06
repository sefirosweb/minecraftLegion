//@ts-nocheck

import {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} from 'mineflayer-statemachine'

import BehaviorLoadConfig from '@/BehaviorModules/BehaviorLoadConfig'

import BehaviorMinerCheckLayer from '@/BehaviorModules/minerJob/BehaviorMinerCheckLayer'
import BehaviorMinerCurrentLayer from '@/BehaviorModules/minerJob/BehaviorMinerCurrentLayer'
import BehaviorMinerCurrentBlock from '@/BehaviorModules/minerJob/BehaviorMinerCurrentBlock'
import BehaviorGetReady from '@/BehaviorModules/BehaviorGetReady'

import BehaviorDigBlock from '@/BehaviorModules/BehaviorDigBlock'
import BehaviorEatFood from '@/BehaviorModules/BehaviorEatFood'
import BehaviorMoveTo from '@/BehaviorModules/BehaviorMoveTo'
import BehaviorDigAndPlaceBlock from '@/BehaviorModules/BehaviorDigAndPlaceBlock'

import mineflayerPathfinder, { Movements } from 'mineflayer-pathfinder'
import botConfigLoader from '@/modules/botConfig'
const { setMinerCords } = botConfigLoader()
import { Bot, LegionStateMachineTargets, MineCords, MineCordsConfig } from '@/types'

const movingWhile = (bot: Bot, nextCurrentLayer: MineCords, movements: Movements) => {
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

function miningFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const start = new BehaviorIdle()
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const finishedJob = new BehaviorIdle()
  finishedJob.stateName = 'Finished Job'
  finishedJob.x = 525
  finishedJob.y = 13

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'
  loadConfig.x = 325
  loadConfig.y = 113

  const exit = new BehaviorIdle()
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

  const digAndPlaceBlock = new BehaviorDigAndPlaceBlock(bot, targets)
  digAndPlaceBlock.stateName = 'Dig Block & Place'
  digAndPlaceBlock.x = 925
  digAndPlaceBlock.y = 563

  const moveToBlock = new BehaviorMoveTo(bot, targets)
  moveToBlock.stateName = 'Move To Block'
  moveToBlock.movements = targets.movements
  moveToBlock.x = 925
  moveToBlock.y = 313

  const moveToNearBlock = new BehaviorMoveTo(bot, targets)
  moveToNearBlock.stateName = 'Move To Near Block'
  moveToNearBlock.movements = targets.movements
  moveToNearBlock.x = 925
  moveToNearBlock.y = 113

  const getReady = new BehaviorGetReady(bot, targets)
  getReady.stateName = 'Check if bot is ready'
  getReady.x = 325
  getReady.y = 563

  const checkLayer = new BehaviorMinerCheckLayer(bot, targets)
  checkLayer.stateName = 'Check Layer Lava & Water'
  checkLayer.x = 525
  checkLayer.y = 213

  const eatFood = new BehaviorEatFood(bot, targets)
  eatFood.stateName = 'Eat Food'
  eatFood.x = 725
  eatFood.y = 363

  const fillBlocks = require('@NestedStateModules/minerJob/fillFunction')(bot, targets)
  fillBlocks.stateName = 'Fill Water & Lava'
  fillBlocks.x = 350
  fillBlocks.y = 313

  const findItemsAndPickup = require('@NestedStateModules/findItemsAndPickup')(
    bot,
    targets
  )
  findItemsAndPickup.stateName = 'Find Items'
  findItemsAndPickup.x = 525
  findItemsAndPickup.y = 363

  const saveCurrentLayer = () => {
    const tunel = targets.config.minerCords.tunel
    const orientation = targets.config.minerCords.orientation
    const world = targets.config.minerCords.world
    const reverse = targets.config.minerCords.reverse

    const newMineCords: MineCords = {
      xStart: parseInt(targets.minerJob.original.xStart),
      xEnd: parseInt(targets.minerJob.original.xEnd),

      yStart: parseInt(targets.minerJob.original.yStart),
      yEnd: parseInt(targets.minerJob.original.yEnd),

      zStart: parseInt(targets.minerJob.original.zStart),
      zEnd: parseInt(targets.minerJob.original.zEnd),
    }

    if (tunel === 'horizontally') {
      if (orientation === 'z+' && newMineCords.zStart < newMineCords.zEnd) newMineCords.zStart++
      if (orientation === 'z-' && newMineCords.zStart < newMineCords.zEnd) newMineCords.zEnd--
      if (orientation === 'x+' && newMineCords.xStart < newMineCords.xEnd) newMineCords.xStart++
      if (orientation === 'x-' && newMineCords.xStart < newMineCords.xEnd) newMineCords.xEnd--
    }

    if (tunel === 'vertically' && newMineCords.yStart < newMineCords.yEnd) {
      newMineCords.yEnd--
    }


    targets.minerJob.original = newMineCords

    const mineCordsConfig: MineCordsConfig = {
      ...newMineCords,
      tunel: tunel,
      orientation: orientation,
      world: world,
      reverse: reverse
    }

    setMinerCords(bot.username, mineCordsConfig)
    targets.config.minerCords = mineCordsConfig
  }

  const transitions = [
    new StateTransition({
      parent: start,
      child: loadConfig,
      name: 'start -> loadConfig',
      onTransition: () => {
        targets.minerJob.nextLayer = nextLayer

        const yStart =
          targets.config.minerCords.yStart >
            targets.config.minerCords.yEnd
            ? targets.config.minerCords.yEnd
            : targets.config.minerCords.yStart
        const yEnd =
          targets.config.minerCords.yStart >
            targets.config.minerCords.yEnd
            ? targets.config.minerCords.yStart
            : targets.config.minerCords.yEnd

        const xStart =
          targets.config.minerCords.xStart >
            targets.config.minerCords.xEnd
            ? targets.config.minerCords.xEnd
            : targets.config.minerCords.xStart
        const xEnd =
          targets.config.minerCords.xStart >
            targets.config.minerCords.xEnd
            ? targets.config.minerCords.xStart
            : targets.config.minerCords.xEnd

        const zStart =
          targets.config.minerCords.zStart >
            targets.config.minerCords.zEnd
            ? targets.config.minerCords.zEnd
            : targets.config.minerCords.zStart
        const zEnd =
          targets.config.minerCords.zStart >
            targets.config.minerCords.zEnd
            ? targets.config.minerCords.zStart
            : targets.config.minerCords.zEnd

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
      child: finishedJob,
      name: 'Mining finished',
      onTransition: () => {
        bot.pathfinder.setGoal(null)
        bot.emit('finishedJob', 'Mining Job')
      },
      shouldTransition: () => nextLayer.isFinished()
    }),

    new StateTransition({
      parent: nextLayer,
      child: checkLayer,
      name: 'nextLayer -> checkLayer',
      onTransition: () => {
        const nextCurrentLayer = nextLayer.getCurrentLayerCoords()
        movingWhile(bot, nextCurrentLayer, targets.movements)
        checkLayer.setMinerCords(nextCurrentLayer)
      },
      shouldTransition: () => !nextLayer.isFinished()
    }),

    new StateTransition({
      parent: checkLayer,
      child: findItemsAndPickup,
      onTransition: () =>
        currentBlock.setMinerCords(nextLayer.getCurrentLayerCoords()),
      shouldTransition: () =>
        checkLayer.isFinished() ||
        !bot.inventory
          .items()
          .find((item) => targets.minerJob.blockForPlace.includes(item.name))
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
        const item = bot.inventory
          .items()
          .find((item) => targets.minerJob.blockForPlace.includes(item.name))
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
      shouldTransition: () => fillBlocks.isFinished() && digAndPlaceBlock.getItemToPlace()
    }),

    new StateTransition({
      parent: fillBlocks,
      child: exit,
      name: 'Finished fill block',
      shouldTransition: () => fillBlocks.isFinished() && !digAndPlaceBlock.getItemToPlace()
    }),

    new StateTransition({
      parent: currentBlock,
      child: moveToBlock,
      name: 'currentBlock -> moveToBlock',
      onTransition: () => {
        targets.minerJob.mineBlock = targets.position.clone()
        if (nextLayer.minerCords.tunel === 'horizontally') {
          // Move to base of block
          targets.position.y = parseInt(checkLayer.minerCords.yStart)
          targets.position.dimension = targets.config.minerCords.world
        }
      },
      shouldTransition: () => currentBlock.isFinished() && currentBlock.canGetBlockInfo()
    }),

    new StateTransition({
      parent: currentBlock,
      child: moveToNearBlock,
      shouldTransition: () => currentBlock.isFinished() && !currentBlock.canGetBlockInfo()
    }),

    new StateTransition({
      parent: moveToNearBlock,
      child: currentBlock,
      shouldTransition: () => {
        const block = targets.position ? bot.blockAt(targets.position) : null
        if (block) {
          return true
        }
        return false
      }
    }),

    new StateTransition({
      parent: currentBlock,
      child: nextLayer,
      name: 'Finished chunk',
      onTransition: () => {
        saveCurrentLayer()
        nextLayer.next()
      },
      shouldTransition: () => currentBlock.getLayerIsFinished()
    }),

    new StateTransition({
      parent: moveToBlock,
      child: digAndPlaceBlock,
      onTransition: () => {
        targets.position = targets.minerJob.mineBlock
      },
      shouldTransition: () =>
        (moveToBlock.isFinished() || moveToBlock.distanceToTarget() < 2.5) &&
        !bot.pathfinder.isMining()
    }),

    new StateTransition({
      parent: digAndPlaceBlock,
      child: getReady,
      shouldTransition: () => digAndPlaceBlock.isFinished() && !digAndPlaceBlock.isOutOfBlocks()
    }),

    new StateTransition({
      parent: digAndPlaceBlock,
      child: exit,
      shouldTransition: () => digAndPlaceBlock.isFinished() && digAndPlaceBlock.isOutOfBlocks()
    }),

    new StateTransition({
      parent: getReady,
      child: eatFood,
      shouldTransition: () => getReady.getIsReady()
    }),

    new StateTransition({
      parent: eatFood,
      child: currentBlock,
      shouldTransition: () => eatFood.isFinished()
    }),

    new StateTransition({
      parent: getReady,
      child: exit,
      name: 'No pickaxes or shovel in inventory',
      shouldTransition: () => !getReady.getIsReady()
    })
  ]

  const miningFunction = new NestedStateMachine(transitions, start, exit)
  miningFunction.stateName = 'Mining'
  return miningFunction
}

module.exports = miningFunction
