module.exports = function (bot) {
  const findItemsInChests = (chestInput, itemsInput, exclude) => {
    const chests = JSON.parse(JSON.stringify(chestInput))
    const items = JSON.parse(JSON.stringify(itemsInput))

    const transactions = []

    items.forEach((item, itemIndex) => {
      chests.forEach((chest, chestIndex) => {
        chest.slots.every((slot, slotIndex) => {
          if (exclude[chestIndex][slotIndex].correct === true) return true
          if (item.count === 0) return false
          if (!slot) return true
          if (slot.type === item.type && slot.count > 0) {
            const count = slot.count < item.count ? slot.count : item.count
            const slotCount = slot.count
            slot.count = 0
            item.count -= count
            transactions.push({
              fromChest: chestIndex,
              toChest: item.chest,
              fromSlot: slotIndex,
              toSlot: item.slot,
              name: slot.name,
              quantity: slotCount,
              type: item.type
            })
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
