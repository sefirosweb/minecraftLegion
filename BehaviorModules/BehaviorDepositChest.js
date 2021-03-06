const botWebsocket = require('../modules/botWebsocket')
const { sleep } = require('../modules/utils')

module.exports = class BehaviorDepositChest {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorDepositChest'
    this.isEndFinished = false

    this.chest = false
  }

  onStateEntered () {
    this.isEndFinished = false
    botWebsocket.log('Items to deposit ' + JSON.stringify(this.targets.items))
    this.depositAllItems()
  }

  onStateExited () {
    this.isEndFinished = false
    this.targets.items = []
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
    await sleep(200)
    await this.depositItems()
    await sleep(200)
    await this.chest.close()
    await sleep(500)
    this.isEndFinished = true
  }

  async depositItems () {
    if (this.targets.items.length === 0) { return }
    const itemToDeposit = this.targets.items.shift()

    try {
      await this.chest.deposit(itemToDeposit.type, null, itemToDeposit.quantity)
    } catch (err) {
      botWebsocket.log(JSON.stringify(err.message))
      return
    }

    await this.depositItems()
  }
}
