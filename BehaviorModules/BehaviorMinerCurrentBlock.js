const botWebsocket = require('../modules/botWebsocket')
const Vec3 = require('vec3')
module.exports = class BehaviorMinerCurrentBlock {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorMinerCurrentBlock'

    this.blockInValidType = ['air', 'cave_air', 'lava', 'water', 'bedrock']
    this.minerCords = false

    this.xStart = false
    this.yStart = false
    this.zStart = false

    this.xEnd = false
    this.yEnd = false
    this.zEnd = false

    this.xCurrent = false
    this.yCurrent = false
    this.zCurrent = false

    this.isLayerFinished = false
    this.isEndFinished = false
    this.firstBlockOnLayer = true
  }

  isFinished () {
    return this.isEndFinished
  }

  getLayerIsFinished () {
    return this.isLayerFinished
  }

  setMinerCords (minerCords) {
    this.isLayerFinished = false
    this.firstBlockOnLayer = true
    this.minerCords = minerCords
    this.startBlock()
  }

  startBlock () {
    // For Horitonzally go down to up
    this.yStart = this.minerCords.yStart
    this.yEnd = this.minerCords.yEnd

    this.yCurrent = parseInt(this.yStart)

    if (this.minerCords.orientation === 'n' || this.minerCords.orientation === 'e') {
      this.xStart = parseInt(this.minerCords.xStart)
      this.zStart = parseInt(this.minerCords.zStart)

      this.xEnd = parseInt(this.minerCords.xEnd)
      this.zEnd = parseInt(this.minerCords.zEnd)

      this.xCurrent = parseInt(this.xStart)
      this.zCurrent = parseInt(this.zStart)
    } else { // S & W
      this.xStart = parseInt(this.minerCords.xEnd)
      this.zStart = parseInt(this.minerCords.zEnd)

      this.xEnd = parseInt(this.minerCords.xStart)
      this.zEnd = parseInt(this.minerCords.zStart)

      this.xCurrent = parseInt(this.xStart)
      this.zCurrent = parseInt(this.zStart)
    }
  }

  onStateEntered () {
    this.isEndFinished = false
    if (
      this.yCurrent === this.yEnd &&
      this.zCurrent === this.zEnd &&
      this.xCurrent === this.xEnd
    ) {
      this.isLayerFinished = true
      botWebsocket.log(`Current LAYER ${this.yCurrent} finished`)
    } else {
      if (this.minerCords.orientation === 'n' || this.minerCords.orientation === 's') {
        this.zNext()
      }
      if (this.minerCords.orientation === 'e' || this.minerCords.orientation === 'w') {
        this.xNext()
      }

      if (this.calculateIsValid()) {
        this.isEndFinished = true
      } else {
        this.onStateEntered()
      }
    }
  }

  getBlockType () {
    const position = new Vec3(this.xCurrent, this.yCurrent, this.zCurrent)
    return this.bot.blockAt(position)
  }

  calculateIsValid () {
    const block = this.getBlockType()
    if (!block) {
      return false
    }
    const isValidBlockType = this.blockInValidType.find(b => b === block.name)
    if (isValidBlockType === undefined) {
      this.targets.position = block.position // I detect is not air / lava / water then go to this position
      return true
    }

    return false
  }

  yNext () {
    this.yCurrent++
  }

  xNext () {
    if (this.xCurrent === this.xEnd) {
      const temp = this.xEnd
      this.xEnd = this.xStart
      this.xStart = temp
      if (this.minerCords.orientation === 'n' || this.minerCords.orientation === 's') {
        this.yNext()
      }
      if (this.minerCords.orientation === 'e' || this.minerCords.orientation === 'w') {
        this.zNext()
      }
    } else {
      if (this.xStart < this.xEnd) {
        this.xCurrent++
      } else {
        this.xCurrent--
      }
    }
  }

  zNext () {
    if (this.zCurrent === this.zEnd) {
      const temp = this.zEnd
      this.zEnd = this.zStart
      this.zStart = temp
      if (this.minerCords.orientation === 'n' || this.minerCords.orientation === 's') {
        this.xNext()
      }
      if (this.minerCords.orientation === 'e' || this.minerCords.orientation === 'w') {
        this.yNext()
      }
    } else {
      if (this.firstBlockOnLayer) {
        this.firstBlockOnLayer = false
      } else {
        if (this.zStart < this.zEnd) {
          this.zCurrent++
        } else {
          this.zCurrent--
        }
      }
    }
  }

  getCurrentBlock () {
    const currentBlock = {
      x: this.xCurrent,
      y: this.yCurrent,
      z: this.zCurrent
    }
    return currentBlock
  }
}
