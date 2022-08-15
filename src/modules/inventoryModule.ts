
import { BlockChest, Bot, Facing, ChestPosition, OptionsFind, Item, ItemArmor } from "@/types"
import { getSecondBlockPosition } from '@/modules/utils'
import { EquipmentDestination } from "mineflayer"
import { Vec3 } from "vec3"

const inventoryModule = (bot: Bot) => {
  const mcData = require('minecraft-data')(bot.version)

  function countItemsInInventoryOrEquipped(item: string) {
    let currentItems = 0

    if (checkItemEquiped(item)) {
      currentItems++
    }

    currentItems += countItemsInInventory(item)
    return currentItems
  }

  function countItemsInInventory(itemToCount: string) {
    const currentItems = bot.inventory.items()
      .filter(item => item.name === itemToCount)
      .map(x => x.count)
      .reduce((total, num) => { return total + num }, 0)
    return currentItems
  }

  function checkItemEquiped(itemArmor: string | ItemArmor) {
    let swordEquiped, isSword, bowEquiped, isBow

    let slotID
    switch (itemArmor) {
      case 'helmet':
        slotID = 5
        break
      case 'chestplate':
        slotID = 6
        break
      case 'leggings':
        slotID = 7
        break
      case 'boots':
        slotID = 8
        break
      case 'shield':
        slotID = 45
        break
      case 'sword':
        slotID = bot.getEquipmentDestSlot('hand')
        swordEquiped = bot.inventory.slots[slotID]
        if (swordEquiped === null) { return false }
        if (swordEquiped === undefined) { return false }
        isSword = swordEquiped.name.includes('sword')
        return isSword
      case 'bow':
        slotID = bot.getEquipmentDestSlot('hand')
        bowEquiped = bot.inventory.slots[slotID]
        if (bowEquiped === null) { return false }
        if (bowEquiped === undefined) { return false }
        isBow = bowEquiped.name.includes('bow')
        return isBow
      default:
        return false
    }

    return bot.inventory.slots[slotID] !== null
  }

  function equipItem(itemArmor: ItemArmor): Promise<void> {
    return new Promise((resolve, reject) => {
      if (checkItemEquiped(itemArmor)) {
        resolve()
        return
      }

      const armor = bot.inventory.items().find(item => item.name.includes(itemArmor))

      if (!armor) {
        resolve()
        return
      }

      let location: EquipmentDestination
      switch (itemArmor) {
        case 'helmet':
          location = 'head'
          break
        case 'chestplate':
          location = 'torso'
          break
        case 'leggings':
          location = 'legs'
          break
        case 'boots':
          location = 'feet'
          break
        case 'sword':
          location = 'hand'
          break
        case 'shield':
          location = 'off-hand'
          break
        default:
          return undefined
      }

      bot.equip(armor, location)
        .then(() => resolve())
        .catch((error) => reject(error))
    })
  }

  function getResumeInventory(): Array<Item> {
    const items: Array<Item> = []

    bot.inventory.slots.forEach((slot) => {
      if (slot === null) return

      const itemSlot: Item = {
        id: slot.type,
        name: slot.name,
        quantity: slot.count
      }

      const index = items.findIndex(i => i.id === slot.type)
      if (index >= 0) {
        items[index].quantity += slot.count
      } else {
        items.push(itemSlot)
      }

    })

    return items
  }

  const findChests = (options: OptionsFind | undefined) => {
    options = options || {}
    const matching = options.matching || ['chest', 'ender_chest', 'trapped_chest'].map(name => mcData.blocksByName[name].id)
    const point = (options.point || bot.entity.position).floored()
    const maxDistance = options.maxDistance || 16
    const count = options.count || 1
    const useExtraInfo = options.useExtraInfo || false

    const blocksFound = bot.findBlocks({
      matching,
      maxDistance,
      point,
      count: count * 2,
      useExtraInfo
    }).map(chest => bot.blockAt(chest))

    const chests = []
    let block: BlockChest | null | undefined
    let secondBlock: Vec3
    let secondBlockIndex: number
    let props: { [key: string]: string | number }

    while (block = blocksFound.shift()) {

      if (chests.length >= count) {
        break
      }

      props = block.getProperties()
      const facing: Facing = props.facing as Facing
      const type: ChestPosition = props.type as ChestPosition
      const offset = getSecondBlockPosition(facing, type)

      if (offset === false) {
        chests.push(block)
        continue
      }

      secondBlock = block.position.offset(offset.x, offset.y, offset.z)

      secondBlockIndex = blocksFound.findIndex(chest => chest && chest.position.equals(secondBlock))
      if (secondBlockIndex >= 0) {
        blocksFound.splice(secondBlockIndex, 1)
      }

      const secondBlockChest: BlockChest | null = bot.blockAt(secondBlock)
      if (secondBlockChest) {
        block.secondBlock = secondBlockChest
      }

      chests.push(block)
    }

    return chests
  }



  const equipHeldItem = (itemName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const hand = bot.heldItem

      if (hand != null && hand.name === itemName) {
        resolve()
        return
      }

      let item = bot.inventory.items().find(item => itemName === item.name && item.slot >= bot.inventory.hotbarStart)

      if (!item) {
        item = bot.inventory.items().find(item => itemName === item.name)
      }

      if (item === undefined) {
        reject(new Error(`Item not found ${itemName}`))
        return
      }

      bot.equip(item, 'hand')
        .then(() => {
          resolve()
        })
        .catch(() => {
          setTimeout(() => {
            equipHeldItem(itemName)
              .then(() => {
                resolve()
              })
          }, 200)
        })
    })
  }

  return {
    countItemsInInventoryOrEquipped,
    countItemsInInventory,
    checkItemEquiped,
    equipItem,
    getResumeInventory,
    findChests,
    getSecondBlockPosition,
    equipHeldItem
  }
}


export default inventoryModule