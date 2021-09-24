const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')
const vec3 = require('vec3')

const BehaviorCustomPlaceBlock = require('@BehaviorModules/BehaviorCustomPlaceBlock')
const BehaviorMoveTo = require('@BehaviorModules/BehaviorMoveTo')

let blockOffset

function placeBlockAfterDig (bot, targets) {
  const { getOffsetPlaceBlock } = require('@modules/placeBlockModule')(bot)
  const placeBlocks = require('@modules/placeBlockModule')(bot).blocksCanBeReplaced
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'exit'

  const placeBlock = new BehaviorCustomPlaceBlock(bot, targets)
  placeBlock.stateName = 'Place Block'

  const moveToBlock = new BehaviorMoveTo(bot, targets)
  moveToBlock.stateName = 'Move To Block'
  moveToBlock.movements = targets.movements

  const transitions = [
    new StateTransition({
      parent: start,
      child: placeBlock,
      shouldTransition: () => {
        const block = bot.blockAt(targets.position.offset(0, -1, 0))
        const item = bot.inventory.items().find(item => targets.minerJob.blockForPlace.includes(item.name))

        if (
          (
            targets.minerJob.nextLayer.minerCords.tunel === 'vertically' ||
            (
              targets.minerJob.nextLayer.minerCords.tunel === 'horizontally' &&
              parseInt(targets.position.y) === parseInt(targets.minerJob.nextLayer.minerCords.yStart)
            )
          ) &&
          placeBlocks.includes(block.name) &&
          item
        ) {
          targets.item = item
          targets.position = targets.position.offset(0, -1, 0)
          blockOffset = getOffsetPlaceBlock(bot.blockAt(targets.position))
          targets.position = targets.position.add(blockOffset)

          blockOffset = {
            x: blockOffset.x * -1,
            y: blockOffset.y * -1,
            z: blockOffset.z * -1
          }

          placeBlock.setOffset(blockOffset)
          return true
        }
        return false
      }
    }),

    new StateTransition({
      parent: placeBlock,
      child: exit,
      onTransition: () => {
        targets.position.add(blockOffset).add(vec3(0, 1, 0))
      },
      shouldTransition: () => placeBlock.isFinished() || placeBlock.isItemNotFound() || placeBlock.isCantPlaceBlock()
    }),

    new StateTransition({
      parent: start,
      child: exit,
      shouldTransition: () => {
        const block = bot.blockAt(targets.position.offset(0, -1, 0))
        const item = bot.inventory.items().find(item => targets.minerJob.blockForPlace.includes(item.name))

        if (
          (
            targets.minerJob.nextLayer.minerCords.tunel === 'horizontally' &&
            parseInt(targets.position.y) !== parseInt(targets.minerJob.nextLayer.minerCords.yStart)
          ) ||
          !placeBlocks.includes(block.name) ||
          !item
        ) {
          return true
        }

        return false
      }
    })

  ]

  const placeBlockAfterDig = new NestedStateMachine(transitions, start, exit)
  placeBlockAfterDig.stateName = 'Place Block After Dig'
  return placeBlockAfterDig
}

module.exports = placeBlockAfterDig
