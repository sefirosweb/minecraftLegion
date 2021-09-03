module.exports = function (bot) {
  const mcData = require('minecraft-data')(bot.version)

  function countItemsInInventoryOrEquipped (item) {
    let currentItems = 0

    if (checkItemEquiped(item)) {
      currentItems++
    }

    currentItems += countItemsInInventory(item)
    return currentItems
  }

  function countItemsInInventory (itemToCount) {
    let currentItems = bot.inventory.items().filter(item => item.name.includes(itemToCount))
    currentItems = currentItems.map(x => x.count)
    currentItems = currentItems.reduce((total, num) => { return total + num }, 0)
    return currentItems
  }

  function checkItemEquiped (itemArmor) {
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

  function equipItem (itemArmor) {
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

      let location
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
      }

      bot.equip(armor, location, (error) => {
        if (error === undefined) {
          resolve()
        }
        reject(error)
      })
    })
  }

  function getResumeInventory () {
    const items = bot.inventory.items().reduce((currentItems, slot) => {
      const newItems = [...currentItems]
      const itemSlot = {
        name: slot.name,
        type: slot.type,
        quantity: slot.count
      }

      const index = currentItems.findIndex(i => i.type === slot.type)
      if (index >= 0) {
        currentItems[index].quantity += slot.count
      } else {
        newItems.push(itemSlot)
      }

      return newItems
    }, [])

    return items
  }

  const findChests = (options) => {
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
    let block, secondBlock, secondBlockIndex, props
    while (blocksFound.length > 0) {
      if (chests.length >= count) {
        break
      }

      block = blocksFound.shift()
      props = block.getProperties()

      if (props.type === 'single') {
        chests.push(block)
        continue
      }

      if (props.facing === 'south' && props.type === 'right') {
        secondBlock = block.position.offset(1, 0, 0)
      }

      if (props.facing === 'south' && props.type === 'left') {
        secondBlock = block.position.offset(-1, 0, 0)
      }

      if (props.facing === 'north' && props.type === 'left') {
        secondBlock = block.position.offset(1, 0, 0)
      }

      if (props.facing === 'north' && props.type === 'right') {
        secondBlock = block.position.offset(-1, 0, 0)
      }

      if (props.facing === 'east' && props.type === 'right') {
        secondBlock = block.position.offset(0, 0, -1)
      }

      if (props.facing === 'east' && props.type === 'left') {
        secondBlock = block.position.offset(0, 0, 1)
      }

      if (props.facing === 'west' && props.type === 'left') {
        secondBlock = block.position.offset(0, 0, -1)
      }

      if (props.facing === 'west' && props.type === 'right') {
        secondBlock = block.position.offset(0, 0, 1)
      }

      secondBlockIndex = blocksFound.findIndex(chest => chest.position.equals(secondBlock))
      if (secondBlockIndex >= 0) {
        blocksFound.splice(secondBlockIndex, 1)
      }

      block.secondBlock = bot.blockAt(secondBlock)

      chests.push(block)
    }

    return chests
  }

  const findItemsInChests = (chestInput, itemsInput, exclude) => {
    const chests = [...chestInput]
    const items = [...itemsInput]

    const transactions = []

    items.forEach((item, itemIndex) => {
      chests.forEach((chest, chestIndex) => {
        chest.slots.every((slot, slotIndex) => {
          if (item.count === 0) return false
          if (!slot) return true
          if (slot.type === item.type && slot.count > 0) {
            const count = slot.count < item.count ? slot.count : item.count
            slot.count -= count
            item.count -= count
            transactions.push({
              toSlot: itemIndex,
              fromChest: chestIndex,
              fromSlot: slotIndex,
              quantity: count,
              type: item.type
            })
          }
          return true
        })
      })
    })

    return transactions
  }

  return {
    countItemsInInventoryOrEquipped,
    countItemsInInventory,
    checkItemEquiped,
    equipItem,
    getResumeInventory,
    findChests,
    findItemsInChests
  }
}
