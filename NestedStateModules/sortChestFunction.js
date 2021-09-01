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

        targets.chests.every((chest, chestIndex) => {
          if (!targets.newChestSort[chestIndex]) return false
          chest.slots.every((slot, slotIndex) => {
            if (!targets.newChestSort[chestIndex][slotIndex]) return false
            if (
              !slot ||
              slot.type !== targets.newChestSort[chestIndex][slotIndex].type
            ) {
              slotsToSort.push({
                chest: chestIndex,
                slot: slotIndex,
                type: targets.newChestSort[chestIndex][slotIndex].type,
                count: targets.newChestSort[chestIndex][slotIndex].count,
                method: 'set'
              })
            } else if (slot.count !== targets.newChestSort[chestIndex][slotIndex].count) {
              slotsToSort.push({
                chest: chestIndex,
                slot: slotIndex,
                type: targets.newChestSort[chestIndex][slotIndex].type,
                count: targets.newChestSort[chestIndex][slotIndex].count - slot.count,
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
