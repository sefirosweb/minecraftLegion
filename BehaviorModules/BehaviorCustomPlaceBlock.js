const botWebsocket = require('@modules/botWebsocket')
module.exports = class BehaviorCustomPlaceBlock {
  constructor (bot, targets, canJump = true) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'Custom BehaviorPlaceBlock '
    this.blockCanBeReplaced = ['air', 'cave_air', 'lava', 'water']

    this.isEndFinished = false
    this.itemNotFound = false
    this.cantPlaceBlock = false
    this.canJump = canJump
  }

  isFinished () {
    return this.isEndFinished
  }

  isItemNotFound () {
    return this.itemNotFound
  }

  isCantPlaceBlock () {
    return this.cantPlaceBlock
  }

  setCanJump (canJump) {
    this.canJump = canJump
  }

  setOffset (offset) {
    this.offset = offset
  }

  onStateExited () {
    this.isEndFinished = false
    this.itemNotFound = false
    this.cantPlaceBlock = false
    clearTimeout(this.timeLimit)
  }

  onStateEntered () {
    this.timeLimit = setTimeout(() => {
      botWebsocket.log('Time exceded for place item')
      this.isEndFinished = true
    }, 7000)

    this.isEndFinished = false
    this.itemNotFound = false
    this.cantPlaceBlock = false

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

    const block = this.bot.blockAt(this.targets.position.clone().add(this.offset))

    if (block == null) {
      botWebsocket.log('Cant find block')
      this.isEndFinished = true
      return
    }

    if (block.name === this.targets.item.name) {
      botWebsocket.log('The block is same')
      this.isEndFinished = true
      return
    }

    if (!this.blockCanBeReplaced.includes(block.name)) {
      botWebsocket.log(`Cant s block there ${block.name}`)
      this.cantPlaceBlock = true
      return
    }

    this.equip()
      .then(() => {
        this.placeBlock(block)
      })
  }

  place (offset) {
    return new Promise((resolve, reject) => {
      const blockOffset = this.bot.blockAt(this.targets.position.clone().add(this.offset))
      const block = this.bot.blockAt(this.targets.position)
      if (blockOffset == null || blockOffset.name === this.targets.item.name) {
        resolve(true)
        return
      }

      if (!this.blockCanBeReplaced.includes(blockOffset.name)) {
        botWebsocket.log('Cant place block there!!')
        resolve(false)
        return
      }

      if (
        Math.floor(this.bot.entity.position.y) > blockOffset.position.y &&
        this.bot.entity.position.distanceTo(blockOffset.position) < 1.8 &&
        this.isJumping === false &&
        this.canJump === true
      ) {
        this.isJumping = true
        this.bot.setControlState('jump', true)
      }

      const hand = this.bot.heldItem
      if (hand == null && hand.name !== this.targets.item.name) {
        this.equip()
          .then(() => {
            this.place()
              .then(() => {
                resolve()
              })
          })
      }

      this.bot.placeBlock(block, this.offset)
        .then(() => {
          resolve()
        })
        .catch((err) => {
          console.log(err)
          setTimeout(function () {
            this.place()
              .then(canBePlaced => {
                resolve(canBePlaced)
              })
          }.bind(this), 200)
        })
    })
  }

  placeBlock (block) {
    // Jump if this on same position
    this.isJumping = false
    if (
      Math.floor(this.bot.entity.position.x) === block.position.x &&
      Math.floor(this.bot.entity.position.y) === block.position.y &&
      Math.floor(this.bot.entity.position.z) === block.position.z &&
      this.canJump
    ) {
      this.isJumping = true
      this.bot.setControlState('jump', true)
    }
    this.place()
      .then((canBePlaced) => {
        if (this.isJumping) {
          this.bot.setControlState('jump', false)
        }
        if (canBePlaced) {
          this.isEndFinished = true
        } else {
          this.cantPlaceBlock = true
        }
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
          .catch(function (err) {
            botWebsocket.log(`Error on change item ${this.targets.item.name} ${err.message}`)
            setTimeout(function () {
              this.equip()
                .then(() => {
                  resolve()
                })
            }.bind(this), 200)
          }.bind(this))
      }
    })
  }
}
