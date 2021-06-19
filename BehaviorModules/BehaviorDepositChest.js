const botWebsocket = require('../modules/botWebsocket')
const { sleep } = require('../modules/utils')

module.exports = class BehaviorDepositChest {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorDepositChest'
    this.isEndFinished = false
    this.items = []
    this.chest = false
  }

  onStateEntered () {
    this.isEndFinished = false
    botWebsocket.log('Items to deposit ' + JSON.stringify(this.targets.items))
    this.items = this.targets.items

    this.timeToGetChest = setTimeout(() => {
      console.log('Time exceded for deposit items, forcing close')
      this.chest.close()
      this.isEndFinished = true
    }, 5000)

    this.depositAllItems()
  }

  onStateExited () {
    this.isEndFinished = false
    this.targets.items = []
    clearTimeout(this.timeToGetChest)
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
    this.depositItems()
      .then(async () => {
        await sleep(200)
        await this.chest.close()
        await sleep(500)
        this.isEndFinished = true
      })
      .catch(err =>
        console.log(err)
      )
      .then(async () => {
        await sleep(200)
        await this.chest.close()
        await sleep(500)
        this.isEndFinished = true
      })
  }

  depositItems () {
    return new Promise((resolve, reject) => {
      if (this.items.length === 0) {
        resolve()
        return
      }
      const itemToDeposit = this.items.shift()

      this.chest.deposit(itemToDeposit.type, null, itemToDeposit.quantity)
        .then(() => {
          this.depositItems()
            .then(() => {
              resolve()
            })
            .catch(err => {
              reject(err)
            })
        })
        .catch(err => {
          reject(err)
        })
    })
  }
}
