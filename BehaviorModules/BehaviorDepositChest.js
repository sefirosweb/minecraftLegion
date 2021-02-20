const botWebsocket = require('../modules/botWebsocket')

module.exports = class BehaviorDepositChest {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorDepositChest'
    this.isEndFinished = false

    this.chest = false
    this.indexItemsToDeposit = 0
    this.inventory = require('../modules/inventoryModule')(this.bot)
  }

  onStateEntered () {
    this.indexItemsToDeposit = 0
    this.isEndFinished = false
    botWebsocket.log('Items to deposit ' + JSON.stringify(this.targets.items))
    this.depositAllItems()
  }

  onStateExited () {
    this.indexItemsToDeposit = 0
    this.isEndFinished = false
    this.targets.items = []
    try {
      this.chest.removeAllListeners()
    } catch (e) { }
  }

  isFinished () {
    return this.isEndFinished
  }

  async depositAllItems () {
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

    this.depositItems()
  }

  async depositItems () {
    const itemToDeposit = this.targets.items[this.indexItemsToDeposit]
    if (this.targets.items.length <= this.indexItemsToDeposit) {
      setTimeout(() => {
        this.chest.close()
      }, 500)
      return
    }

    await this.depositToChest(itemToDeposit.type, itemToDeposit.quantity)
    this.indexItemsToDeposit++
    this.depositItems()
  }

  async depositToChest (itemType, quantity) {
    try {
      await this.chest.deposit(itemType, null, quantity)
    } catch (err) {
      botWebsocket.log(JSON.stringify(err))
    }
  }
}
