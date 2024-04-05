import { StateTransition, BehaviorIdle, NestedStateMachine } from 'mineflayer-statemachine'
import BehaviorLoadConfig from '@/BehaviorModules/BehaviorLoadConfig'
import BehaviorWithdrawItemChest from '@/BehaviorModules/BehaviorWithdrawItemChest'
import BehaviorDepositItemChest from '@/BehaviorModules/BehaviorDepositItemChest'
import BehaviorCheckItemsInInventory from '@/BehaviorModules/BehaviorCheckItemsInInventory'
import BehaviorMoveTo from '@/BehaviorModules/BehaviorMoveTo'
import chestModule from '@/modules/chestModule'
import SearchAndCraftFunction from '@/NestedStateModules/crafterJob/searchAndCraftFunction'
import { Chest, Item, LegionStateMachineTargets } from 'base-types'
import { Bot } from 'mineflayer'

export default (bot: Bot, targets: LegionStateMachineTargets) => {
  const { findChestsToWithdraw } = chestModule(bot, targets)

  const start = new BehaviorIdle()
  start.stateName = 'Start'
  start.x = 75
  start.y = 63

  const checkCraftItem = new BehaviorIdle()
  checkCraftItem.stateName = 'Check Craft Item'
  checkCraftItem.x = 75
  checkCraftItem.y = 513

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  exit.x = 525
  exit.y = 113

  const nextCheck = new BehaviorIdle()
  nextCheck.stateName = 'Next Check'
  nextCheck.x = 325
  nextCheck.y = 213

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'
  loadConfig.x = 75
  loadConfig.y = 213

  const checkItemsInInventory = new BehaviorCheckItemsInInventory(bot, targets)
  checkItemsInInventory.stateName = 'Checks Items in Inventory'
  checkItemsInInventory.x = 325
  checkItemsInInventory.y = 363

  const goChest = new BehaviorMoveTo(bot, targets)
  goChest.stateName = 'Go chest'
  goChest.x = 525
  goChest.y = 513
  goChest.movements = targets.movements

  const withdrawItems = new BehaviorWithdrawItemChest(bot, targets)
  withdrawItems.stateName = 'Withdraw Items'
  withdrawItems.x = 325
  withdrawItems.y = 513

  const depositItems = new BehaviorDepositItemChest(bot, targets)
  depositItems.stateName = 'Deposit Items'
  depositItems.x = 525
  depositItems.y = 363

  const searchAndCraft = SearchAndCraftFunction(bot, targets);
  searchAndCraft.x = 75
  searchAndCraft.y = 363

  let chests: Array<Chest> = []
  let chestIndex = 0
  let itemsToCraft: Array<Item> = []

  const transitions = [
    new StateTransition({
      parent: start,
      child: nextCheck,
      onTransition: () => {
        chestIndex = 0
        chests = structuredClone(bot.config.chests)
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: nextCheck,
      child: exit,
      shouldTransition: () => chestIndex === (chests.length)
    }),

    new StateTransition({
      parent: nextCheck,
      child: checkItemsInInventory,
      onTransition: () => {
        checkItemsInInventory.setItemsToCheck(chests[chestIndex].items)
        checkItemsInInventory.setIsDeposit(chests[chestIndex].type)
      },
      shouldTransition: () => chestIndex < (chests.length)
    }),

    new StateTransition({
      parent: checkItemsInInventory,
      child: nextCheck,
      onTransition: () => chestIndex++,
      shouldTransition: () => checkItemsInInventory.isFinished() && targets.items.length === 0
    }),

    new StateTransition({
      parent: checkItemsInInventory,
      child: goChest,
      onTransition: () => {
        targets.position = chests[chestIndex].position
        targets.position.dimension = chests[chestIndex].dimension
      },
      shouldTransition: () => checkItemsInInventory.isFinished() && targets.items.length > 0
    }),

    new StateTransition({
      parent: goChest,
      child: withdrawItems,
      shouldTransition: () => (goChest.isFinished() || goChest.distanceToTarget() < 3) && !goChest.isSuccess() && !bot.pathfinder.isMining() && chests[chestIndex].type === 'withdraw'
    }),

    new StateTransition({
      parent: goChest,
      child: depositItems,
      shouldTransition: () => (goChest.isFinished() || goChest.distanceToTarget() < 3) && !goChest.isSuccess() && !bot.pathfinder.isMining() && (chests[chestIndex].type === 'deposit' || chests[chestIndex].type === 'depositAll')
    }),

    new StateTransition({
      parent: withdrawItems,
      child: checkCraftItem,
      onTransition: () => {
        //@ts-ignore
        itemsToCraft = targets.items.filter(i => i.quantity > 0)
      },
      shouldTransition: () => withdrawItems.isFinished()
    }),

    new StateTransition({
      parent: checkCraftItem,
      child: nextCheck,
      onTransition: () => chestIndex++,
      shouldTransition: () => itemsToCraft.length === 0 || !bot.config.canCraftItemWithdrawChest
    }),

    new StateTransition({
      parent: checkCraftItem,
      child: searchAndCraft,
      onTransition: () => {
        targets.craftItemBatch = itemsToCraft
      },
      shouldTransition: () => itemsToCraft.length > 0 && bot.config.canCraftItemWithdrawChest
    }),

    new StateTransition({
      parent: searchAndCraft,
      child: nextCheck,
      onTransition: () => chestIndex++,
      shouldTransition: () => searchAndCraft.isFinished()
    }),

    new StateTransition({
      parent: depositItems,
      child: nextCheck,
      onTransition: () => chestIndex++,
      shouldTransition: () => depositItems.isFinished()
    })
  ]

  const nestedState = new NestedStateMachine(transitions, start, exit)
  nestedState.stateName = 'Go Chests'
  return nestedState
}