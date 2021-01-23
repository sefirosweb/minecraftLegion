const botWebsocket = require('../modules/botWebsocket')
module.exports = class BehaviorMinerCurrentLayer {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorMinerCurrentLayer'

    this.minerCords = false
    this.currentLayer = false
    this.endLayer = false

    this.minerMethod = 'vertically' // Can use Horizontally or Vertically
    this.nextLayer = false
    this.firstBlockLayer = true
    this.isEndFinished = false
    this.xIsInverted = false
  }

  isFinished () {
    return this.isEndFinished
  }

  setMinerCords (minerCords) {
    botWebsocket.log('BehaviorMinerCurrentLayer: Set new coords', minerCords)
    this.minerCords = minerCords
    this.firstBlockLayer = true
    this.isEndFinished = false
    this.xIsInverted = false
    this.startLayer()
  }

  startLayer () {
    if (this.minerMethod === 'vertically') {
      this.currentLayer = Math.max(parseInt(this.minerCords.yStart), parseInt(this.minerCords.yEnd))
      this.endLayer = Math.min(parseInt(this.minerCords.yStart), parseInt(this.minerCords.yEnd))
    } else {
      throw console.error('No soportado otro metodo')
    }
  }

  onStateEntered () {
    if (this.currentLayer === this.endLayer) {
      this.isEndFinished = true
      botWebsocket.log('Finished all layers')
    } else {
      if (this.firstBlockLayer) {
        this.firstBlockLayer = false
      } else {
        this.currentLayer--
        if (this.xIsInverted) {
          this.xIsInverted = false
        } else {
          this.xIsInverted = true
        }
      }
    }
  }

  getCurrentLayerCoords () {
    if (this.minerMethod === 'vertically') {
      const minerCoords = {}
      if (this.xIsInverted) {
        minerCoords.xStart = this.minerCords.xStart
        minerCoords.xEnd = this.minerCords.xEnd
      } else {
        minerCoords.xStart = this.minerCords.xEnd
        minerCoords.xEnd = this.minerCords.xStart
      }

      minerCoords.yStart = this.currentLayer
      minerCoords.zStart = this.minerCords.zStart
      minerCoords.yEnd = this.currentLayer
      minerCoords.zEnd = this.minerCords.zEnd

      minerCoords.orientation = this.minerCords.orientation

      return minerCoords
    } else {
      throw console.error('No soportado otro metodo')
    }
  }
}
