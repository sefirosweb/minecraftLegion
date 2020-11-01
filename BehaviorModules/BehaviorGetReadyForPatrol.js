module.exports = class BehaviorGetReadyForPatrol {
  constructor(bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorGetReadyForPatrol'

    this.isReady = false

    this.inventory = require('../modules/inventoryModule')(this.bot)
  }

  onStateEntered() {
    this.checkImReady()
  }

  getIsReady() {
    return this.isReady
  }

  checkImReady() {
    if (this.inventory.countItemsInInventoryOrEquipped('sword') === 0) {
      this.isReady = false
      return
    }

    if (this.inventory.countItemsInInventoryOrEquipped('shield') === 0) {
      this.isReady = false
      return
    }
    if (this.inventory.countItemsInInventoryOrEquipped('bow') === 0) {
      this.isReady = false
      return
    }
    if (this.inventory.countItemsInInventoryOrEquipped('arrow') <= 64) {
      this.isReady = false
      return
    }
    if (this.inventory.countItemsInInventoryOrEquipped('helmet') === 0) {
      this.isReady = false
      return
    }
    if (this.inventory.countItemsInInventoryOrEquipped('chest') === 0) {
      this.isReady = false
      return
    }
    if (this.inventory.countItemsInInventoryOrEquipped('leggings') === 0) {
      this.isReady = false
      return
    }
    if (this.inventory.countItemsInInventoryOrEquipped('boots') === 0) {
      this.isReady = false
      return
    }

    if (this.inventory.countItemsInInventoryOrEquipped('cooked_chicken') <= 32) { // Food
      this.isReady = false
      return
    }

    this.isReady = true
  }
}
