module.exports = function (bot) {
  const findItemsInChests = (chestInput, itemsInput, exclude) => {
    const chests = [...chestInput]
    const items = [...itemsInput]

    const transactions = []

    items.forEach((item, itemIndex) => {
      chests.forEach((chest, chestIndex) => {
        chest.slots.every((slot, slotIndex) => {
          if (exclude[chestIndex][slotIndex].correct === true) return true
          if (item.count === 0) return false
          if (!slot) return true
          if (slot.type === item.type && slot.count > 0) {
            const count = slot.count < item.count ? slot.count : item.count
            slot.count -= count
            item.count -= count
            transactions.push({
              fromChest: chestIndex,
              toChest: item.chest,
              fromSlot: slotIndex,
              toSlot: itemIndex,
              name: slot.name,
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

  const sortChestVec = (a, b, sortBy, sort) => {
    let tempA = a
    let tempB = b
    if (sort === 'desc') {
      tempA = b
      tempB = a
    }

    if (sortBy === 'z') {
      if (tempA.position.z - tempB.position.z !== 0) {
        return tempA.position.z - tempB.position.z
      }

      return tempA.position.x - tempB.position.x
    }

    if (tempA.position.x - tempB.position.x !== 0) {
      return tempA.position.x - tempB.position.x
    }

    return tempA.position.z - tempB.position.z
  }

  return {
    findItemsInChests,
    sortChestVec
  }
}
