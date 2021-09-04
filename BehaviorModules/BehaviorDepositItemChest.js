const botWebsocket = require('@modules/botWebsocket')
const { sleep } = require('@modules/utils')

module.exports = class BehaviorDepositItemChest {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorDepositItemChest'
    this.isEndFinished = false

    this.items = []
  }

  onStateEntered () {
    this.isEndFinished = false
    botWebsocket.log('Items to deposit ' + JSON.stringify(this.targets.items))
    this.items = [...this.targets.items]

    this.timeLimit = setTimeout(() => {
      botWebsocket.log('Time exceded for deposit items, forcing close')
      this.isEndFinished = true
    }, 5000)

    this.depositAllItems()
  }

  onStateExited () {
    this.isEndFinished = false
    this.targets.items = []
    clearTimeout(this.timeLimit)
  }

  isFinished () {
    return this.isEndFinished
  }

  async depositAllItems () {
    const chestToOpen = this.bot.blockAt(this.targets.position)
    if (!['chest', 'ender_chest', 'trapped_chest'].includes(chestToOpen.name)) {
      botWebsocket.log('No chest found')
      this.isEndFinished = true
      return
    }

    this.bot.openContainer(chestToOpen)
      .then((container) => {
        this.depositItems(container)
          .then(async () => {
            await sleep(200)
            await container.close()
            await sleep(500)
            this.isEndFinished = true
          })
          .catch(async (err) => {
            console.log(err)
            await sleep(200)
            await container.close()
            await sleep(500)
            this.isEndFinished = true
          })
      })
  }

  depositItems (container) {
    return new Promise((resolve, reject) => {
      if (this.items.length === 0) {
        resolve()
        return
      }
      const itemToDeposit = this.items.shift()

      if (container.containerItems().length === container.inventoryStart) {
        reject(new Error('The chest is full'))
        return
      }

      container.deposit(itemToDeposit.type, null, itemToDeposit.quantity)
        .then(() => {
          this.depositItems(container)
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
