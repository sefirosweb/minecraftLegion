const botWebsocket = require('@modules/botWebsocket')
const { sleep } = require('@modules/utils')

module.exports = class BehaviorWithdrawItemChest {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorWithdrawItemChest'
    this.isEndFinished = false

    this.items = []
  }

  onStateEntered () {
    this.isEndFinished = false
    botWebsocket.log('Items to withdraw ' + JSON.stringify(this.targets.items))
    this.items = [...this.targets.items]

    this.timeLimit = setTimeout(() => {
      botWebsocket.log('Time exceded for get items, forcing close')
      this.isEndFinished = true
    }, 5000)

    this.withdrawAllItems()
  }

  onStateExited () {
    this.isEndFinished = false
    this.targets.items = []
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

    this.bot.openContainer(chestToOpen)
      .then((container) => {
        this.withdrawItem(container)
          .then(async () => {
            await sleep(200)
            await container.close()
            await sleep(500)
            this.isEndFinished = true
          })
      })
  }

  withdrawItem (container) {
    return new Promise((resolve, reject) => {
      if (this.items.length === 0) {
        resolve()
        return
      }

      const itemToWithdraw = this.items.shift()

      const foundItem = container.items().find(i => i.type === itemToWithdraw.type)
      if (!foundItem) {
        this.withdrawItem(container)
          .then(() => {
            resolve()
          })
          .catch(err => {
            reject(err)
          })
        return
      }

      const quantity = foundItem.count < itemToWithdraw.quantity ? foundItem.count : itemToWithdraw.quantity

      container.withdraw(foundItem.type, null, quantity)
        .then(() => {
          this.withdrawItem(container)
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
