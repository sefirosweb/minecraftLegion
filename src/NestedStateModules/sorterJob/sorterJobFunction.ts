import vec3 from 'vec3'
import { StateTransition, BehaviorIdle, NestedStateMachine } from 'mineflayer-statemachine'

import botWebsocket from '@/modules/botWebsocket'
import BehaviorcCheckItemsInChest from '@/BehaviorModules/sorterJob/BehaviorcCheckItemsInChest'
import BehaviorMoveTo from '@/BehaviorModules/BehaviorMoveTo'
import { Bot, LegionStateMachineTargets } from '@/types'
import sorterJob from '@/modules/sorterJob'
import inventoryModule from '@/modules/inventoryModule'
import DepositItemsInInventory from '@/NestedStateModules/sorterJob/depositItemsInInventory'
import SortChestFunction from '@/NestedStateModules/sorterJob/sortChestFunction'

const sorterJobFunction = (bot: Bot, targets: LegionStateMachineTargets) => {
  const { findChests } = inventoryModule(bot)
  const { sortChests, calculateSlotsToSort } = sorterJob()

  const start = new BehaviorIdle()
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const checkItemsInInventory = new BehaviorIdle()
  checkItemsInInventory.stateName = 'Check Items In Inventory'
  checkItemsInInventory.x = 125
  checkItemsInInventory.y = 263

  const depositItemsInInventory = DepositItemsInInventory(bot, targets)
  depositItemsInInventory.stateName = 'Deposit Items In Inventory'
  depositItemsInInventory.x = 125
  depositItemsInInventory.y = 463

  const checkNewChests = new BehaviorIdle()
  checkNewChests.stateName = 'Check new chests'
  checkNewChests.x = 325
  checkNewChests.y = 463

  const checkItemsInChest = new BehaviorcCheckItemsInChest(bot, targets)
  checkItemsInChest.stateName = 'Check items in chests'
  checkItemsInChest.x = 525
  checkItemsInChest.y = 613

  const calculateSort = new BehaviorIdle()
  calculateSort.stateName = 'Calculate sorted items in chests'
  calculateSort.x = 525
  calculateSort.y = 263

  const goChest = new BehaviorMoveTo(bot, targets)
  goChest.stateName = 'Go chest'
  goChest.x = 125
  goChest.y = 613
  goChest.movements = targets.movements

  const sortChestFunction = SortChestFunction(bot, targets)
  sortChestFunction.stateName = 'Sort chests'
  sortChestFunction.x = 325
  sortChestFunction.y = 263

  const findNewChests = () => {

    Object.entries(targets.chests).forEach(c => {
      //@ts-ignore
      c.chestFound = false
    })

    const chests = findChests({
      count: 9999,
      maxDistance: 40
    })


    chests.forEach(chest => {
      // Find chest in targets.chests
      const cKey = Object.values(targets.chests).findIndex(tc => { // TODO revisar
        if (
          // Both must be second block or not

          //@ts-ignore
          (tc.secondBlock === undefined) === (chest.secondBlock === undefined) &&
          (

            vec3(tc.position).equals(chest.position) ||

            //@ts-ignore
            (tc.secondBlock && vec3(tc.secondBlock.position).equals(chest.position)) ||

            (chest.secondBlock && vec3(tc.position).equals(chest.secondBlock.position)) ||

            //@ts-ignore
            (tc.secondBlock && chest.secondBlock && vec3(tc.secondBlock.position).equals(chest.secondBlock.position))
          )
        ) {
          return true
        }

        return false
      })

      if (cKey >= 0) {

        //@ts-ignore
        targets.chests[cKey].chestFound = true
      } else {
        //@ts-ignore
        chest.chestFound = true

        //@ts-ignore
        targets.sorterJob.newChests.push(chest)
      }
    })


    //@ts-ignore
    const removeValFromIndex = []

    Object.entries(targets.chests).forEach((c, cKey) => { // TODO pendiente
      //@ts-ignore
      if (c.chestFound === false) {
        removeValFromIndex.push(cKey)
      }
    })

    if (removeValFromIndex.length > 0) { // TODO pendiente
      for (let i = removeValFromIndex.length - 1; i >= 0; i--) {

        //@ts-ignore
        targets.chests.splice(removeValFromIndex[i], 1)
      }

      botWebsocket.sendAction('setChests', targets.chests)
    }
  }

  const customSortJobAddNewChestToCheck = (chest: any, isOpen: any, secondBlock: any) => {
    if (!isOpen) {
      if (
        /* Check if this chest closed is last chest closed by bot */
        (

          //@ts-ignore
          !targets.sorterJob.chest ||

          //@ts-ignore
          !chest.position.equals(targets.sorterJob.chest.position)
        ) &&
        /* Check if pending chest to open is in list */

        //@ts-ignore
        !targets.sorterJob.newChests.find(c => {
          if (vec3(c.position).equals(chest.position)) return true
          if (secondBlock && vec3(c.position).equals(secondBlock.position)) return true
          return false
        })
      ) {
        const chestInfo = Object.values(targets.chests).find(c => { // TODO revisar

          if (vec3(c.position).equals(chest.position)) return true

          if (secondBlock && vec3(c.position).equals(secondBlock.position)) return true
          return false
        })

        //@ts-ignore
        if (!chestInfo || Date.now() - chestInfo.lastTimeOpen > 5000) {

          //@ts-ignore
          targets.sorterJob.newChests.push(chest)
        }
      }
    }
  }

  const transitions = [
    new StateTransition({
      parent: start,
      child: checkItemsInInventory,
      onTransition: () => {
        targets.sorterJob.emptyChests = []

        //@ts-ignore
        targets.sorterJob.newChests = []

        //@ts-ignore
        bot.removeListener('chestLidMove', customSortJobAddNewChestToCheck)

        //@ts-ignore
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

        //@ts-ignore
        targets.sorterJob.chest = targets.sorterJob.newChests.shift()

        //@ts-ignore
        targets.position = targets.sorterJob.chest.position.clone()
      },
      shouldTransition: () => {
        const newChestSort = sortChests(targets.chests)
        const calculatedSlotsToSort = calculateSlotsToSort(targets.chests, newChestSort)
        if (calculatedSlotsToSort.slotsToSort.length > 0) {
          return false
        }

        //@ts-ignore
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

            //@ts-ignore
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
      shouldTransition: () => (goChest.isFinished() || goChest.distanceToTarget() < 3) && !bot.pathfinder.isMining()
    }),

    new StateTransition({
      parent: checkItemsInChest,
      child: checkNewChests,
      onTransition: () => {
        if (!checkItemsInChest.getCanOpenChest()) {
          const chestIndex = Object.values(targets.chests).findIndex(c => { // TODO revisar

            //@ts-ignore
            if (vec3(c.position).equals(targets.sorterJob.chest.position)) return true

            //@ts-ignore
            if (targets.sorterJob.chest.secondBlock && vec3(c.position).equals(targets.sorterJob.chest.secondBlock.position)) return true
            return false
          })
          if (chestIndex >= 0) {

            //@ts-ignore
            targets.chests.splice(chestIndex, 1)
          }
        }
      },

      //@ts-ignore
      shouldTransition: () => checkItemsInChest.isFinished() && targets.sorterJob.newChests.length === 0
    }),

    new StateTransition({
      parent: checkItemsInChest,
      child: goChest,
      onTransition: () => {
        if (!checkItemsInChest.getCanOpenChest()) {
          const chestIndex = Object.values(targets.chests).findIndex(c => { // TODO revisar

            //@ts-ignore
            if (vec3(c.position).equals(targets.sorterJob.chest.position)) return true

            //@ts-ignore
            if (targets.sorterJob.chest.secondBlock && vec3(c.position).equals(targets.sorterJob.chest.secondBlock.position)) return true
            return false
          })
          if (chestIndex >= 0) {

            //@ts-ignore
            targets.chests.splice(chestIndex, 1)
          }
        }


        //@ts-ignore
        targets.sorterJob.chest = targets.sorterJob.newChests.shift()

        //@ts-ignore
        targets.position = targets.sorterJob.chest.position.clone()
      },

      //@ts-ignore
      shouldTransition: () => checkItemsInChest.isFinished() && targets.sorterJob.newChests.length > 0
    }),

    new StateTransition({
      parent: sortChestFunction,
      child: checkItemsInInventory,
      shouldTransition: () => sortChestFunction.isFinished()
    })

  ]

  const nestedState = new NestedStateMachine(transitions, start)
  nestedState.stateName = 'Sorter Job'
  return nestedState
}

export default sorterJobFunction
