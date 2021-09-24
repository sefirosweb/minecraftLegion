const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorCustomPlaceBlock = require('@BehaviorModules/BehaviorCustomPlaceBlock')
const BehaviorMoveTo = require('@BehaviorModules/BehaviorMoveTo')

let originalPosition

function placeBlockAfterDig (bot, targets) {
  const { getNewPositionForPlaceBlock } = require('@modules/placeBlockModule')(bot)
  const placeBlocks = require('@modules/placeBlockModule')(bot).blocksCanBeReplaced

  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 13

  const load = new BehaviorIdle(targets)
  load.stateName = 'Load'
  load.x = 125
  load.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'exit'
  exit.x = 625
  exit.y = 113

  const checkCorner = new BehaviorIdle(targets)
  checkCorner.stateName = 'Check Corner'
  exit.stateName = 'exit'
  checkCorner.x = 125
  checkCorner.y = 263

  const checkBack = new BehaviorIdle(targets)
  checkBack.stateName = 'Check Back'
  checkBack.x = 125
  checkBack.y = 413

  const placeBlockBottom = new BehaviorCustomPlaceBlock(bot, targets)
  placeBlockBottom.stateName = 'Place Block Bottom'
  placeBlockBottom.x = 425
  placeBlockBottom.y = 263

  const placeBlockCorner = new BehaviorCustomPlaceBlock(bot, targets)
  placeBlockCorner.stateName = 'Place Block Corner'
  placeBlockCorner.x = 425
  placeBlockCorner.y = 413

  const placeBlockBack = new BehaviorCustomPlaceBlock(bot, targets)
  placeBlockBack.stateName = 'Place Block Back'
  placeBlockBack.x = 625
  placeBlockBack.y = 563

  const moveToBlock = new BehaviorMoveTo(bot, targets)
  moveToBlock.stateName = 'Move To Block'
  moveToBlock.movements = targets.movements

  const transitions = [

    new StateTransition({
      parent: start,
      child: load,
      onTransition: () => {
        originalPosition = targets.position.clone()
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: load,
      child: placeBlockBottom,
      shouldTransition: () => {
        const block = bot.blockAt(originalPosition.offset(0, -1, 0))
        const item = bot.inventory.items().find(item => targets.minerJob.blockForPlace.includes(item.name))

        if (
          (
            targets.minerJob.nextLayer.minerCords.tunel === 'vertically' ||
            (
              targets.minerJob.nextLayer.minerCords.tunel === 'horizontally' &&
              parseInt(originalPosition.y) === parseInt(targets.minerJob.nextLayer.minerCords.yStart)
            )
          ) &&
          placeBlocks.includes(block.name) &&
          item
        ) {
          targets.item = item
          const positionForPlaceBlock = getNewPositionForPlaceBlock(originalPosition.offset(0, -1, 0))
          targets.position = positionForPlaceBlock.newPosition
          placeBlockBottom.setOffset(positionForPlaceBlock.blockOffset)
          return true
        }
        return false
      }
    }),

    new StateTransition({
      parent: load,
      child: checkBack,
      shouldTransition: () => {
        if (
          targets.minerJob.nextLayer.minerCords.tunel === 'horizontally' &&
          parseInt(originalPosition.y) !== parseInt(targets.minerJob.nextLayer.minerCords.yStart)
        ) {
          return true
        }

        return false
      }
    }),

    new StateTransition({
      parent: placeBlockBottom,
      child: exit,
      onTransition: () => {
        targets.position = originalPosition
      },
      shouldTransition: () =>
        targets.minerJob.nextLayer.minerCords.tunel === 'vertically' &&
        (
          placeBlockBottom.isFinished() ||
          placeBlockBottom.isItemNotFound() ||
          placeBlockBottom.isCantPlaceBlock()
        )
    }),

    new StateTransition({
      parent: placeBlockBottom,
      child: checkCorner,
      shouldTransition: () =>
        targets.minerJob.nextLayer.minerCords.tunel === 'horizontally' &&
        (
          placeBlockBottom.isFinished() ||
          placeBlockBottom.isItemNotFound() ||
          placeBlockBottom.isCantPlaceBlock()
        )
    }),

    new StateTransition({
      parent: load,
      child: exit,
      shouldTransition: () => {
        const block = bot.blockAt(originalPosition.offset(0, -1, 0))
        const item = bot.inventory.items().find(item => targets.minerJob.blockForPlace.includes(item.name))

        if (
          targets.minerJob.nextLayer.minerCords.tunel === 'vertically' &&
          (
            !placeBlocks.includes(block.name) ||
            !item
          )
        ) {
          return true
        }

        return false
      }
    }),

    new StateTransition({
      parent: load,
      child: checkCorner,
      shouldTransition: () => {
        const block = bot.blockAt(originalPosition.offset(0, -1, 0))
        const item = bot.inventory.items().find(item => targets.minerJob.blockForPlace.includes(item.name))

        if (
          targets.minerJob.nextLayer.minerCords.tunel === 'horizontally' &&
          (
            !placeBlocks.includes(block.name) ||
            !item
          )
        ) {
          return true
        }

        return false
      }
    }),

    new StateTransition({
      parent: checkCorner,
      child: checkBack,
      shouldTransition: () => {
        const offsetX = targets.minerJob.nextLayer.minerCords.orientation === 'x+'
          ? 1 : targets.minerJob.nextLayer.minerCords.orientation === 'x-' ? -1 : 0
        const offsetZ = targets.minerJob.nextLayer.minerCords.orientation === 'z+'
          ? 1 : targets.minerJob.nextLayer.minerCords.orientation === 'z-' ? -1 : 0
        const block = bot.blockAt(originalPosition.offset(offsetX, -1, offsetZ))
        const item = bot.inventory.items().find(item => targets.minerJob.blockForPlace.includes(item.name))

        if (
          targets.minerJob.nextLayer.minerCords.tunel === 'horizontally' &&
          (
            !placeBlocks.includes(block.name) ||
            !item
          )
        ) {
          return true
        }

        return false
      }
    }),

    new StateTransition({
      parent: checkCorner,
      child: placeBlockCorner,
      shouldTransition: () => {
        const offsetX = targets.minerJob.nextLayer.minerCords.orientation === 'x+' ? 1 : targets.minerJob.nextLayer.minerCords.orientation === 'x-' ? -1 : 0
        const offsetZ = targets.minerJob.nextLayer.minerCords.orientation === 'z+' ? 1 : targets.minerJob.nextLayer.minerCords.orientation === 'z-' ? -1 : 0
        const block = bot.blockAt(originalPosition.offset(offsetX, -1, offsetZ))
        const item = bot.inventory.items().find(item => targets.minerJob.blockForPlace.includes(item.name))

        if (
          targets.minerJob.nextLayer.minerCords.tunel === 'horizontally' &&
          placeBlocks.includes(block.name) &&
          item
        ) {
          targets.item = item
          const { newPosition, blockOffset } = getNewPositionForPlaceBlock(originalPosition.offset(offsetX, -1, offsetZ))
          targets.position = newPosition
          placeBlockCorner.setOffset(blockOffset.clone())
          return true
        }

        return false
      }
    }),

    new StateTransition({
      parent: placeBlockCorner,
      child: checkBack,
      shouldTransition: () =>
        targets.minerJob.nextLayer.minerCords.tunel === 'horizontally' &&
        (
          placeBlockCorner.isFinished() ||
          placeBlockCorner.isItemNotFound() ||
          placeBlockCorner.isCantPlaceBlock()
        )
    }),

    new StateTransition({
      parent: checkBack,
      child: placeBlockBack,
      shouldTransition: () => {
        const offsetX = targets.minerJob.nextLayer.minerCords.orientation === 'x+' ? 1 : targets.minerJob.nextLayer.minerCords.orientation === 'x-' ? -1 : 0
        const offsetZ = targets.minerJob.nextLayer.minerCords.orientation === 'z+' ? 1 : targets.minerJob.nextLayer.minerCords.orientation === 'z-' ? -1 : 0
        const block = bot.blockAt(originalPosition.offset(offsetX, 0, offsetZ))
        const item = bot.inventory.items().find(item => targets.minerJob.blockForPlace.includes(item.name))

        if (
          targets.minerJob.nextLayer.minerCords.tunel === 'horizontally' &&
          placeBlocks.includes(block.name) &&
          item
        ) {
          targets.item = item
          const { newPosition, blockOffset } = getNewPositionForPlaceBlock(originalPosition.offset(offsetX, 0, offsetZ))
          targets.position = newPosition
          placeBlockBack.setOffset(blockOffset.clone())
          return true
        }

        return false
      }
    }),

    new StateTransition({
      parent: checkBack,
      child: exit,
      shouldTransition: () => {
        const offsetX = targets.minerJob.nextLayer.minerCords.orientation === 'x+' ? 1 : targets.minerJob.nextLayer.minerCords.orientation === 'x-' ? -1 : 0
        const offsetZ = targets.minerJob.nextLayer.minerCords.orientation === 'z+' ? 1 : targets.minerJob.nextLayer.minerCords.orientation === 'z-' ? -1 : 0
        const block = bot.blockAt(originalPosition.offset(offsetX, 0, offsetZ))
        const item = bot.inventory.items().find(item => targets.minerJob.blockForPlace.includes(item.name))

        if (
          targets.minerJob.nextLayer.minerCords.tunel === 'horizontally' &&
          (
            !placeBlocks.includes(block.name) ||
            !item
          )
        ) {
          return true
        }

        return false
      }
    }),

    new StateTransition({
      parent: placeBlockBack,
      child: exit,
      onTransition: () => {
        targets.position = originalPosition
      },
      shouldTransition: () =>
        targets.minerJob.nextLayer.minerCords.tunel === 'horizontally' &&
        (
          placeBlockBack.isFinished() ||
          placeBlockBack.isItemNotFound() ||
          placeBlockBack.isCantPlaceBlock()
        )
    })

  ]

  const placeBlockAfterDig = new NestedStateMachine(transitions, start, exit)
  placeBlockAfterDig.stateName = 'Place Block After Dig'
  return placeBlockAfterDig
}

module.exports = placeBlockAfterDig
