const botWebsocket = require('../modules/botWebsocket')

module.exports = class BehaviorWithdrawItemChest {
  constructor(bot, targets, itemsToWithdraw = []) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorWithdrawItemChest'

    this.isEndFinished = false
    this.chest = false

    this.indexItemsToWithdraw = 0
    this.itemsToWithdraw = itemsToWithdraw

    this.inventory = require('../modules/inventoryModule')(this.bot)
  }

  onStateEntered() {
    this.indexItemsToWithdraw = 0
    this.isEndFinished = false
    this.withdrawItems()
  }

  onStateExited() {
    this.indexItemsToWithdraw = 0
    this.isEndFinished = false
    try {
      this.chest.removeAllListeners()
    } catch (e) { }
  }

  isFinished() {
    return this.isEndFinished
  }

  withdrawItems() {
    const mcData = require('minecraft-data')(this.bot.version)

    const chestToOpen = this.bot.findBlock({
      matching: ['chest', 'ender_chest', 'trapped_chest'].map(name => mcData.blocksByName[name].id),
      maxDistance: 6
    })

    if (!chestToOpen) {
      botWebsocket.log('No chest found')
      this.isEndFinished = true
      return
    }

    this.chest = this.bot.openChest(chestToOpen)

    this.chest.on('open', () => {
      setTimeout(() => {
        this.getItemsFromChest()
          .then(() => {
            this.chest.close()
          })
      }, 1000)
    })

    this.chest.on('close', () => {
      setTimeout(() => this.isEndFinished = true, 1000)

    })
  }

  getItemsFromChest() {
    return new Promise((resolve, reject) => {

      if (this.indexItemsToWithdraw >= this.itemsToWithdraw.length) {
        resolve()
      }

      const itemToWithdraw = this.itemsToWithdraw[this.indexItemsToWithdraw]
      this.withdrawItem(itemToWithdraw.item, itemToWithdraw.quantity)
        .then(() => {
          this.indexItemsToWithdraw++
          this.getItemsFromChest()
            .then(() => resolve())
        })

    })
  }

  withdrawItem(itemName, quantity) {
    return new Promise((resolve, reject) => {
      const currentItems = this.inventory.countItemsInInventoryOrEquipped(itemName)
      quantity -= currentItems
      if (quantity <= 0) {
        resolve()
        return
      }

      const foundItem = this.chest.items().find(itemtoFind => itemtoFind.name.includes(itemName))
      if (!foundItem) {
        botWebsocket.log(`No item ${itemName} in chest!`)
        resolve()
        return
      }

      this.chest.withdraw(foundItem.type, null, quantity, () => {
        resolve()
      })
    })
  }

}
