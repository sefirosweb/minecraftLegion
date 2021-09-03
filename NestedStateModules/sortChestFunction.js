const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

function sortChestFunction (bot, targets) {
  const { findItemsInChests } = require('@modules/inventoryModule')(bot)

  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'
  exit.x = 225
  exit.y = 413

  const checkChestsToSort = new BehaviorIdle(targets)
  checkChestsToSort.stateName = 'Check Chests mus be sorted'

  const findItems = new BehaviorIdle(targets)
  findItems.stateName = 'Find items in chests'

  const pickUpItems = require('@NestedStateModules/sorterJob/pickUpItems')(bot, targets)
  pickUpItems.stateName = 'Sort chests'

  const transitions = [
    new StateTransition({
      parent: start,
      child: checkChestsToSort,
      onTransition: () => {
        targets.correctChests = targets.sorterJob.chests.map(chest => chest.slots.map(slot => { return { correct: false } }))

        const slotsToSort = []
        targets.newChestSort.every((chest, chestIndex) => {
          chest.every((slot, slotIndex) => {
            if (
              !targets.sorterJob.chests[chestIndex].slots[slotIndex] ||
              slot.type !== targets.sorterJob.chests[chestIndex].slots[slotIndex].type ||
              slot.count !== targets.sorterJob.chests[chestIndex].slots[slotIndex].count
            ) {
              slotsToSort.push({
                chest: chestIndex,
                slot: slotIndex,
                type: slot.type,
                count: slot.count,
                method: 'set'
              })
            } else {
              targets.correctChests[chestIndex][slotIndex].correct = true
            }

            /* OLD
            if (
              !targets.sorterJob.chests[chestIndex].slots[slotIndex] ||
              slot.type !== targets.sorterJob.chests[chestIndex].slots[slotIndex].type
            ) {
              slotsToSort.push({
                chest: chestIndex,
                slot: slotIndex,
                type: slot.type,
                count: slot.count,
                method: 'set'
              })
            } else if (slot.count !== targets.sorterJob.chests[chestIndex].slots[slotIndex].count) {
              slotsToSort.push({
                chest: chestIndex,
                slot: slotIndex,
                type: slot.type,
                count: slot.count - targets.sorterJob.chests[chestIndex].slots[slotIndex].count,
                method: 'add'
              })
            }
            */

            if (slotsToSort.length < 25) return true
            return false
          })

          if (slotsToSort.length < 25) return true
          return false
        })
        targets.slotsToSort = slotsToSort
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkChestsToSort,
      child: findItems,
      onTransition: () => {
        targets.sorterJob.transactions = findItemsInChests(targets.sorterJob.chests, targets.slotsToSort, targets.correctChests)
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: findItems,
      child: pickUpItems,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: pickUpItems,
      child: exit,
      shouldTransition: () => false
    })
  ]

  const sortChestFunction = new NestedStateMachine(transitions, start)
  sortChestFunction.stateName = 'sortChestFunction'
  return sortChestFunction
}

module.exports = sortChestFunction
