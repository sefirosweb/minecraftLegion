import { Bot, GetResumeInventoryV2 } from "@/types"
import sorterJob from '@/modules/sorterJob'
import inventoryModule from '@/modules/inventoryModule'
import { Item as ItemMC } from "minecraft-data"
import { Block } from "prismarine-block"

type ChestBlock = { // Todo pending to fill
  slots: Array<{
    count: number
  }>
}

type ArrayOfChests = {
  [key: string]: ChestBlock
}

type Item = {
  name: string
  quantity: number
}

type HaveMaterials = 'all' | 'none' | 'some'

type ResultItemPickup = {
  haveMaterials: HaveMaterials
  itemToPickup: Array<ChestMovement>
  needCraftingTable: boolean,
  recipesFound: boolean,
  repicesUsed: Array<Recpie>
  sharedChests: ArrayOfChests
  resumeInventory: Array<ItemRecipe>
}

type ChestMovement = {
  fromChest: string
  fromSlot: string
  quantity: number
  type: number
  name?: string
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

type ItemRecipe = {
  count: number
  id: number
  name: string
  type: number
  subRecipes?: Array<Recpie>
}

type Recpie = {
  items: Array<ItemRecipe>
  result: ItemRecipe
  needCraftingTable: boolean
}


type GetItemsToPickUpBatch = {
  itemsToCraft: Array<ItemWithPickup>
  needCraftingTable: boolean,
  itemToPickup: Array<ChestMovement>,
  repicesUsed: Array<Recpie>,
}

type CalculateHowManyItemsCanBeCraft = {
  haveMaterials: HaveMaterials
  itemToPickup: Array<ChestMovement>,
  repicesUsed: Array<Recpie>,
  sharedChests: ArrayOfChests,
  resumeInventory: Array<ItemRecipe>
}

type GetItemsToPickUpRecursive = {
  currentInventoryStatus: Array<ItemRecipe>
  sharedChests: ArrayOfChests
  repicesUsed: Array<Recpie>,
  itemToPickup: Array<ChestMovement>
  recipedUsed: NonNullable<Recpie>
}

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
    sharedChests: ArrayOfChests,
    quantity: number,
    InputResumeInventory: Array<ItemRecipe> | undefined
  ): ResultItemPickup | false => {
    const fullTreeCraftToItem = getFullTreeCraftToItem(itemName)

    if (fullTreeCraftToItem.length === 0) {
      return false
    }

    const resumeInventory: Array<ItemRecipe> = InputResumeInventory === undefined ? getResumeInventory() : InputResumeInventory

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

  const getResumeInventory = (): Array<ItemRecipe> => {
    const items: Array<GetResumeInventoryV2> = getResumeInventoryV2()

    const itemsToReturn: Array<ItemRecipe> = items.map(p => {
      return {
        count: p.count,
        id: p.type,
        name: p.name,
        type: p.type,
      }
    })

    return itemsToReturn
  }

  const getItemsToPickUpBatch = (itemsToCraft: Array<ItemWithPickup>, InputSharedChests: ArrayOfChests): GetItemsToPickUpBatch => {
    let resumeInventory: Array<ItemRecipe> = getResumeInventory()

    let sharedChests: ArrayOfChests = JSON.parse(JSON.stringify(InputSharedChests))

    let allItemsToPickUp: Array<ChestMovement> = []
    let allRecpiesUsed: Array<Recpie> = []

    let resultItemToPickup: ResultItemPickup | false
    let itemToCraft: ItemWithPickup
    let needCraftingTable: boolean = false

    for (let i = 0; i < itemsToCraft.length; i++) {
      itemToCraft = itemsToCraft[i]
      resultItemToPickup = getItemsToPickUp(
        itemToCraft.name,
        sharedChests,
        itemToCraft.quantity,
        resumeInventory
      )

      itemsToCraft[i].resultItemToPickup = resultItemToPickup

      if (!resultItemToPickup) {
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
    fullTreeCraftToItem: Array<Recpie>,
    InputSharedChests: ArrayOfChests,
    quantity: number
  ): CalculateHowManyItemsCanBeCraft => {
    let resumeInventory: Array<ItemRecipe> = JSON.parse(JSON.stringify(InputCurrentInventoryStatus))
    let sharedChests: ArrayOfChests = JSON.parse(JSON.stringify(InputSharedChests))

    let resultItemToPickup
    let allItemsToPickUp: Array<ChestMovement> = []
    let allRecpiesUsed: Array<Recpie> = []

    let haveMaterials: boolean | HaveMaterials = true

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

      allItemsToPickUp = allItemsToPickUp.concat(resultItemToPickup.itemToPickup)
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
    inputTreeCraftToItem: Array<Recpie> | undefined,
    InputSharedChests: ArrayOfChests,
    InputItemToPickup: Array<ChestMovement>,
    InputRepicesUsed: Array<Recpie>
  ): GetItemsToPickUpRecursive | false => {
    const treeCraftToItem: Array<Recpie> = JSON.parse(JSON.stringify(inputTreeCraftToItem))

    let haveAllItems: boolean, recipe: Recpie, item: ItemRecipe

    for (let r = 0; r < treeCraftToItem.length; r++) {
      recipe = treeCraftToItem[r]

      let currentInventoryStatus: Array<ItemRecipe> = JSON.parse(JSON.stringify(InputCurrentInventoryStatus))
      let sharedChests: ArrayOfChests = JSON.parse(JSON.stringify(InputSharedChests))
      let itemToPickup: Array<ChestMovement> = JSON.parse(JSON.stringify(InputItemToPickup))
      let repicesUsed: Array<Recpie> = JSON.parse(JSON.stringify(InputRepicesUsed))

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
          //@ts-ignore
          const itemsInChests = findItemsInChests(sharedChests, [item])

          itemsInChests.every((itemsInChest) => {
            if (item.count === 0) return false

            itemsInChest.quantity = itemsInChest.quantity > item.count ? item.count : itemsInChest.quantity

            item.count -= itemsInChest.quantity
            sharedChests[itemsInChest.fromChest].slots[itemsInChest.fromSlot].count -= itemsInChest.quantity

            itemToPickup.push(itemsInChest)
            return true
          })

          if (item.count > 0) {
            const itemsPickupRecursive: GetItemsToPickUpRecursive | false = getItemsToPickUpRecursive(
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
              currentInventoryStatus = itemsPickupRecursive.currentInventoryStatus

              const cc = itemsPickupRecursive.recipedUsed.result.count

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