module.exports = class BehaviorGetReady {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorGetReady'
    this.x = 0
    this.y = 0

    this.isReady = false
    this.itemsToBeReady = []

    this.inventory = require('../modules/inventoryModule')(this.bot)
  }

  onStateEntered () {
    this.checkImReady()
  }

  getIsReady () {
    return this.isReady
  }

  checkImReady () {
    for (let i = 0; i < this.itemsToBeReady.length; i++) {
      const itemToBeReady = this.itemsToBeReady[i]
      const itemsInUse = this.inventory.countItemsInInventoryOrEquipped(itemToBeReady.item)
      // console.log(itemToBeReady, 'In use ' + itemsInUse);
      if (itemsInUse < itemToBeReady.quantity) {
        this.isReady = false
        return
      }
    }

    this.isReady = true
  }
}
