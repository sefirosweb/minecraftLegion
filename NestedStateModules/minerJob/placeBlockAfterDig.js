const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorCustomPlaceBlock = require('@BehaviorModules/BehaviorCustomPlaceBlock')
const BehaviorMoveTo = require('@BehaviorModules/BehaviorMoveTo')
const vec3 = require('vec3')

let originalPosition
let sidesToCheck
let currentSideToCheck

function placeBlockAfterDig (bot, targets) {
  const { getNewPositionForPlaceBlock } = require('@modules/placeBlockModule')(bot)
  const placeBlocks = require('@modules/placeBlockModule')(bot).blocksCanBeReplaced

  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const load = new BehaviorIdle(targets)
  load.stateName = 'Load'
  load.x = 125
  load.y = 213

  const checkPendingSides = new BehaviorIdle(targets)
  checkPendingSides.stateName = 'Check Pending Sides'
  checkPendingSides.x = 425
  checkPendingSides.y = 213

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'exit'
  exit.x = 725
  exit.y = 213

  const checkBlockOffset = new BehaviorIdle(targets)
  checkBlockOffset.stateName = 'Check Block Offset'
  checkBlockOffset.x = 625
  checkBlockOffset.y = 413

  const placeBlock = new BehaviorCustomPlaceBlock(bot, targets)
  placeBlock.stateName = 'Place Block'
  placeBlock.x = 225
  placeBlock.y = 413

  const moveToBlock = new BehaviorMoveTo(bot, targets)
  moveToBlock.stateName = 'Move To Block'
  moveToBlock.movements = targets.movements
  moveToBlock.x = 425
  moveToBlock.y = 613

  const transitions = [

    new StateTransition({
      parent: start,
      child: load,
      onTransition: () => {
        originalPosition = targets.position.clone()
        sidesToCheck = []

        let off
        const offsetX = targets.config.minerCords.orientation === 'x+' ? 1 : targets.config.minerCords.orientation === 'x-' ? -1 : 0
        const offsetZ = targets.config.minerCords.orientation === 'z+' ? 1 : targets.config.minerCords.orientation === 'z-' ? -1 : 0

        const backOffset = vec3(offsetX, 0, offsetZ)

        if (
          targets.config.minerCords.tunel === 'vertically' ||
          (
            targets.config.minerCords.tunel === 'horizontally' &&
            parseInt(originalPosition.y) === parseInt(targets.minerJob.original.yStart)
          )
        ) {
          sidesToCheck.push({
            side: 'bottom',
            position: originalPosition.offset(0, -1, 0)
          })
          sidesToCheck.push({
            side: 'backBottom',
            position: originalPosition.offset(offsetX, -1, offsetZ)
          })
        }

        if (
          targets.config.minerCords.tunel === 'horizontally' &&
          parseInt(originalPosition.y) === parseInt(targets.minerJob.original.yEnd)
        ) {
          sidesToCheck.push({
            side: 'top',
            position: originalPosition.offset(0, 1, 0)
          })
          sidesToCheck.push({
            side: 'backTop',
            position: originalPosition.offset(offsetX, 1, offsetZ)
          })
        }

        if (
          targets.config.minerCords.tunel === 'horizontally' &&
          (
            (targets.config.minerCords.orientation === 'x+' && parseInt(originalPosition.z) === parseInt(targets.minerJob.original.zStart)) ||
            (targets.config.minerCords.orientation === 'x-' && parseInt(originalPosition.z) === parseInt(targets.minerJob.original.zEnd)) ||
            (targets.config.minerCords.orientation === 'z+' && parseInt(originalPosition.x) === parseInt(targets.minerJob.original.xEnd)) ||
            (targets.config.minerCords.orientation === 'z-' && parseInt(originalPosition.x) === parseInt(targets.minerJob.original.xStart))
          )
        ) {
          switch (targets.config.minerCords.orientation) {
            case 'x+':
              off = vec3(0, 0, -1)
              break
            case 'x-':
              off = vec3(0, 0, 1)
              break
            case 'z+':
              off = vec3(1, 0, 0)
              break
            case 'z-':
              off = vec3(-1, 0, 0)
              break
          }

          sidesToCheck.push({
            side: 'left',
            position: originalPosition.clone().add(off)
          })
          sidesToCheck.push({
            side: 'backLeft',
            position: originalPosition.clone().add(backOffset).add(off)
          })
        }

        if (
          targets.config.minerCords.tunel === 'horizontally' &&
          (
            (targets.config.minerCords.orientation === 'x+' && parseInt(originalPosition.z) === parseInt(targets.minerJob.original.zEnd)) ||
            (targets.config.minerCords.orientation === 'x-' && parseInt(originalPosition.z) === parseInt(targets.minerJob.original.zStart)) ||
            (targets.config.minerCords.orientation === 'z+' && parseInt(originalPosition.x) === parseInt(targets.minerJob.original.xStart)) ||
            (targets.config.minerCords.orientation === 'z-' && parseInt(originalPosition.x) === parseInt(targets.minerJob.original.xEnd))
          )
        ) {
          switch (targets.config.minerCords.orientation) {
            case 'x+':
              off = vec3(0, 0, 1)
              break
            case 'x-':
              off = vec3(0, 0, -1)
              break
            case 'z+':
              off = vec3(-1, 0, 0)
              break
            case 'z-':
              off = vec3(1, 0, 0)
              break
          }

          sidesToCheck.push({
            side: 'right',
            position: originalPosition.clone().add(off)
          })
          sidesToCheck.push({
            side: 'backRight',
            position: originalPosition.clone().add(backOffset).add(off)
          })
        }

        if (targets.config.minerCords.tunel === 'horizontally') {
          sidesToCheck.push({
            side: 'back',
            position: originalPosition.offset(offsetX, 0, offsetZ)
          })
        }
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: load,
      child: checkPendingSides,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkPendingSides,
      child: checkBlockOffset,
      onTransition: () => {
        currentSideToCheck = sidesToCheck.shift()
      },
      shouldTransition: () => sidesToCheck.length > 0
    }),

    new StateTransition({
      parent: checkPendingSides,
      child: exit,
      shouldTransition: () => {
        return sidesToCheck.length === 0
      }
    }),

    new StateTransition({
      parent: checkBlockOffset,
      child: moveToBlock,
      shouldTransition: () => {
        const block = bot.blockAt(currentSideToCheck.position)
        const item = bot.inventory.items().find(item => targets.minerJob.blockForPlace.includes(item.name))
        if (placeBlocks.includes(block.name) && item) {
          const goPosition = originalPosition.clone()
          if (targets.config.minerCords.tunel === 'horizontally') {
            goPosition.y = parseInt(targets.minerJob.original.yStart)
          }

          targets.position = goPosition
          return true
        }
        return false
      }
    }),

    new StateTransition({
      parent: checkBlockOffset,
      child: checkPendingSides,
      shouldTransition: () => {
        const block = bot.blockAt(currentSideToCheck.position)
        const item = bot.inventory.items().find(item => targets.minerJob.blockForPlace.includes(item.name))

        if (!placeBlocks.includes(block.name) || !item) {
          return true
        }

        return false
      }
    }),

    new StateTransition({
      parent: moveToBlock,
      child: placeBlock,
      onTransition: () => {
        targets.item = bot.inventory.items().find(item => targets.minerJob.blockForPlace.includes(item.name))
        const { newPosition, blockOffset } = getNewPositionForPlaceBlock(currentSideToCheck.position)
        targets.position = newPosition
        placeBlock.setOffset(blockOffset)
      },
      shouldTransition: () => (moveToBlock.isFinished() || moveToBlock.distanceToTarget() < 3) && !bot.pathfinder.isMining()
    }),

    new StateTransition({
      parent: placeBlock,
      child: checkPendingSides,
      shouldTransition: () => placeBlock.isFinished() || placeBlock.isItemNotFound() || placeBlock.isCantPlaceBlock()
    })

  ]

  const placeBlockAfterDig = new NestedStateMachine(transitions, start, exit)
  placeBlockAfterDig.stateName = 'Place Block After Dig'
  return placeBlockAfterDig
}

module.exports = placeBlockAfterDig
