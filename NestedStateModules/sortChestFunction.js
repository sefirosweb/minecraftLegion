const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

function sortChestFunction (bot, targets) {
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
  checkChestsToSort.x = 225
  checkChestsToSort.y = 413

  const transitions = [
    new StateTransition({
      parent: start,
      child: checkChestsToSort,
      onTransition: () => {
        const slotsToSort = []
        targets.newChestSort.every((chest, chestIndex) => {
          chest.every((slot, slotIndex) => {
            if (
              !targets.chests[chestIndex].slots[slotIndex] ||
              slot.type !== targets.chests[chestIndex].slots[slotIndex].type
            ) {
              slotsToSort.push({
                chest: chestIndex,
                slot: slotIndex,
                type: slot.type,
                count: slot.count,
                method: 'set'
              })
            } else if (slot.count !== targets.chests[chestIndex].slots[slotIndex].count) {
              slotsToSort.push({
                chest: chestIndex,
                slot: slotIndex,
                type: slot.type,
                count: slot.count - targets.chests[chestIndex].slots[slotIndex].count,
                method: 'add'
              })
            }

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
      child: exit,
      shouldTransition: () => false
    })
  ]

  const sortChestFunction = new NestedStateMachine(transitions, start)
  sortChestFunction.stateName = 'sortChestFunction'
  return sortChestFunction
}

module.exports = sortChestFunction
