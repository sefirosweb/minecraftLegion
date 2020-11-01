const botWebsocket = require('../modules/botWebsocket')

module.exports = class BehaviorEquip {
  constructor(bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorEquip'

    this.isEndFinished = false

    this.inventory = require('../modules/inventoryModule')(this.bot)
  }

  onStateEntered() {
    this.isEndFinished = false
    this.equipAllItems()
      .then(() => {
        this.isEndFinished = true
      })
  }

  onStateExited() {
    this.isEndFinished = false
  }

  isFinished() {
    return this.isEndFinished
  }

  equipAllItems() {
    return new Promise((resolve, reject) => {
      this.inventory.equipItem('helmet')
        .then(() => {
          return this.inventory.equipItem('chest')
        })
        .then(() => {
          return this.inventory.equipItem('leggings')
        })
        .then(() => {
          return this.inventory.equipItem('boots')
        })
        .then(() => {
          return this.inventory.equipItem('shield')
        })
        .then(() => {
          resolve()
        })
        .catch((error) => {
          botWebsocket.log(JSON.stringify(error))
        })
    })
  }
}
