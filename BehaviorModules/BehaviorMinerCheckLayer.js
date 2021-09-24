const botWebsocket = require('@modules/botWebsocket')
const Vec3 = require('vec3')

module.exports = class BehaviorMinerCheckLayer {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorMinerCheckLayer'

    this.isEndFinished = false
    this.minerCords = false
    this.foundLavaOrWater = false
    this.firstBlockOnLayer = true

    this.blocksToFind = ['lava', 'water']
    this.floorBlocksToFind = ['air', 'cave_air']
    this.blockForPlace = ['stone', 'cobblestone', 'dirt', 'andesite', 'diorite', 'granite', 'sandstone']
  }

  isFinished () {
    return this.isEndFinished
  }

  getFoundLavaOrWater () {
    return this.foundLavaOrWater
  }

  onStateEntered () {
    this.foundLavaOrWater = false
    this.isEndFinished = false

    this.foundLavaOrWater = this.checkArea()
    if (this.foundLavaOrWater === false) {
      this.isEndFinished = true
    }
  }

  onStateExited () {
    // Reset positions for cehck again all blocks
    const stone = this.checkStoneInInventory()
    if (stone === undefined) {
      botWebsocket.log('No blocks for place into lava or water')
      this.targets.item = undefined
      this.isEndFinished = true
      return
    }

    this.targets.item = stone

    this.startBlock()
  }

  checkStoneInInventory () {
    return this.bot.inventory.items().find(item => this.blockForPlace.includes(item.name))
  }

  checkArea () {
    if (
      this.yCurrent === this.yEnd &&
      this.zCurrent === this.zEnd &&
      this.xCurrent === this.xEnd
    ) {
      return false
    } else {
      if (this.minerCords.orientation === 'z-' || this.minerCords.orientation === 'z+') {
        this.zNext()
      }
      if (this.minerCords.orientation === 'x+' || this.minerCords.orientation === 'x-') {
        this.xNext()
      }

      // 4 extreme position => omit
      if (
        this.minerCords.tunel === 'vertically' &&
        (
          (this.xCurrent === this.xEnd && this.zCurrent === this.zEnd) ||
          (this.xCurrent === this.xStart && this.zCurrent === this.zStart) ||
          (this.xCurrent === this.xEnd && this.zCurrent === this.zStart) ||
          (this.xCurrent === this.xStart && this.zCurrent === this.zEnd)
        )
      ) {
        return this.checkArea()
      }

      const block = this.getBlockType()
      if (
        block &&
        (
          this.blocksToFind.includes(block.name) ||
          (
            this.floorBlocksToFind.includes(block.name) &&
            this.minerCords.tunel === 'horizontally' &&
            (this.minerCords.yStart - 1) === this.yCurrent
          )
        )
      ) {
        botWebsocket.log(`Found: ${block.name} on X:${this.xCurrent} Y:${this.yCurrent} Z:${this.zCurrent}`)
        this.targets.position = block.position
        this.foundLavaOrWater = true
        return true
      }

      return this.checkArea()
    }
  }

  xNext () {
    if (this.xCurrent === this.xEnd) {
      const temp = this.xEnd
      this.xEnd = this.xStart
      this.xStart = temp
      if (this.minerCords.orientation === 'z-' || this.minerCords.orientation === 'z+') {
        this.yNext()
      }
      if (this.minerCords.orientation === 'x+' || this.minerCords.orientation === 'x-') {
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

  yNext () {
    this.yCurrent--
  }

  zNext () {
    if (this.zCurrent === this.zEnd) {
      const temp = this.zEnd
      this.zEnd = this.zStart
      this.zStart = temp
      if (this.minerCords.orientation === 'z-' || this.minerCords.orientation === 'z+') {
        this.xNext()
      }
      if (this.minerCords.orientation === 'x+' || this.minerCords.orientation === 'x-') {
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

  getBlockType () {
    const position = new Vec3(this.xCurrent, this.yCurrent, this.zCurrent)
    return this.bot.blockAt(position)
  }

  setMinerCords (minerCords) {
    this.isLayerFinished = false
    this.firstBlockOnLayer = true
    this.minerCords = minerCords
    this.startBlock()
  }

  startBlock () {
    this.yStart = this.minerCords.yStart > this.minerCords.yEnd ? parseInt(this.minerCords.yStart) : parseInt(this.minerCords.yEnd)
    this.yEnd = this.minerCords.yStart > this.minerCords.yEnd ? parseInt(this.minerCords.yEnd) : parseInt(this.minerCords.yStart)

    this.yStart++
    if (this.minerCords.tunel === 'horizontally') {
      this.yEnd--
    }

    if (this.minerCords.orientation === 'z-' || this.minerCords.orientation === 'x+') {
      this.xStart = parseInt(this.minerCords.xStart)
      this.zStart = parseInt(this.minerCords.zStart)

      this.xEnd = parseInt(this.minerCords.xEnd)
      this.zEnd = parseInt(this.minerCords.zEnd)
    } else { // S & W
      this.xStart = parseInt(this.minerCords.xEnd)
      this.zStart = parseInt(this.minerCords.zEnd)

      this.xEnd = parseInt(this.minerCords.xStart)
      this.zEnd = parseInt(this.minerCords.zStart)
    }

    if (this.xStart > this.xEnd) {
      if (this.minerCords.tunel === 'vertically' || this.minerCords.orientation === 'z+') {
        this.xStart++
        this.xEnd--
      }
    } else {
      if (this.minerCords.tunel === 'vertically' || this.minerCords.orientation === 'z-') {
        this.xStart--
        this.xEnd++
      }
    }

    if (this.zStart > this.zEnd) {
      if (this.minerCords.tunel === 'vertically' || this.minerCords.orientation === 'x-') {
        this.zStart++
        this.zEnd--
      }
    } else {
      if (this.minerCords.tunel === 'vertically' || this.minerCords.orientation === 'x+') {
        this.zStart--
        this.zEnd++
      }
    }

    this.yCurrent = parseInt(this.yStart)
    this.xCurrent = parseInt(this.xStart)
    this.zCurrent = parseInt(this.zStart)
  }
}
