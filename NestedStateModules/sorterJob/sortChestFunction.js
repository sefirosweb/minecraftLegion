const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

function sortChestFunction (bot, targets) {
  const { findItemsInChests, calculateSlotsToSort } = require('@modules/sorterJob')(bot)

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

  const pickUpItems = require('@NestedStateModules/getReady/pickUpItems')(bot, targets)
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
        const calculatedSlotsToSort = calculateSlotsToSort(targets.chests, targets.sorterJob.newChestSort)
        targets.sorterJob.correctChests = calculatedSlotsToSort.correctChests
        targets.sorterJob.slotsToSort = calculatedSlotsToSort.slotsToSort
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkChestsToSort,
      child: findItems,
      onTransition: () => {
        targets.pickUpItems = findItemsInChests(targets.chests, targets.sorterJob.slotsToSort, targets.sorterJob.correctChests)
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
      shouldTransition: () => depositItems.isFinished()
    })
  ]

  const sortChestFunction = new NestedStateMachine(transitions, start, exit)
  sortChestFunction.stateName = 'sortChestFunction'
  return sortChestFunction
}

module.exports = sortChestFunction
