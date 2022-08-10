//@ts-nocheck
import { Bot, GetResumeInventoryV2 } from "@/types"

import sorterJob from '@/modules/sorterJob'
import inventoryModule from '@/modules/inventoryModule'
import { Block } from "prismarine-block"
import { Item, Recipe } from "minecraft-data"

const craftModule = (bot: Bot) => {
  const mcData = require('minecraft-data')(bot.version)
  const { getResumeInventoryV2 } = inventoryModule(bot)
  const { findItemsInChests } = sorterJob(bot)

  const getRecipes = (itemId: number, craftingTable: Block | null): Array<Recpie> => {
    const aviableRecipes = bot.recipesAll(itemId, null, craftingTable)

    const recipes: Array<Recpie> = []

    aviableRecipes.forEach(recipe => {
      const items: Array<ItemRecipe> = []
      let result: ItemRecipe | null = null

      recipe.delta.forEach(itemsInRecipe => {
        if (itemsInRecipe.count > 0) {
          result = { // Item returned
            name: mcData.items[itemsInRecipe.id].name,
            id: itemsInRecipe.id,
            type: itemsInRecipe.id,
            count: Math.abs(itemsInRecipe.count)
          }
        } else {
          const itemToAdd: ItemRecipe = {
            name: mcData.items[itemsInRecipe.id].name,
            id: itemsInRecipe.id,
            type: itemsInRecipe.id,
            count: Math.abs(itemsInRecipe.count)
          }

          items.push(itemToAdd)
        }
      })

      recipes.push({
        result,
        items
      })
    })

    return recipes
  }

  const recursiveRecipes = (item: Item, craftingTable: Block | null, previousItem: ItemRecursive | undefined) => {
    let needCraftingTable: boolean = false
    let subItem: Item
    let recipes = getRecipes(item.id, null)

    if (recipes.length === 0 && craftingTable) {
      needCraftingTable = true
      recipes = getRecipes(item.id, craftingTable)
    }

    const itemsToRemove: Array<number> = []
    for (let r = 0; r < recipes.length; r++) {
      recipes[r].needCraftingTable = needCraftingTable

      for (let i = 0; i < recipes[r].items.length; i++) {
        const idItem = recipes[r].items[i].id
        subItem = mcData.items[idItem]
        if (subItem && previousItem && subItem.id === previousItem.id) {
          itemsToRemove.push(r)
          continue
        }
        const subRecipe = recursiveRecipes(
          subItem,
          craftingTable,
          item
        )

        recipes[r].items[i].subRecipes = subRecipe
      }
    }

    const finalRecipes = recipes.filter((value, index, arr) => {
      return !itemsToRemove.includes(index)
    })

    return {
      recipes: finalRecipes
    }
  }

  const getFullTreeCraftToItem = (itemName: string) => {
    const item = mcData.itemsByName[itemName]
    const craftingTable = getCraftingTable()
    return recursiveRecipes(item, craftingTable, undefined)
  }

  const getCraftingTable = () => {
    const craftingTableID = mcData.blocksByName.crafting_table.id
    const craftingTable = bot.findBlock({
      matching: craftingTableID,
      maxDistance: 3
    })

    return craftingTable
  }

  const checkCraftingTableNeeded = (recipes: Array<Recpie>): boolean => {
    for (let r = 0; r < recipes.length; r++) {
      const recipe = recipes[r]
      if (recipe.needCraftingTable) {
        return true
      }

      for (let i = 0; i < recipe.items.length; i++) {
        const item = recipe.items[i]

        if (checkCraftingTableNeeded(item.subRecipes)) {
          return true
        }
      }
    }

    return false
  }

  const getItemsToPickUp = (
    itemName: string,
    sharedChests: ArrayOfBlocks,
    quantity: number,
    InputResumeInventory: Array<GetResumeInventoryV2> | undefined
  ): GetItemsToPickUp => {
    const fullTreeCraftToItem = getFullTreeCraftToItem(itemName)

    if (fullTreeCraftToItem.recipes.length === 0) {
      return {
        recipesFound: false,
        needCraftingTable: null,
        haveMaterials: null,
        itemToPickup: null,
        repicesUsed: null,
        sharedChests: null,
        resumeInventory: null
      }
    }

    const resumeInventory = InputResumeInventory === undefined ? getResumeInventoryV2() : InputResumeInventory

    const resultItemToPickup = calculateHowManyItemsCanBeCraft(
      resumeInventory,
      fullTreeCraftToItem,
      sharedChests,
      quantity
    )

    const needCraftingTable = checkCraftingTableNeeded(
      resultItemToPickup.repicesUsed
    )

    return {
      recipesFound: true,
      needCraftingTable,
      haveMaterials: resultItemToPickup.haveMaterials,
      itemToPickup: resultItemToPickup.itemToPickup,
      repicesUsed: resultItemToPickup.repicesUsed,
      sharedChests: resultItemToPickup.sharedChests,
      resumeInventory: resultItemToPickup.resumeInventory
    }
  }

  const getItemsToPickUpBatch = (itemsToCraft: Array<ItemWithPickup>, InputSharedChests: ArrayOfBlocks): GetItemsToPickUpBatch => {
    let resumeInventory: Array<GetResumeInventoryV2> = getResumeInventoryV2()

    let sharedChests: ArrayOfBlocks = JSON.parse(JSON.stringify(InputSharedChests))

    let allItemsToPickUp: Array<ChestMovement> = []
    let allRecpiesUsed: Array<Recpie> = []

    let resultItemToPickup
    let itemToCraft
    let i
    let needCraftingTable = false

    for (i = 0; i < itemsToCraft.length; i++) {
      itemToCraft = itemsToCraft[i]
      resultItemToPickup = getItemsToPickUp(
        itemToCraft.name,
        sharedChests,
        itemToCraft.quantity,
        resumeInventory
      )

      itemsToCraft[i].resultItemToPickup = resultItemToPickup

      if (!resultItemToPickup.recipesFound) {
        continue
      }

      allRecpiesUsed = allRecpiesUsed.concat(resultItemToPickup.repicesUsed)
      allItemsToPickUp = allItemsToPickUp.concat(resultItemToPickup.itemToPickup)

      if (resultItemToPickup.needCraftingTable) {
        needCraftingTable = true
      }

      sharedChests = resultItemToPickup.sharedChests
      resumeInventory = resultItemToPickup.resumeInventory
    }

    return {
      itemsToCraft,
      needCraftingTable,
      itemToPickup: allItemsToPickUp,
      repicesUsed: allRecpiesUsed
    }
  }

  const calculateHowManyItemsCanBeCraft = (
    InputCurrentInventoryStatus: Array<ItemRecipe>,
    fullTreeCraftToItem: { recipes: Array<Recipe> },
    InputSharedChests: ArrayOfBlocks,
    quantity: number
  ): CalculateHowManyItemsCanBeCraft => {
    let resumeInventory = JSON.parse(
      JSON.stringify(InputCurrentInventoryStatus)
    )
    let sharedChests = JSON.parse(JSON.stringify(InputSharedChests))

    let resultItemToPickup
    let allItemsToPickUp = []
    let allRecpiesUsed = []

    let haveMaterials: boolean | string = true

    let q
    for (q = 0; q < quantity; q++) {
      resultItemToPickup = getItemsToPickUpRecursive(
        resumeInventory,
        fullTreeCraftToItem,
        sharedChests,
        [],
        []
      )

      if (!resultItemToPickup) {
        haveMaterials = false
        break
      }

      allItemsToPickUp = allItemsToPickUp.concat(
        resultItemToPickup.itemToPickup
      )
      allRecpiesUsed = allRecpiesUsed.concat(resultItemToPickup.repicesUsed)

      resumeInventory = resultItemToPickup.currentInventoryStatus
      sharedChests = resultItemToPickup.sharedChests
    }

    if (haveMaterials) {
      haveMaterials = 'all'
    } else if (!haveMaterials && q === 0) {
      haveMaterials = 'none'
    } else {
      haveMaterials = 'some'
    }

    return {
      haveMaterials,
      itemToPickup: allItemsToPickUp,
      repicesUsed: allRecpiesUsed,
      sharedChests,
      resumeInventory
    }
  }

  const getItemsToPickUpRecursive = (
    InputCurrentInventoryStatus: Array<ItemRecipe>,
    inputTreeCraftToItem: Array<Recpie>,
    InputSharedChests: ArrayOfBlocks,
    InputItemToPickup: Array<ChestMovement>,
    InputRepicesUsed: Array<Recpie>
  ): GetItemsToPickUpRecursive => {
    const treeCraftToItem = JSON.parse(JSON.stringify(inputTreeCraftToItem))

    let haveAllItems: boolean, recipe: Recpie, item: ItemWithRecipe

    for (let r = 0; r < treeCraftToItem.recipes.length; r++) {
      recipe = treeCraftToItem.recipes[r]

      let currentInventoryStatus: Array<ItemRecipe> = JSON.parse(
        JSON.stringify(InputCurrentInventoryStatus)
      )
      let sharedChests = JSON.parse(JSON.stringify(InputSharedChests))
      let itemToPickup = JSON.parse(JSON.stringify(InputItemToPickup))
      let repicesUsed = JSON.parse(JSON.stringify(InputRepicesUsed))

      haveAllItems = true

      for (let i = 0; i < recipe.items.length; i++) {
        item = recipe.items[i]

        const invItem = currentInventoryStatus.find(
          (inv) => inv.type === item.type
        )

        if (invItem) {
          const itemToDiscount =
            invItem.count > item.count ? item.count : invItem.count

          item.count -= itemToDiscount
          invItem.count -= itemToDiscount
        }

        if (item.count > 0) {
          const itemsInChests = findItemsInChests(sharedChests, [item])

          itemsInChests.every((itemsInChest) => {
            if (item.count === 0) return false

            itemsInChest.quantity =
              itemsInChest.quantity > item.count
                ? item.count
                : itemsInChest.quantity

            item.count -= itemsInChest.quantity
            sharedChests[itemsInChest.fromChest].slots[
              itemsInChest.fromSlot
            ].count -= itemsInChest.quantity

            itemToPickup.push(itemsInChest)
            return true
          })

          if (item.count > 0) {
            const itemsPickupRecursive = getItemsToPickUpRecursive(
              currentInventoryStatus,
              item.subRecipes,
              sharedChests,
              itemToPickup,
              repicesUsed
            )

            if (itemsPickupRecursive) {
              itemToPickup = itemsPickupRecursive.itemToPickup
              repicesUsed = itemsPickupRecursive.repicesUsed
              sharedChests = itemsPickupRecursive.sharedChests
              currentInventoryStatus =
                itemsPickupRecursive.currentInventoryStatus

              itemsPickupRecursive.recipedUsed.result.count -= item.count
              const spareItem = itemsPickupRecursive.recipedUsed.result
              item.count = 0

              if (spareItem.count > 0) {
                const itemInventory = currentInventoryStatus.find(
                  (i) => i.type === spareItem.type
                )

                if (itemInventory) {
                  itemInventory.count += spareItem.count
                } else {
                  currentInventoryStatus.push(spareItem)
                }
              }
            }
          }

          if (item.count > 0) {
            haveAllItems = false
          }
        }
      }

      if (haveAllItems) {
        repicesUsed.push(recipe)
        return {
          itemToPickup,
          currentInventoryStatus,
          sharedChests,
          repicesUsed,
          recipedUsed: recipe
        }
      }
    }

    return false
  }

  return {
    getItemsToPickUp,
    getItemsToPickUpBatch,
    getFullTreeCraftToItem,
    getCraftingTable
  }
}


export default craftModule