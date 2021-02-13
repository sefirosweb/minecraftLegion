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
    this.withdrawAllItems()
  }

  onStateExited () {
    this.indexItemsToWithdraw = 0
    this.isEndFinished = false
    this.targets.items = []
    try {
      this.chest.removeAllListeners()
    } catch (e) { }
  }

  isFinished () {
    return this.isEndFinished
  }

  withdrawAllItems () {
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

    this.chest = this.bot.openChest(chestToOpen)

    this.chest.on('close', () => {
      setTimeout(() => {
        this.isEndFinished = true
      }, 500)
    })

    this.chest.on('open', () => {
      setTimeout(() => {
        this.getItemsFromChest()
          .then(() => this.chest.close())
          .catch((error) => {
            botWebsocket.log(`Error Withdraw items  ${error}`)
            this.chest.close()
          })
      }, 500)
    })
  }

  withdrawItem (itemName, quantity) {
    return new Promise((resolve, reject) => {
      const foundItem = this.chest.items().find(itemtoFind => itemtoFind.name.includes(itemName))
      if (!foundItem) {
        botWebsocket.log(`No item ${itemName} in chest!`)
        resolve()
      }

      this.chest.withdraw(foundItem.type, null, quantity, (error) => {
        if (error) {
          setTimeout(() => reject(error), 200)
        } else {
          setTimeout(() => resolve(), 200)
        }
      })
    })
  }

  getItemsFromChest () {
    return new Promise((resolve, reject) => {
      if (this.indexItemsToWithdraw >= this.targets.items.length) {
        resolve()
        return
      }

      const itemToWithdraw = this.targets.items[this.indexItemsToWithdraw]
      this.withdrawItem(itemToWithdraw.item, itemToWithdraw.quantity)
        .then(() => {
          this.indexItemsToWithdraw++
          this.getItemsFromChest()
            .then(() => resolve())
            .catch((error) => reject(error))
        })
        .catch((error) => reject(error))
    })
  }
}
