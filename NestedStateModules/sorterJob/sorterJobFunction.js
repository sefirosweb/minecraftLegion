const vec3 = require('vec3')
const botWebsocket = require('@modules/botWebsocket')
const {
  StateTransition,
  BehaviorIdle,
  BehaviorMoveTo,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorcCheckItemsInChest = require('@BehaviorModules/sorterJob/BehaviorcCheckItemsInChest')

function sorterJobFunction (bot, targets) {
  const { findChests } = require('@modules/inventoryModule')(bot)
  const { sortChests, calculateSlotsToSort } = require('@modules/sorterJob')(bot)

  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const checkItemsInInventory = new BehaviorIdle(targets)
  checkItemsInInventory.stateName = 'Check Items In Inventory'
  checkItemsInInventory.x = 125
  checkItemsInInventory.y = 263

  const depositItemsInInventory = require('@NestedStateModules/sorterJob/depositItemsInInventory')(bot, targets)
  depositItemsInInventory.stateName = 'Deposit Items In Inventory'
  depositItemsInInventory.x = 125
  depositItemsInInventory.y = 463

  const checkNewChests = new BehaviorIdle(targets)
  checkNewChests.stateName = 'Check new chests'
  checkNewChests.x = 325
  checkNewChests.y = 463

  const checkItemsInChest = new BehaviorcCheckItemsInChest(bot, targets)
  checkItemsInChest.stateName = 'Check items in chests'
  checkItemsInChest.x = 525
  checkItemsInChest.y = 613

  const calculateSort = new BehaviorIdle(targets)
  calculateSort.stateName = 'Calculate sorted items in chests'
  calculateSort.x = 525
  calculateSort.y = 263

  const goChest = new BehaviorMoveTo(bot, targets)
  goChest.stateName = 'Go chest'
  goChest.x = 125
  goChest.y = 613
  goChest.movements = targets.movements

  const sortChestFunction = require('@NestedStateModules/sorterJob/sortChestFunction')(bot, targets)
  sortChestFunction.stateName = 'Sort chests'
  sortChestFunction.x = 325
  sortChestFunction.y = 263

  const findNewChests = () => {
    targets.chests.forEach(c => {
      c.chestFound = false
    })

    const chests = findChests({
      count: 9999,
      maxDistance: 40
    })

    chests.forEach(chest => {
      // Find chest in targets.chests
      const cKey = targets.chests.findIndex(tc => {
        if (
          // Both must be second block or not
          (tc.secondBlock === undefined) === (chest.secondBlock === undefined) &&
          (
            vec3(tc.position).equals(chest.position) ||
            (tc.secondBlock && vec3(tc.secondBlock.position).equals(chest.position)) ||
            (chest.secondBlock && vec3(tc.position).equals(chest.secondBlock.position)) ||
            (tc.secondBlock && chest.secondBlock && vec3(tc.secondBlock.position).equals(chest.secondBlock.position))
          )
        ) {
          return true
        }

        return false
      })

      if (cKey >= 0) {
        targets.chests[cKey].chestFound = true
      } else {
        chest.chestFound = true
        targets.sorterJob.newChests.push(chest)
      }
    })

    const removeValFromIndex = []
    targets.chests.forEach((c, cKey) => {
      if (c.chestFound === false) {
        removeValFromIndex.push(cKey)
      }
    })

    if (removeValFromIndex.length > 0) {
      for (let i = removeValFromIndex.length - 1; i >= 0; i--) {
        targets.chests.splice(removeValFromIndex[i], 1)
      }

      botWebsocket.sendAction('setChests', targets.chests)
    }
  }

  const customSortJobAddNewChestToCheck = (chest, isOpen, secondBlock) => {
    if (!isOpen) {
      if (
        /* Check if this chest closed is last chest closed by bot */
        (
          !targets.sorterJob.chest ||
          !chest.position.equals(targets.sorterJob.chest.position)
        ) &&
        /* Check if pending chest to open is in list */
        !targets.sorterJob.newChests.find(c => {
          if (vec3(c.position).equals(chest.position)) return true
          if (secondBlock && vec3(c.position).equals(secondBlock.position)) return true
          return false
        })
      ) {
        targets.sorterJob.newChests.push(chest)
      }
    }
  }

  const transitions = [
    new StateTransition({
      parent: start,
      child: checkItemsInInventory,
      onTransition: () => {
        targets.sorterJob.emptyChests = []
        targets.sorterJob.newChests = []
        bot.removeListener('chestLidMove', customSortJobAddNewChestToCheck)
        bot.on('chestLidMove', customSortJobAddNewChestToCheck)
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkItemsInInventory,
      child: depositItemsInInventory,
      shouldTransition: () => bot.inventory.items().length > 0
    }),

    new StateTransition({
      parent: depositItemsInInventory,
      child: checkItemsInInventory,
      shouldTransition: () => depositItemsInInventory.isFinished() && targets.sorterJob.emptyChests.length > 0
    }),

    new StateTransition({
      parent: depositItemsInInventory,
      child: checkNewChests,
      name: 'No chests for deposit the items',
      onTransition: () => {
        findNewChests()
      },
      shouldTransition: () => depositItemsInInventory.isFinished() && targets.sorterJob.emptyChests.length === 0
    }),

    new StateTransition({
      parent: checkItemsInInventory,
      child: checkNewChests,
      onTransition: () => {
        findNewChests()
      },
      shouldTransition: () => bot.inventory.items().length === 0
    }),

    new StateTransition({
      parent: checkNewChests,
      child: goChest,
      onTransition: () => {
        targets.sorterJob.chest = targets.sorterJob.newChests.shift()
        targets.position = targets.sorterJob.chest.position.clone()
      },
      shouldTransition: () => {
        const newChestSort = sortChests(targets.chests)
        const calculatedSlotsToSort = calculateSlotsToSort(targets.chests, newChestSort)
        if (calculatedSlotsToSort.slotsToSort.length > 0) {
          return false
        }
        return targets.sorterJob.newChests.length > 0
      }
    }),

    new StateTransition({
      parent: checkNewChests,
      child: sortChestFunction,
      shouldTransition: () => {
        if (bot.inventory.items().length === 0) {
          const newChestSort = sortChests(targets.chests)
          const calculatedSlotsToSort = calculateSlotsToSort(targets.chests, newChestSort)
          if (calculatedSlotsToSort.slotsToSort.length > 0) {
            targets.sorterJob.newChestSort = newChestSort
            return true
          }
        }
        return false
      }
    }),

    new StateTransition({
      parent: checkNewChests,
      child: checkItemsInInventory,
      name: 'Found items in inventory',
      shouldTransition: () => bot.inventory.items().length > 0
    }),

    new StateTransition({
      parent: goChest,
      child: checkItemsInChest,
      shouldTransition: () => goChest.isFinished() && !bot.pathfinder.isMining()
    }),

    new StateTransition({
      parent: checkItemsInChest,
      child: checkNewChests,
      onTransition: () => {
        if (!checkItemsInChest.getCanOpenChest()) {
          const chestIndex = targets.chests.findIndex(c => {
            if (vec3(c.position).equals(targets.sorterJob.chest.position)) return true
            if (targets.sorterJob.chest.secondBlock && vec3(c.position).equals(targets.sorterJob.chest.secondBlock.position)) return true
            return false
          })
          if (chestIndex >= 0) {
            targets.chests.splice(chestIndex, 1)
          }
        }
      },
      shouldTransition: () => checkItemsInChest.isFinished() && targets.sorterJob.newChests.length === 0
    }),

    new StateTransition({
      parent: checkItemsInChest,
      child: goChest,
      onTransition: () => {
        if (!checkItemsInChest.getCanOpenChest()) {
          const chestIndex = targets.chests.findIndex(c => {
            if (vec3(c.position).equals(targets.sorterJob.chest.position)) return true
            if (targets.sorterJob.chest.secondBlock && vec3(c.position).equals(targets.sorterJob.chest.secondBlock.position)) return true
            return false
          })
          if (chestIndex >= 0) {
            targets.chests.splice(chestIndex, 1)
          }
        }

        targets.sorterJob.chest = targets.sorterJob.newChests.shift()
        targets.position = targets.sorterJob.chest.position.clone()
      },
      shouldTransition: () => checkItemsInChest.isFinished() && targets.sorterJob.newChests.length > 0
    }),

    new StateTransition({
      parent: sortChestFunction,
      child: checkItemsInInventory,
      shouldTransition: () => sortChestFunction.isFinished()
    })

  ]

  const sorterJob = new NestedStateMachine(transitions, start)
  sorterJob.stateName = 'Sorter Job'
  return sorterJob
}

module.exports = sorterJobFunction
