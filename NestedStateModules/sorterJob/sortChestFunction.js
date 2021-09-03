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
  exit.x = 125
  exit.y = 413

  const checkChestsToSort = new BehaviorIdle(targets)
  checkChestsToSort.stateName = 'Check Chests mus be sorted'
  checkChestsToSort.x = 525
  checkChestsToSort.y = 113

  const findItems = new BehaviorIdle(targets)
  findItems.stateName = 'Find items in chests'
  findItems.x = 525
  findItems.y = 263

  const pickUpItems = require('@NestedStateModules/sorterJob/pickUpItems')(bot, targets)
  pickUpItems.stateName = 'Pick Up Items'
  pickUpItems.x = 525
  pickUpItems.y = 413

  const depositItems = require('@NestedStateModules/sorterJob/depositItems')(bot, targets)
  depositItems.stateName = 'Deposit Items'
  depositItems.x = 325
  depositItems.y = 413

  const transitions = [
    new StateTransition({
      parent: start,
      child: checkChestsToSort,
      onTransition: () => {
        targets.sorterJob.correctChests = targets.chests.map(chest => chest.slots.map(slot => { return { correct: false } }))

        const slotsToSort = []
        targets.sorterJob.newChestSort.every((chest, chestIndex) => {
          chest.every((slot, slotIndex) => {
            if (
              !targets.chests[chestIndex].slots[slotIndex] ||
              slot.type !== targets.chests[chestIndex].slots[slotIndex].type ||
              slot.count !== targets.chests[chestIndex].slots[slotIndex].count
            ) {
              slotsToSort.push({
                chest: chestIndex,
                slot: slotIndex,
                type: slot.type,
                count: slot.count,
                method: 'set'
              })
            } else {
              targets.sorterJob.correctChests[chestIndex][slotIndex].correct = true
            }
            if (slotsToSort.length < 25) return true
            return false
          })

          if (slotsToSort.length < 25) return true
          return false
        })
        targets.sorterJob.slotsToSort = slotsToSort
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkChestsToSort,
      child: findItems,
      onTransition: () => {
        targets.sorterJob.transactions = findItemsInChests(targets.chests, targets.sorterJob.slotsToSort, targets.sorterJob.correctChests)
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
      child: depositItems,
      shouldTransition: () => pickUpItems.isFinished()
    }),

    new StateTransition({
      parent: depositItems,
      child: exit,
      shouldTransition: () => {
        return false
      }
    })
  ]

  const sortChestFunction = new NestedStateMachine(transitions, start, exit)
  sortChestFunction.stateName = 'sortChestFunction'
  return sortChestFunction
}

module.exports = sortChestFunction
