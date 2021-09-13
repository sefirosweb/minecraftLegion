module.exports = function (bot) {
  const { getGenericItems } = require('@modules/inventoryModule')(bot)

  const findItemsInChests = (chestInput, itemsInput, exclude) => {
    const chests = JSON.parse(JSON.stringify(chestInput))
    const items = JSON.parse(JSON.stringify(itemsInput))

    const transactions = []

    items.forEach((item, itemIndex) => {
      chests.forEach((chest, chestIndex) => {
        chest.slots.every((slot, slotIndex) => {
          if (exclude && exclude[chestIndex][slotIndex].correct === true) return true
          if (item.quantity === 0) return false
          if (!slot) return true
          if (item.type) {
            if (slot.type === item.type && slot.count > 0) {
              const count = slot.count < item.quantity ? slot.count : item.quantity
              const slotCount = slot.count
              slot.count = 0
              item.quantity -= count
              transactions.push({
                fromChest: chestIndex,
                fromSlot: slotIndex,
                name: slot.name,
                quantity: slotCount,
                type: slot.type
              })
            }
          } else {
            if (
              (
                (
                  getGenericItems().includes(item.item) && slot.name.includes(item.item)
                ) || slot.name === item.item
              ) && slot.count > 0) {
              const count = slot.count < item.quantity ? slot.count : item.quantity
              const slotCount = slot.count
              slot.count = 0
              item.quantity -= count
              transactions.push({
                fromChest: chestIndex,
                fromSlot: slotIndex,
                name: slot.name,
                quantity: slotCount,
                type: slot.type
              })
            }
          }
          return true
        })
      })
    })

    return transactions
  }

  const sortChestVec = (a, b, sortBy, sort) => {
    let tempA = a
    let tempB = b
    if (sort === 'desc') {
      tempA = b
      tempB = a
    }

    // Sort by Z
    if (sortBy === 'z') {
      if (tempA.position.z - tempB.position.z !== 0) {
        return tempA.position.z - tempB.position.z
      }

      if (tempA.position.x - tempB.position.x !== 0) {
        return tempA.position.x - tempB.position.x
      }

      return tempA.position.y - tempB.position.y
    }

    // Sort by X
    if (tempA.position.x - tempB.position.x !== 0) {
      return tempA.position.x - tempB.position.x
    }

    if (tempA.position.z - tempB.position.z !== 0) {
      return tempA.position.z - tempB.position.z
    }

    return tempA.position.y - tempB.position.y
  }

  return {
    findItemsInChests,
    sortChestVec
  }
}
