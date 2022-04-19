const botWebsocket = require('@modules/botWebsocket')

module.exports = class BehaviorCustomPlaceBlock {
  constructor(bot, targets, canJump = true) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'Custom BehaviorPlaceBlock '
    this.blockCanBeReplaced = require('@modules/placeBlockModule')(bot).blocksCanBeReplaced
    this.equipHeldItem = require('@modules/inventoryModule')(bot).equipHeldItem
    this.place = require('@modules/placeBlockModule')(bot).place

    this.isEndFinished = false
    this.itemNotFound = false
    this.cantPlaceBlock = false
    this.canJump = canJump
  }

  isFinished() {
    return this.isEndFinished
  }

  isItemNotFound() {
    return this.itemNotFound
  }

  isCantPlaceBlock() {
    return this.cantPlaceBlock
  }

  setCanJump(canJump) {
    this.canJump = canJump
  }

  setOffset(offset) {
    this.offset = offset
  }

  onStateExited() {
    this.isEndFinished = false
    this.itemNotFound = false
    this.cantPlaceBlock = false
    clearTimeout(this.timeLimit)
  }

  onStateEntered() {
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

    this.equipHeldItem(this.targets.item.name)
      .then(() => {
        this.place(this.targets.position, this.offset)
          .then(() => {
            this.isEndFinished = true
          })
          .catch(() => {
            this.cantPlaceBlock = true
            this.isEndFinished = true
          })
      })
  }
}
