module.exports = class BehaviorCheckItemsInInventory {
  constructor (bot, targets, itemsToCheck = [], isDeposit = false) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorCheckItemsInInventory'
    this.isEndFinished = false
    this.itemsToCheck = itemsToCheck
    this.isDeposit = isDeposit
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

    if (this.isDeposit === 'deposit') {
      this.getItemsToDeposit()
    }
    if (this.isDeposit === 'withdraw') {
      this.getItemsToWithdraw()
    }
  }

  getItemsToDeposit () {
    const items = this.getResumeInventory()

    const itemsToDeposit = items.reduce((currentItems, slot) => {
      const newItems = [...currentItems]
      const itemToExclude = this.itemsToCheck.find(i => slot.name.includes(i.item))

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

  getItemsToWithdraw () {
    const items = this.getResumeInventory()

    const itemsToWithdraw = this.itemsToCheck.reduce((currentItems, slot) => {
      const newItems = [...currentItems]
      const itemToExclude = items.find(i => i.name.includes(slot.item))

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

  getResumeInventory () {
    const items = this.bot.inventory.items().reduce((currentItems, slot) => {
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
