import { Bot, LegionStateMachineTargets, Recipes, Recpie } from '@/types'
import { StateTransition, BehaviorIdle, NestedStateMachine } from 'mineflayer-statemachine'
import BehaviorCraft from '@/BehaviorModules/BehaviorCraft'
import chestModule from '@/modules/chestModule'
import craftModule, { GetItemsToPickUpBatch } from '@/modules/craftModule'
import PickUpItems from '@/NestedStateModules/getReady/pickUpItems'
import GoCraftingTableFunction from '@/NestedStateModules/crafterJob/goCraftingTableFunction'

export default (bot: Bot, targets: LegionStateMachineTargets) => {
  const { getItemsToPickUpBatch } = craftModule(bot)
  const { nearChests } = chestModule(bot, targets)

  const start = new BehaviorIdle()
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle()
  exit.stateName = 'exit'
  exit.x = 125
  exit.y = 575

  const checkRecipes = new BehaviorIdle()
  checkRecipes.stateName = 'checkRecipes'
  checkRecipes.x = 625
  checkRecipes.y = 113

  const checkRecipesWithTable = new BehaviorIdle()
  checkRecipesWithTable.stateName = 'checkRecipesWithTable'
  checkRecipesWithTable.x = 350
  checkRecipesWithTable.y = 575

  const checkMaterials = new BehaviorIdle()
  checkMaterials.stateName = 'checkMaterials'
  checkMaterials.x = 525
  checkMaterials.y = 350

  const checkPickUpItems = new BehaviorIdle()
  checkPickUpItems.stateName = 'checkPickUpItems'
  checkPickUpItems.x = 350
  checkPickUpItems.y = 213

  const checkCraftingTable = new BehaviorIdle()
  checkCraftingTable.stateName = 'checkCraftingTable'
  checkCraftingTable.x = 125
  checkCraftingTable.y = 350

  const craftItem = new BehaviorCraft(bot, targets)
  craftItem.stateName = 'Craft Item'
  craftItem.x = 125
  craftItem.y = 462

  const pickUpItems = PickUpItems(bot, targets)
  pickUpItems.stateName = 'Pick Up Items'
  pickUpItems.x = 125
  pickUpItems.y = 213

  const goTable = GoCraftingTableFunction(bot, targets)
  goTable.stateName = 'Go check recipes'
  goTable.x = 625
  goTable.y = 462

  const goTableToCraft = GoCraftingTableFunction(bot, targets)
  goTableToCraft.stateName = 'Go to Craft'
  goTableToCraft.x = 325
  goTableToCraft.y = 350

  let recipes: Array<Recpie> = []
  let itemsToPickUpBatch: GetItemsToPickUpBatch

  const transitions = [
    new StateTransition({
      parent: start,
      child: checkRecipes,
      onTransition: () => {
        if (!targets.craftItemBatch) {
          throw new Error('No items to craft targets.craftItemBatch')
        }
        itemsToPickUpBatch = getItemsToPickUpBatch(targets.craftItemBatch, nearChests())
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkRecipes,
      child: checkMaterials,
      onTransition: () => {
        // if (!itemsToPickUpBatch.repicesUsed) throw Error('Variable not defined itemsToPickUpBatch.repicesUsed')
        recipes = itemsToPickUpBatch.repicesUsed
      },
      shouldTransition: () => itemsToPickUpBatch.repicesUsed.length > 0
    }),

    new StateTransition({
      parent: checkRecipes,
      child: goTable,
      shouldTransition: () => itemsToPickUpBatch.repicesUsed.length === 0
    }),

    new StateTransition({
      parent: checkMaterials,
      child: exit,
      shouldTransition: () => itemsToPickUpBatch.itemToPickup.length === 0
    }),

    new StateTransition({
      parent: checkMaterials,
      child: checkPickUpItems,
      onTransition: () => {
        targets.pickUpItems = itemsToPickUpBatch.itemToPickup
      },
      shouldTransition: () => itemsToPickUpBatch.itemToPickup.length > 0
    }),

    new StateTransition({
      parent: checkPickUpItems,
      child: checkCraftingTable,
      shouldTransition: () => targets.pickUpItems.length === 0
    }),

    new StateTransition({
      parent: checkPickUpItems,
      child: pickUpItems,
      shouldTransition: () => { return targets.pickUpItems.length > 0 }
    }),

    new StateTransition({
      parent: checkCraftingTable,
      child: craftItem,
      shouldTransition: () => !itemsToPickUpBatch.needCraftingTable
    }),

    new StateTransition({
      parent: checkCraftingTable,
      child: goTableToCraft,
      shouldTransition: () => itemsToPickUpBatch.needCraftingTable
    }),

    new StateTransition({
      parent: goTableToCraft,
      child: craftItem,
      shouldTransition: () => itemsToPickUpBatch.needCraftingTable && goTableToCraft.isFinished()
    }),

    new StateTransition({
      parent: pickUpItems,
      child: checkCraftingTable,
      onTransition: () => {
        targets.craftItem = {
          name: recipes.shift()?.result.name
        }
      },
      shouldTransition: () => pickUpItems.isFinished()
    }),

    new StateTransition({
      parent: craftItem,
      child: craftItem,
      onTransition: () => {
        targets.craftItem = {
          name: recipes.shift()?.result.name
        }
      },
      shouldTransition: () => recipes.length > 0 && craftItem.isFinished()
    }),

    new StateTransition({
      parent: craftItem,
      child: exit,
      shouldTransition: () => recipes.length === 0 && craftItem.isFinished()
    }),

    new StateTransition({
      parent: goTable,
      child: checkRecipesWithTable,
      onTransition: () => {
        if (!targets.craftItemBatch) {
          throw new Error('No items to craft targets.craftItemBatch')
        }

        itemsToPickUpBatch = getItemsToPickUpBatch(targets.craftItemBatch, nearChests())
      },
      shouldTransition: () => goTable.isFinished()
    }),

    new StateTransition({
      parent: checkRecipesWithTable,
      child: exit,
      shouldTransition: () => itemsToPickUpBatch.repicesUsed.length === 0
    }),

    new StateTransition({
      parent: checkRecipesWithTable,
      child: checkMaterials,
      onTransition: () => {
        recipes = itemsToPickUpBatch.repicesUsed
      },
      shouldTransition: () => itemsToPickUpBatch.repicesUsed.length > 0
    })
  ]

  const nestedState = new NestedStateMachine(transitions, start, exit)
  nestedState.stateName = 'Search and craft item'
  return nestedState
}