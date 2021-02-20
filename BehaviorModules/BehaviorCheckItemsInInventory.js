module.exports = class BehaviorCheckItemsInInventory {
  constructor (bot, targets, itemsToCheck = [], isDeposit = false) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorCheckItemsInInventory'
    this.isEndFinished = false
    this.itemsToCheck = itemsToCheck
    this.isDeposit = isDeposit
    this.genericItems = ['helmet', 'chestplate', 'leggings', 'boots', 'sword', 'pickaxe', 'shovel', '_axe', 'hoe']
  }

  setItemsToCheck (itemsToCheck) {
    this.itemsToCheck = itemsToCheck
  }

  setIsDeposit (isDeposit) {
    this.isDeposit = isDeposit
  }

  onStateEntered () {
    this.isEndFinished = false
    this.targets.items = []

    if (this.isDeposit === 'depositAll') {
      this.getItemsToDepositAll()
    }
    if (this.isDeposit === 'deposit') {
      this.getItemsToDeposit()
    }
    if (this.isDeposit === 'withdraw') {
      this.getItemsToWithdraw()
    }
  }

  getItemsToDepositAll () {
    const items = this.getResumeInventory(false)

    const itemsToDeposit = items.reduce((currentItems, slot) => {
      const newItems = [...currentItems]
      const itemToExclude = this.itemsToCheck.find(i => {
        if (this.genericItems.includes(i.item)) {
          return slot.name.includes(i.item)
        }

        return i.item === slot.name
      })

      if (itemToExclude === undefined) {
        newItems.push(slot)
      } else {
        slot.quantity -= itemToExclude.quantity
        if (slot.quantity > 0) {
          newItems.push(slot)
        }
      }

      return newItems
    }, [])

    this.targets.items = itemsToDeposit
    this.isEndFinished = true
  }

  getItemsToDeposit () {
    const items = this.getResumeInventory(false)

    const itemsToDeposit = this.itemsToCheck.reduce((currentItems, slot) => {
      const newItems = [...currentItems]
      const itemToExclude = items.find(i => {
        if (this.genericItems.includes(slot.item)) {
          return i.name.includes(slot.item)
        }

        return i.name === slot.item
      })

      if (itemToExclude !== undefined) {
        itemToExclude.quantity -= slot.quantity
        if (itemToExclude.quantity > 0) {
          newItems.push(itemToExclude)
        }
      }
      return newItems
    }, [])

    this.targets.items = itemsToDeposit
    this.isEndFinished = true
  }

  getItemsToWithdraw () {
    const items = this.getResumeInventory(true)

    const itemsToWithdraw = this.itemsToCheck.reduce((currentItems, slot) => {
      const newItems = [...currentItems]
      const itemToExclude = items.find(i => {
        if (this.genericItems.includes(slot.item)) {
          return i.name.includes(slot.item)
        }

        return i.name === slot.item
      })

      if (itemToExclude === undefined) {
        newItems.push(slot)
      } else {
        slot.quantity -= itemToExclude.quantity
        if (slot.quantity > 0) {
          newItems.push(slot)
        }
      }
      return newItems
    }, [])

    this.targets.items = itemsToWithdraw
    this.isEndFinished = true
  }

  // onStateExited () {

  // }

  isFinished () {
    return this.isEndFinished
  }

  getEquipedItems () {
    const equipedItems = []

    if (this.bot.inventory.slots[5]) equipedItems.push(this.bot.inventory.slots[5]) // helmet
    if (this.bot.inventory.slots[6]) equipedItems.push(this.bot.inventory.slots[6]) // chestplate
    if (this.bot.inventory.slots[7]) equipedItems.push(this.bot.inventory.slots[7]) // leggings
    if (this.bot.inventory.slots[8]) equipedItems.push(this.bot.inventory.slots[8]) // boots
    if (this.bot.inventory.slots[45]) equipedItems.push(this.bot.inventory.slots[45]) // shield

    return equipedItems
  }

  getResumeInventory (withEquip) {
    let equipItems = []
    if (withEquip) {
      equipItems = this.getEquipedItems()
    }

    const items = this.bot.inventory.items().concat(equipItems).reduce((currentItems, slot) => {
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
}
