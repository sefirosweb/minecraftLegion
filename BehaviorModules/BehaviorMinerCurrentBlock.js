module.exports = class BehaviorMinerCurrentBlock {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorMinerCurrentBlock'

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

    this.isEndFinished = false
  }

  isFinished () {
    return this.isEndFinished
  }

  setMinerCords (minerCords) {
    this.isEndFinished = false
    // console.log('BehaviorMinerCurrentBlock: Set new coords', minerCords)
    this.minerCords = minerCords
    this.startBlock()
  }

  startBlock () {
    // Put correct order if user wrong set Y position first
    if (this.minerCords.yStart > this.minerCords.yEnd) {
      this.yStart = parseInt(this.minerCords.yStart)
      this.yEnd = parseInt(this.minerCords.yEnd)
    } else {
      this.yStart = parseInt(this.minerCords.yEnd)
      this.yEnd = parseInt(this.minerCords.yStart)
    }
    this.yCurrent = parseInt(this.yStart)

    this.xStart = parseInt(this.minerCords.xStart)
    this.zStart = parseInt(this.minerCords.zStart)

    this.xEnd = parseInt(this.minerCords.xEnd)
    this.zEnd = parseInt(this.minerCords.zEnd)

    this.xCurrent = parseInt(this.xStart)
    this.zCurrent = parseInt(this.zStart)
  }

  onStateEntered () {
    if (
      this.yCurrent === this.yEnd &&
      this.zCurrent === this.zEnd &&
      this.xCurrent === this.xEnd
    ) {
      this.isEndFinished = true
      console.log('Is finished')
    } else {
      this.zNext()
      // console.log(this.getCurrentBlock())
    }
  }

  yNext () {
    this.yCurrent--
  }

  xNext () {
    if (this.xCurrent === this.xEnd) {
      this.xCurrent = this.xStart
      this.yNext()
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
      this.zCurrent = this.zStart
      this.xNext()
    } else {
      if (this.zStart < this.zEnd) {
        this.zCurrent++
      } else {
        this.zCurrent--
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
