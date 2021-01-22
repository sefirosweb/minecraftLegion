const botWebsocket = require('../modules/botWebsocket')
const vec3 = require('vec3')
module.exports = class BehaviorCustomPlaceBlock {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'Custom BehaviorPlaceBlock '
    this.isEndFinished = false

    this.tryCount = 0
    this.itemNotFound = false
  }

  isFinished () {
    return this.isEndFinished
  }

  isItemNotFound () {
    return this.itemNotFound
  }

  onStateEntered () {
    this.isEndFinished = false
    this.itemNotFound = false
    this.tryCount = 0

    if (this.targets.item == null) {
      botWebsocket.log('No exists targets.item')
      this.isEndFinished = true
      return
    }

    if (this.targets.position == null) {
      botWebsocket.log('No exists targets.position')
      this.isEndFinished = true
      return
    }

    const block = this.bot.blockAt(this.targets.position)

    if (block.name === this.targets.item.name) {
      this.isEndFinished = true
      return
    }

    if (block == null) {
      botWebsocket.log('Cant find block')
      this.isEndFinished = true
      return
    }

    this.equip()
      .then(() => {
        this.placeBlock(block)
      })
      .catch(err => {
        botWebsocket.log(`Error on change item ${this.targets.item.name} ${err.message}`)
        setTimeout(function () {
          this.onStateEntered()
        }.bind(this), 500)
      })
  }

  placeBlock (block) {
    this.bot.placeBlock(block, vec3(0, 1, 0))
      .then(() => {
        this.isEndFinished = true
      })
      .catch(() => {
        setTimeout(function () {
          this.onStateEntered()
        }.bind(this), 200)
      })
  }

  equip () {
    return new Promise((resolve, reject) => {
      const hand = this.bot.heldItem

      if (hand != null && hand.name === this.targets.item.name) {
        resolve()
        return
      }

      const item = this.bot.inventory.items().find(item => this.targets.item.name === item.name)

      if (item === undefined) {
        botWebsocket.log(`Item not found ${this.targets.item}`)
        this.itemNotFound = true
      } else {
        this.bot.equip(item, 'hand')
          .then(() => {
            resolve()
          })
          .catch(err => {
            reject(err)
          })
      }
    })
  }
}
