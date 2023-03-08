import { StateTransition, BehaviorIdle, NestedStateMachine, BehaviorFindInteractPosition } from 'mineflayer-statemachine'
import BehaviorDigBlock from '@/BehaviorModules/BehaviorDigBlock'
import BehaviorCustomPlaceBlock from '@/BehaviorModules/BehaviorCustomPlaceBlock'
import BehaviorLoadConfig from '@/BehaviorModules/BehaviorLoadConfig'
import BehaviorMoveTo from '@/BehaviorModules/BehaviorMoveTo'
import { LegionStateMachineTargets } from 'types/index'
import { Vec3 } from 'vec3'
import placeBlockModule from '@/modules/placeBlockModule'
import { Bot } from 'mineflayer'

function fillFunction(bot: Bot, targets: LegionStateMachineTargets) {
  let placeBlock2Position: Vec3 | undefined
  const { getNewPositionForPlaceBlock, blocksCanBeReplaced, getPathToPlace } = placeBlockModule(bot)

  const start = new BehaviorIdle()
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  exit.x = 125
  exit.y = 313

  const moveToCantSeeBlock = new BehaviorMoveTo(bot, targets)
  moveToCantSeeBlock.stateName = 'Cant see block'
  moveToCantSeeBlock.movements = targets.movements
  moveToCantSeeBlock.x = 125
  moveToCantSeeBlock.y = 213

  const findInteractPosition = new BehaviorFindInteractPosition(bot, targets)
  findInteractPosition.stateName = 'findInteractPosition'
  findInteractPosition.x = 325
  findInteractPosition.y = 113

  const moveToBlock = new BehaviorMoveTo(bot, targets)
  moveToBlock.stateName = 'Move To Block'
  moveToBlock.movements = targets.movements
  moveToBlock.x = 525
  moveToBlock.y = 113

  const mineBlock = new BehaviorDigBlock(bot, targets)
  mineBlock.stateName = 'Mine Block'
  mineBlock.x = 725
  mineBlock.y = 113

  const placeBlock1 = new BehaviorCustomPlaceBlock(bot, targets, true, true)
  placeBlock1.stateName = 'Place Block 1'
  placeBlock1.x = 725
  placeBlock1.y = 313

  const placeBlock2 = new BehaviorCustomPlaceBlock(bot, targets, true, true)
  placeBlock2.stateName = 'Place Block 2'
  placeBlock2.x = 525
  placeBlock2.y = 313

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'
  loadConfig.x = 325
  loadConfig.y = 113

  let originalPosition: Vec3 | undefined
  let listPlaceBlocks = []

  const transitions = [
    new StateTransition({
      parent: start,
      child: moveToCantSeeBlock,
      shouldTransition: () => targets.position !== undefined && bot.blockAt(targets.position) !== undefined
    }),

    new StateTransition({
      parent: moveToCantSeeBlock,
      child: findInteractPosition,
      onTransition: () => {
        originalPosition = targets.position?.clone()
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: findInteractPosition,
      child: moveToBlock,
      onTransition: () => {
        targets.position = targets.position ? targets.position : originalPosition
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: moveToBlock,
      child: placeBlock2,
      name: 'if block is liquid',
      onTransition: () => {
        if (!originalPosition) throw Error('Variable not defined originalPosition')
        listPlaceBlocks = getPathToPlace(originalPosition)
        const currentPlaceBlock = listPlaceBlocks.shift()

        if (!currentPlaceBlock) throw Error('Variable not defined currentPlaceBlock')
        const positionForPlaceBlock = getNewPositionForPlaceBlock(currentPlaceBlock.position)

        targets.position = positionForPlaceBlock.newPosition
        if (positionForPlaceBlock.blockOffset) {
          placeBlock2.setOffset(positionForPlaceBlock.blockOffset)
        }
      },
      shouldTransition: () => {
        const block = targets.position ? bot.blockAt(targets.position.offset(0, 1, 0)) : null
        return (moveToBlock.isFinished() || moveToBlock.distanceToTarget() < 2.5) &&
          block !== null && blocksCanBeReplaced.includes(block.name) &&
          !bot.pathfinder.isMining()
      }
    }),

    new StateTransition({
      parent: moveToBlock,
      child: mineBlock,
      name: 'If up block is solid',
      onTransition: () => {
        targets.position = targets.position?.offset(0, 1, 0)
      },
      shouldTransition: () => {
        const block = targets.position ? bot.blockAt(targets.position.offset(0, 1, 0)) : null
        if (block && bot.canDigBlock(block) && !blocksCanBeReplaced.includes(block.name)) {
          bot.pathfinder.setGoal(null)
          return !bot.pathfinder.isMining()
        }
        return false
      }
    }),

    new StateTransition({
      parent: mineBlock,
      child: placeBlock1,
      name: 'mineBlock -> placeBlock1',
      onTransition: () => {
        if (!targets.position) throw Error('Variable not defined targets.position')

        placeBlock2Position = targets.position.clone()
        listPlaceBlocks = getPathToPlace(targets.position?.offset(0, -1, 0))
        const currentPlaceBlock = listPlaceBlocks.shift()
        if (!currentPlaceBlock) throw Error('Variable not defined currentPlaceBlock')

        const positionForPlaceBlock = getNewPositionForPlaceBlock(currentPlaceBlock.position)

        targets.position = positionForPlaceBlock.newPosition
        if (positionForPlaceBlock.blockOffset) {
          placeBlock1.setOffset(positionForPlaceBlock.blockOffset)
        }
      },
      shouldTransition: () => mineBlock.isFinished()
    }),

    new StateTransition({
      parent: placeBlock1,
      child: placeBlock2,
      name: 'placeBlock1 -> placeBlock2',
      onTransition: () => {
        if (!placeBlock2Position) throw Error('Variable not defined placeBlock2Position')

        targets.position = placeBlock2Position
        const positionForPlaceBlock = getNewPositionForPlaceBlock(targets.position)
        targets.position = positionForPlaceBlock.newPosition
        if (positionForPlaceBlock.blockOffset) {
          placeBlock2.setOffset(positionForPlaceBlock.blockOffset)
        }
      },
      shouldTransition: () => placeBlock1.isFinished() || placeBlock1.isItemNotFound() || placeBlock1.isCantPlaceBlock()
    }),

    new StateTransition({
      parent: placeBlock2,
      child: exit,
      name: 'placeBlock1 -> checkLayer',
      shouldTransition: () => placeBlock2.isFinished() || placeBlock2.isItemNotFound() || placeBlock2.isCantPlaceBlock()
    })

  ]

  const nestedState = new NestedStateMachine(transitions, start, exit)
  nestedState.stateName = 'fillFunction'
  return nestedState
}

export default fillFunction
