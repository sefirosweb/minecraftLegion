import {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} from 'mineflayer-statemachine'
//@ts-ignore
import BehaviorCraft from '@BehaviorModules/BehaviorCraft'
//@ts-ignore
import BehaviorMoveTo from '@BehaviorModules/BehaviorMoveTo'
import { Bot, ItemsToPickUpBatch, LegionStateMachineTargets, Recipes } from '@/types'

function searchAndCraftFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const { getItemsToPickUpBatch } = require('@modules/craftModule')(bot)
  const { nearChests } = require('@modules/chestModule')(bot, targets)

  const start = new BehaviorIdle()
  start.stateName = 'Start'
  //@ts-ignore
  start.x = 125
  //@ts-ignore
  start.y = 113

  const exit = new BehaviorIdle()
  exit.stateName = 'exit'
  //@ts-ignore
  exit.x = 125
  //@ts-ignore
  exit.y = 575

  const checkRecipes = new BehaviorIdle()
  checkRecipes.stateName = 'checkRecipes'
  //@ts-ignore
  checkRecipes.x = 625
  //@ts-ignore
  checkRecipes.y = 113

  const checkRecipesWithTable = new BehaviorIdle()
  checkRecipesWithTable.stateName = 'checkRecipesWithTable'
  //@ts-ignore
  checkRecipesWithTable.x = 350
  //@ts-ignore
  checkRecipesWithTable.y = 575

  const checkMaterials = new BehaviorIdle()
  checkMaterials.stateName = 'checkMaterials'
  //@ts-ignore
  checkMaterials.x = 525
  //@ts-ignore
  checkMaterials.y = 350

  const checkPickUpItems = new BehaviorIdle()
  checkPickUpItems.stateName = 'checkPickUpItems'
  //@ts-ignore
  checkPickUpItems.x = 350
  //@ts-ignore
  checkPickUpItems.y = 213

  const checkCraftingTable = new BehaviorIdle()
  checkCraftingTable.stateName = 'checkCraftingTable'
  //@ts-ignore
  checkCraftingTable.x = 125
  //@ts-ignore
  checkCraftingTable.y = 350

  const craftItem = new BehaviorCraft(bot, targets)
  craftItem.stateName = 'Craft Item'
  craftItem.x = 125
  craftItem.y = 462

  const pickUpItems = require('@NestedStateModules/getReady/pickUpItems')(
    bot,
    targets
  )
  pickUpItems.stateName = 'Pick Up Items'
  pickUpItems.x = 125
  pickUpItems.y = 213

  const goTable =
    require('@NestedStateModules/crafterJob/goCraftingTableFunction')(
      bot,
      targets
    )
  goTable.stateName = 'Go check recipes'
  goTable.x = 625
  goTable.y = 462

  const goTableToCraft =
    require('@NestedStateModules/crafterJob/goCraftingTableFunction')(
      bot,
      targets
    )
  goTableToCraft.stateName = 'Go to Craft'
  goTableToCraft.x = 325
  goTableToCraft.y = 350

  let recipes: Array<Recipes> = []
  let itemsToPickUpBatch: ItemsToPickUpBatch
  let craftingTable

  const transitions = [
    new StateTransition({
      parent: start,
      child: checkRecipes,
      onTransition: () => {
        itemsToPickUpBatch = getItemsToPickUpBatch(
          targets.craftItemBatch,
          nearChests()
        )
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: checkRecipes,
      child: checkMaterials,
      onTransition: () => {
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
      shouldTransition: () => itemsToPickUpBatch.itemToPickup.length === 0 && itemsToPickUpBatch.haveMaterials !== 'all'
    }),

    new StateTransition({
      parent: checkMaterials,
      child: checkPickUpItems,
      onTransition: () => {
        targets.pickUpItems = itemsToPickUpBatch.itemToPickup
      },
      shouldTransition: () => itemsToPickUpBatch.itemToPickup.length > 0 || itemsToPickUpBatch.haveMaterials === 'all'
    }),

    new StateTransition({
      parent: checkPickUpItems,
      child: checkCraftingTable,
      shouldTransition: () => targets.pickUpItems.length === 0
    }),

    new StateTransition({
      parent: checkPickUpItems,
      child: pickUpItems,
      shouldTransition: () => targets.pickUpItems.length > 0
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
      shouldTransition: () =>
        itemsToPickUpBatch.needCraftingTable && goTableToCraft.isFinished()
    }),

    new StateTransition({
      parent: pickUpItems,
      child: checkCraftingTable,
      onTransition: () => {
        targets.craftItem = {
          name: recipes.shift()?.result.name
        }
      },
      shouldTransition: () => {
        return pickUpItems.isFinished()
      }
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
        itemsToPickUpBatch = getItemsToPickUpBatch(
          targets.craftItemBatch,
          nearChests()
        )
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

  const searchAndCraftFunction = new NestedStateMachine(
    transitions,
    start,
    exit
  )
  searchAndCraftFunction.stateName = 'Search and craft item'
  return searchAndCraftFunction
}

module.exports = searchAndCraftFunction
