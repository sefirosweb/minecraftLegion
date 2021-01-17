
const botWebsocket = require('../modules/botWebsocket')
module.exports = class BehaviorMinerChecks {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorMinerChecks'
    this.x = 0
    this.y = 0

    this.inventoryModule = require('../modules/inventoryModule')(bot)
    this.isEndFinished = false
    this.isReady = false
  }

  isFinished () {
    return this.isEndFinished
  }

  getIsReady () {
    return this.isReady
  }

  onStateEntered () {
    this.isReady = false
    this.isEndFinished = false
    this.isReady = this.checkInventory()
    this.isEndFinished = true
  }

  checkInventory () {
    const pickaxes = this.inventoryModule.countItemsInInventoryOrEquipped('pickaxe')
    const shovel = this.inventoryModule.countItemsInInventoryOrEquipped('shovel')

    if (pickaxes === 0) {
      botWebsocket.log('No pickaxes, returning...')
      return false
    }
    if (shovel === 0) {
      botWebsocket.log('No shoveles, returning...')
      return false
    }

    if (this.isIventoryFull()) {
      botWebsocket.log('Inventory full, returning...')
      return false
    }

    return true
  }

  onStateExited () {
    // this.targets.targetEntity = this.bot.nearestEntity(() => true)
  }

  isIventoryFull () {
    const items = this.bot.inventory.items()
    if (items.length >= 34) {
      return true
    }
    return false
  }
}
