import vec3 from 'vec3'
import { StateTransition, BehaviorIdle, NestedStateMachine } from 'mineflayer-statemachine'
import BehaviorcCheckItemsInChest from '@/BehaviorModules/sorterJob/BehaviorcCheckItemsInChest'
import BehaviorMoveTo from '@/BehaviorModules/BehaviorMoveTo'
import { NewChestBlock, LegionStateMachineTargets } from 'types/index'
import sorterJob from '@/modules/sorterJob'
import inventoryModule from '@/modules/inventoryModule'
import DepositItemsInInventory from '@/NestedStateModules/sorterJob/depositItemsInInventory'
import SortChestFunction from '@/NestedStateModules/sorterJob/sortChestFunction'
import { Block } from 'prismarine-block'
import { Bot, Dimension_V2 } from 'mineflayer'

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

    Object.values(targets.chests).forEach(c => {
      c.chestFound = false
    })

    const chests = findChests({
      count: 9999,
      maxDistance: 40
    })


    chests.forEach(chest => {

      const cKey = Object.entries(targets.chests)
        .find(entry => {
          const [, tc] = entry
          if (
            (tc.position_2 === undefined) === (chest.secondBlock === undefined) &&
            (
              vec3(tc.position).equals(chest.position) ||
              (tc.position_2 && vec3(tc.position_2).equals(chest.position)) ||
              (chest.secondBlock && vec3(tc.position).equals(chest.secondBlock.position)) ||
              (tc.position_2 && chest.secondBlock && vec3(tc.position_2).equals(chest.secondBlock.position))
            )
          ) {
            return true
          }

          return false
        })

      if (cKey) {
        targets.chests[cKey[0]].chestFound = true
      } else {

        const newChest: NewChestBlock = {
          dimension: bot.game.dimension as Dimension_V2,
          position: chest.position
        }

        targets.sorterJob.newChests.push(newChest)
      }
    })


    // const removeValFromIndex: Array<number> = []

    // Object.values(targets.chests).forEach((c, cKey) => { // TODO pendiente
    //   if (c.chestFound === false) {
    //     removeValFromIndex.push(cKey)
    //   }
    // })

    // if (removeValFromIndex.length > 0) { // TODO pendiente
    //   for (let i = removeValFromIndex.length - 1; i >= 0; i--) {
    //     targets.chests.splice(removeValFromIndex[i], 1)
    //   }
    //   botWebsocket.sendAction('setChests', targets.chests)
    // }
  }

  const customSortJobAddNewChestToCheck = (chest: Block, isOpen: number, secondBlock: Block) => {
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

        const chestInfo = Object.values(targets.chests).find(c => {
          if (vec3(c.position).equals(chest.position)) return true
          if (secondBlock && vec3(c.position).equals(secondBlock.position)) return true
          return false
        })

        if (!chestInfo || chestInfo.lastTimeOpen === undefined || Date.now() - chestInfo.lastTimeOpen > 5000) {

          const newChest: NewChestBlock = {
            dimension: bot.game.dimension as Dimension_V2,
            position: chest.position
          }

          targets.sorterJob.newChests.push(newChest)
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
        targets.sorterJob.newChests = []

        // @ts-ignore pendiente de PR: https://github.com/PrismarineJS/mineflayer/pull/2919
        bot.removeListener('chestLidMove', customSortJobAddNewChestToCheck)

        // @ts-ignore pendiente de PR: https://github.com/PrismarineJS/mineflayer/pull/2919
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
        const chest = targets.sorterJob.newChests.shift()
        if (!chest) throw new Error('Chest is not defined!')
        targets.sorterJob.chest = chest
        targets.position = chest.position.clone()
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
      shouldTransition: () => (goChest.isFinished() || goChest.distanceToTarget() < 3) && !bot.pathfinder.isMining()
    }),

    new StateTransition({
      parent: checkItemsInChest,
      child: checkNewChests,
      onTransition: () => {
        if (!checkItemsInChest.getCanOpenChest()) {
          const chestToDelete = Object.entries(targets.chests)
            .find(c => {
              const chest = c[1]

              if (!targets.sorterJob.chest) throw new Error('Chest is not defined!')
              const chestToFind = targets.sorterJob.chest

              if (vec3(chest.position).equals(chestToFind.position)) return true

              // if (chest.secondBlock && vec3(c.position).equals(chest.secondBlock.position)) return true // TODO revisar
              return false
            })

          if (chestToDelete) {
            delete targets.chests[chestToDelete[0]]
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
          const chestToDelete = Object.entries(targets.chests)
            .find(c => {
              const chest = c[1]

              if (!targets.sorterJob.chest) throw new Error('Chest is not defined!')
              const chestToFind = targets.sorterJob.chest

              if (vec3(chest.position).equals(chestToFind.position)) return true

              // if (chest.secondBlock && vec3(c.position).equals(chest.secondBlock.position)) return true // TODO revisar
              return false
            })

          if (chestToDelete) {
            delete targets.chests[chestToDelete[0]]
          }
        }


        targets.sorterJob.chest = targets.sorterJob.newChests.shift()
        if (!targets.sorterJob.chest) throw Error('Chest ist not defined!')
        targets.position = targets.sorterJob.chest.position.clone()
      },

      shouldTransition: () => checkItemsInChest.isFinished() && targets.sorterJob.newChests.length > 0
    }),

    new StateTransition({
      parent: sortChestFunction,
      child: checkItemsInInventory,
      onTransition() {
        bot.emit('finishedJob')
      },
      shouldTransition: () => sortChestFunction.isFinished()
    })

  ]

  const nestedState = new NestedStateMachine(transitions, start)
  nestedState.stateName = 'Sorter Job'
  return nestedState
}

export default sorterJobFunction
