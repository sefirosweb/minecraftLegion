import { Bot, Chests, ChestTransaction, Item, ItemRecipe, Recpie } from "@/types"
import sorterJob from '@/modules/sorterJob'
import inventoryModule from '@/modules/inventoryModule'
import { Item as ItemMC } from "minecraft-data"
import { Block } from "prismarine-block"
import mcDataLoader from 'minecraft-data'
import _ from 'lodash'

type HaveMaterials = 'all' | 'none' | 'some'

type ResultItemPickup = {
  haveMaterials: HaveMaterials
  itemToPickup: Array<ChestTransaction>
  needCraftingTable: boolean,
  recipesFound: boolean,
  repicesUsed: Array<Recpie>
  sharedChests: Chests
  resumeInventory: Array<ItemRecipe>
}

type ItemWithPickup = Item & {
  resultItemToPickup: ResultItemPickup | false
}

type ItemRecursive = {
  displayName: string
  id: number
  name: string
  stackSize: number
}

export type GetItemsToPickUpBatch = {
  itemsToCraft: Array<ItemWithPickup>
  needCraftingTable: boolean,
  itemToPickup: Array<ChestTransaction>,
  repicesUsed: Array<Recpie>,
}

type CalculateHowManyItemsCanBeCraft = {
  haveMaterials: HaveMaterials
  itemToPickup: Array<ChestTransaction>,
  repicesUsed: Array<Recpie>,
  sharedChests: Chests,
  resumeInventory: Array<ItemRecipe>
}

type GetItemsToPickUpRecursive = {
  currentInventoryStatus: Array<ItemRecipe>
  sharedChests: Chests
  repicesUsed: Array<Recpie>,
  itemToPickup: Array<ChestTransaction>
  recipedUsed: NonNullable<Recpie>
}

const craftModule = (bot: Bot) => {
  const mcData = mcDataLoader(bot.version)
  const { getResumeInventory } = inventoryModule(bot)
  const { findItemsInChests } = sorterJob()

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
            quantity: Math.abs(itemsInRecipe.count)
          }
        } else {
          const itemToAdd: ItemRecipe = {
            name: mcData.items[itemsInRecipe.id].name,
            id: itemsInRecipe.id,
            quantity: Math.abs(itemsInRecipe.count)
          }

          items.push(itemToAdd)
        }
      })

      if (!result)
        throw Error(`Can't craft the tiem ${itemId}`)

      recipes.push({
        items,
        result,
        needCraftingTable: craftingTable ? true : false,
      })
    })

    return recipes
  }

  const recursiveRecipes = (item: ItemMC, craftingTable: Block | null, previousItem: ItemRecursive | undefined): Array<Recpie> => {
    let subItem: ItemMC
    let recipes = getRecipes(item.id, null)

    if (recipes.length === 0 && craftingTable) {
      recipes = getRecipes(item.id, craftingTable)
    }

    const itemsToRemove: Array<number> = []

    for (let r = 0; r < recipes.length; r++) {

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

    const finalRecipes = recipes.filter((value, index) => {
      return !itemsToRemove.includes(index)
    })

    return finalRecipes
  }

  const getFullTreeCraftToItem = (itemName: string): Array<Recpie> => {
    const item = mcData.itemsByName[itemName]
    const craftingTable = getCraftingTable()
    return recursiveRecipes(item, craftingTable, undefined)
  }

  const getCraftingTable = (): Block | null => {
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

        if (item.subRecipes && checkCraftingTableNeeded(item.subRecipes)) {
          return true
        }
      }
    }

    return false
  }

  const getItemsToPickUp = (
    itemName: string,
    sharedChests: Chests,
    quantity: number,
    InputResumeInventory: Array<ItemRecipe> | undefined
  ): ResultItemPickup | false => {
    const fullTreeCraftToItem = getFullTreeCraftToItem(itemName)

    if (fullTreeCraftToItem.length === 0) {
      return false
    }

    const resumeInventory: Array<ItemRecipe> = InputResumeInventory === undefined ? getResumeInventoryItemRecipe() : InputResumeInventory

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

  const getResumeInventoryItemRecipe = (): Array<ItemRecipe> => {
    const items: Array<ItemRecipe> = getResumeInventory() as Array<ItemRecipe>

    const itemsToReturn: Array<ItemRecipe> = items
      .filter(p => p.id)
      .map(p => {
        return {
          id: p.id,
          name: p.name,
          quantity: p.quantity,
          subRecipes: undefined,
        }
      })

    return itemsToReturn
  }

  const getItemsToPickUpBatch = (InputItemsToCraft: Array<Item>, InputSharedChests: Chests): GetItemsToPickUpBatch => {
    const itemsToCraft = _.cloneDeep(InputItemsToCraft)
    let sharedChests: Chests = _.cloneDeep(InputSharedChests)
    let resumeInventory: Array<ItemRecipe> = getResumeInventoryItemRecipe()
    let allItemsToPickUp: Array<ChestTransaction> = []
    let allRecpiesUsed: Array<Recpie> = []
    let needCraftingTable: boolean = false

    const itemsToCraftWithPickup: Array<ItemWithPickup> = []

    itemsToCraft.forEach(itemToCraft => {
      if (!itemToCraft.name) return

      const resultItemToPickup = getItemsToPickUp(
        itemToCraft.name,
        sharedChests,
        itemToCraft.quantity,
        resumeInventory
      )

      itemsToCraftWithPickup.push({
        ...itemToCraft,
        resultItemToPickup: resultItemToPickup
      })

      if (!resultItemToPickup) {
        return
      }

      allRecpiesUsed = allRecpiesUsed.concat(resultItemToPickup.repicesUsed)
      allItemsToPickUp = allItemsToPickUp.concat(resultItemToPickup.itemToPickup)

      if (resultItemToPickup.needCraftingTable) {
        needCraftingTable = true
      }

      sharedChests = resultItemToPickup.sharedChests
      resumeInventory = resultItemToPickup.resumeInventory
    })

    return {
      itemsToCraft: itemsToCraftWithPickup,
      needCraftingTable,
      itemToPickup: allItemsToPickUp,
      repicesUsed: allRecpiesUsed
    }
  }

  const calculateHowManyItemsCanBeCraft = (
    InputCurrentInventoryStatus: Array<ItemRecipe>,
    fullTreeCraftToItem: Array<Recpie>,
    InputSharedChests: Chests,
    quantity: number
  ): CalculateHowManyItemsCanBeCraft => {
    let resumeInventory: Array<ItemRecipe> = _.cloneDeep(InputCurrentInventoryStatus)
    let sharedChests: Chests = _.cloneDeep(InputSharedChests)

    let resultItemToPickup
    let allItemsToPickUp: Array<ChestTransaction> = []
    let allRecpiesUsed: Array<Recpie> = []

    let haveMaterials: boolean | HaveMaterials = true

    let q = 0

    do {
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
      q += resultItemToPickup.recipedUsed.result.quantity

      allItemsToPickUp = allItemsToPickUp.concat(resultItemToPickup.itemToPickup)
      allRecpiesUsed = allRecpiesUsed.concat(resultItemToPickup.repicesUsed)

      resumeInventory = resultItemToPickup.currentInventoryStatus
      sharedChests = resultItemToPickup.sharedChests
    } while (q < quantity)

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
    inputTreeCraftToItem: Array<Recpie> | undefined,
    InputSharedChests: Chests,
    InputItemToPickup: Array<ChestTransaction>,
    InputRepicesUsed: Array<Recpie>
  ): GetItemsToPickUpRecursive | false => {
    const treeCraftToItem: Array<Recpie> = inputTreeCraftToItem === undefined ? [] : _.cloneDeep(inputTreeCraftToItem);

    let haveAllItems: boolean, recipe: Recpie, item: ItemRecipe

    for (let r = 0; r < treeCraftToItem.length; r++) {
      recipe = treeCraftToItem[r]

      let currentInventoryStatus: Array<ItemRecipe> = _.cloneDeep(InputCurrentInventoryStatus)
      let sharedChests: Chests = _.cloneDeep(InputSharedChests)
      let itemToPickup: Array<ChestTransaction> = _.cloneDeep(InputItemToPickup)
      let repicesUsed: Array<Recpie> = _.cloneDeep(InputRepicesUsed)

      haveAllItems = true

      for (let i = 0; i < recipe.items.length; i++) {
        item = recipe.items[i]

        let quantityToCraft = item.quantity
        do {

          const invItem = currentInventoryStatus.find(
            (inv) => inv.id === item.id
          )

          if (invItem) {
            const itemToDiscount =
              invItem.quantity > quantityToCraft ? quantityToCraft : invItem.quantity

            quantityToCraft -= itemToDiscount
            invItem.quantity -= itemToDiscount
          }

          if (quantityToCraft > 0) {
            const itemsInChests = findItemsInChests(sharedChests, [item])

            itemsInChests.every((itemsInChest) => {
              if (quantityToCraft === 0) return false

              itemsInChest.quantity = itemsInChest.quantity > quantityToCraft ? quantityToCraft : itemsInChest.quantity

              quantityToCraft -= itemsInChest.quantity
              if (itemsInChest.fromChest === undefined || itemsInChest.fromSlot === undefined) throw new Error('FromChest | FromSlot ist not defined!')
              sharedChests[itemsInChest.fromChest].slots[itemsInChest.fromSlot].count -= itemsInChest.quantity

              itemToPickup.push(itemsInChest)
              return true
            })

            if (quantityToCraft > 0) {
              const itemsPickupRecursive: GetItemsToPickUpRecursive | false = getItemsToPickUpRecursive(
                currentInventoryStatus,
                item.subRecipes,
                sharedChests,
                itemToPickup,
                repicesUsed
              )

              if (!itemsPickupRecursive) {
                break;
              }

              itemToPickup = itemsPickupRecursive.itemToPickup
              repicesUsed = itemsPickupRecursive.repicesUsed
              sharedChests = itemsPickupRecursive.sharedChests
              currentInventoryStatus = itemsPickupRecursive.currentInventoryStatus

              const itemQuantity = quantityToCraft
              const recipedUsed = _.cloneDeep(itemsPickupRecursive.recipedUsed)
              quantityToCraft -= recipedUsed.result.quantity
              recipedUsed.result.quantity -= itemQuantity
              const spareItem = recipedUsed.result

              if (spareItem.quantity > 0) {
                const itemInventory = currentInventoryStatus.find(
                  (i) => i.id === spareItem.id
                )

                if (itemInventory) {
                  itemInventory.quantity += spareItem.quantity
                } else {
                  currentInventoryStatus.push(spareItem)
                }
              }

            }
          }

        } while (quantityToCraft > 0)

        if (quantityToCraft > 0) {
          haveAllItems = false
        }
      }



      if (haveAllItems) {
        repicesUsed.push(recipe)
        return {
          currentInventoryStatus,
          sharedChests,
          repicesUsed,
          itemToPickup,
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