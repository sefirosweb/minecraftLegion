const botWebsocket = require('../modules/botWebsocket')

module.exports = class BehaviorWithdrawItemChest {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorWithdrawItemChest'
    this.isEndFinished = false

    this.chest = false
    this.indexItemsToWithdraw = 0
  }

  onStateEntered () {
    this.indexItemsToWithdraw = 0
    this.isEndFinished = false
    botWebsocket.log('Items to withdraw ' + JSON.stringify(this.targets.items))

    this.timeLimit = setTimeout(() => {
      console.log('Time exceded for get items, forcing close')
      this.chest.close()
      this.isEndFinished = true
    }, 5000)

    this.withdrawAllItems()
  }

  onStateExited () {
    this.indexItemsToWithdraw = 0
    this.isEndFinished = false
    this.targets.items = []
    try {
      this.chest.removeAllListeners()
    } catch (e) {
      console.log(e)
    }

    clearTimeout(this.timeLimit)
  }

  isFinished () {
    return this.isEndFinished
  }

  async withdrawAllItems () {
    const mcData = require('minecraft-data')(this.bot.version)

    const chestToOpen = this.bot.findBlock({
      matching: ['chest', 'ender_chest', 'trapped_chest'].map(name => mcData.blocksByName[name].id),
      maxDistance: 3
    })

    if (!chestToOpen) {
      botWebsocket.log('No chest found')
      this.isEndFinished = true
      return
    }

    this.chest = await this.bot.openChest(chestToOpen)

    this.chest.on('close', () => {
      setTimeout(() => {
        this.isEndFinished = true
      }, 500)
    })

    this.getItemsFromChest()
  }

  async withdrawItem (itemName, quantity) {
    const foundItem = this.chest.containerItems().find(itemtoFind => itemtoFind.name.includes(itemName))

    if (!foundItem) {
      botWebsocket.log(`No item ${itemName} in chest!`)
      return
    }

    try {
      await this.chest.withdraw(foundItem.type, null, quantity)
    } catch (err) {
      botWebsocket.log(JSON.stringify(err))
    }
  }

  async getItemsFromChest () {
    if (this.indexItemsToWithdraw >= this.targets.items.length) {
      setTimeout(() => {
        this.chest.close()
      }, 500)
      return
    }

    const itemToWithdraw = this.targets.items[this.indexItemsToWithdraw]
    await this.withdrawItem(itemToWithdraw.item, itemToWithdraw.quantity)
    this.indexItemsToWithdraw++
    this.getItemsFromChest()
  }
}
