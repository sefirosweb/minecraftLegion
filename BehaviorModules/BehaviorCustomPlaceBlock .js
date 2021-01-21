const botWebsocket = require('../modules/botWebsocket')
const vec3 = require('vec3')
module.exports = class BehaviorCustomPlaceBlock {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'Custom BehaviorPlaceBlock '
    this.isEndFinished = false

    this.tryCount = 0
  }

  isFinished () {
    return this.isEndFinished
  }

  onStateEntered () {
    this.isEndFinished = false
    this.tryCount = 0

    if (this.targets.item == null) {
      botWebsocket.log('No exists targets.item')
      console.error('No exists targets.item')
      return
    }

    if (this.targets.position == null) {
      botWebsocket.log('No exists targets.position')
      console.error('No exists targets.position')
      return
    }

    const block = this.bot.blockAt(this.targets.position)

    if (block.name === this.targets.item.name) {
      this.isEndFinished = true
      return
    }

    if (block == null) {
      botWebsocket.log('Cant find block')
      console.error('Cant find block')
      return
    }

    this.equip()
      .then(() => {
        this.placeBlock(block)
      })
      .catch((err) => {
        console.log('Error on change weapon', this.targets.item)
        console.log(err)
        setTimeout(function () {
          this.onStateEntered()
        }.bind(this), 200)
      })
  }

  placeBlock (block) {
    this.bot.placeBlock(block, vec3(0, 1, 0))
      .then(() => {
        this.isEndFinished = true
      })
      .catch(err => {
        console.log('Error on place block')
        console.log(err)
        setTimeout(function () {
          this.onStateEntered()
        }.bind(this), 200)
      })
  }

  equip () {
    return new Promise((resolve, reject) => {
      const hand = this.bot.heldItem

      if (hand != null && hand.name === this.targets.item) {
        console.log('Equip ', hand)
        resolve()
        return
      }

      const item = this.bot.inventory.items().find(item => this.targets.item.name === item.name)

      if (item === undefined) {
        reject(new Error('Item not found', this.targets.item))
        return
      }

      this.bot.equip(item, 'hand')
        .then(() => {
          resolve()
        })
        .catch(err => {
          console.log('Error on equip')
          reject(err)
        })
    })
  }
}
