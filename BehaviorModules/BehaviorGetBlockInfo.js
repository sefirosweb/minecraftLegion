// const botWebsocket = require('../modules/botWebsocket')
const Vec3 = require('vec3')

module.exports = class BehaviorGetBlockInfo {
  constructor (bot, targets, blockType) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorGetBlockInfo'
    this.blockType = blockType

    this.position = false
    this.isValidBlockType = false
  }

  getIsValidBlockType () {
    return this.isValidBlockType
  }

  setPosition (position) {
    this.position = position
  }

  onStateEntered () {
    this.isValidBlockType = this.calculateIsValid()
  }

  getBlockType () {
    const position = new Vec3(this.position.x, this.position.y, this.position.z)
    const block = this.bot.blockAt(position)
    return block
  }

  calculateIsValid () {
    const block = this.getBlockType()
    const isValidBlockType = this.blockType.find(b => b === block.name)
    if (isValidBlockType === undefined) {
      this.targets.position = block.position // I detect is not air / lava / water then go to this position
      return false
    }

    return true
  }

  onStateExited () {
    this.position = false
  }
}
