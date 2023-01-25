import { Bot, LegionStateMachineTargets } from '@/types'
import {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} from 'mineflayer-statemachine'

import sorterJob from '@/modules/sorterJob'
import PickUpItems from '@/NestedStateModules/getReady/pickUpItems'
import DepositItems from '@/NestedStateModules/sorterJob/depositItems'

function sortChestFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const { findItemsInChests, calculateSlotsToSort } = sorterJob()

  const start = new BehaviorIdle()
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  exit.x = 125
  exit.y = 413

  const checkChestsToSort = new BehaviorIdle()
  checkChestsToSort.stateName = 'Check Chests mus be sorted'
  checkChestsToSort.x = 525
  checkChestsToSort.y = 113

  const findItems = new BehaviorIdle()
  findItems.stateName = 'Find items in chests'
  findItems.x = 525
  findItems.y = 263

  const pickUpItems = PickUpItems(bot, targets)
  pickUpItems.stateName = 'Pick Up Items'
  pickUpItems.x = 525
  pickUpItems.y = 413

  const depositItems = DepositItems(bot, targets)
  depositItems.stateName = 'Deposit Items'
  depositItems.x = 325
  depositItems.y = 413

  const transitions = [
    new StateTransition({
      parent: start,
      child: checkChestsToSort,
      onTransition: () => {
        //@ts-ignore
        const calculatedSlotsToSort = calculateSlotsToSort(targets.chests, targets.sorterJob.newChestSort)
        //@ts-ignore
        targets.sorterJob.correctChests = calculatedSlotsToSort.correctChests
        //@ts-ignore
        targets.sorterJob.slotsToSort = calculatedSlotsToSort.slotsToSort
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkChestsToSort,
      child: findItems,
      onTransition: () => {
        //@ts-ignore
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

  const nestedState = new NestedStateMachine(transitions, start, exit)
  nestedState.stateName = 'sortChestFunction'
  return nestedState
}

export default sortChestFunction
