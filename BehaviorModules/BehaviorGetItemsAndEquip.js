const botWebsocket = require('../modules/botWebsocket')

module.exports = class BehaviorGetItemsAndEquip {
  constructor(bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorGetItemsAndEquip'

    this.isFinished = false
    this.chest = false

    this.inventory = require('../modules/inventoryModule')(this.bot)
  }

  onStateEntered() {
    this.isFinished = false
    this.getAndEquip()
  }

  onStateExited() {
    try {
      this.chest.removeAllListeners()
    } catch (e) { }
  }

  getIsFinished() {
    return this.isFinished
  }

  getAndEquip() {
    const mcData = require('minecraft-data')(this.bot.version)

    const chestToOpen = this.bot.findBlock({
      matching: ['chest', 'ender_chest', 'trapped_chest'].map(name => mcData.blocksByName[name].id),
      maxDistance: 6
    })

    if (!chestToOpen) {
      botWebsocket.log('No chest found')
      setTimeout(() => {
        this.getAndEquip()
      }, 3000)
      return
    }

    this.chest = this.bot.openChest(chestToOpen)

    this.chest.on('open', () => {
      this.getItemsFromChest()
        .then(() => {
          this.chest.close()
        })
    })

    this.chest.on('close', () => {
      setTimeout(() => {
        this.equipAllItems()
          .then(() => {
            this.isFinished = true
          })
      }, 1000)
    })
  }

  getItemsFromChest() {
    return new Promise((resolve, reject) => {
      this.withdrawItem('sword', 1)
        .then(() => {
          return this.withdrawItem('helmet', 1)
        })
        .then(() => {
          return this.withdrawItem('chest', 1)
        })
        .then(() => {
          return this.withdrawItem('leggings', 1)
        })
        .then(() => {
          return this.withdrawItem('boots', 1)
        })
        .then(() => {
          return this.withdrawItem('shield', 1)
        })
        .then(() => {
          return this.withdrawItem('bow', 1)
        })
        .then(() => {
          return this.withdrawItem('cooked_chicken', 64) // Food
        })
        .then(() => {
          return this.withdrawItem('arrow', 128)
        }).then(() => {
          setTimeout(() => {
            resolve()
          }, 1000)
        })
    })
  }

  withdrawItem(item, amount) {
    return new Promise((resolve, reject) => {
      const currentItems = this.inventory.countItemsInInventoryOrEquipped(item)
      amount -= currentItems
      if (amount <= 0) {
        resolve()
        return
      }

      // console.log(this.chest.items()) // Items in chest

      const foundItem = this.chest.items().find(itemtoFind => itemtoFind.name.includes(item))
      if (!foundItem) {
        botWebsocket.log(`No item ${item} in chest!`)
        resolve()
        return
      }

      this.chest.withdraw(foundItem.type, null, amount, () => {
        resolve()
      })
    })
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
