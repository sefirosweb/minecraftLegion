module.exports = function (bot) {
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
    let slotID
    switch (itemArmor) {
      case 'helmet':
        slotID = 5
        break
      case 'chest':
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
        case 'chest':
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

      bot.equip(armor, location, () => {
        resolve()
      })
    })
  }

  return {
    countItemsInInventoryOrEquipped,
    countItemsInInventory,
    checkItemEquiped,
    equipItem
  }
}
